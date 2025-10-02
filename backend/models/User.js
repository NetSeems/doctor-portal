// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define(
  'User',
  {
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName:  { type: DataTypes.STRING, allowNull: false },
    email:     { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    phoneNumber:{ type: DataTypes.STRING, allowNull: false },
    age:       { type: DataTypes.INTEGER, allowNull: false },
    gender:    { type: DataTypes.ENUM('male', 'female'), allowNull: true }, // made optional like your schema (not explicitly required at DB level)
    doctorEmail:{ type: DataTypes.STRING, defaultValue: '' },
    password:  { type: DataTypes.STRING }, // store bcrypt hash
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  {
    tableName: 'users',
    updatedAt: true
  }
);

module.exports = User;
