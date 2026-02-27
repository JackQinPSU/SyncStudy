// ─────────────────────────────────────────
// Root component. Controls which "step" is shown.
// Steps: setup → heatmap → session → report
// ─────────────────────────────────────────
import { useState } from "react";
import SetupForm   from "./components/SetupForm";
import Heatmap     from "./components/Heatmap";
import SessionPlan from "./components/SessionPlan";
import ReportCard  from "./components/ReportCard";
import { analyzeWeaknesses, generatePlan, generateReport } from "./api/client";

export default function App() {
  const [step,         setStep]         = useState("setup");
  const [sessionInput, setSessionInput] = useState(null);
  const [weaknesses,   setWeaknesses]   = useState([]);
  const [plan,         setPlan]         = useState(null);
  const [report,       setReport]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  async function handleSetupSubmit(input) {
    setSessionInput(input);
    setLoading(true);
    setError("");
    try {
      const data = await analyzeWeaknesses(input);
      setWeaknesses(data);
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

  const STEPS = ["setup", "heatmap", "session", "report"];
  const LABELS = ["Setup", "Weaknesses", "Session", "Report"];

  return (
    <div className="app-wrapper">
      <header>
        <h1>🧠 Study Orchestrator</h1>
        <p className="subtitle">AI-powered group study sessions</p>

        {/* Step indicator */}
        <div className="step-bar">
          {STEPS.map((s, i) => (
            <div key={s} className={`step-dot ${step === s ? "active" : STEPS.indexOf(step) > i ? "done" : ""}`}>
              <span>{i + 1}</span>
              <small>{LABELS[i]}</small>
            </div>
          ))}
        </div>
      </header>

      {error   && <div className="error-banner">{error}</div>}
      {loading && <div className="loading-banner">⏳ Thinking...</div>}

      {step === "setup"   && <SetupForm onSubmit={handleSetupSubmit} />}
      {step === "heatmap" && <Heatmap sessionInput={sessionInput} weaknesses={weaknesses} onNext={handleGeneratePlan} />}
      {step === "session" && <SessionPlan plan={plan} sessionInput={sessionInput} onFinish={handleGenerateReport} />}
      {step === "report"  && <ReportCard report={report} />}
    </div>
  );
}
