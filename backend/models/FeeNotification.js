const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const FeeNotification = sequelize.define("FeeNotification", {
  notifiedId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  appointmentFee: { type: DataTypes.STRING, defaultValue: "0" },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = FeeNotification;
