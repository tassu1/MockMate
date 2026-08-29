import express from "express";
import auth from "../middlewares/authmiddle.js";
import {
  startInterview,
  answerInterview,
  endInterview,
  getReport,
} from "../controllers/interview.js";

const router = express.Router();

router.post("/start", auth, startInterview);
router.post("/:id/answer", auth, answerInterview);
router.post("/:id/end", auth, endInterview);
router.get("/:id/report", auth, getReport);

export default router;
