const {
  registerFeeNotification,
  getAllFeeNotifications,
} = require("../controllers/feeNotificationController");

async function feeNotificationRoutes(fastify, options) {
  // Register
  fastify.post("/register", registerFeeNotification);

  // Get all (desc order)
  fastify.get("/all", getAllFeeNotifications);
}

module.exports = feeNotificationRoutes;