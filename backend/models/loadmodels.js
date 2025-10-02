const sequelize = require("../config/db");

// Import all models
const Admin = require("./Admin");
const Doctor = require("./Doctor");
const OfflineUser = require("./OfflineUser");
const OfflineAppointment = require("./OfflineAppointment");
const Pharmacy = require("./Pharmacy");
const Order = require("./Order");
const AppointmentFee = require("./AppointmentFee");
const Option = require("./Option");
const SuperRemedies = require("./AdminRemedies");
const Reception = require("./Reception");
const FeeNotification = require("./FeeNotification");
// const Appointment = require("./Appointment"); // add if you have this

// Collect models into an object
const models = {
  Admin,
  Doctor,
  OfflineUser,
  SuperRemedies,
  OfflineAppointment,
  Pharmacy,
  Order,
  AppointmentFee,
  Option,
  Reception,
  FeeNotification,
  // Appointment,
};

// Run associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = { sequelize, ...models };
