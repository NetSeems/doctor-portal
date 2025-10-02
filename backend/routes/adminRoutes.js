const superAdminController = require("../controllers/adminController");

async function superAdminRoutes(fastify, options) {
  // Admin Auth & Profile
  fastify.post("/register", superAdminController.registerAdmin);
  fastify.post("/login", superAdminController.loginAdmin);
  // fastify.put("/update/:id", superAdminController.updateSuperProfile);
  fastify.get("/get", superAdminController.getAdminByToken);

  // Locations
  fastify.post("/add-location", superAdminController.addLocation);
  fastify.get("/locations", superAdminController.getAllLocations);
  // fastify.delete("/delete-location/:index", superAdminController.de);

  // Testimonials
  fastify.post("/add-testimonial", superAdminController.addTestimonial);
  fastify.get("/testimonials", superAdminController.getAllTestimonials);
  fastify.put("/update-testimonial/:id", superAdminController.updateTestimonial);
  fastify.delete("/delete-testimonial/:id", superAdminController.deleteTestimonial);

  // Team Members
  fastify.post("/add-team-member", superAdminController.addTeamMember);
  fastify.get("/teams", superAdminController.getAllTeamMembers);
  // fastify.put("/update-member/:id", superAdminController.updateMember);
  // fastify.delete("/delete-member/:id", superAdminController.de);

  // Events
  fastify.post("/add-event", superAdminController.addEvent);
  fastify.get("/events", superAdminController.getAllEvents);
  fastify.put("/update-event/:id", superAdminController.updateEvent);
  // fastify.delete("/delete-event/:id", superAdminController.deleteEvent);
}

module.exports = superAdminRoutes;