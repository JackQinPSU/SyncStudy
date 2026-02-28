// ─────────────────────────────────────────
// Multi-signal topic prioritization — no GPT involved.
//
// weaknessScore(t) = α·(5 − avg)  +  β·stdDev  +  γ·weakRatio
//   avg       = mean confidence score across all members
//   stdDev    = disagreement signal — high variance = worth discussing
//   weakRatio = fraction of members scoring ≤ 2 (actively lost)
//
// timeWeight(t) = weaknessScore(t) / Σ weaknessScore
// allocatedMinutes(t) = round(timeWeight(t) × totalMinutes)  [min 5]
// ─────────────────────────────────────────

const ALPHA = 0.5; // avg weakness
const BETA  = 0.3; // std dev (disagreement)
const GAMMA = 0.2; // weak ratio (struggling)

function mean(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }
function std(arr)  {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length);
}
function r2(n) { return Math.round(n * 100) / 100; }

export function prioritizeTopics(topics, members, totalMinutes) {
  const stats = topics.map(topic => {
    const scores     = members.map(m => m.scores?.[topic] ?? 3);
    const avg        = mean(scores);
    const stdDev     = std(scores);
    const weakRatio  = scores.filter(s => s <= 2).length / scores.length;
    const weakness   = ALPHA * (5 - avg) + BETA * stdDev + GAMMA * weakRatio;
    const discussion = r2(stdDev / (avg + 0.1));
    const weakMembers = members.filter(m => (m.scores?.[topic] ?? 3) <= 2).map(m => m.name);

    return {
      topic,
      avg:              r2(avg),
      avg_score:        r2(avg),        // backward compat with Heatmap
      stdDev:           r2(stdDev),
      weakRatio:        r2(weakRatio),
      weaknessScore:    r2(weakness),
      discussionValue:  discussion,
      weakMembers,
      weak_members:     weakMembers,    // backward compat with Heatmap
    };
  });

  const total = stats.reduce((s, t) => s + t.weaknessScore, 0) || 1;
  stats.sort((a, b) => b.weaknessScore - a.weaknessScore);

  return stats.map((t, i) => ({
    ...t,
    priority:         i + 1,
    allocatedMinutes: Math.max(5, Math.round((t.weaknessScore / total) * totalMinutes)),
    critical:         false,
  }));
}
