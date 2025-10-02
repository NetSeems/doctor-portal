const bcrypt = require("bcrypt");
const Pharmacy = require("../models/Pharmacy");
const Order = require("../models/Order");
const OfflineAppointment = require("../models/OfflineAppointment"); // assuming defined
const sequelize = require("../config/db");
const { emitNewOrder } = require("./websocketController");
const { Op, fn, col, literal } = require("sequelize");

// exports.getTodayOrderStats = async (request, reply) => {
//   try {
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);

//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     const todayStats = await Order.findAll({
//       attributes: [
//         [fn("COUNT", col("orderId")), "todayOrder"],
//         [
//           fn(
//             "COUNT",
//             literal(`CASE WHEN "orderStatus" = 'Completed' THEN 1 END`)
//           ),
//           "todayCompletedOrder",
//         ],
//         [
//           fn(
//             "SUM",
//             literal(`COALESCE(NULLIF("totalPrice", '')::numeric, 0)`)
//           ),
//           "todayCollection",
//         ],
//         [
//           fn(
//             "SUM",
//             literal(`COALESCE("additionalFee", 0)`)
//           ),
//           "todayAdditionalFee",
//         ],
//       ],
//       where: {
//         createdAt: { [Op.between]: [todayStart, todayEnd] },
//       },
//       raw: true,
//     });

//     const totalOrder = await Order.count();

//     reply.send({
//       todayOrder: Number(todayStats[0].todayOrder),
//       todayCompletedOrder: Number(todayStats[0].todayCompletedOrder),
//       todayCollection: Number(todayStats[0].todayCollection || 0),
//       todayAdditionalFee: Number(todayStats[0].todayAdditionalFee || 0),
//       totalOrder,
//     });
//   } catch (error) {
//     console.error("Error fetching today order stats:", error);
//     reply.status(500).send({ message: "Internal server error", error });
//   }
// };

exports.getTodayOrderStats = async (request, reply) => {
  try {
    const { pharmacyId } = request.params; // or request.query depending on your route

    if (!pharmacyId) {
      return reply.status(400).send({ message: "Pharmacy ID is required" });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // ✅ Single query for today's stats
    const todayStats = await Order.findOne({
      attributes: [
        [fn("COUNT", col("orderId")), "todayOrder"],
        [
          fn(
            "COUNT",
            literal(`CASE WHEN "orderStatus" = 'Completed' THEN 1 END`)
          ),
          "todayCompletedOrder",
        ],
        [
          fn("SUM", literal(`COALESCE(NULLIF("totalPrice", '')::numeric, 0)`)),
          "todayCollection",
        ],
        [
          fn("SUM", literal(`COALESCE("additionalFee", 0)`)),
          "todayAdditionalFee",
        ],
      ],
      where: {
        pharmacyId,
        createdAt: { [Op.between]: [todayStart, todayEnd] },
      },
      raw: true,
    });

    // ✅ Separate query for total orders of this pharmacy
    const totalOrder = await Order.count({
      where: { pharmacyId },
    });

    reply.send({
      todayOrder: Number(todayStats?.todayOrder || 0),
      todayCompletedOrder: Number(todayStats?.todayCompletedOrder || 0),
      todayCollection: Number(todayStats?.todayCollection || 0),
      todayAdditionalFee: Number(todayStats?.todayAdditionalFee || 0),
      totalOrder,
    });
  } catch (error) {
    console.error("Error fetching today order stats:", error);
    reply.status(500).send({ message: "Internal server error", error });
  }
};

exports.addPharmacy = async (req, reply) => {
  try {
    const { email, password, pharmacyName, address, phoneNumber } = req.body;

    // Check if pharmacy already exists
    const existingPharmacy = await Pharmacy.findOne({ where: { email } });
    if (existingPharmacy) {
      return reply.code(400).send({ message: "Email already exists" });
    }

    // Hash password if provided
    let hashedPassword = "12345"; // default
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Create new pharmacy
    const newPharmacy = await Pharmacy.create({
      pharmacyName,
      address,
      phoneNumber,
      email,
      password: hashedPassword,
    });

    reply
      .code(201)
      .send({ message: "Pharmacy added successfully", pharmacy: newPharmacy });
  } catch (error) {
    reply
      .code(500)
      .send({ message: "Failed to add pharmacy", error: error.message });
  }
};

exports.getAllPharmacies = async (req, reply) => {
  try {
    const pharmacies = await Pharmacy.findAll({
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Order,
          as: "orders",
          include: [
            {
              model: OfflineAppointment,
              as: "appointment", // must match association alias
            },
          ],
        },
      ],
    });

    reply.code(200).send(pharmacies);
  } catch (error) {
    reply.code(500).send({
      message: "Failed to retrieve pharmacies",
      error: error.message,
    });
  }
};

exports.addOrderToPharmacy = async (request, reply) => {
  try {
    const { id } = request.params; // pharmacyId
    const { appointmentId, instruction } = request.body;

    // ✅ Validate pharmacy existence
    const pharmacy = await Pharmacy.findByPk(id);
    if (!pharmacy) {
      return reply.code(404).send({ message: "Pharmacy not found" });
    }

    // ✅ Validate appointment existence
    const appointment = await OfflineAppointment.findByPk(appointmentId);
    if (!appointment) {
      return reply.code(404).send({ message: "Appointment not found" });
    }

    // ✅ Create new Order (orderId auto-increments in your model)
    const newOrder = await Order.create({
      appointmentId,
      pharmacyId: pharmacy.pharmacyId, // use PK
      paymentStatus: "Pending",
      orderStatus: "Pending",
      feeInstruction: instruction,
    });

    // (Optional) If you want to emit socket events
    emitNewOrder(newOrder);

    return reply.send({
      message: "Order added to pharmacy",
      pharmacyDetail: pharmacy,
      order: newOrder,
    });
  } catch (error) {
    request.log.error(error);
    return reply
      .code(500)
      .send({ message: "Failed to add order to pharmacy", error });
  }
};

exports.getPharmacyByEmail = async (request, reply) => {
  try {
    const { email } = request.params;

    // ✅ Fetch pharmacy by email
    const pharmacy = await Pharmacy.findOne({ where: { email } });

    if (!pharmacy) {
      return reply.code(404).send({ message: "Pharmacy not found" });
    }

    return reply.code(200).send(pharmacy);
  } catch (error) {
    request.log.error(error);
    return reply
      .code(500)
      .send({ message: "Failed to retrieve pharmacy", error });
  }
};

exports.viewAllOrdersByPharmacyId = async (request, reply) => {
  try {
    const { id } = request.params;

    const pharmacy = await Pharmacy.findByPk(id, {
      include: [
        {
          model: Order,
          as: "orders",
          include: [{ model: OfflineAppointment, as: "appointment" }],
        },
      ],
    });

    if (!pharmacy) {
      return reply.code(404).send({ message: "Pharmacy not found" });
    }

    return reply.code(200).send(pharmacy.orders);
  } catch (error) {
    console.error(error);
    return reply
      .code(500)
      .send({ message: "Failed to retrieve orders", error });
  }
};

exports.viewPendingOrdersByPharmacyId = async (request, reply) => {
  try {
    const { id } = request.params;
    let { page } = request.query;

    const limit = 10;

    // ✅ Check if pharmacy exists
    const [pharmacy] = await sequelize.query(
      `SELECT "pharmacyId" FROM "Pharmacies" WHERE "pharmacyId" = :id`,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!pharmacy) {
      return reply.code(404).send({ message: "Pharmacy not found" });
    }

    // ✅ Count total pending orders
    const [countResult] = await sequelize.query(
      `
      SELECT COUNT(*) as total
      FROM "Orders"
      WHERE "pharmacyId" = :id
        AND "orderStatus" = 'Pending'
      `,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const totalOrders = parseInt(countResult.total, 10) || 0;
    const totalPages = Math.ceil(totalOrders / limit);

    // ✅ If no pending orders → return empty result early
    if (totalOrders === 0) {
      return reply.code(200).send({
        currentPage: 0,
        totalPages: 0,
        totalOrders: 0,
        perPage: limit,
        data: [],
      });
    }

    // ✅ If no page provided → go to last page
    page = page ? parseInt(page) : totalPages;

    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    const offset = (page - 1) * limit;

    // ✅ Fetch pending orders with pagination
    const orders = await sequelize.query(
      `
      SELECT o.*, a.*
      FROM "Orders" o
      LEFT JOIN "OfflineAppointments" a
        ON o."appointmentId" = a."appointmentId"
      WHERE o."pharmacyId" = :id
        AND o."orderStatus" = 'Pending'
      ORDER BY o."createdAt" DESC
      LIMIT :limit OFFSET :offset
      `,
      {
        replacements: { id, limit, offset },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return reply.code(200).send({
      currentPage: page,
      totalPages,
      totalOrders,
      perPage: limit,
      data: orders,
    });
  } catch (error) {
    console.error(error);
    return reply.code(500).send({
      message: "Failed to retrieve pending orders",
      error: error.message,
    });
  }
};
// exports.viewCompletedOrdersByPharmacyId = async (request, reply) => {
//   try {
//     const { id } = request.params;

//     const pharmacy = await Pharmacy.findByPk(id, {
//       include: [
//         {
//           model: Order,
//           as: "orders",
//           where: { orderStatus: "Completed" }, // ✅ only Completed orders
//           required: false,
//           include: [
//             {
//               model: OfflineAppointment,
//               as: "appointment", // must match alias in Order.belongsTo
//               required: false,
//             },
//           ],
//         },
//       ],
//     });

//     if (!pharmacy) {
//       return reply.code(404).send({ message: "Pharmacy not found" });
//     }

//     return reply.code(200).send(pharmacy.orders);
//   } catch (error) {
//     console.error(error);
//     return reply.code(500).send({
//       message: "Failed to retrieve completed orders",
//       error,
//     });
//   }
// };

exports.viewCompletedOrdersByPharmacyId = async (request, reply) => {
  try {
    const { id } = request.params;
    let { page = 1 } = request.query;

    page = parseInt(page);
    if (isNaN(page) || page < 1) page = 1;

    const limit = 10; // ✅ fixed limit
    let offset = (page - 1) * limit;

    // ✅ Count total completed orders for pharmacy
    const countResult = await sequelize.query(
      `
      SELECT COUNT(*) AS total
      FROM "Orders" o
      WHERE o."pharmacyId" = :id AND o."orderStatus" = 'Completed'
      `,
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const totalOrders = parseInt(countResult[0].total, 10);
    const totalPages = Math.ceil(totalOrders / limit);

    // ✅ If no records, force page=1 and offset=0
    if (totalPages === 0) {
      page = 1;
      offset = 0;
    } else if (page > totalPages) {
      // ✅ if user requests a page greater than totalPages, clamp to last page
      page = totalPages;
      offset = (page - 1) * limit;
    }

    // ✅ Fetch paginated completed orders (with appointments if any)
    const orders = await sequelize.query(
      `
      SELECT o.*, a.*
      FROM "Orders" o
      LEFT JOIN "OfflineAppointments" a
      ON o."appointmentId" = a."appointmentId"
      WHERE o."pharmacyId" = :id AND o."orderStatus" = 'Completed'
      ORDER BY o."createdAt" DESC
      LIMIT :limit OFFSET :offset
      `,
      {
        replacements: { id, limit, offset },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return reply.code(200).send({
      currentPage: page,
      totalPages,
      totalOrders,
      perPage: limit,
      data: orders,
    });
  } catch (error) {
    console.error(error);
    return reply.code(500).send({
      message: "Failed to retrieve completed orders",
      error: error.message,
    });
  }
};

exports.updateOrderPharmacy = async (req, reply) => {
  try {
    const {
      pharmacyId,
      appointmentId,
      appointmentOrderId,
      remedies,
      totalPrice,
      paymentMode,
      additionalFee,
    } = req.body;

    // 🔹 1. Find pharmacy
    const pharmacy = await Pharmacy.findByPk(pharmacyId);
    if (!pharmacy) {
      return reply.code(404).send({ message: "Pharmacy not found" });
    }

    // 🔹 2. Find order
    const order = await Order.findByPk(appointmentOrderId);
    if (!order) {
      return reply.code(404).send({ message: "Order not found" });
    }

    if (order.pharmacyId !== pharmacyId) {
      return reply.code(403).send({ message: "Unauthorized access to order" });
    }

    // 🔹 3. Update order details
    order.totalPrice = totalPrice;
    order.paymentMode = paymentMode;
    order.remedies = remedies; // requires remedies: JSONB field in Order model

    // 🔹 5. Update appointment medicines
    const appointment = await OfflineAppointment.findByPk(appointmentId);
    if (!appointment) {
      return reply.code(404).send({ message: "Appointment not found" });
    }

    appointment.medicines = {
      ...appointment.medicines,
      remedies,
      pharmacyId,
    };
    appointment.appointmentOrderId = appointmentOrderId;

    await appointment.save();

    // 🔹 6. Finalize order status
    if (req.body.additionalFee !== 0) {
      order.additionalFee = req.body.additionalFee;
    }
    order.orderStatus = "Completed";
    order.paymentStatus = "Completed";
    await order.save();

    return reply.code(200).send({
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    return reply
      .code(500)
      .send({ message: "Server error", error: error.message });
  }
};
