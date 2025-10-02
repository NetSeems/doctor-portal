const controller = require("../controllers/appointmentFeeController");

async function appointmentFeeRoutes(fastify, options) {
  // Add new fee
  fastify.post("/add", controller.addAppointmentFee);

  // Update fee
  fastify.put("/update/:id", controller.updateAppointmentFee);

  // Delete fee
  fastify.delete("/delete/:id", controller.deleteAppointmentFee);

  // Get all fees
  fastify.get("/all", controller.getAllAppointmentFees);

  // Get fee by ID
  fastify.get("/get/:id", controller.getFeeById);
}

module.exports = appointmentFeeRoutes;
