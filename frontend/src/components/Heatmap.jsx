// ─────────────────────────────────────────
// Step 2: Weakness heatmap — the "wow factor" visual
// ─────────────────────────────────────────
export default function Heatmap({ sessionInput, weaknesses, onNext }) {
  const { members, topics } = sessionInput;

  const cellColor = s => s <= 2 ? "#e74c3c" : s === 3 ? "#f39c12" : "#27ae60";
  const priorityTag = p => p === 1 ? "🔴 Critical" : p <= 3 ? "🟡 Important" : "🟢 Solid";

  return (
    <div className="card">
      <h2>Group Weakness Map</h2>
      <p className="subtitle-text">
        Red cells = everyone struggles here. These get the most session time.
      </p>

      <div className="table-wrapper">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th>Member \ Topic</th>
              {topics.map(t => <th key={t}>{t}</th>)}
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.name}>
                <td><strong>{m.name}</strong></td>
                {topics.map(t => {
                  const v = m.scores[t] ?? 3;
                  return (
                    <td key={t} style={{
                      background: cellColor(v),
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                      fontSize: "1.1rem",
                      borderRadius: "4px",
                      padding: "10px 14px",
                    }}>{v}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Priority Ranking</h3>
      <div className="priority-list">
        {weaknesses.map(w => (
          <div key={w.topic} className="priority-row">
            <span className="priority-num">#{w.priority}</span>
            <span className="priority-topic">{w.topic}</span>
            <span className="priority-avg">avg {w.avg_score}/5</span>
            <span className="priority-label">{priorityTag(w.priority)}</span>
            {w.weak_members.length > 0 && (
              <span className="weak-members">⚠️ {w.weak_members.join(", ")} need help</span>
            )}
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={onNext}>
        Generate 60-Min Session Plan →
      </button>
    </div>
  );
}