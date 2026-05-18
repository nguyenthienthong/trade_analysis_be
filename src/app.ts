import express from "express";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import authRoute from "./routes/auth.route";
import tradesRoute from "./routes/trade.route";
import accountRoute from "./routes/account.route";
import analysisRoute from "./routes/analysis.route";
import marketDataRoute from "./routes/market-data.route";

const app = express();

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoute);
app.use("/api/trades", tradesRoute);
app.use("/api/accounts", accountRoute);
app.use("/api/analysis", analysisRoute);
app.use("/api/market-data", marketDataRoute);

app.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

export default app;
