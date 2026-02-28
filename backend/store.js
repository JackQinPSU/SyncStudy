// ─────────────────────────────────────────
// In-memory session store — no DB needed.
// Sessions live until the server restarts.
// ─────────────────────────────────────────

export const sessions = new Map();

function genId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function createSession(sessionInput, prioritizedTopics) {
  const id = genId();

  const topicStats = {};
  prioritizedTopics.forEach(t => {
    topicStats[t.topic] = {
      allocatedMinutes: t.allocatedMinutes,
      incorrectCount:   0,
      correctCount:     0,
      critical:         false,
    };
  });

  const session = {
    id,
    createdAt:         Date.now(),
    sessionInput,
    prioritizedTopics: prioritizedTopics.map(t => ({ ...t })),
    topicStats,
    currentBlock:      0,
    presence:          {}, // { memberName: lastSeenEpochMs }
  };

  sessions.set(id, session);
  return session;
}

// A member is "online" if their heartbeat is < 8s ago
export function getOnlineMembers(session) {
  const now = Date.now();
  return Object.entries(session.presence)
    .filter(([, t]) => now - t < 8000)
    .map(([name]) => name);
}
