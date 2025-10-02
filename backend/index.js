// server.js
require("dotenv").config();
const fastify = require("fastify")({ logger: true });
const { initSocket } = require("./controllers/websocketController.js");
const cors = require("@fastify/cors");
const sequelize = require("./config/db");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const SuperRemedies = require("./models/AdminRemedies"); // adjust path to your model
// const sequelize = require("./config/db"); // your sequelize instance
require("./models/loadmodels.js");
require("./models/User.js");
require("./models/Admin.js");
require("./models/Doctor.js");
require("./models/OfflineUser.js");
require("./models/OfflineAppointment.js");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const pharmacyRoutes = require("./routes/pharmacyRoutes.js");
const optionRoutes = require("./routes/optionRoutes.js");
const appointmentFeeRoutes = require("./routes/appointmentFeeRoutes.js");
const offlineuserRoutes = require("./routes/offlineuserRoutes.js");
const offlineappointmentRoutes = require("./routes/offlineappointmentRoutes.js");
const adminRemediesRoutes = require("./routes/adminRemediesRoutes.js");
const receptionRoutes = require("./routes/receptionRoutes.js");
const feeNotificationRoutes = require("./routes/feeNotificationRoutes.js");

fastify.register(cors, {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
  ], // replace with your frontend URL
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // allowed methods
  credentials: true, // if you use cookies or auth headers
});
// Routes
fastify.register(userRoutes, { prefix: "/api/auth" });
fastify.register(adminRoutes, { prefix: "/api/super" });
fastify.register(doctorRoutes, { prefix: "/api/doctor" });
fastify.register(pharmacyRoutes, { prefix: "/api/pharmacy" });
fastify.register(optionRoutes, { prefix: "/api/option" });
fastify.register(appointmentFeeRoutes, { prefix: "/api/appointmentfee" });
fastify.register(offlineuserRoutes, { prefix: "/api/offline" });
fastify.register(adminRemediesRoutes, { prefix: "/api/superremedies" });
fastify.register(receptionRoutes, { prefix: "/api/reception" });
fastify.register(feeNotificationRoutes, { prefix: "/api/notification" });
fastify.register(offlineappointmentRoutes, {
  prefix: "/api/offlineappointment",
});
async function importRemedies() {
  const remedies = [];
  const filePath = path.join(
    __dirname,
    "Copy of Total Medicine List(1) .csv" // your CSV file
  );

  try {
    // Read CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          console.log("Row from CSV:", row); // 👈 debug what header looks like
          const name =
            row["remediesName"]?.trim() || row["remediesName "]?.trim();
          if (name) {
            remedies.push({ remediesName: name });
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });

    console.log(`✅ Read ${remedies.length} remedies from CSV`);

    if (remedies.length > 0) {
      // Insert into DB
      await sequelize.authenticate();
      await SuperRemedies.bulkCreate(remedies, {
        ignoreDuplicates: true,
      });
      console.log("✅ Remedies imported successfully!");
    } else {
      console.log("⚠️ No remedies found in CSV!");
    }
  } catch (err) {
    console.error("❌ Error importing remedies:", err);
  } finally {
    await sequelize.close(); // close pool AFTER all queries finish
  }
}
// importRemedies()

// Start server
const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // For dev only, create tables if not exist
    fastify.log.info("Database connected.");
    await fastify.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" });
    initSocket(fastify.server);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
