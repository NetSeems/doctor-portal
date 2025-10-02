const doctorController = require("../controllers/doctorController");

async function doctorRoutes(fastify, options) {
  fastify.post("/add", doctorController.addDoctor);
  fastify.post("/getdoctoremail", doctorController.getDoctorByEmail);
  fastify.get("/getdoctortoken", doctorController.getDoctorByToken);
  fastify.get("/getall", async (request, reply) => {
    // Get page from query params, default to 1
    const page = parseInt(request.query.page) || 1;
    // Call the controller and pass page
    await doctorController.getAllDoctors(request, reply, page);
  });
  fastify.get(
  "/getallofflineappointment/:id",
  doctorController.getAllOfflineAppointmentsByDoctorId
);
}

module.exports = doctorRoutes;
