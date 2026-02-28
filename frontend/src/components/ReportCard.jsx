export default function ReportCard({ report }) {
  const r = report?.report;
  if (!r) return (
    <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-3)" }}>
      No report data available.
    </div>
  );

  return (
    <>
      <div className="page-head">
        <p className="page-eyebrow">Step 4 of 4</p>
        <h1 className="page-title">Session complete.</h1>
        <p className="page-sub">Here's what your group should focus on before the exam.</p>
      </div>

      <div className="report-summary-block">{r.summary}</div>

      {r.critical_topics?.length > 0 && (
        <div style={{ marginBottom: "36px" }}>
          <p className="section-label" style={{ marginBottom: "12px" }}>Critical Before Exam</p>
          <div className="critical-chips">
            {r.critical_topics.map(t => (
              <span key={t} className="critical-chip">{t}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: "36px" }}>
        <p className="section-label" style={{ marginBottom: "12px" }}>Action Plans</p>
        <div className="members-grid">
          {r.per_member?.map(m => (
            <div key={m.name} className="member-card">
              <div className="member-card-head">
                <div className="member-avatar">
                  {m.name.slice(0, 2).toUpperCase()}
                </div>
                {m.name}
              </div>
              <div className="member-card-body">
                <ul className="member-focuses">
                  {m.focus_before_exam?.map(f => <li key={f}>{f}</li>)}
                </ul>
                <span className="member-strength-tag">{m.strength}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="next-session-card">
        <p className="next-session-eyebrow">Recommended Next Session</p>
        <p className="next-session-text">{r.recommended_next_session}</p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-outline btn-md" onClick={() => window.location.reload()}>
          Start New Session
        </button>
      </div>
    </>
  );
}
