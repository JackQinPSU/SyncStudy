// ─────────────────────────────────────────
// Pure logic — no GPT. Multi-signal weakness scoring + session creation.
// Expects full sessionInput: { topics, members, duration_minutes?, ... }
// Returns: { sessionId, topics: [...] }
// ─────────────────────────────────────────
import { Router } from "express";
import { prioritizeTopics } from "../services/prioritize.js";
import { createSession } from "../store.js";

const router = Router();

router.post("/", (req, res) => {
  const { topics, members, duration_minutes = 60 } = req.body;

  if (!topics?.length || !members?.length)
    return res.status(400).json({ error: "topics and members are required" });

  const prioritized = prioritizeTopics(topics, members, duration_minutes);
  const session     = createSession(req.body, prioritized);

  res.json({ sessionId: session.id, topics: prioritized });
});

export default router;
