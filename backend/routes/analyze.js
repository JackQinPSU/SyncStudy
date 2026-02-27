// ─────────────────────────────────────────
// Pure logic — no GPT. Calculates weakness scores from member input.
// Expects: { topics: string[], members: [{ name, scores: { topic: number } }] }
// ─────────────────────────────────────────
import { Router } from "express";
const router = Router();

router.post("/", (req, res) => {
  const { topics, members } = req.body;

  if (!topics?.length || !members?.length)
    return res.status(400).json({ error: "topics and members are required" });

  const results = topics.map(topic => {
    const scores      = members.map(m => m.scores?.[topic] ?? 3);
    const avg         = scores.reduce((a, b) => a + b, 0) / scores.length;
    const weakMembers = members
      .filter(m => (m.scores?.[topic] ?? 3) <= 2)
      .map(m => m.name);

    return { topic, avg_score: Math.round(avg * 100) / 100, weak_members: weakMembers };
  });

  // Sort lowest avg first (highest priority)
  results.sort((a, b) => a.avg_score - b.avg_score);
  results.forEach((r, i) => (r.priority = i + 1));

  res.json(results);
});

export default router;