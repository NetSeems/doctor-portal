const userController = require("../controllers/userController");

async function userRoutes(fastify, options) {
  fastify.post("/register", userController.createUser);
  fastify.get("/getdetails", userController.getUsers);
}

module.exports = userRoutes;
