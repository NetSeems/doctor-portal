const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // your Sequelize instance
const OfflineAppointment = require("./OfflineAppointment");
const Order = sequelize.define(
  "Order",
  {
    orderId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    appointmentId: {
      type: DataTypes.INTEGER, // must match OfflineAppointment PK type
      references: {
        model: "OfflineAppointments", // table name
        key: "appointmentId",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    pharmacyId: { type: DataTypes.INTEGER }, // FK to Pharmacy
    paymentStatus: { type: DataTypes.STRING, defaultValue: "Pending" },
    orderStatus: { type: DataTypes.STRING, defaultValue: "Pending" },
    orderPaymentImageUrl: { type: DataTypes.STRING, defaultValue: "" },
    feeInstruction: { type: DataTypes.STRING, defaultValue: "" },
    additionalFee: { type: DataTypes.INTEGER, defaultValue: 0 },
    remedies: { type: DataTypes.JSONB, defaultValue: [] },
    totalPrice: { type: DataTypes.STRING, defaultValue: "" },
    orderPaymentId: { type: DataTypes.STRING, defaultValue: "" },
    paymentMode: { type: DataTypes.STRING, defaultValue: "" },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    timestamps: false, // since createdAt is already defined
  }
);
Order.belongsTo(OfflineAppointment, {
  foreignKey: "appointmentId",
  as: "appointment",
});
module.exports = Order;
