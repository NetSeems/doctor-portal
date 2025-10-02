const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  SuperAdmin,
  Testimonial,
  TeamMember,
  Event,
  Location,
} = require("../models/Admin"); // import models

// ==================== ADMIN CONTROLLERS ====================

// Register Admin
exports.registerAdmin = async (req, reply) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await SuperAdmin.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    reply.send({
      success: true,
      admin: {
        id: admin.id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        createdAt: admin.createdAt,
      },
    });
  } catch (err) {
    console.log("Error",err);
    reply.code(500).send({ success: false, error: err.message });
  }
};

// Login Admin
exports.loginAdmin = async (req, reply) => {
  const { email, password } = req.body;
  try {
    const admin = await SuperAdmin.findOne({ where: { email } });
    if (!admin)
      return reply
        .code(404)
        .send({ success: false, message: "Admin not found" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return reply
        .code(401)
        .send({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    reply.send({
      success: true,
      token,
      admin: { id: admin.id, firstName: admin.firstName, email: admin.email },
    });
  } catch (err) {
    reply.code(500).send({ success: false, error: err.message });
  }
};

// Get Admin by ID
exports.getAdminByToken = async (req, reply) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.code(401).send({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Make sure JWT_SECRET exists
    } catch (err) {
      return reply.code(401).send({ success: false, message: "Invalid token" });
    }

    // Get admin by ID from token
    const admin = await SuperAdmin.findByPk(decoded.id, {
      attributes: ["id", "firstName", "lastName", "email", "createdAt"],
    });

    if (!admin) {
      return reply.code(404).send({ success: false, message: "Admin not found" });
    }

    reply.send(admin);
  } catch (err) {
    reply.code(500).send({ success: false, error: err.message });
  }
};

// ==================== TESTIMONIAL ====================
exports.addTestimonial = async (req, reply) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    reply.send({ success: true, testimonial });
  } catch (err) {
    reply.code(500).send({ success: false, error: err.message });
  }
};

exports.getAllTestimonials = async (_, reply) => {
  try {
    const testimonials = await Testimonial.findAll({
      order: [["createdAt", "DESC"]],
    });
    reply.send({ success: true, testimonials });
  } catch (err) {
    reply.code(500).send({ success: false, error: err.message });
  }
};

exports.getTestimonialById = async (req, reply) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByPk(id);
    if (!testimonial)
      return reply.code(404).send({ success: false, message: "Not found" });
    reply.send({ success: true, testimonial });
  } catch (err) {
    reply.code(500).send({ success: false, error: err.message });
  }
};

exports.updateTestimonial = async (req, reply) => {
  try {
    const { id } = req.params;
    const [updated] = await Testimonial.update(req.body, { where: { id } });
    if (!updated) return reply.code(404).send({ success: false, message: "Not found" });
    const testimonial = await Testimonial.findByPk(id);
    reply.send({ success: true, testimonial });
  } catch (err) {
    reply.code(500).send({ success: false, error: err.message });
  }
};

exports.deleteTestimonial = async (req, reply) => {
  try {
    const { id } = req.params;
    await Testimonial.destroy({ where: { id } });
    reply.send({ success: true, message: "Deleted" });
  } catch (err) {
    reply.code(500).send({ success: false, error: err.message });
  }
};

// ==================== TEAM MEMBER ====================
exports.addTeamMember = async (req, reply) => {
  try {
    const team = await TeamMember.create(req.body);
    reply.send({ success: true, team });
  } catch (err) {
    reply.code(500).send({ success: false, error: err.message });
  }
};

exports.getAllTeamMembers = async (_, reply) => {
  try {
    const teamMembers = await TeamMember.findAll({
      order: [["createdAt", "DESC"]],
    });
    reply.send({ success: true, teamMembers });
  } catch (err) {
    reply.code(500).send({ success: false, error: err.message });
  }
};

exports.updateTeamMember = async (req, reply) => {
  try {
    const { id } = req.params;
    const [updated] = await TeamMember.update(req.body, { where: { id } });
    if (!updated) return reply.code(404).send({ success: false, message: "Not found" });
    const teamMember = await TeamMember.findByPk(id);
    reply.send({ success: true, teamMember });
  } catch (err) {
    reply.code(500).send({ success: false, error: err.message });
  }
};

// ==================== EVENT ====================
exports.addEvent = async (req, reply) => {
  try {
    const event = await Event.create(req.body);
    reply.send({ success: true, event });
  } catch (err) {
    reply.code(500).send({ success: false, error: err.message });
  }
};

exports.getAllEvents = async (_, reply) => {
  try {
    const events = await Event.findAll({ order: [["createdAt", "DESC"]] });
    reply.send({ success: true, events });
  } catch (err) {
    reply.code(500).send({ success: false, error: err.message });
  }
};

exports.updateEvent = async (req, reply) => {
  try {
    const { id } = req.params;
    const [updated] = await Event.update(req.body, { where: { id } });
    if (!updated) return reply.code(404).send({ success: false, message: "Not found" });
    const event = await Event.findByPk(id);
    reply.send({ success: true, event });
  } catch (err) {
    reply.code(500).send({ success: false, error: err.message });
  }
};

// ==================== LOCATION ====================
exports.addLocation = async (req, reply) => {
  try {
    const location = await Location.create(req.body);
    reply.send({ success: true, location });
  } catch (err) {
    reply.code(500).send({ success: false, error: err.message });
  }
};

exports.getAllLocations = async (_, reply) => {
  try {
    const locations = await Location.findAll({ order: [["createdAt", "DESC"]] });
    reply.send({ success: true, locations });
  } catch (err) {
    reply.code(500).send({ success: false, error: err.message });
  }
};

exports.updateLocation = async (req, reply) => {
  try {
    const { id } = req.params;
    const [updated] = await Location.update(req.body, { where: { id } });
    if (!updated) return reply.code(404).send({ success: false, message: "Not found" });
    const location = await Location.findByPk(id);
    reply.send({ success: true, location });
  } catch (err) {
    reply.code(500).send({ success: false, error: err.message });
  }
};
