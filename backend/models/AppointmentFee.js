const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // your Sequelize instance

const AppointmentFee = sequelize.define(
  "AppointmentFee",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    consultationType: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    consultationFee: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false, // we already define createdAt manually
    tableName: "appointment_fees", // table name in PostgreSQL
  }
);

module.exports = AppointmentFee;
