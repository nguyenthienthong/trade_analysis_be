import { Sequelize } from "sequelize-typescript";
import { User } from "../models/user.model";
import { Account } from "../models/account.model";

export const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  models: [User, Account],
  logging: false,
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // dev
    console.log("✅ PostgreSQL connected");
  } catch (error) {
    console.error("❌ DB error:", error);
  }
};
