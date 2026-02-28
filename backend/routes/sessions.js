// ─────────────────────────────────────────
// Session collaboration routes.
// GET  /:id          — poll state (members, priorities, stats)
// POST /:id/join     — register presence
// POST /:id/heartbeat — keep-alive (call every 5s)
// POST /:id/answer   — record answer result + adaptive reallocation
// ─────────────────────────────────────────
import { Router } from "express";
import { sessions, getOnlineMembers } from "../store.js";

const router = Router();
const MIN_BLOCK_MINUTES = 5;

// Poll session state
router.get("/:id", (req, res) => {
  const session = sessions.get(req.params.id.toUpperCase());
  if (!session) return res.status(404).json({ error: "Session not found" });

  res.json({
    id:                session.id,
    course:            session.sessionInput?.course,
    prioritizedTopics: session.prioritizedTopics,
    currentBlock:      session.currentBlock,
    onlineMembers:     getOnlineMembers(session),
    topicStats:        session.topicStats,
  });
});

// Join — register member presence
router.post("/:id/join", (req, res) => {
  const session = sessions.get(req.params.id.toUpperCase());
  if (!session) return res.status(404).json({ error: "Session not found" });

  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });

  session.presence[name] = Date.now();
  res.json({
    ok:            true,
    course:        session.sessionInput?.course,
    onlineMembers: getOnlineMembers(session),
  });
});

// Heartbeat — keep member "online" (< 8s threshold in store)
router.post("/:id/heartbeat", (req, res) => {
  const session = sessions.get(req.params.id.toUpperCase());
  if (!session) return res.status(404).json({ error: "Session not found" });

  const { name } = req.body;
  if (name) session.presence[name] = Date.now();
  res.json({ ok: true });
});

// Record answer + adaptive time reallocation
router.post("/:id/answer", (req, res) => {
  const session = sessions.get(req.params.id.toUpperCase());
  if (!session) return res.status(404).json({ error: "Session not found" });

  const { topic, result } = req.body; // result: "correct" | "partial" | "incorrect"
  if (!topic || !result) return res.status(400).json({ error: "topic and result required" });

  const stats = session.topicStats;
  if (!stats[topic]) {
    stats[topic] = { allocatedMinutes: 5, incorrectCount: 0, correctCount: 0, critical: false };
  }

  if (result === "correct") {
    stats[topic].correctCount++;
  } else {
    stats[topic].incorrectCount++;

    if (result === "incorrect") {
      // Steal 5 min from the easiest topic (highest avg) that still has time to spare
      const donor = session.prioritizedTopics
        .filter(t => t.topic !== topic && (stats[t.topic]?.allocatedMinutes ?? 0) > MIN_BLOCK_MINUTES)
        .sort((a, b) => b.avg - a.avg)[0];

      if (donor) {
        stats[donor.topic].allocatedMinutes -= 5;
        stats[topic].allocatedMinutes = (stats[topic].allocatedMinutes ?? 5) + 5;
      }

      // Flag as critical after 2 wrong answers
      if (stats[topic].incorrectCount >= 2) stats[topic].critical = true;
    }

    // Re-rank: boost weaknessScore by 0.15 per incorrect answer
    session.prioritizedTopics = session.prioritizedTopics
      .map(t => ({
        ...t,
        adjustedScore:    (t.weaknessScore ?? 0) + 0.15 * (stats[t.topic]?.incorrectCount ?? 0),
        allocatedMinutes: stats[t.topic]?.allocatedMinutes ?? t.allocatedMinutes,
        critical:         stats[t.topic]?.critical ?? false,
      }))
      .sort((a, b) => b.adjustedScore - a.adjustedScore)
      .map((t, i) => ({ ...t, priority: i + 1 }));
  }

  // Sync allocatedMinutes into prioritizedTopics for correct/partial too
  if (result !== "incorrect") {
    session.prioritizedTopics = session.prioritizedTopics.map(t => ({
      ...t,
      allocatedMinutes: stats[t.topic]?.allocatedMinutes ?? t.allocatedMinutes,
      critical:         stats[t.topic]?.critical ?? false,
    }));
  }

  res.json({ prioritizedTopics: session.prioritizedTopics, topicStats: stats });
});

export default router;
