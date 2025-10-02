const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Doctor = sequelize.define("Doctor", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, defaultValue: "both" },
  specialization: { type: DataTypes.STRING, allowNull: false },
  locations: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

Doctor.associate = (models) => {
  Doctor.hasMany(models.OfflineAppointment, { foreignKey: "doctorId",onDelete: "CASCADE" });
  // Example: if a Doctor can have Orders directly
  // Doctor.hasMany(models.Order, { foreignKey: "doctorId" });
};

module.exports = Doctor;
