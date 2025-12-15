import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoute from "./routes/auth.route";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoute);

app.get("/health", (_, res) => {
  res.json({ status: "OK" });
});

export default app;
