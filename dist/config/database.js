"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.sequelize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_model_1 = require("../models/user.model");
const account_model_1 = require("../models/account.model");
const trade_model_1 = require("../models/trade.model");
const daily_stat_model_1 = require("../models/daily-stat.model");
const trade_setup_model_1 = require("../models/trade-setup.model");
const emotion_model_1 = require("../models/emotion.model");
const tag_model_1 = require("../models/tag.model");
const trade_emotion_model_1 = require("../models/trade-emotion.model");
const trade_tag_model_1 = require("../models/trade-tag.model");
const trade_image_model_1 = require("../models/trade-image.model");
exports.sequelize = new sequelize_typescript_1.Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    models: [user_model_1.User, account_model_1.Account, trade_model_1.Trade, daily_stat_model_1.DailyStat, trade_setup_model_1.TradeSetup, emotion_model_1.Emotion, tag_model_1.Tag, trade_emotion_model_1.TradeEmotion, trade_tag_model_1.TradeTag, trade_image_model_1.TradeImage],
    logging: false,
});
const connectDB = async () => {
    try {
        await exports.sequelize.authenticate();
        await exports.sequelize.sync({ alter: true }); // dev
        console.log("✅ PostgreSQL connected");
    }
    catch (error) {
        console.error("❌ DB error:", error);
    }
};
exports.connectDB = connectDB;
