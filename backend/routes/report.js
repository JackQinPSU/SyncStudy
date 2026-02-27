// ─────────────────────────────────────────
// Generates the post-session weakness report.
// Expects: { session_input: {...}, prioritized_topics: [...] }
// ─────────────────────────────────────────
import { Router } from "express";
import { generateReport } from "../services/openaiService.js";
const router = Router();

router.post("/", async (req, res) => {
  const { session_input, prioritized_topics } = req.body;

  if (!session_input || !prioritized_topics)
    return res.status(400).json({ error: "session_input and prioritized_topics are required" });

  try {
    const data = await generateReport(
      session_input.course,
      session_input.exam_date,
      prioritized_topics,
      session_input.members
    );
    res.json(data);
  } catch (err) {
    console.error("Report error:", err.message);
    res.status(500).json({ error: "GPT call failed" });
  }
});

export default router;