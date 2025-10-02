const OfflineUser = require("../models/OfflineUser");
const OfflineAppointment = require("../models/OfflineAppointment");
const Doctor = require("../models/Doctor"); // Sequelize doctor model
const Pharmacy = require("../models/Pharmacy"); // Sequelize pharmacy model
const Order = require("../models/Order"); // Sequelize pharmacy model
const jwt = require("jsonwebtoken");
const sequelize = require("../config/db");
/**
 * Register a new offline user
 */
const registerUser = async (req, reply) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      age,
      gender,
      doctorId,
      location,
    } = req.body;

    // Check if user already exists by email
    const existing = await OfflineUser.findOne({ where: { email } });
    if (existing) {
      return reply.code(400).send({ message: "User already exists" });
    }

    const user = await OfflineUser.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      age,
      gender,
      doctorId,
      location,
    });

    reply.code(201).send({ message: "Patient created successfully", user });
  } catch (error) {
    reply.code(500).send({ message: "Server error", error: error.message });
  }
};

/**
 * Update offline user (partial updates)
 */
const updateOfflineUser = async (req, reply) => {
  try {
    const { userId } = req.params;
    const updates = req.body.data;

    if (!updates || Object.keys(updates).length === 0) {
      return reply.code(400).send({ message: "No update fields provided." });
    }

    if (updates.userId) {
      return reply.code(400).send({ message: "Cannot update userId field." });
    }

    const [updated] = await OfflineUser.update(updates, {
      where: { userId },
      returning: true,
    });

    if (!updated) {
      return reply.code(404).send({ message: "Offline user not found." });
    }

    const updatedUser = await OfflineUser.findByPk(userId);
    reply.send({
      message: "Offline user updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    reply
      .code(500)
      .send({ message: "Internal server error", error: error.message });
  }
};

/**
 * Update user by ID (simple version)
 */
const updateUserById = async (req, reply) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const [updated] = await OfflineUser.update(updates, {
      where: { userId },
      returning: true,
    });

    if (!updated) return reply.code(404).send({ message: "User not found" });

    const user = await OfflineUser.findByPk(userId);
    reply.send(user);
  } catch (error) {
    reply.code(500).send({ message: error.message });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, reply) => {
  try {
    const { userId } = req.params;
    const user = await OfflineUser.findByPk(userId, {
      include: OfflineAppointment,
    });
    if (!user) return reply.code(404).send({ message: "User not found" });
    reply.send(user);
  } catch (error) {
    reply.code(500).send({ message: error.message });
  }
};

/**
 * Get all users linked to a doctor
 */

const getAllUsersByDoctorId = async (req, reply) => {
  try {
    const { doctorId } = req.params;
    const limit = 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    // ✅ Step 1: Get total distinct users count
    const totalResult = await sequelize.query(
      `
      SELECT COUNT(DISTINCT u."userId") AS "totalCount"
      FROM "offline_users" u
      JOIN "OfflineAppointments" a ON u."userId" = a."userId"
      WHERE a."doctorId" = :doctorId
      `,
      {
        replacements: { doctorId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const totalCount = parseInt(totalResult[0].totalCount, 10);
    const totalPages = Math.ceil(totalCount / limit);

    // ✅ Step 2: Get paginated distinct users
    const users = await sequelize.query(
      // `
      // SELECT DISTINCT ON (u."userId") 
      //        u."userId", u."firstName", u."lastName", u."email", 
      //        u."phoneNumber", u."age", u."gender", u."createdAt"
      // FROM "offline_users" u
      // JOIN "OfflineAppointments" a ON u."userId" = a."userId"
      // WHERE a."doctorId" = :doctorId
      // ORDER BY u."userId", u."createdAt" desc
      // LIMIT :limit OFFSET :offset
      // `,
       `SELECT * FROM (
    SELECT DISTINCT ON (u."userId") 
           u."userId", u."firstName", u."lastName", u."email", 
           u."phoneNumber", u."age", u."gender", u."createdAt"
    FROM "offline_users" u
    JOIN "OfflineAppointments" a ON u."userId" = a."userId"
    WHERE a."doctorId" = :doctorId
    ORDER BY u."userId", u."createdAt" DESC
) sub
ORDER BY sub."createdAt" DESC
LIMIT :limit OFFSET :offset`,
      {
        replacements: { doctorId, limit, offset },
        type: sequelize.QueryTypes.SELECT,
      }
     
    );

    const userIds = users.map((u) => u.userId);

    if (userIds.length === 0) {
      return reply.send({
        page,
        limit,
        totalCount,
        totalPages,
        data: [],
      });
    }

    // ✅ Step 3: Fetch all appointments for these users
    const appointments = await sequelize.query(
      `
        SELECT a.*, 
         a."userId",
         ROW_NUMBER() OVER (PARTITION BY a."userId" ORDER BY a."createdAt" DESC) AS row_num,
         COUNT(*) OVER (PARTITION BY a."userId") AS "totalAppointments"
        FROM "OfflineAppointments" a
        WHERE a."doctorId" = :doctorId
        AND a."userId" IN (:userIds)
        ORDER BY a."userId", a."createdAt" DESC
      `,
      {
        replacements: { doctorId, userIds },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // ✅ Step 4: Group appointments per user (only keep top 10)
    const groupedAppointments = {};
    const appointmentMeta = {};

    appointments.forEach((app) => {
      // store meta info once per user
      if (!appointmentMeta[app.userId]) {
        const totalAppointments = parseInt(app.totalAppointments, 10);
        const totalPagesForAppointments = Math.ceil(totalAppointments / 10);
        appointmentMeta[app.userId] = {
          totalAppointments,
          totalPages: totalPagesForAppointments,
          currentPage: 1, // since we always show first 10 here
        };
      }

      // only push first 10 appointments
      if (app.row_num <= 10) {
        if (!groupedAppointments[app.userId]) {
          groupedAppointments[app.userId] = [];
        }
        groupedAppointments[app.userId].push(app);
      }
    });

    // ✅ Step 5: Combine users + their appointments with pagination info
    const usersWithAppointments = users.map((user) => ({
      ...user,
      appointments: {
        page: appointmentMeta[user.userId]?.currentPage || 1,
        limit: 10,
        totalCount: appointmentMeta[user.userId]?.totalAppointments || 0,
        totalPages: appointmentMeta[user.userId]?.totalPages || 0,
        data: groupedAppointments[user.userId] || [],
      },
    }));

    reply.send({
      page,
      limit,
      totalCount,
      totalPages,
      data: usersWithAppointments,
    });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Server error", error: error.message });
  }
};

const getUserAppointmentsByDoctorId = async (req, reply) => {
  try {
    const { doctorId, userId } = req.params;
    const limit = 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    // ✅ Count total appointments for this user
    const totalResult = await sequelize.query(
      `
      SELECT COUNT(*) AS "totalCount"
      FROM "OfflineAppointments"
      WHERE "doctorId" = :doctorId AND "userId" = :userId
      `,
      {
        replacements: { doctorId, userId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const totalCount = parseInt(totalResult[0].totalCount, 10);
    const totalPages = Math.ceil(totalCount / limit);

    // ✅ Fetch paginated appointments
    const appointments = await sequelize.query(
      `
      SELECT *
      FROM "OfflineAppointments"
      WHERE "doctorId" = :doctorId AND "userId" = :userId
      ORDER BY "createdAt" DESC
      LIMIT :limit OFFSET :offset
      `,
      {
        replacements: { doctorId, userId, limit, offset },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    reply.send({
      page,
      limit,
      totalCount,
      totalPages,
      data: appointments,
    });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Server error", error: error.message });
  }
};

/**
 * Get user details from JWT
 */
const getUserDetails = async (req, reply) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return reply
        .code(401)
        .send({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await OfflineUser.findByPk(decoded.userId);

    if (!user) return reply.code(404).send({ message: "User not found" });

    reply.send(user);
  } catch (error) {
    reply.code(401).send({ message: "Invalid or expired token" });
  }
};

/**
 * Get all users
 */
const getAllUsers = async (req, reply) => {
  try {
    const users = await OfflineUser.findAll({ include: OfflineAppointment });
    reply.send(users);
  } catch (error) {
    reply.code(500).send({ message: error.message });
  }
};

/**
 * Get all appointments from all users
 */
const getAllAppointmentsFromUsers = async (req, reply) => {
  try {
    const users = await OfflineUser.findAll({ include: OfflineAppointment });
    if (!users || users.length === 0) {
      return reply
        .code(404)
        .send({ message: "No users or appointments found" });
    }

    const allAppointments = users.flatMap(
      (user) => user.OfflineAppointments || []
    );
    reply.send(allAppointments);
  } catch (error) {
    reply.code(500).send({ message: error.message });
  }
};

const deleteOfflineUserWithAppointments = async (req, reply) => {
  const { userId } = req.params;

  const transaction = await sequelize.transaction();

  try {
    // 1. Find the user
    const user = await OfflineUser.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return reply.code(404).send({ message: "User not found" });
    }

    // 2. Find all appointments of this user
    const appointments = await OfflineAppointment.findAll({
      where: { userId },
      transaction,
    });

    for (const appointment of appointments) {
      const { appointmentId, doctorId, medicines, appointmentOrderId } =
        appointment;

      // 3. Update doctor record (TODO: implement your slot restore logic if needed)

      // 4. Delete related order if exists
      if (appointmentOrderId) {
        await Order.destroy({
          where: { orderId: appointmentOrderId },
          transaction,
        });
      }

      // 5. If order belongs to a pharmacy, clean up (association way)
      if (medicines?.pharmacyId && appointmentOrderId) {
        const pharmacy = await Pharmacy.findByPk(medicines.pharmacyId, {
          include: { model: Order, as: "orders" },
          transaction,
        });

        if (pharmacy) {
          // Remove order from pharmacy's orders
          pharmacy.orders = pharmacy.orders.filter(
            (order) =>
              order.orderId.toString() !== appointmentOrderId.toString()
          );
        }
      }

      // 6. Delete appointment
      await OfflineAppointment.destroy({
        where: { appointmentId },
        transaction,
      });
    }

    // 7. Delete user
    await OfflineUser.destroy({ where: { userId }, transaction });

    // 8. Commit
    await transaction.commit();

    return reply.code(200).send({
      message: "User and all related data deleted successfully.",
    });
  } catch (error) {
    console.error("❌ Error during deletion:", error);
    await transaction.rollback();
    return reply.code(500).send({
      message: "Failed to delete user. Transaction rolled back.",
      error: error.message,
    });
  }
};
module.exports = {
  registerUser,
  updateOfflineUser,
  updateUserById,
  getUserById,
  getAllUsersByDoctorId,
  getUserDetails,
  getAllUsers,
  getAllAppointmentsFromUsers,
  getUserAppointmentsByDoctorId,
  deleteOfflineUserWithAppointments,
};
