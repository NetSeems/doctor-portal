const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // your Sequelize instance

const Option = sequelize.define(
  "Option",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    potency: {
      type: DataTypes.ARRAY(DataTypes.STRING), // Array of strings
      defaultValue: [],
    },
    repetition: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    dosage: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    days: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    unit: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false, // disable Sequelize's auto timestamps
    tableName: "options", // table name in PostgreSQL
  }
);

module.exports = Option;
