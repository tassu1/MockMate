import { Queue } from "bullmq";
import connection from "./connection.js";

export const REPORT_QUEUE_NAME = "report-generation";

export const reportQueue = new Queue(REPORT_QUEUE_NAME, { connection });


export const enqueueReportJob = async (interviewId) => {
  console.log("1️⃣ enqueueReportJob START");

  console.log("2️⃣ Redis status:", connection.status);

  console.log("3️⃣ About to add job");

  const job = await reportQueue.add(
    "generate-report",
    {
      interviewId: interviewId.toString(),
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: 100,
    }
  );

  console.log("4️⃣ Job successfully added");
  console.log("5️⃣ Job ID:", job.id);

  return job;
};