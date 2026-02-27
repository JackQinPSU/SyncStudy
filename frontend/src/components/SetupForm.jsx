// ─────────────────────────────────────────
// Step 1: Collect course info + per-member confidence scores
// ─────────────────────────────────────────
import { useState } from "react";

const INIT_TOPICS  = ["Recursion", "Big-O Notation", "Sorting Algorithms", "Graphs", "Dynamic Programming"];
const INIT_MEMBERS = ["Alice", "Bob", "Carol", "Dave"];

export default function SetupForm({ onSubmit }) {
  const [course,     setCourse]     = useState("Data Structures & Algorithms");
  const [examDate,   setExamDate]   = useState("");
  const [topics,     setTopics]     = useState(INIT_TOPICS);
  const [topicInput, setTopicInput] = useState("");
  const [members,    setMembers]    = useState(
    INIT_MEMBERS.map(name => ({
      name,
      scores: Object.fromEntries(INIT_TOPICS.map(t => [t, 3])),
    }))
  );

  function updateScore(mi, topic, val) {
    setMembers(prev => prev.map((m, i) =>
      i !== mi ? m : { ...m, scores: { ...m.scores, [topic]: Number(val) } }
    ));
  }

  function addTopic() {
    const t = topicInput.trim();
    if (!t || topics.includes(t)) return;
    setTopics(p => [...p, t]);
    setMembers(p => p.map(m => ({ ...m, scores: { ...m.scores, [t]: 3 } })));
    setTopicInput("");
  }

  function removeTopic(t) {
    setTopics(p => p.filter(x => x !== t));
    setMembers(p => p.map(m => {
      const s = { ...m.scores }; delete s[t]; return { ...m, scores: s };
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!examDate) return alert("Please enter an exam date.");
    onSubmit({ course, exam_date: examDate, topics, members });
  }

  const scoreColor = v => ["#e74c3c","#e67e22","#f1c40f","#2ecc71","#27ae60"][v - 1];

  return (
    <div className="card">
      <h2>Session Setup</h2>

      <label>Course Name</label>
      <input value={course} onChange={e => setCourse(e.target.value)} />

      <label>Exam Date</label>
      <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} />

      <label>Topics</label>
      <div className="topic-list">
        {topics.map(t => (
          <span key={t} className="topic-chip">
            {t} <button type="button" onClick={() => removeTopic(t)}>×</button>
          </span>
        ))}
      </div>
      <div className="row">
        <input
          placeholder="Add a topic..."
          value={topicInput}
          onChange={e => setTopicInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTopic())}
        />
        <button type="button" className="btn-add" onClick={addTopic}>Add</button>
      </div>

      <h3>Confidence Ratings <span style={{fontWeight:400,color:"#888"}}>(1 = lost · 5 = solid)</span></h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              {topics.map(t => <th key={t}>{t}</th>)}
            </tr>
          </thead>
          <tbody>
            {members.map((m, mi) => (
              <tr key={m.name}>
                <td><strong>{m.name}</strong></td>
                {topics.map(t => {
                  const v = m.scores[t] ?? 3;
                  return (
                    <td key={t} style={{ textAlign: "center" }}>
                      <input
                        type="range" min="1" max="5" value={v}
                        onChange={e => updateScore(mi, t, e.target.value)}
                        style={{ accentColor: scoreColor(v), width: "80px" }}
                      />
                      <span className="score-badge" style={{ background: scoreColor(v) }}>{v}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="btn-primary" onClick={handleSubmit}>
        Analyze Weaknesses →
      </button>
    </div>
  );
}