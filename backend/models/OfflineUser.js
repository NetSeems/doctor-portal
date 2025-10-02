const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const OfflineUser = sequelize.define(
  "OfflineUser",
  {
    userId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    firstName: { type: DataTypes.STRING },
    lastName: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    phoneNumber: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.STRING, allowNull: false },
    gender: { type: DataTypes.ENUM("male", "female"), allowNull: false },
    doctorId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
    location: { type: DataTypes.STRING, defaultValue: "" },
    userUniqueId: { type: DataTypes.STRING, allowNull: false, unique: true },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "offline_users",
    timestamps: false,
  }
);

OfflineUser.associate = (models) => {
  OfflineUser.hasMany(models.OfflineAppointment, { foreignKey: "userId",onDelete: "CASCADE"  });
};

module.exports = OfflineUser;
