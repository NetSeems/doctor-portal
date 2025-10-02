const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const OfflineAppointment = sequelize.define("OfflineAppointment", {
  appointmentId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  phoneNumber: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  consultationType: { type: DataTypes.STRING, defaultValue: "Clinic Visit" },
  userId: { type: DataTypes.INTEGER }, // FK → OfflineUser
  doctorId: { type: DataTypes.INTEGER, allowNull: false }, // FK → Doctor
  doctorName: { type: DataTypes.STRING, allowNull: false },
  feeInstruction: { type: DataTypes.STRING, defaultValue: "" },
  medicines: { type: DataTypes.JSONB, defaultValue: {} },
  reportImageUrls: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  appointmentFee: { type: DataTypes.STRING, defaultValue: "0" },
  appointmentPaymentStatus: { type: DataTypes.STRING, defaultValue: "Pending" },
  appointmentOrderId: { type: DataTypes.STRING, defaultValue: "" },
  appointmentPaymentMode: {
    type: DataTypes.STRING,
    defaultValue: "Cash",
  },
  appointmentStatus: { type: DataTypes.STRING, defaultValue: "Booked" },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

OfflineAppointment.associate = (models) => {
  OfflineAppointment.belongsTo(models.Doctor, {
    foreignKey: "doctorId",
    onDelete: "CASCADE",
  });
  OfflineAppointment.belongsTo(models.OfflineUser, {
    foreignKey: "userId",
    onDelete: "CASCADE",
  });
  OfflineAppointment.hasMany(models.Order, {
    foreignKey: "appointmentId",
    as: "orders",
    onDelete: "CASCADE",
  });
};

module.exports = OfflineAppointment;
