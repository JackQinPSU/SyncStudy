import { useState } from "react";
import { useSessionPoll } from "../hooks/useSessionPoll";

export default function Heatmap({ sessionInput, weaknesses, sessionId, onNext }) {
  const { members, topics } = sessionInput;
  const [copied, setCopied] = useState(false);

  const sessionState  = useSessionPoll(sessionId);
  const onlineMembers = sessionState?.onlineMembers ?? [];
  const joinUrl       = sessionId
    ? `${window.location.origin}/?session=${sessionId}`
    : null;

  function copyLink() {
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const heatClass     = s => s <= 1 ? "h1" : s === 2 ? "h2" : s === 3 ? "h3" : s === 4 ? "h4" : "h5";
  const priorityClass = p => p === 1 ? "p-critical" : p <= 3 ? "p-important" : "p-solid";
  const tagClass      = p => p === 1 ? "tag-critical" : p <= 3 ? "tag-important" : "tag-solid";
  const tagLabel      = p => p === 1 ? "Critical" : p <= 3 ? "Important" : "Solid";

  return (
    <>
      <div className="page-head">
        <p className="page-eyebrow">Step 2 of 4</p>
        <h1 className="page-title">Here's where you need work.</h1>
        <p className="page-sub">
          Red cells mean the group struggles here — these topics get the most session time.
        </p>
      </div>

      {/* Session join bar */}
      {joinUrl && (
        <div className="session-bar">
          <div className="session-bar-left">
            <span className="session-id-label">Session</span>
            <span className="session-id-code">{sessionId}</span>
          </div>

          <div className="presence-dots">
            {onlineMembers.map(m => (
              <span key={m} className="presence-dot">{m}</span>
            ))}
            {onlineMembers.length === 0 && (
              <span style={{ color: "#555", fontSize: "0.78rem" }}>No one joined yet</span>
            )}
          </div>

          <button className="btn btn-outline btn-sm" onClick={copyLink}>
            {copied ? "✓ Copied" : "Copy join link"}
          </button>
        </div>
      )}

      <div style={{ marginBottom: "32px" }}>
        <p className="section-label" style={{ marginBottom: "10px" }}>Confidence Heatmap</p>
        <div className="data-table-wrap">
          <table className="heatmap-table">
            <thead>
              <tr>
                <th>Member</th>
                {topics.map(t => <th key={t}>{t}</th>)}
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.name}>
                  <td>{m.name}</td>
                  {topics.map(t => {
                    const v = m.scores[t] ?? 3;
                    return <td key={t} className={heatClass(v)}>{v}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginBottom: "40px" }}>
        <p className="section-label" style={{ marginBottom: "10px" }}>Priority Ranking</p>
        <div className="priority-list">
          {weaknesses.map(w => (
            <div key={w.topic} className="priority-item">
              <div className={`priority-num ${priorityClass(w.priority)}`}>{w.priority}</div>
              <span className="priority-topic">{w.topic}</span>
              {w.weak_members.length > 0 && (
                <span className="weak-members-text">{w.weak_members.join(", ")} need help</span>
              )}
              <span className="priority-avg">{w.avg_score}/5</span>
              <span className={`priority-tag ${tagClass(w.priority)}`}>{tagLabel(w.priority)}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-dark btn-lg" onClick={onNext}>
          Generate Session Plan →
        </button>
      </div>
    </>
  );
}
