const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// =======================
// SuperAdmin Model
// =======================
const Reception = sequelize.define(
  "Reception",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING }, // bcrypt hash
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "reception",
    updatedAt: true,
  }
);

module.exports = {
  Reception,
};
