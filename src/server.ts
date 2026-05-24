import "dotenv/config";
import app from "./app";
import { connectDB } from "./config/database";
import { initCronJobs } from "./cron/daily-stats.cron";

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  initCronJobs();
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
