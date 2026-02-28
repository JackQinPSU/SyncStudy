import { useState, useEffect } from "react";
import { generateQuestions, gradeAnswer } from "../api/client";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

export default function QuestionPanel({ topic, course }) {
  const [questions,    setQuestions]    = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [depth,        setDepth]        = useState("normal");
  const [hints,        setHints]        = useState({});
  const [showAnswer,   setShowAnswer]   = useState({});
  const [userAnswers,  setUserAnswers]  = useState({});
  const [results,      setResults]      = useState({});
  const [grading,      setGrading]      = useState({});
  const [listeningFor, setListeningFor] = useState(null);
  const [interimMap,   setInterimMap]   = useState({});

  const { isSupported, start, stop } = useSpeechRecognition();

  async function load(newDepth) {
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
      stop();
      setListeningFor(null);
      setInterimMap(m => ({ ...m, [i]: "" }));
    } else {
      if (listeningFor !== null) stop();
      setListeningFor(i);
      setInterimMap(m => ({ ...m, [i]: "" }));
      start(
        (text)    => { setUserAnswers(a => ({ ...a, [i]: (a[i] ?? "").trimEnd() + (a[i] ? " " : "") + text })); },
        (interim) => { setInterimMap(m => ({ ...m, [i]: interim })); },
        ()        => { setListeningFor(null); setInterimMap(m => ({ ...m, [i]: "" })); }
      );
    }
  }

  const resultColor = r => r === "correct" ? "var(--green)" : r === "partial" ? "var(--amber)" : "var(--red)";
  const resultLabel = r => r === "correct" ? "Correct" : r === "partial" ? "Partial" : "Incorrect";

  return (
    <div className="q-panel">
      {!isSupported && (
        <p className="stt-notice">Speech-to-text requires Chrome or Edge.</p>
      )}

      <div className="q-depth-bar">
        <button
          className="btn btn-outline btn-xs"
          onClick={() => load("harder")}
          disabled={loading || depth === "harder"}
        >
          Make it harder
        </button>
        <button
          className="btn btn-outline btn-xs"
          onClick={() => load("deeper")}
          disabled={loading || depth === "deeper"}
        >
          Simplify
        </button>
      </div>

      {loading ? (
        <div className="q-loading">Generating questions…</div>
      ) : (
        questions.map((q, i) => {
          const result      = results[i];
          const isRecording = listeningFor === i;
          return (
            <div key={q.id ?? i} className="question-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span className="q-type-badge">{q.type}</span>
                {result && (
                  <span style={{ fontSize: "12px", fontWeight: 600, color: resultColor(result.result) }}>
                    {resultLabel(result.result)}
                  </span>
                )}
              </div>

              <p className="q-text">{q.question}</p>

              <div className="q-answer-row">
                <textarea
                  className="q-textarea"
                  placeholder={isSupported ? "Type or speak your answer…" : "Type your answer here…"}
                  value={userAnswers[i] ?? ""}
                  onChange={e => setUserAnswers(a => ({ ...a, [i]: e.target.value }))}
                  disabled={!!result}
                />
                {isSupported && !result && (
                  <button
                    className={`mic-btn${isRecording ? " active" : ""}`}
                    onClick={() => toggleMic(i)}
                    title={isRecording ? "Stop recording" : "Speak answer"}
                    type="button"
                  >🎤</button>
                )}
              </div>

              {isRecording && (
                <p className="interim-text">
                  {interimMap[i] ? interimMap[i] : "Listening…"}
                </p>
              )}

              {!result && (
                <div className="q-actions">
                  <button
                    className="btn btn-dark btn-sm"
                    onClick={() => checkAnswer(i, q)}
                    disabled={!userAnswers[i]?.trim() || grading[i] || !q.answer}
                  >
                    {grading[i] ? "Checking…" : "Check Answer"}
                  </button>
                </div>
              )}

              {result && (
                <div className={`feedback-box feedback-${result.result}`}>
                  {result.feedback}
                </div>
              )}

              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
                {q.hint && (
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => setHints(h => ({ ...h, [i]: !h[i] }))}
                  >
                    {hints[i] ? "Hide hint" : "Hint"}
                  </button>
                )}
                {q.answer && (
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => setShowAnswer(s => ({ ...s, [i]: !s[i] }))}
                  >
                    {showAnswer[i] ? "Hide answer" : "Model answer"}
                  </button>
                )}
              </div>

              {hints[i] && q.hint && <div className="hint-box">{q.hint}</div>}
              {showAnswer[i] && q.answer && (
                <div className="hint-box" style={{ background: "var(--surface-2)", borderColor: "var(--border-mid)" }}>
                  {q.answer}
                </div>
              )}
            </div>
          );
        })
      )}

      {(depth === "harder" || depth === "deeper") && !loading && (
        <p className="adapt-note">
          {depth === "harder" ? "Harder mode active." : "Simplified mode active."}
        </p>
      )}
    </div>
  );
}
