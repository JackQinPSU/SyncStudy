import { useState, useMemo } from "react";
import SetupForm   from "./components/SetupForm";
import Heatmap     from "./components/Heatmap";
import SessionPlan from "./components/SessionPlan";
import ReportCard  from "./components/ReportCard";
import JoinView    from "./components/JoinView";
import { analyzeWeaknesses, generatePlan, generateReport } from "./api/client";

const STEPS  = ["setup", "heatmap", "session", "report"];
const LABELS = ["Setup", "Weaknesses", "Session", "Report"];

export default function App() {
  const [step,         setStep]         = useState("setup");
  const [sessionInput, setSessionInput] = useState(null);
  const [sessionId,    setSessionId]    = useState(null);
  const [weaknesses,   setWeaknesses]   = useState([]);
  const [plan,         setPlan]         = useState(null);
  const [report,       setReport]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  // Detect ?session=XYZ join link
  const joinParam = useMemo(() => new URLSearchParams(window.location.search).get("session"), []);

  async function handleSetupSubmit(input) {
    setSessionInput(input);
    setLoading(true);
    setError("");
    try {
      const data = await analyzeWeaknesses(input);
      setWeaknesses(data.topics);
      setSessionId(data.sessionId);
      setStep("heatmap");
    } catch {
      setError("Failed to analyze. Is the backend running on port 8000?");
    } finally { setLoading(false); }
  }

  async function handleGeneratePlan() {
    setLoading(true);
    setError("");
    try {
      const data = await generatePlan(sessionInput, weaknesses);
      setPlan(data);
      setStep("session");
    } catch {
      setError("GPT call failed. Check your OPENAI_API_KEY in backend/.env");
    } finally { setLoading(false); }
  }

  async function handleGenerateReport() {
    setLoading(true);
    setError("");
    try {
      const data = await generateReport(sessionInput, weaknesses);
      setReport(data);
      setStep("report");
    } catch {
      setError("Report generation failed.");
    } finally { setLoading(false); }
  }

  const currentIdx = STEPS.indexOf(step);

  // Joiner flow — someone opened a ?session= link
  if (joinParam && !sessionId) {
    return (
      <div className="app-wrapper">
        <header className="app-header">
          <div className="header-inner">
            <div className="logo"><div className="logo-dot" />SyncStudy</div>
          </div>
        </header>
        <main className="main-content">
          <JoinView sessionId={joinParam} />
        </main>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-dot" />
            SyncStudy
          </div>
          <nav className="step-bar">
            {STEPS.map((s, i) => {
              const state = i < currentIdx ? "done" : i === currentIdx ? "active" : "pending";
              return (
                <div key={s} className="step-item">
                  {i > 0 && <div className="step-connector" />}
                  <div className="step-pip">
                    <div className={`step-pip-num ${state}`}>{i + 1}</div>
                    <span className={`step-pip-label ${state}`}>{LABELS[i]}</span>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="main-content">
        {error && (
          <div className="error-banner">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="page-loader">
            <div className="loader-ring" />
            <p className="loader-text">Thinking…</p>
          </div>
        ) : (
          <div className="fade-in">
            {step === "setup"   && <SetupForm onSubmit={handleSetupSubmit} />}
            {step === "heatmap" && (
              <Heatmap
                sessionInput={sessionInput}
                weaknesses={weaknesses}
                sessionId={sessionId}
                onNext={handleGeneratePlan}
              />
            )}
            {step === "session" && (
              <SessionPlan
                plan={plan}
                sessionInput={sessionInput}
                sessionId={sessionId}
                onFinish={handleGenerateReport}
              />
            )}
            {step === "report"  && <ReportCard report={report} />}
          </div>
        )}
      </main>
    </div>
  );
}
