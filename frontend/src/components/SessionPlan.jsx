// ─────────────────────────────────────────
// Step 3: 60-min session plan with roles + expandable question panels
// ─────────────────────────────────────────
import { useState } from "react";
import QuestionPanel from "./QuestionPanel";

const ROLE_COLORS = {
  Explainer:  "#3498db",
  Questioner: "#e74c3c",
  Challenger: "#9b59b6",
  Reviewer:   "#27ae60",
};

export default function SessionPlan({ plan, sessionInput, onFinish }) {
  const [activeBlock, setActiveBlock] = useState(null);
  const blocks = plan?.session_plan ?? [];

  return (
    <div className="card">
      <h2>60-Minute Session Plan</h2>
      <p className="subtitle-text">Click a block to open practice questions.</p>

      <div className="blocks-list">
        {blocks.map((block, i) => (
          <div key={i} className="block-card">
            <div className="block-header">
              <span className="block-num">Block {block.block}</span>
              <span className="block-topic">{block.topic}</span>
              <span className="block-duration">⏱ {block.duration_minutes} min</span>
            </div>

            <p className="block-goal">🎯 {block.goal}</p>

            <div className="roles-row">
              {Object.entries(block.roles ?? {}).map(([role, person]) => (
                <div key={role} className="role-badge" style={{ borderLeft: `4px solid ${ROLE_COLORS[role] ?? "#888"}` }}>
                  <span className="role-name">{role}</span>
                  <span className="role-person">{person}</span>
                </div>
              ))}
            </div>

            <button
              className="btn-secondary"
              onClick={() => setActiveBlock(activeBlock === i ? null : i)}
            >
              {activeBlock === i ? "▲ Hide Questions" : "▼ Practice Questions"}
            </button>

            {activeBlock === i && (
              <QuestionPanel topic={block.topic} course={sessionInput.course} />
            )}
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={onFinish} style={{ marginTop: "2rem" }}>
        Generate Post-Session Report →
      </button>
    </div>
  );
}