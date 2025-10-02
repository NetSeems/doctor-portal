// controllers/userController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Create a new user
exports.createUser = async (req, reply) => {
  try {
    const body = req.body || {};

    const hash = body.password ? await bcrypt.hash(body.password, 10) : null;
    const user = await User.create({ ...body, password: hash });

    const { password, ...safe } = user.get({ plain: true });
    return reply.code(201).send(safe);

  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return reply.code(409).send({ error: 'Email already exists' });
    }
    return reply.code(500).send({ error: err.message });
  }
};

// List all users with pagination
exports.getUsers = async (req, reply) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const offset = parseInt(req.query.offset || '0', 10);

    const users = await User.findAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    return reply.send({ items: users, limit, offset });
  } catch (err) {
    return reply.code(500).send({ error: err.message });
  }
};
