// ─────────────────────────────────────────
// Loads + displays practice questions for a topic.
// Supports easier/harder depth and per-question answer grading.
// ─────────────────────────────────────────
import { useState, useEffect } from "react";
import { generateQuestions, gradeAnswer } from "../api/client";

const TYPE_COLORS = { conceptual: "#3498db", application: "#27ae60", debugging: "#e74c3c", comparison: "#9b59b6" };

const RESULT_STYLE = {
  correct:   { color: "#27ae60", label: "✓ Correct"   },
  partial:   { color: "#f39c12", label: "~ Partial"   },
  incorrect: { color: "#e74c3c", label: "✗ Incorrect" },
};

export default function QuestionPanel({ topic, course }) {
  const [questions,    setQuestions]    = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [depth,        setDepth]        = useState("normal");
  const [hints,        setHints]        = useState({});
  const [showAnswer,   setShowAnswer]   = useState({});
  const [userAnswers,  setUserAnswers]  = useState({});
  const [results,      setResults]      = useState({});
  const [grading,      setGrading]      = useState({});

  async function load(newDepth) {
    setLoading(true);
    setDepth(newDepth);
    setHints({});
    setShowAnswer({});
    setUserAnswers({});
    setResults({});
    setGrading({});
    try {
      const data = await generateQuestions(topic, course, newDepth);
      setQuestions(data.questions ?? []);
    } catch {
      setQuestions([{ id: 0, question: "Failed to load questions — check backend.", hint: "", type: "conceptual" }]);
    } finally { setLoading(false); }
  }

  useEffect(() => { load("normal"); }, [topic]);

  async function checkAnswer(i, q) {
    if (!userAnswers[i]?.trim() || !q.answer) return;
    setGrading(g => ({ ...g, [i]: true }));
    try {
      const res = await gradeAnswer(q.question, q.answer, userAnswers[i]);
      setResults(r => ({ ...r, [i]: res }));
    } catch {
      setResults(r => ({ ...r, [i]: { result: "incorrect", feedback: "Could not grade — check backend." } }));
    } finally {
      setGrading(g => ({ ...g, [i]: false }));
    }
  }

  if (loading) return <div className="q-panel"><p style={{color:"#888"}}>⏳ Generating questions...</p></div>;

  return (
    <div className="q-panel">
      {questions.map((q, i) => {
        const result = results[i];
        return (
          <div key={q.id ?? i} className="question-card">
            <div className="q-header">
              <span className="q-num">Q{i + 1}</span>
              <span className="q-type" style={{ background: TYPE_COLORS[q.type] ?? "#555" }}>{q.type}</span>
              {result && (
                <span style={{ marginLeft: "auto", color: RESULT_STYLE[result.result]?.color, fontWeight: 600, fontSize: "0.85rem" }}>
                  {RESULT_STYLE[result.result]?.label}
                </span>
              )}
            </div>

            <p className="q-text">{q.question}</p>

            <textarea
              placeholder="Type your answer here..."
              value={userAnswers[i] ?? ""}
              onChange={e => setUserAnswers(a => ({ ...a, [i]: e.target.value }))}
              disabled={!!result}
            />

            {!result && (
              <button
                className="btn-add"
                onClick={() => checkAnswer(i, q)}
                disabled={!userAnswers[i]?.trim() || grading[i] || !q.answer}
                style={{ marginBottom: "0.5rem" }}
              >
                {grading[i] ? "Grading..." : "Check Answer"}
              </button>
            )}

            {result && (
              <div style={{
                background: `${RESULT_STYLE[result.result]?.color}18`,
                border: `1px solid ${RESULT_STYLE[result.result]?.color}`,
                borderRadius: "6px", padding: "0.6rem 0.85rem",
                fontSize: "0.88rem", marginBottom: "0.5rem", lineHeight: 1.6,
                color: "#ddd",
              }}>
                {result.feedback}
              </div>
            )}

            {q.hint && (
              <>
                <button className="btn-ghost" onClick={() => setHints(h => ({ ...h, [i]: !h[i] }))}>
                  {hints[i] ? "Hide hint" : "Show hint 💡"}
                </button>
                {hints[i] && <p className="q-hint">💡 {q.hint}</p>}
              </>
            )}

            {q.answer && (
              <>
                <button className="btn-ghost" style={{ color: "#888", marginLeft: hints[i] !== undefined && q.hint ? "1rem" : 0 }}
                  onClick={() => setShowAnswer(s => ({ ...s, [i]: !s[i] }))}>
                  {showAnswer[i] ? "Hide model answer" : "Show model answer"}
                </button>
                {showAnswer[i] && <p className="q-hint" style={{ color: "#aaa" }}>📝 {q.answer}</p>}
              </>
            )}
          </div>
        );
      })}

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
        <button className="btn-secondary" onClick={() => load("harder")} disabled={loading || depth === "harder"}>
          🔥 Make it harder
        </button>
        <button className="btn-danger" onClick={() => load("deeper")} disabled={loading || depth === "deeper"}>
          😵 We got stuck — give us simpler questions
        </button>
      </div>

      {depth === "harder" && <p className="adapt-note" style={{ color: "#e74c3c" }}>🔥 Harder mode active — good luck!</p>}
      {depth === "deeper" && <p className="adapt-note">✅ Adapted to simpler questions. Keep going!</p>}
    </div>
  );
}
