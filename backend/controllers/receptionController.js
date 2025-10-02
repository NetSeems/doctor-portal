const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Reception } = require("../models/Reception");

const JWT_SECRET = "your_jwt_secret"; // put in .env

// =======================
// Register Reception
// =======================
async function register(req, reply) {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !email || !password) {
      return reply.code(400).send({ message: "All fields are required" });
    }

    const existingUser = await Reception.findOne({ where: { email } });
    if (existingUser) {
      return reply.code(400).send({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newReception = await Reception.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    reply.code(201).send({ message: "Reception registered successfully", user: newReception });
  } catch (error) {
    reply.code(500).send({ message: "Error registering reception", error: error.message });
  }
}

// =======================
// Login Reception
// =======================
async function login(req, reply) {
  try {
    const { email, password } = req.body;

    const reception = await Reception.findOne({ where: { email } });
    if (!reception) {
      return reply.code(400).send({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, reception.password);
    if (!isMatch) {
      return reply.code(400).send({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: reception.id }, JWT_SECRET, { expiresIn: "1d" });

    reply.send({ message: "Login successful", token });
  } catch (error) {
    reply.code(500).send({ message: "Error logging in", error: error.message });
  }
}

// =======================
// Get Reception by Token
// =======================
async function getUserByToken(req, reply) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return reply.code(401).send({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const reception = await Reception.findByPk(decoded.id);
    if (!reception) return reply.code(404).send({ message: "User not found" });

    reply.send(reception);
  } catch (error) {
    reply.code(500).send({ message: "Error fetching user by token", error: error.message });
  }
}

// =======================
// Get Reception by ID
// =======================
async function getUserById(req, reply) {
  try {
    const { id } = req.params;

    const reception = await Reception.findByPk(id);
    if (!reception) return reply.code(404).send({ message: "User not found" });

    reply.send(reception);
  } catch (error) {
    reply.code(500).send({ message: "Error fetching user by id", error: error.message });
  }
}

module.exports = {
  register,
  login,
  getUserByToken,
  getUserById,
};