// ─────────────────────────────────────────
// Loads + displays practice questions for a topic.
// Supports easier/harder depth and per-question answer grading.
// Speech-to-text: click the 🎤 button to dictate your answer.
// ─────────────────────────────────────────
import { useState, useEffect } from "react";
import { generateQuestions, gradeAnswer } from "../api/client";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

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

  // Speech-to-text state
  const [listeningFor, setListeningFor] = useState(null); // question index currently recording
  const [interimMap,   setInterimMap]   = useState({});   // live interim text per question

  const { isSupported, start, stop } = useSpeechRecognition();

  async function load(newDepth) {
    // Stop any active microphone before resetting
    stop();
    setListeningFor(null);
    setInterimMap({});

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

  function toggleMic(i) {
    if (listeningFor === i) {
      // Already recording for this question — stop
      stop();
      setListeningFor(null);
      setInterimMap(m => ({ ...m, [i]: "" }));
    } else {
      // Stop any other question's recording, then start for this one
      if (listeningFor !== null) stop();
      setListeningFor(i);
      setInterimMap(m => ({ ...m, [i]: "" }));

      start(
        // onFinal: append finalized speech to the answer
        (text) => {
          setUserAnswers(a => ({ ...a, [i]: (a[i] ?? "").trimEnd() + (a[i] ? " " : "") + text }));
        },
        // onInterim: show live preview
        (interim) => {
          setInterimMap(m => ({ ...m, [i]: interim }));
        },
        // onEnd: recognition stopped (silence timeout, user stopped, etc.)
        () => {
          setListeningFor(null);
          setInterimMap(m => ({ ...m, [i]: "" }));
        }
      );
    }
  }

  if (loading) return <div className="q-panel"><p style={{color:"#888"}}>⏳ Generating questions...</p></div>;

  return (
    <div className="q-panel">
      {!isSupported && (
        <p className="stt-unsupported">
          🎤 Speech-to-text is not supported in this browser. Use Chrome or Edge to enable it.
        </p>
      )}

      {questions.map((q, i) => {
        const result = results[i];
        const isRecording = listeningFor === i;
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

            {/* Textarea + mic button */}
            <div className="textarea-wrap">
              <textarea
                placeholder={isSupported ? "Type or speak your answer…" : "Type your answer here..."}
                value={userAnswers[i] ?? ""}
                onChange={e => setUserAnswers(a => ({ ...a, [i]: e.target.value }))}
                disabled={!!result}
                style={isSupported && !result ? { paddingRight: "2.8rem" } : {}}
              />
              {isSupported && !result && (
                <button
                  className={`mic-btn${isRecording ? " active" : ""}`}
                  onClick={() => toggleMic(i)}
                  title={isRecording ? "Stop recording" : "Speak your answer"}
                  type="button"
                >
                  🎤
                </button>
              )}
            </div>

            {/* Live interim speech preview */}
            {isRecording && interimMap[i] && (
              <p className="interim-text">🎙️ {interimMap[i]}</p>
            )}
            {isRecording && !interimMap[i] && (
              <p className="interim-text listening-pulse">🎙️ Listening…</p>
            )}

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
