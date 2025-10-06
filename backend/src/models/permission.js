// models/Permission.ts
import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

export const Permission = sequelize.define(
  "permission",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    page: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "permissions",
    timestamps: false, // no createdAt/updatedAt
  }
);

export default Permission;
