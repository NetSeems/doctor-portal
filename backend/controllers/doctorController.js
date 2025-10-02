const bcrypt = require("bcryptjs");
const Doctor = require("../models/Doctor"); // Sequelize Doctor model
const OfflineAppointment = require("../models/OfflineAppointment"); // Sequelize Doctor model
const jwt = require("jsonwebtoken");
const sequelize = require("../config/db");
// Add Doctor
exports.addDoctor = async (req, reply) => {
  try {
    const { name, email, phone, specialization, password, location, type } =
      req.body;

    // check if doctor already exists
    const existingDoctor = await Doctor.findOne({ where: { email } });
    if (existingDoctor) {
      return reply.code(400).send({ message: "Doctor already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || "12345", salt);

    // create doctor
    const doctor = await Doctor.create({
      name,
      email,
      phone,
      specialization,
      locations: Array.isArray(location) ? location : [location], // store as array (JSONB in Postgres)
      password: hashedPassword,
      type,
      schedules: [], // initialize empty schedules
    });

    return reply.code(201).send({
      message: "Doctor added successfully",
      doctor,
    });
  } catch (error) {
    console.error("Error adding doctor:", error);
    return reply
      .code(500)
      .send({ message: "Error adding doctor", error: error.message });
  }
};
exports.getDoctorByEmail = async (request, reply) => {
  try {
    const { email, password } = request.body;

    // Find doctor by email (include appointments)
    const doctorWithPassword = await Doctor.findOne({
      where: { email },
      include: [{ model: OfflineAppointment }],
    });

    if (!doctorWithPassword) {
      return reply.code(404).send({ message: "Doctor not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, doctorWithPassword.password);
    if (!isMatch) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { doctorId: doctorWithPassword.id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    // Remove password before sending response
    const doctor = doctorWithPassword.toJSON();
    delete doctor.password;

    return reply.code(200).send({ token, doctor });
  } catch (error) {
    return reply
      .code(500)
      .send({ message: "Error logging in", error: error.message });
  }
};
exports.getDoctorByToken = async (req, reply) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply
        .code(401)
        .send({ success: false, message: "No token provided" });
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
    const doctor = await Doctor.findByPk(decoded.doctorId);

    if (!doctor) {
      return reply
        .code(404)
        .send({ success: false, message: "Doctor not found" });
    }

    reply.send(doctor);
  } catch (err) {
    reply.code(500).send({ success: false, error: err.message });
  }
};

exports.getAllDoctors = async (req, reply, page) => {
  try {
    const limit = 10;
    const offset = (page - 1) * limit;
    const { count, rows: doctors } = await Doctor.findAndCountAll({
      distinct: true,  // 👈 This makes count return unique Doctor rows
      include: [
        {
          model: OfflineAppointment,
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    reply.code(200).send({
      totalDoctors: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      doctors,
    });
  } catch (error) {
    reply.code(500).send({
      message: "Error fetching doctors",
      error: error.message,
    });
  }
};


exports.getAllOfflineAppointmentsByDoctorId = async (req, reply) => {
  try {
    const { id: doctorId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    // ✅ Check doctor exists
    const [doctor] = await sequelize.query(
      `SELECT * FROM "Doctors" WHERE id = :doctorId`,
      {
        replacements: { doctorId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!doctor) {
      return reply.code(404).send({ message: "Doctor not found with this ID." });
    }

    // ✅ Fetch appointments with pagination
    const appointments = await sequelize.query(
      `
      SELECT *
      FROM "OfflineAppointments"
      WHERE "doctorId" = :doctorId
      ORDER BY "createdAt" DESC
      LIMIT :limit OFFSET :offset
      `,
      {
        replacements: { doctorId, limit, offset },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // ✅ Total count
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM "OfflineAppointments" WHERE "doctorId" = :doctorId`,
      {
        replacements: { doctorId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return reply.code(200).send({
      message: "Appointments retrieved successfully.",
      appointments,
      pagination: {
        total: Number(countResult.total),
        page,
        limit,
        totalPages: Math.ceil(Number(countResult.total) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching appointments for doctor:", error);
    return reply.code(500).send({
      message: "Failed to retrieve appointments for this doctor. Please try again.",
      error: error.message,
    });
  }
};
