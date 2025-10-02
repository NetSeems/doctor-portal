const {
  addRemedy,
  updateRemedy,
  deleteRemedy,
  getAllRemedies,
  insertRemedies
} = require("../controllers/adminRemediesController.js");

async function superRemediesRoutes(fastify, options) {
  fastify.post("/add", addRemedy);
  fastify.post("/adder", insertRemedies);
  fastify.put("/update/:id", updateRemedy);
  fastify.delete("/delete/:id", deleteRemedy);
  fastify.get("/getall", getAllRemedies);
}

module.exports = superRemediesRoutes;
