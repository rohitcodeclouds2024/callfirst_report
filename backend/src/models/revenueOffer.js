import { DataTypes } from "sequelize";
import { sequelize } from "../lib/db.js";
import { Revenue } from "./revenue.js";

export const RevenueOffer = sequelize.define(
  "revenue_offer",
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    revenue_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    offer_rate: { type: DataTypes.FLOAT, allowNull: true },
    start_date: { type: DataTypes.DATEONLY, allowNull: true },
    end_date: { type: DataTypes.DATEONLY, allowNull: true },
  },
  { tableName: "revenue_offers", timestamps: false }
);

RevenueOffer.belongsTo(Revenue, { foreignKey: "revenue_id", as: "revenue" });
Revenue.hasMany(RevenueOffer, { foreignKey: "revenue_id", as: "offers" });

export default RevenueOffer;
