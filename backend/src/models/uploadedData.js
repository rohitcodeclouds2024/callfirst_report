import { DataTypes } from 'sequelize';
import { sequelize } from '../lib/db.js';

export const UploadedData = sequelize.define('uploadedData', {
	id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
	client_id: { type: DataTypes.INTEGER, allowNull: false },
	upload_log_id: { type: DataTypes.INTEGER, allowNull: false },
  	customer_name: { type: DataTypes.STRING, allowNull: false },
  	phone_number: { type: DataTypes.STRING, allowNull: false },
  	status: { type: DataTypes.STRING, allowNull: false },
}, {
 tableName: 'uploaded_data',
 timestamps: true,
});

export default UploadedData;
