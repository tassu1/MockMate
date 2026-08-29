import { Worker } from "bullmq";
import connection from "./connection.js";
import { REPORT_QUEUE_NAME } from "./reportQueue.js";
import { generateReport } from "../services/reportService.js";

// Concurrency = how many report jobs this worker process runs at once.
// This is the actual "backpressure" control against OpenAI rate limits —
// tune it based on your OpenAI tier's requests-per-minute limit.
const CONCURRENCY = parseInt(process.env.REPORT_WORKER_CONCURRENCY || "3", 10);

export const startReportWorker = () => {
  const worker = new Worker(
    REPORT_QUEUE_NAME,
    async (job) => {
      const { interviewId } = job.data;
      console.log(`[report-worker] generating report for ${interviewId}`);
      const report = await generateReport(interviewId);
      console.log(`[report-worker] done: ${interviewId}`);
      return report;
    },
    { connection, concurrency: CONCURRENCY }
  );

  worker.on("failed", (job, err) => {
    console.error(
      `[report-worker] job for interview ${job?.data?.interviewId} failed (attempt ${job?.attemptsMade}): ${err.message}`
    );
  });

  worker.on("completed", (job) => {
    console.log(`[report-worker] job ${job.id} completed`);
  });

  return worker;
};
