import Interview from "../models/interview.js";
import Resume from "../models/resume.js";
import { chatComplete } from "../utils/ai.js";
import { buildInterviewerSystemPrompt } from "../utils/prompts.js";
import { enqueueReportJob } from "../queue/reportQueue.js";

export const startInterview = async (req, res) => {
  try {
    const { resumeId, role, experienceLevel } = req.body;

    if (!resumeId || !role) {
      return res.status(400).json({
        success: false,
        message: "resumeId and role are required",
      });
    }

    const resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    const interview = await Interview.create({
      user: req.user.id,
      resume: resume._id,
      role,
      experienceLevel: experienceLevel || "fresher",
    });

    const systemPrompt = buildInterviewerSystemPrompt({
      role: interview.role,
      experienceLevel: interview.experienceLevel,
      resumeText: resume.rawText,
    });

    const firstQuestion = await chatComplete([
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content:
          "Begin the interview now with your opening question (e.g. a brief intro question or one grounded in their resume).",
      },
    ]);

    interview.messages.push({ sender: "ai", content: firstQuestion });
    await interview.save();

    res.status(201).json({
      success: true,
      interviewId: interview._id,
      question: firstQuestion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const answerInterview = async (req, res) => {
  try {
    const { message } = req.body;
    const { id } = req.params;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "message is required",
      });
    }

    const interview = await Interview.findOne({
      _id: id,
      user: req.user.id,
    }).populate("resume");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (interview.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "This interview has already ended",
      });
    }

    interview.messages.push({ sender: "candidate", content: message });

    const questionsAskedSoFar = interview.messages.filter(
      (m) => m.sender === "ai"
    ).length;

    const reachedLimit = questionsAskedSoFar >= interview.questionLimit;

    const systemPrompt = buildInterviewerSystemPrompt({
      role: interview.role,
      experienceLevel: interview.experienceLevel,
      resumeText: interview.resume.rawText,
    });

    const history = interview.messages.map((m) => ({
      role: m.sender === "ai" ? "assistant" : "user",
      content: m.content,
    }));

    let aiReply;
    let shouldEnd = false;

    if (reachedLimit) {
      aiReply =
        "That wraps up the interview — thanks for your time. Your performance report is being generated now.";
      shouldEnd = true;
    } else {
      aiReply = await chatComplete([
        { role: "system", content: systemPrompt },
        ...history,
      ]);
    }

    interview.messages.push({ sender: "ai", content: aiReply });

    if (shouldEnd) {
      interview.status = "completed";
    }

    await interview.save();

    res.json({
      success: true,
      question: aiReply,
      interviewEnded: shouldEnd,
    });

    // Report generation is handed off to the queue — a worker process
    // picks it up, so this request doesn't wait on the LLM call at all.
    if (shouldEnd) {
      await enqueueReportJob(interview._id);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const endInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    interview.status = "completed";
    await interview.save();

    await enqueueReportJob(interview._id);

    res.json({
      success: true,
      message: "Interview ended. Report generation has started.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getReport = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (!interview.report) {
      return res.status(202).json({
        success: false,
        message: "Report is still being generated, try again shortly",
      });
    }

    res.json({ success: true, report: interview.report });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
