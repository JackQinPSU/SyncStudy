import { useState } from "react";

const INIT_TOPICS  = ["Recursion", "Big-O Notation", "Sorting Algorithms", "Graphs", "Dynamic Programming"];
const INIT_MEMBERS = ["Alice", "Bob", "Carol", "Dave"];

export default function SetupForm({ onSubmit }) {
  const [course,      setCourse]      = useState("Data Structures & Algorithms");
  const [examDate,    setExamDate]    = useState("");
  const [duration,    setDuration]    = useState(60);
  const [topics,      setTopics]      = useState(INIT_TOPICS);
  const [topicInput,  setTopicInput]  = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [members,     setMembers]     = useState(
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

  function renameMember(mi, name) {
    setMembers(prev => prev.map((m, i) => i !== mi ? m : { ...m, name }));
  }

  function addMember() {
    const name = memberInput.trim();
    if (!name || members.some(m => m.name === name)) return;
    setMembers(p => [...p, { name, scores: Object.fromEntries(topics.map(t => [t, 3])) }]);
    setMemberInput("");
  }

  function removeMember(mi) {
    setMembers(prev => prev.filter((_, i) => i !== mi));
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
    onSubmit({ course, exam_date: examDate, duration_minutes: duration, topics, members });
  }

  const scoreBadgeClass = v => `score-badge s${v}`;

  return (
    <form onSubmit={handleSubmit}>
      <div className="page-head">
        <p className="page-eyebrow">Step 1 of 4</p>
        <h1 className="page-title">Set up your session.</h1>
        <p className="page-sub">
          Rate each member's confidence per topic — we'll use this to build a personalized plan.
        </p>
      </div>

      <div className="form-row">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Course</label>
          <input
            className="form-input"
            value={course}
            onChange={e => setCourse(e.target.value)}
            placeholder="e.g. Data Structures"
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Exam Date</label>
          <input
            className="form-input"
            type="date"
            value={examDate}
            onChange={e => setExamDate(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Session Duration</label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            className="form-input"
            type="number"
            min="15"
            max="480"
            step="5"
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            style={{ width: "90px" }}
          />
          <span style={{ fontSize: "13px", color: "var(--text-3)" }}>minutes</span>
        </div>
      </div>

      <div className="divider" />

      <div className="form-group">
        <label className="form-label">Topics</label>
        <div className="chips-wrap">
          {topics.map(t => (
            <span key={t} className="chip">
              {t}
              <button type="button" className="chip-x" onClick={() => removeTopic(t)}>×</button>
            </span>
          ))}
        </div>
        <div className="add-row">
          <input
            className="form-input"
            placeholder="Add a topic…"
            value={topicInput}
            onChange={e => setTopicInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTopic())}
          />
          <button type="button" className="btn btn-outline btn-sm" onClick={addTopic}>Add</button>
        </div>
      </div>

      <div className="divider" />

      <div className="form-group">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
          <label className="form-label" style={{ margin: 0 }}>Confidence Matrix</label>
          <span style={{ fontSize: "12px", color: "var(--text-3)" }}>1 = lost &nbsp;·&nbsp; 5 = solid</span>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                {topics.map(t => <th key={t}>{t}</th>)}
                <th style={{ width: "40px" }} />
              </tr>
            </thead>
            <tbody>
              {members.map((m, mi) => (
                <tr key={mi}>
                  <td>
                    <input
                      className="name-input"
                      value={m.name}
                      onChange={e => renameMember(mi, e.target.value)}
                    />
                  </td>
                  {topics.map(t => {
                    const v = m.scores[t] ?? 3;
                    return (
                      <td key={t} className="score-cell">
                        <input
                          type="range"
                          className="score-range"
                          min="1" max="5" value={v}
                          onChange={e => updateScore(mi, t, e.target.value)}
                        />
                        <span className={scoreBadgeClass(v)}>{v}</span>
                      </td>
                    );
                  })}
                  <td style={{ textAlign: "center" }}>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeMember(mi)}
                      title="Remove member"
                    >×</button>
                  </td>
                </tr>
              ))}
              <tr className="table-add-row">
                <td colSpan={topics.length + 2}>
                  <div className="add-row" style={{ margin: "2px 0" }}>
                    <input
                      className="form-input"
                      placeholder="Add member…"
                      value={memberInput}
                      onChange={e => setMemberInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addMember())}
                      style={{ height: "32px", fontSize: "13px" }}
                    />
                    <button type="button" className="btn btn-outline btn-sm" onClick={addMember}>Add</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "4px" }}>
        <button type="submit" className="btn btn-dark btn-lg">
          Analyze Weaknesses →
        </button>
      </div>
    </form>
  );
}
