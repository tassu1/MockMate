import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["ai", "candidate"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const reportSchema = new mongoose.Schema(
  {
    overallScore: {
      type: Number, // 0-100
    },
    categoryScores: {
      technicalKnowledge: Number,
      communication: Number,
      problemSolving: Number,
      resumeAlignment: Number,
    },
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    summary: String,
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    experienceLevel: {
      type: String,
      enum: ["intern", "junior", "mid", "senior", "lead"],
      default: "mid",
    },

    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },

    // How many questions to ask before wrapping up
    questionLimit: {
      type: Number,
      default: 8,
    },

    messages: [messageSchema],

    report: reportSchema,
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
