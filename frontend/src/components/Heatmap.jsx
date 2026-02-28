export default function Heatmap({ sessionInput, weaknesses, onNext }) {
  const { members, topics } = sessionInput;

  const heatClass    = s => s <= 1 ? "h1" : s === 2 ? "h2" : s === 3 ? "h3" : s === 4 ? "h4" : "h5";
  const priorityClass = p => p === 1 ? "p-critical" : p <= 3 ? "p-important" : "p-solid";
  const tagClass      = p => p === 1 ? "tag-critical" : p <= 3 ? "tag-important" : "tag-solid";
  const tagLabel      = p => p === 1 ? "Critical" : p <= 3 ? "Important" : "Solid";

  const criticalCount  = weaknesses.filter(w => w.priority === 1).length;
  const needsWorkCount = weaknesses.filter(w => w.priority > 1 && w.priority <= 3).length;
  const solidCount     = weaknesses.filter(w => w.priority > 3).length;

  return (
    <>
      <div className="page-head">
        <p className="page-eyebrow">Step 2 of 4</p>
        <h1 className="page-title">Here's where you need work.</h1>
        <p className="page-sub">
          Red cells mean the group struggles here — these topics get the most session time.
        </p>
      </div>

      {/* Stats summary */}
      <div className="heatmap-stats">
        <div className="hstat">
          <span className="hstat-num critical">{criticalCount}</span>
          <span className="hstat-label">Critical</span>
        </div>
        <div className="hstat">
          <span className="hstat-num caution">{needsWorkCount}</span>
          <span className="hstat-label">Needs Work</span>
        </div>
        <div className="hstat">
          <span className="hstat-num solid">{solidCount}</span>
          <span className="hstat-label">Solid</span>
        </div>
      </div>

      <div style={{ marginBottom: "36px" }}>
        <p className="section-label" style={{ marginBottom: "12px" }}>Confidence Heatmap</p>
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

      <div style={{ marginBottom: "48px" }}>
        <p className="section-label" style={{ marginBottom: "12px" }}>Priority Ranking</p>
        <div className="priority-list">
          {weaknesses.map(w => (
            <div key={w.topic} className="priority-item">
              <div className={`priority-num ${priorityClass(w.priority)}`}>{w.priority}</div>
              <div className="priority-info">
                <div className="priority-topic">{w.topic}</div>
                {w.weak_members?.length > 0 && (
                  <div className="strength-bar-track">
                    <div
                      className="strength-bar-fill"
                      style={{
                        width: `${((5 - w.avg_score) / 4) * 100}%`,
                        background: w.priority === 1 ? "var(--heat-1-c)" : w.priority <= 3 ? "var(--heat-2-c)" : "var(--heat-5-c)",
                      }}
                    />
                  </div>
                )}
              </div>
              {w.weak_members?.length > 0 && (
                <span className="weak-members-text">{w.weak_members.join(", ")}</span>
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
