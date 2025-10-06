// models/Role.ts
import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";
import Permission from './permission.js';
import PermissionsRole from './permissionRole.js';

export const Role = sequelize.define(
  "role",
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
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "roles",
    timestamps: false, // disable createdAt & updatedAt
  }
);

Role.belongsToMany(Permission, { through: PermissionsRole, foreignKey: "role_id", otherKey: "permission_id" });

export default Role;
