import { DataTypes } from 'sequelize';
import { sequelize } from '../lib/db.js';
import { User } from "./user.js";

export const Revenue = sequelize.define('revenue', {
	id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
	client_id: { type: DataTypes.INTEGER, allowNull: false },
  	revenue_per_conversion: { type: DataTypes.FLOAT, allowNull: false },
  	special_offer: { type: DataTypes.BOOLEAN, defaultValue: false },
  	special_offer_revenue: { type: DataTypes.FLOAT, allowNull: true },
  	special_offer_begin_date: { type: DataTypes.DATEONLY, allowNull: true },
  	special_offer_valid_till: { type: DataTypes.DATEONLY, allowNull: true },
}, { tableName: 'revenue_details', timestamps: false,});

export default Revenue;

Revenue.belongsTo(User, { foreignKey: "client_id", as: "client" });
