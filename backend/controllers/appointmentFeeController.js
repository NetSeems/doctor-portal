const AppointmentFee = require("../models/AppointmentFee");

// Add a new appointment fee
const addAppointmentFee = async (req, reply) => {
  try {
    const { consultationType, consultationFee } = req.body;
    const newFee = await AppointmentFee.create({ consultationType, consultationFee });
    reply.code(201).send({ message: "Appointment fee added", data: newFee });
  } catch (error) {
    reply.code(500).send({ message: "Error adding fee", error: error.message });
  }
};

// Update fee by ID
const updateAppointmentFee = async (req, reply) => {
  try {
    const { id } = req.params;
    const { consultationFee } = req.body;

    const fee = await AppointmentFee.findByPk(id);
    if (!fee) {
      return reply.code(404).send({ message: "Fee not found" });
    }

    fee.consultationFee = consultationFee;
    await fee.save();

    reply.code(200).send({ message: "Fee updated", data: fee });
  } catch (error) {
    reply.code(500).send({ message: "Error updating fee", error: error.message });
  }
};

// Delete fee by ID
const deleteAppointmentFee = async (req, reply) => {
  try {
    const { id } = req.params;

    const deleted = await AppointmentFee.destroy({ where: { id } });

    if (!deleted) {
      return reply.code(404).send({ message: "Fee not found" });
    }

    reply.code(200).send({ message: "Fee deleted" });
  } catch (error) {
    reply.code(500).send({ message: "Error deleting fee", error: error.message });
  }
};

// Get all appointment fees
const getAllAppointmentFees = async (req, reply) => {
  try {
    const fees = await AppointmentFee.findAll({ order: [["createdAt", "DESC"]] });
    reply.code(200).send({ data: fees });
  } catch (error) {
    reply.code(500).send({ message: "Error fetching fees", error: error.message });
  }
};

// Get fee by ID
const getFeeById = async (req, reply) => {
  try {
    const { id } = req.params;
    const fee = await AppointmentFee.findByPk(id);

    if (!fee) {
      return reply.code(404).send({ message: "Fee not found" });
    }

    reply.code(200).send({ data: fee });
  } catch (error) {
    reply.code(500).send({ message: "Error retrieving fee", error: error.message });
  }
};

module.exports = {
  addAppointmentFee,
  updateAppointmentFee,
  deleteAppointmentFee,
  getAllAppointmentFees,
  getFeeById,
};
