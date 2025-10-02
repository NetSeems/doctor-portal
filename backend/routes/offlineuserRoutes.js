const { getAllOfflineAppointmentsByDoctorId } = require("../controllers/doctorController");

async function offlineUserRoutes(fastify) {
  const {
    registerUser,
    getUserById,
    getAllUsers,
    updateUserById,
    getUserDetails,
    getAllAppointmentsFromUsers,
    getAllUsersByDoctorId, // changed doctorEmail → doctorId
    updateOfflineUser,
    getUserAppointmentsByDoctorId,
    deleteOfflineUserWithAppointments,
  } = require("../controllers/offlineuserController");

  // Register route
  fastify.post("/register", registerUser);

  // Update password / user details
  fastify.patch("/updatepassword/:userId", updateUserById);

  // Get user by ID
  fastify.get("/getUserById/:userId", getUserById);

  // Get user appointments by phone number
  //   fastify.get("/getUser/:phoneNumber", getUserAppointmentsByEmail);

  // Get all users linked to doctor
  fastify.get("/getUserByDoctor/:doctorId", getAllUsersByDoctorId);
  fastify.get("/moreappointment/:userId/:doctorId", getUserAppointmentsByDoctorId);
  // Get all appointments from users
  fastify.get("/getUserAllAppointment", getAllAppointmentsFromUsers);

  // Get all users
  fastify.get("/getAllUser", getAllUsers);

  // Get current user (JWT required)
  fastify.get("/getuser", getUserDetails);

  // Update offline user
  fastify.patch("/updateofflineusers/:userId", updateOfflineUser);
  fastify.delete("/deleteoffline/:userId", deleteOfflineUserWithAppointments);
}

module.exports = offlineUserRoutes;
