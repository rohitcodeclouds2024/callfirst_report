import { DataTypes } from 'sequelize';
import { sequelize } from '../lib/db.js';
import UploadedData from "./uploadedData.js";

export const UploadLog = sequelize.define('uploadLog', {
	id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
	client_id: { type: DataTypes.INTEGER, allowNull: false },
  	file_name: { type: DataTypes.STRING, allowNull: false },
  	count: { type: DataTypes.INTEGER, allowNull: false },
  	status: { type: DataTypes.STRING, allowNull: false },
  	date: { type: DataTypes.DATEONLY, allowNull: true,},
}, {
 tableName: 'upload_log',
 timestamps: true,
});

export default UploadLog;

UploadLog.hasMany(UploadedData, { foreignKey: 'upload_log_id', as: 'uploadedData' });

UploadedData.belongsTo(UploadLog, { foreignKey: 'upload_log_id', as: 'uploadLog' });
