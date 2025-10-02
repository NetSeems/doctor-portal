const appointmentController = require("../controllers/offlineappointmentController");

async function offlineAppointmentRoutes(fastify) {
  // Add appointment
  fastify.post("/add", appointmentController.addAppointment);

  // Add appointment with zero fee
  fastify.post("/setzerofee", appointmentController.setFeeAsZeroAddAppointment);

  // Get appointment by userId and appointment id
  fastify.get(
    "/getappointment/:userId/:id",
    appointmentController.getAppointmentById
  );

  // Get all appointments
  fastify.get("/getallappointment", appointmentController.getAllAppointments);
  fastify.get("/stats/:doctorId", appointmentController.getAppointmentStats);

  // Update appointment
  fastify.put("/update/:userId/:id", appointmentController.updateAppointment);

  // Delete appointment
  fastify.delete("/delete/:id", appointmentController.deleteAppointment);

  // Add medicines to appointment
  fastify.put(
    "/addmedicines/:userId/:id",
    appointmentController.addMedicineToAppointment
  );
  fastify.patch(
    "/updatemedicines/:appointmentId",
    appointmentController.updateAppointmentMedicines
  );
  fastify.put(
    "/:appointmentId",
    appointmentController.updateAppointmentDetails
  );
}

module.exports = offlineAppointmentRoutes;
