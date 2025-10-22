import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";
import { User } from "./user.js";

export const Revenue = sequelize.define(
  "revenue",
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    client_id: { type: DataTypes.INTEGER, allowNull: false },
    revenue_per_conversion: { type: DataTypes.FLOAT, allowNull: false },
    special_offer: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: "revenue_details", timestamps: false }
);

Revenue.belongsTo(User, { foreignKey: "client_id", as: "client" });

export default Revenue;