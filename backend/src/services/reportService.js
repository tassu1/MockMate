import Interview from "../models/interview.js";
import { chatComplete } from "../utils/openai.js";
import { buildReportPrompt } from "../utils/prompts.js";

// Generates and saves the report for a given interview.
// Called by the BullMQ worker (see queue/reportWorker.js).
export const generateReport = async (interviewId) => {
  const interview = await Interview.findById(interviewId).populate("resume");

  if (!interview) {
    throw new Error(`Interview ${interviewId} not found`);
  }

  const transcript = interview.messages
    .map((m) => `${m.sender === "ai" ? "AI" : "Candidate"}: ${m.content}`)
    .join("\n");

  const prompt = buildReportPrompt({
    role: interview.role,
    experienceLevel: interview.experienceLevel,
    resumeText: interview.resume.rawText,
    transcript,
  });

  const raw = await chatComplete([{ role: "user", content: prompt }], {
    json: true,
  });

  const report = JSON.parse(raw);

  interview.report = report;
  await interview.save();

  return report;
};
