const OfflineAppointment = require("../models/OfflineAppointment");
const OfflineUser = require("../models/OfflineUser");
const Doctor = require("../models/Doctor");
const Order = require("../models/Order");
const {
  emitNewAppointment,
  emitNewOrder,
  emitNewUpdate,
} = require("./websocketController");
const { Op, fn, col, literal } = require("sequelize");

/**
 * Add new appointment
 */
// async function getAppointmentStats(request, reply) {
//   try {
//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);

//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     // Aggregate today's data in a single query
//     const todayStats = await OfflineAppointment.findAll({
//       attributes: [
//         [fn("COUNT", col("appointmentId")), "todayTotalAppointment"],
//         [
//           fn(
//             "SUM",
//             literal(`COALESCE("appointmentFee"::numeric, 0)`)
//           ),
//           "todayCollection",
//         ],
//         [
//           fn(
//             "COUNT",
//             literal(`CASE WHEN "appointmentStatus" = 'Completed' THEN 1 END`)
//           ),
//           "todayCompleted",
//         ],
//       ],
//       where: {
//         createdAt: {
//           [Op.between]: [todayStart, todayEnd],
//         },
//       },
//       raw: true,
//     });

//     // Total appointments in DB
//     const totalAppointments = await OfflineAppointment.count();

//     reply.send({
//       todayTotalAppointment: Number(todayStats[0].todayTotalAppointment),
//       todayCollection: Number(todayStats[0].todayCollection),
//       todayCompleted: Number(todayStats[0].todayCompleted),
//       totalAppointments,
//     });
//   } catch (error) {
//     console.error("Error fetching appointment stats:", error);
//     reply.status(500).send({ message: "Internal server error", error });
//   }
// }

async function updateAppointmentDetails(req, reply) {
  try {
    const { appointmentId } = req.params;
    const { firstName, lastName, email, phoneNumber, location } = req.body;

    const appointment = await OfflineAppointment.findByPk(appointmentId);
    if (!appointment) {
      return reply.code(404).send({ message: "Appointment not found" });
    }

    // Update allowed fields
    appointment.firstName = firstName ?? appointment.firstName;
    appointment.lastName = lastName ?? appointment.lastName;
    appointment.email = email ?? appointment.email;
    appointment.phoneNumber = phoneNumber ?? appointment.phoneNumber;
    appointment.location = location ?? appointment.location;

    await appointment.save();

    return reply.send({
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    return reply.code(500).send({ message: "Server error" });
  }
}

async function getAppointmentStats(request, reply) {
  try {
    const { doctorId } = request.params; // or request.query if you’re passing doctorId in query string

    if (!doctorId) {
      return reply.status(400).send({ message: "Doctor ID is required" });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // ✅ Aggregate today's data in a single query
    const todayStats = await OfflineAppointment.findOne({
      attributes: [
        [fn("COUNT", col("appointmentId")), "todayTotalAppointment"],
        [
          fn("SUM", literal(`COALESCE("appointmentFee"::numeric, 0)`)),
          "todayCollection",
        ],
        [
          fn(
            "COUNT",
            literal(`CASE WHEN "appointmentStatus" = 'Completed' THEN 1 END`)
          ),
          "todayCompleted",
        ],
      ],
      where: {
        doctorId,
        createdAt: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
      raw: true,
    });

    // ✅ Total appointments for this doctor
    const totalAppointments = await OfflineAppointment.count({
      where: { doctorId },
    });

    reply.send({
      todayTotalAppointment: Number(todayStats?.todayTotalAppointment || 0),
      todayCollection: Number(todayStats?.todayCollection || 0),
      todayCompleted: Number(todayStats?.todayCompleted || 0),
      totalAppointments,
    });
  } catch (error) {
    console.error("Error fetching appointment stats:", error);
    reply.status(500).send({ message: "Internal server error", error });
  }
}
const addAppointment = async (req, reply) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      location,
      doctorId,
      age,
      gender,
      medicines,
      appointmentFee,
      paymentMode,
    } = req.body;
    console.log("Body", req.body);
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return reply.code(404).send({ message: "Doctor not found" });
    }
    const userUniqueId =
      firstName.substring(0, 3).toUpperCase() +
      phoneNumber.slice(-4) +
      Date.now().toString().slice(-4) +
      Math.floor(1000 + Math.random() * 9000);
    // check if user exists
    let user = await OfflineUser.findOne({ where: { userUniqueId } });

    if (!user) {
      user = await OfflineUser.create({
        firstName,
        lastName,
        email,
        phoneNumber,
        age,
        gender,
        doctorId,
        location,
        userUniqueId,
      });
    }

    const formattedMedicines = medicines || {
      complain: "",
      remedies: [],
      duration: "",
      pharmacyName: "",
      instructions: "",
      showMedicine: "",
    };

    const appointment = await OfflineAppointment.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      location,
      doctorId,
      doctorName: doctor.name,
      userId: user.userId,
      appointmentFee,
      appointmentPaymentMode: paymentMode,
      medicines: formattedMedicines,
    });

    emitNewAppointment(appointment);

    reply.code(201).send({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    reply.code(500).send({ message: "Server error", error: error.message });
  }
};

/**
 * Add appointment with possible zero fee if user had completed visit in last 30 days
 */
const setFeeAsZeroAddAppointment = async (req, reply) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      location,
      doctorId,
      age,
      gender,
      medicines,
      userId,
      paymentMode,
      appointmentFee,
    } = req.body;

    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return reply.code(404).send({ message: "Doctor not found" });
    }

    let user = await OfflineUser.findByPk(userId);

    if (!user) {
      user = await OfflineUser.create({
        firstName,
        lastName,
        email,
        phoneNumber,
        age,
        gender,
        doctorId,
        location,
        paymentMode,
      });
    }

    // let finalFee = 200;

    // if (!newUserCreated) {
    //   const thirtyDaysAgo = new Date();
    //   thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    //   const recentCompletedAppointment = await OfflineAppointment.findOne({
    //     where: {
    //       userId: user.userId,
    //       appointmentStatus: "Completed",
    //       createdAt: { [Op.gte]: thirtyDaysAgo },
    //     },
    //   });

    //   if (recentCompletedAppointment) {
    //     finalFee = 0;
    //   }
    // }

    const formattedMedicines = medicines || {
      complain: "",
      remedies: [],
      duration: "",
      pharmacyName: "",
      instructions: "",
      showMedicine: "",
    };

    const appointment = await OfflineAppointment.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      location,
      doctorId,
      doctorName: doctor.name,
      userId: user.userId,
      appointmentFee,
      medicines: formattedMedicines,
      appointmentPaymentMode: paymentMode,
    });
    emitNewAppointment(appointment);
    reply.code(201).send({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    reply.code(500).send({ message: "Server error", error: error.message });
  }
};

/**
 * Get all appointments of a user
 */
const getAllAppointments = async (req, reply) => {
  try {
    const { userId } = req.params;

    const appointments = await OfflineAppointment.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    if (!appointments || appointments.length === 0) {
      return reply
        .code(404)
        .send({ message: "No appointments found for this user" });
    }

    reply.send(appointments);
  } catch (error) {
    reply.code(500).send({ message: "Server error", error: error.message });
  }
};

/**
 * Get appointment by ID and userId
 */
const getAppointmentById = async (req, reply) => {
  try {
    const { userId, id } = req.params;

    const appointment = await OfflineAppointment.findOne({
      where: { appointmentId: id, userId },
    });

    if (!appointment) {
      return reply
        .code(404)
        .send({ message: "Appointment not found for this user" });
    }

    reply.send(appointment);
  } catch (error) {
    reply.code(500).send({ message: "Server error", error: error.message });
  }
};

/**
 * Update appointment by ID
 */
const updateAppointment = async (req, reply) => {
  try {
    const { userId, id } = req.params;
    const appointment = await OfflineAppointment.findOne({
      where: { appointmentId: id, userId },
    });

    if (!appointment) {
      return reply
        .code(404)
        .send({ message: "Appointment not found for this user" });
    }

    await appointment.update(req.body);

    const sortedAppointments = await OfflineAppointment.findAll({
      order: [["createdAt", "DESC"]],
    });
    emitNewOrder(sortedAppointments);
    reply.send(sortedAppointments);
  } catch (error) {
    reply.code(500).send({ message: "Server error", error: error.message });
  }
};

/**
 * Add / update medicines for appointment
 */
const updateAppointmentMedicines = async (req, reply) => {
  try {
    const { appointmentId } = req.params;
    const updates = req.body;

    // ✅ Step 1: Find the appointment
    const appointment = await OfflineAppointment.findByPk(appointmentId);
    if (!appointment) {
      return reply.code(404).send({ message: "Appointment not found" });
    }

    // ✅ Step 2: Update medicines in appointment
    await appointment.update(updates);
    await appointment.save();

    // ✅ Step 3: Update remedies in related orders
    if (updates.medicines) {
      await Order.update(
        { remedies: updates.medicines.remedies },
        { where: { appointmentId } }
      );
    }
    // ✅ Step 4: Return updated data with associated order
    const updatedAppointment = await OfflineAppointment.findByPk(
      appointmentId,
      {
        include: [{ model: Order, as: "orders" }],
      }
    );
    emitNewUpdate(updates.medicines.remedies);
    reply.send({
      message: "Appointment and related orders updated successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error updating appointment medicines:", error);
    reply.code(500).send({ message: "Internal server error", error });
  }
};
const addMedicineToAppointment = async (req, reply) => {
  try {
    const { userId, id } = req.params;

    const appointment = await OfflineAppointment.findOne({
      where: { appointmentId: id, userId },
    });

    if (!appointment) {
      return reply
        .code(404)
        .send({ message: "Appointment not found for this user" });
    }

    const updateFields = {
      medicines: {
        complain: req.body.complain,
        remedies: req.body.remedies,
        duration: req.body.duration,
        pharmacyName: req.body.pharmacyName,
        pharmacyId: req.body.pharmacyId,
        showMedicine: req.body.showMedicine,
      },
      feeInstruction: req.body.instruction,
    };

    if (Array.isArray(req.body.reportImageUrls)) {
      updateFields.reportImageUrls = req.body.reportImageUrls;
    }
    if (req.body.showAppointmentFee === "No") {
      appointment.appointmentFee = 0;
    }
    await appointment.update(updateFields);
    appointment.save();
    reply.send(appointment);
  } catch (error) {
    reply.code(500).send({ message: "Server error", error: error.message });
  }
};

/**
 * Delete appointment
 */
const deleteAppointment = async (req, reply) => {
  try {
    const { id } = req.params;

    const appointment = await OfflineAppointment.findByPk(id);
    if (!appointment) {
      return reply.code(404).send({ message: "Appointment not found" });
    }

    await appointment.destroy();

    reply.send({ message: "Appointment deleted successfully" });
  } catch (error) {
    reply.code(500).send({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addAppointment,
  setFeeAsZeroAddAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  addMedicineToAppointment,
  deleteAppointment,
  getAppointmentStats,
  updateAppointmentMedicines,
  updateAppointmentDetails,
};
