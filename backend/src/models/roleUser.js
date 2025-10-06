// models/RolesUser.ts
import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

export const RolesUser = sequelize.define(
  "roles_user",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: "roles_user",
    timestamps: false,
    freezeTableName: true,
  }
);

export default RolesUser;
