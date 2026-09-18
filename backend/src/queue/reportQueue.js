import { Queue } from "bullmq";
import connection from "./connection.js";

export const REPORT_QUEUE_NAME = "report-generation";

export const reportQueue = new Queue(REPORT_QUEUE_NAME, { connection });


export const enqueueReportJob = async (interviewId) => {
  console.log("report ho rha h");

  const job = await reportQueue.add(
    "generate-report",
    { interviewId: interviewId.toString() },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: true,
      removeOnFail: 100,
    }
  );

  console.log("report ho gya");
  console.log("Job ID:", job.id);

  return job;
};