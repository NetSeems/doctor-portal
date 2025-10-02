const FeeNotification = require("../models/FeeNotification");
const { emitNewNotification } = require("./websocketController");
// ======================
// Register FeeNotification
// ======================
const registerFeeNotification = async (req, reply) => {
  try {
    const { appointmentId, appointmentFee } = req.body;

    if (!appointmentId || !appointmentFee) {
      return reply
        .code(400)
        .send({ message: "appointmentId and appointmentFee are required." });
    }

    const newNotification = await FeeNotification.create({
      appointmentId,
      appointmentFee,
    });
    emitNewNotification(newNotification);
    return reply.code(201).send({
      message: "Fee notification created successfully",
      data: newNotification,
    });
  } catch (error) {
    req.log.error(error);
    return reply
      .code(500)
      .send({ message: "Server error", error: error.message });
  }
};

// ======================
// Get All FeeNotifications (desc order)
// ======================
const getAllFeeNotifications = async (req, reply) => {
  try {
    const notifications = await FeeNotification.findAll({
      order: [["createdAt", "DESC"]],
    });

    return reply.code(200).send({
      message: "Fetched all fee notifications",
      data: notifications,
    });
  } catch (error) {
    req.log.error(error);
    return reply
      .code(500)
      .send({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerFeeNotification,
  getAllFeeNotifications,
};
