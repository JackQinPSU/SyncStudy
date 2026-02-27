// ─────────────────────────────────────────
// Step 4: Post-session weakness report
// ─────────────────────────────────────────
export default function ReportCard({ report }) {
  const r = report?.report;
  if (!r) return <div className="card"><p>No report data available.</p></div>;

  return (
    <div className="card">
      <h2>📊 Post-Session Report</h2>

      <div className="report-summary"><p>{r.summary}</p></div>

      <h3>🚨 Critical Topics Before Exam</h3>
      <div className="topic-list">
        {r.critical_topics?.map(t => (
          <span key={t} className="topic-chip danger">{t}</span>
        ))}
      </div>

      <h3>👤 Per-Member Action Plan</h3>
      <div className="member-reports">
        {r.per_member?.map(m => (
          <div key={m.name} className="member-report-card">
            <h4>{m.name}</h4>
            <p><strong>Focus on: </strong>{m.focus_before_exam?.join(", ")}</p>
            <p><strong>Strength: </strong>{m.strength}</p>
          </div>
        ))}
      </div>

      <div className="next-session-box">
        <strong>📅 Recommended Next Session: </strong>{r.recommended_next_session}
      </div>

      <button className="btn-secondary" onClick={() => window.location.reload()} style={{ marginTop: "2rem" }}>
        ↩ Start New Session
      </button>
    </div>
  );
}