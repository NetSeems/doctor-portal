// db.js
require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
    dialect: "postgres",
    logging: false,
    dialect: "postgres", 
    // If your host requires SSL, uncomment the next 4 lines:
    // dialectOptions: {
    //   ssl: { require: true, rejectUnauthorized: false }
    // },
    pool: { max: 10, min: 0, idle: 10000 },
  }
);

module.exports = sequelize;
