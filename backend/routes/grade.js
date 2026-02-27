// ─────────────────────────────────────────
// Grades a student's open-ended answer against the model answer via GPT.
// Expects: { question, correct_answer, user_answer }
// ─────────────────────────────────────────
import { Router } from "express";
import { gradeAnswer } from "../services/openaiService.js";
const router = Router();

router.post("/", async (req, res) => {
  const { question, correct_answer, user_answer } = req.body;

  if (!question || !correct_answer || !user_answer)
    return res.status(400).json({ error: "question, correct_answer, and user_answer are required" });

  try {
    const data = await gradeAnswer(question, correct_answer, user_answer);
    res.json(data);
  } catch (err) {
    console.error("Grade error:", err.message);
    res.status(500).json({ error: "GPT call failed" });
  }
});

export default router;
