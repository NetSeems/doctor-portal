const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // import your sequelize instance

const SuperRemedies = sequelize.define("SuperRemedies", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  remediesName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = SuperRemedies;
