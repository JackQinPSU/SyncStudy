// ─────────────────────────────────────────
// Loads + displays practice questions for a topic.
// "We got stuck" → adaptive re-fetch at deeper depth.
// ─────────────────────────────────────────
import { useState, useEffect } from "react";
import { generateQuestions } from "../api/client";

const TYPE_COLORS = { conceptual: "#3498db", application: "#27ae60", debugging: "#e74c3c", comparison: "#9b59b6" };

export default function QuestionPanel({ topic, course }) {
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [hints,     setHints]     = useState({});
  const [adapted,   setAdapted]   = useState(false);

  async function load(depth = "normal") {
    setLoading(true);
    try {
      const data = await generateQuestions(topic, course, depth);
      setQuestions(data.questions ?? []);
      setHints({});
    } catch {
      setQuestions([{ id: 0, question: "Failed to load questions — check backend.", hint: "", type: "conceptual" }]);
    } finally { setLoading(false); }
  }

  useEffect(() => { load("normal"); }, [topic]);

  function handleStuck() {
    setAdapted(true);
    load("deeper");
  }

  if (loading) return <div className="q-panel"><p style={{color:"#888"}}>⏳ Generating questions...</p></div>;

  return (
    <div className="q-panel">
      {questions.map((q, i) => (
        <div key={q.id ?? i} className="question-card">
          <div className="q-header">
            <span className="q-num">Q{i + 1}</span>
            <span className="q-type" style={{ background: TYPE_COLORS[q.type] ?? "#555" }}>{q.type}</span>
          </div>
          <p className="q-text">{q.question}</p>
          {q.hint && (
            <>
              <button className="btn-ghost" onClick={() => setHints(h => ({ ...h, [i]: !h[i] }))}>
                {hints[i] ? "Hide hint" : "Show hint 💡"}
              </button>
              {hints[i] && <p className="q-hint">💡 {q.hint}</p>}
            </>
          )}
        </div>
      ))}

      <button className="btn-danger" onClick={handleStuck} disabled={loading}>
        😵 We got stuck — give us simpler questions
      </button>
      {adapted && <p className="adapt-note">✅ Adapted to simpler questions. Keep going!</p>}
    </div>
  );
}