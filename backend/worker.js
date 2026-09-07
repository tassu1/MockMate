import dotenv from "dotenv";
import express from "express";

import connectDB from "./src/config/db.js";
import "./src/models/resume.js";
import "./src/models/interview.js";
import { startReportWorker } from "./src/queue/reportWorker.js";

dotenv.config();

await connectDB();

const worker = startReportWorker();

const app = express();

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "report-worker"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Worker health server running on port ${PORT}`);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Closing worker...");
  await worker.close();
  process.exit(0);
});