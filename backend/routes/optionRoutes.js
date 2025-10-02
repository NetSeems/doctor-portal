const optionController = require("../controllers/optionController");

async function optionRoutes(fastify, options) {
  // Add new options
  fastify.post("/add", optionController.addOptions);

  // Get all options
  fastify.get("/get", optionController.getAllOptions);

  // Delete option by field + index
  fastify.delete("/delete", optionController.deleteOptionByField);
}

module.exports = optionRoutes;
