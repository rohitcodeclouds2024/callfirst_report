import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = 3306,
  DB_USER = 'root',
  DB_PASS = '',
  DB_NAME = 'fastify_auth_db',
} = process.env;

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: 'mysql',
  logging: false,
  define: { underscored: true, timestamps: true },
});

export async function initDb() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('DB connected and synced');
  } catch (err) {
    console.error('DB init error', err);
    throw err;
  }
}
