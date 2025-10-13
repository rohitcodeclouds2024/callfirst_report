import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";
import UploadedData from "./uploadedData.js";
import User from "./user.js";

export const LgTracker = sequelize.define("lg_tracker", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  client_id: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  no_of_dials: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  no_of_contacts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  gross_transfer: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  net_transfer: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: false 
  },
  count: {
   type: DataTypes.INTEGER, 
    allowNull: false 
  },
  status: { 
    type: DataTypes.STRING,
    allowNull: false 
  },
}, {
  tableName: "lg_tracker",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false,
});

export default LgTracker;

LgTracker.belongsTo(User, { foreignKey: "client_id", as: "client" });

LgTracker.hasMany(UploadedData, { foreignKey: 'lg_tracker_id', as: 'uploadedData' });

UploadedData.belongsTo(LgTracker, { foreignKey: 'lg_tracker_id', as: 'LgTracker' });
