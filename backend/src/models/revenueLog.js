import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";
import { LgTracker } from "./lgTracker.js";

export const RevenueLog = sequelize.define(
  "revenue_log",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    lg_tracker_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    revenue: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "revenue_log",
    timestamps: false,
  }
);

export default RevenueLog;
