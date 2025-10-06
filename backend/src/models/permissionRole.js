// models/PermissionsRole.ts
import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";

export const PermissionsRole = sequelize.define(
  "permissions_role",
  {
    permission_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: "permissions_role",
    timestamps: false,
    freezeTableName: true,
  }
);

export default PermissionsRole;