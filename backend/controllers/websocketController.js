// socket.js
let ioInstance;

function initSocket(server) {
  const { Server } = require("socket.io");
  ioInstance = new Server(server, {
    cors: {
      origin: "*", // set your frontend origin in production
    },
  });

  ioInstance.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
  });

  return ioInstance;
}

function getSocketInstance() {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized!");
  }
  return ioInstance;
}

function emitNewOrder(order) {
  const io = getSocketInstance();
  io.emit("newOrder", order);
}
function emitNewAppointment(appointment) {
  const io = getSocketInstance();
  io.emit("newAppointment", appointment);
}
function emitNewOption(option) {
  const io = getSocketInstance();
  io.emit("option", option); // keep event name consistent with frontend listener
}
function emitNewRemedy(remedy) {
  const io = getSocketInstance();
  io.emit("remedy", remedy); // keep event name consistent with frontend listener
}
function emitNewNotification(notification) {
  const io = getSocketInstance();
  io.emit("notification", notification); // keep event name consistent with frontend listener
}
function emitNewUpdate(update) {
  const io = getSocketInstance();
  io.emit("appointmentUpdate", update); // keep event name consistent with frontend listener
}
module.exports = {
  initSocket,
  emitNewOrder,
  getSocketInstance,
  emitNewOption,
  emitNewRemedy,
  emitNewAppointment,
  emitNewNotification,
  emitNewUpdate,
};
