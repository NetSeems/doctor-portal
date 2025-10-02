const receptionController = require("../controllers/receptionController");

async function receptionRoutes(fastify, options) {
  // Register
  fastify.post("/register", receptionController.register);

  // Login
  fastify.post("/login", receptionController.login);

  // Get user by token
  fastify.get("/me", receptionController.getUserByToken);

  // Get user by id
  fastify.get("/:id", receptionController.getUserById);
}

module.exports = receptionRoutes;
