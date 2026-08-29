import { Queue } from "bullmq";
import connection from "./connection.js";

export const REPORT_QUEUE_NAME = "report-generation";

export const reportQueue = new Queue(REPORT_QUEUE_NAME, { connection });

/**
 * Enqueues a job to generate the report for a completed interview.
 * Retries up to 3 times with exponential backoff if the LLM call
 * or JSON parsing fails.
 */
export const enqueueReportJob = async (interviewId) => {
  await reportQueue.add(
    "generate-report",
    { interviewId: interviewId.toString() },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: true,
      removeOnFail: 100, // keep failures around for debugging
    }
  );
};
