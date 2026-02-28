import { useState } from "react";
import QuestionPanel from "./QuestionPanel";
import { useSessionPoll } from "../hooks/useSessionPoll";
import { recordAnswer } from "../api/client";

const ACCENT_COLORS = [
  "#4F46E5", "#7C3AED", "#0EA5E9", "#10B981", "#F59E0B",
  "#EF4444", "#8B5CF6", "#06B6D4", "#14B8A6", "#F97316",
];

export default function SessionPlan({ plan, sessionInput, sessionId, onFinish }) {
  const [activeBlock, setActiveBlock] = useState(null);
  const blocks = plan?.session_plan ?? [];

  const sessionState    = useSessionPoll(sessionId);
  const livePriorities  = sessionState?.prioritizedTopics ?? [];

  function handleAnswer(topic, result) {
    if (sessionId) recordAnswer(sessionId, topic, result).catch(() => {});
  }

  return (
    <>
      <div className="page-head">
        <p className="page-eyebrow">Step 3 of 4</p>
        <h1 className="page-title">Your session plan.</h1>
        <p className="page-sub">Work through each block. Open any block to practice questions.</p>
      </div>

      {/* Live priority panel */}
      {livePriorities.length > 0 && (
        <div className="live-priority-panel">
          <p className="section-label" style={{ marginBottom: "10px" }}>
            Live Priorities
            <span className="live-dot" />
          </p>
          <div className="priority-list compact">
            {livePriorities.map(t => (
              <div key={t.topic} className={`priority-item${t.critical ? " critical" : ""}`}>
                <div className="priority-num">{t.priority}</div>
                <span className="priority-topic">{t.topic}</span>
                {t.critical && <span className="critical-badge">Critical</span>}
                <span style={{ marginLeft: "auto", color: "var(--text-3)", fontSize: "0.78rem" }}>
                  {t.allocatedMinutes} min
                </span>
              </div>
            ))}
          </div>
          <p style={{ color: "var(--text-3)", fontSize: "0.75rem", marginTop: "6px" }}>
            Re-ranks automatically when questions are answered incorrectly.
          </p>
        </div>
      )}

      <div className="timeline">
        {blocks.map((block, i) => (
          <div key={i} className="timeline-item">
            <div className="timeline-dot" />
            <div className="block-card">
              <div
                className="block-header"
                onClick={() => setActiveBlock(activeBlock === i ? null : i)}
              >
                <div
                  className="block-accent"
                  style={{ background: ACCENT_COLORS[i % ACCENT_COLORS.length] }}
                />
                <div className="block-num">{block.block}</div>
                <span className="block-topic">{block.topic}</span>
                <span className="block-duration">{block.duration_minutes} min</span>
              </div>

              <div className="block-body">
                <p className="block-goal">{block.goal}</p>
                <div className="roles-grid">
                  {Object.entries(block.roles ?? {}).map(([role, person]) => (
                    <div key={role} className="role-pill">
                      <span className="role-label-text">{role}</span>
                      <span className="role-person-name">{person}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="q-toggle"
                onClick={() => setActiveBlock(activeBlock === i ? null : i)}
                type="button"
              >
                <span>Practice Questions</span>
                <span className={`q-toggle-chevron${activeBlock === i ? " open" : ""}`}>▼</span>
              </button>

              {activeBlock === i && (
                <QuestionPanel
                  topic={block.topic}
                  course={sessionInput.course}
                  onAnswer={handleAnswer}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-dark btn-lg" onClick={onFinish}>
          Generate Report →
        </button>
      </div>
    </>
  );
}
