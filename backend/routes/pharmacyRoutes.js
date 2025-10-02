const pharmacyController = require("../controllers/pharmacyController");

async function pharmacyRoutes(fastify, options) {
  fastify.post("/add", pharmacyController.addPharmacy);
  fastify.get("/getallpharmacy", pharmacyController.getAllPharmacies);
  fastify.get("/getpharmacy/:email", pharmacyController.getPharmacyByEmail);
  fastify.post("/addorder/:id", pharmacyController.addOrderToPharmacy);
  fastify.get(
  "/getallorders/:id",
  pharmacyController.viewAllOrdersByPharmacyId
);
fastify.get(
  "/getallpendingorders/:id",
  pharmacyController.viewPendingOrdersByPharmacyId
);
fastify.get(
  "/stats/:pharmacyId",
  pharmacyController.getTodayOrderStats
);
fastify.get(
  "/getallcompletedorders/:id",
  pharmacyController.viewCompletedOrdersByPharmacyId
);
fastify.put("/updateorder", pharmacyController.updateOrderPharmacy);
}

module.exports = pharmacyRoutes;
