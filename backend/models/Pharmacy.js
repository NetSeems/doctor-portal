const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // your Sequelize instance
const Order = require("./Order");

const Pharmacy = sequelize.define("Pharmacy", {
  pharmacyId:{ type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  pharmacyName: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  phoneNumber: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, defaultValue: "12345" },
}, {
  timestamps: false,
});

// Relationships
Pharmacy.hasMany(Order, { foreignKey: "pharmacyId", as: "orders" });
Order.belongsTo(Pharmacy, { foreignKey: "pharmacyId", as: "pharmacy" });

module.exports = Pharmacy;