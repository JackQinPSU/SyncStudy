// ─────────────────────────────────────────
// Calls GPT to generate the 60-min session plan with role assignments.
// Expects: { session_input: {...}, prioritized_topics: [...] }
// ─────────────────────────────────────────
import { Router } from "express";
import { generateSessionPlan } from "../services/openaiService.js";
const router = Router();

router.post("/", async (req, res) => {
  const { session_input, prioritized_topics } = req.body;

  if (!session_input || !prioritized_topics)
    return res.status(400).json({ error: "session_input and prioritized_topics are required" });

  try {
    // Attach member scores to each topic so GPT can assign roles by competency
    const enriched = prioritized_topics.map(t => ({
      ...t,
      member_scores: Object.fromEntries(
        session_input.members.map(m => [m.name, m.scores?.[t.topic] ?? 3])
      ),
    }));

    const data = await generateSessionPlan(
      session_input.course,
      session_input.exam_date,
      session_input.duration_minutes ?? 60,
      enriched
    );
    res.json(data);
  } catch (err) {
    console.error("Plan error:", err.message);
    res.status(500).json({ error: "GPT call failed" });
  }
});

export default router;