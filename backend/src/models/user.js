import { DataTypes } from 'sequelize';
import { sequelize } from '../lib/db.js';
import Role from "./role.js";
import RolesUser from './roleUser.js';
export const User = sequelize.define('user', {
	id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
	email: { type: DataTypes.STRING(255), allowNull: false },
	password: { type: DataTypes.STRING(255), allowNull: false },
	name: { type: DataTypes.STRING(255), allowNull: true },
	contact_number: { type: DataTypes.STRING(255), allowNull: true },
	availability: { type: DataTypes.ENUM('online', 'in-call', 'offline', 'available'), allowNull: false, defaultValue: 'offline' },
	slug: { type: DataTypes.STRING(100), allowNull: true },
	twilio_identity: { type: DataTypes.STRING(128), allowNull: true },
	twilio_token_issued_at: { type: DataTypes.DATE, allowNull: true },
	twilio_token_expires_at: { type: DataTypes.DATE, allowNull: true },
	socket_id: { type: DataTypes.STRING(128), allowNull: true },
	last_active_at: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'users' });

export default User;

User.belongsToMany(Role, { through: RolesUser, foreignKey: "user_id" ,otherKey: "role_id"});
Role.belongsToMany(User, { through: RolesUser, foreignKey: "role_id",otherKey: "role_id" });
