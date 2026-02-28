export default function Heatmap({ sessionInput, weaknesses, onNext }) {
  const { members, topics } = sessionInput;

  const heatClass    = s => s <= 1 ? "h1" : s === 2 ? "h2" : s === 3 ? "h3" : s === 4 ? "h4" : "h5";
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
