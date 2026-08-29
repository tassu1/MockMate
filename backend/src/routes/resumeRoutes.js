import express from "express";
import auth from "../middlewares/authmiddle.js";
import upload from "../middlewares/upload.js";
import { uploadResume, listResumes } from "../controllers/Resume.js";

const router = express.Router();

router.post("/upload", auth, upload.single("resume"), uploadResume);
router.get("/", auth, listResumes);

export default router;
