import Interview from "../models/interview.js";
import Resume from "../models/resume.js";
import { chatComplete, chatCompleteStream } from "../utils/ai.js";
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

/**
 * Streams the interviewer's reply back to the client over SSE.
 *
 * Event shapes written to the stream (each as `data: <json>\n\n`):
 *   { content: "..." }                    -> one chunk of the reply, append it
 *   { done: true, interviewEnded: bool }  -> final event, stream is about to end
 *   { error: "message" }                  -> something went wrong mid-stream
 *
 * IMPORTANT: once headers are flushed for SSE, you can no longer send a
 * normal res.status(500).json(...) — that's why validation happens BEFORE
 * we call startSSE(), and anything that fails AFTER is sent as an
 * `{ error }` event instead, followed by res.end().
 */
export const answerInterview = async (req, res) => {
  const { message } = req.body;
  const { id } = req.params;

  // --- validation happens before we touch SSE headers ---
  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: "message is required",
    });
  }

  let interview;
  try {
    interview = await Interview.findOne({
      _id: id,
      user: req.user.id,
    }).populate("resume");
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

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

  // --- from here on, we're committed to the stream ---
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", // disable nginx buffering if you're behind it
  });

  const send = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  try {
    interview.messages.push({ sender: "candidate", content: message });

    const questionsAskedSoFar = interview.messages.filter(
      (m) => m.sender === "ai"
    ).length;

    // Defensive fallback in case questionLimit isn't set on the document
    // (e.g. missing schema default) — without this, undefined >= undefined
    // is false and the interview would never auto-end on question count.
    const questionLimit = interview.questionLimit || 8;
    const reachedLimit = questionsAskedSoFar >= questionLimit;

    let aiReply = "";
    let shouldEnd = false;

    if (reachedLimit) {
      aiReply =
        "That wraps up the interview — thanks for your time. Your performance report is being generated now.";
      shouldEnd = true;
      send({ content: aiReply });
    } else {
      const systemPrompt = buildInterviewerSystemPrompt({
        role: interview.role,
        experienceLevel: interview.experienceLevel,
        resumeText: interview.resume.rawText,
      });

      const history = interview.messages.map((m) => ({
        role: m.sender === "ai" ? "assistant" : "user",
        content: m.content,
      }));

      aiReply = await chatCompleteStream(
        [{ role: "system", content: systemPrompt }, ...history],
        (chunk) => send({ content: chunk })
      );
    }

    interview.messages.push({ sender: "ai", content: aiReply });

    if (shouldEnd) {
      interview.status = "completed";
    }

    await interview.save();

    send({ done: true, interviewEnded: shouldEnd });
    res.end();

    if (shouldEnd) {
      await enqueueReportJob(interview._id);
    }
  } catch (error) {
    send({ error: error.message || "Something went wrong." });
    res.end();
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