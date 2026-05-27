"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const daily_stats_cron_1 = require("./cron/daily-stats.cron");
const PORT = process.env.PORT || 3000;
(0, database_1.connectDB)().then(() => {
    (0, daily_stats_cron_1.initCronJobs)();
});
app_1.default.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
