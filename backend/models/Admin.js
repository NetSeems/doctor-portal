const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// =======================
// SuperAdmin Model
// =======================
const SuperAdmin = sequelize.define(
  "SuperAdmin",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING }, // bcrypt hash
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "super_admins",
    updatedAt: true,
  }
);

// =======================
// Location Model
// =======================
const Location = sequelize.define(
  "Location",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    location: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: "locations",
    updatedAt: false,
  }
);

// =======================
// Testimonial Model
// =======================
const Testimonial = sequelize.define(
  "Testimonial",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    image: { type: DataTypes.TEXT },
    name: { type: DataTypes.STRING },
    subject: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
  },
  {
    tableName: "testimonials",
    updatedAt: false,
  }
);

// =======================
// TeamMember Model
// =======================
const TeamMember = sequelize.define(
  "TeamMember",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    image: { type: DataTypes.TEXT },
    name: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
  },
  {
    tableName: "team_members",
    updatedAt: false,
  }
);

// =======================
// Event Model
// =======================
const Event = sequelize.define(
  "Event",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    image: { type: DataTypes.TEXT },
    video: { type: DataTypes.TEXT },
    name: { type: DataTypes.STRING },
  },
  {
    tableName: "events",
    updatedAt: false,
  }
);

// =======================
// Associations
// =======================
SuperAdmin.hasMany(Location, {
  foreignKey: "superAdminId",
  onDelete: "CASCADE",
});
Location.belongsTo(SuperAdmin, { foreignKey: "superAdminId" });

SuperAdmin.hasMany(Testimonial, {
  foreignKey: "superAdminId",
  onDelete: "CASCADE",
});
Testimonial.belongsTo(SuperAdmin, { foreignKey: "superAdminId" });

SuperAdmin.hasMany(TeamMember, {
  foreignKey: "superAdminId",
  onDelete: "CASCADE",
});
TeamMember.belongsTo(SuperAdmin, { foreignKey: "superAdminId" });

SuperAdmin.hasMany(Event, { foreignKey: "superAdminId", onDelete: "CASCADE" });
Event.belongsTo(SuperAdmin, { foreignKey: "superAdminId" });

// =======================
// Export All Models
// =======================
module.exports = {
  SuperAdmin,
  Location,
  Testimonial,
  TeamMember,
  Event,
};
