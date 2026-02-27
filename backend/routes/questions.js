// ─────────────────────────────────────────
// Generates practice questions per topic. Supports adaptive depth.
// Expects: { topic: string, course: string, depth?: "normal" | "deeper" }
// ─────────────────────────────────────────
import { Router } from "express";
import { generateQuestions } from "../services/openaiService.js";
const router = Router();

router.post("/", async (req, res) => {
  const { topic, course, depth = "normal" } = req.body;

  if (!topic || !course)
    return res.status(400).json({ error: "topic and course are required" });

  try {
    const data = await generateQuestions(topic, course, depth);
    res.json(data);
  } catch (err) {
    console.error("Questions error:", err.message);
    res.status(500).json({ error: "GPT call failed" });
  }
});

export default router;