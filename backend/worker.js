import dotenv from "dotenv";
import connectDB from "./src/config/db.js";

import "./src/models/resume.js";
import "./src/models/interview.js";
import { startReportWorker } from "./src/queue/reportWorker.js";

dotenv.config();
connectDB();

const worker = startReportWorker();

console.log("Report worker started, waiting for jobs...");

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
