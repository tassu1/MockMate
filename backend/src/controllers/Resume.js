import pdfParse from "pdf-parse";
import Resume from "../models/resume.js";

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const parsed = await pdfParse(req.file.buffer);
    const rawText = parsed.text?.trim();

    if (!rawText) {
      return res.status(400).json({
        success: false,
        message: "Could not extract text from this PDF",
      });
    }

    const resume = await Resume.create({
      user: req.user.id,
      filename: req.file.originalname,
      rawText,
    });

    res.status(201).json({
      success: true,
      resume: {
        id: resume._id,
        filename: resume.filename,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const listResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id })
      .select("filename createdAt")
      .sort({ createdAt: -1 });

    res.json({ success: true, resumes });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
