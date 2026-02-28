import { useState } from "react";
import QuestionPanel from "./QuestionPanel";

const ACCENT_COLORS = [
  "#4F46E5", "#7C3AED", "#0EA5E9", "#10B981", "#F59E0B",
  "#EF4444", "#8B5CF6", "#06B6D4", "#14B8A6", "#F97316",
];

export default function SessionPlan({ plan, sessionInput, onFinish }) {
  const [activeBlock, setActiveBlock] = useState(null);
  const blocks = plan?.session_plan ?? [];

  return (
    <>
      <div className="page-head">
        <p className="page-eyebrow">Step 3 of 4</p>
        <h1 className="page-title">Your session plan.</h1>
        <p className="page-sub">Work through each block. Open any block to practice questions.</p>
      </div>

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
                <QuestionPanel topic={block.topic} course={sessionInput.course} />
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
