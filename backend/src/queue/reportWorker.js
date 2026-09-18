import { Worker } from "bullmq";
import connection from "./connection.js";
import { REPORT_QUEUE_NAME } from "./reportQueue.js";
import { generateReport } from "../services/reportService.js";


const CONCURRENCY = parseInt(process.env.REPORT_WORKER_CONCURRENCY || "3", 10);
export const startReportWorker = () => {
  console.log("🚀 Starting report worker...");
  console.log("Queue:", REPORT_QUEUE_NAME);
  console.log("Redis status:", connection.status);

  const worker = new Worker(
    REPORT_QUEUE_NAME,
    async (job) => {
      console.log("🔥 JOB RECEIVED:", job.id);
      console.log("Interview ID:", job.data.interviewId);

      const report = await generateReport(job.data.interviewId);

      console.log("✅ REPORT GENERATED:", job.id);

      return report;
    },
    {
      connection,
      concurrency: CONCURRENCY,
    }
  );

  worker.on("ready", () => {
    console.log("🟢 WORKER READY");
  });

  worker.on("active", (job) => {
    console.log("🟡 JOB ACTIVE:", job.id);
  });

  worker.on("completed", (job) => {
    console.log("✅ JOB COMPLETED:", job.id);
  });

  worker.on("failed", (job, err) => {
    console.error(
      "❌ JOB FAILED:",
      job?.id,
      err.message
    );
  });

  worker.on("error", (err) => {
    console.error("❌ WORKER ERROR:", err.message);
  });

  return worker;
};