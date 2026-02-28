import { useState, useEffect } from "react";
import SetupForm   from "./components/SetupForm";
import Heatmap     from "./components/Heatmap";
import SessionPlan from "./components/SessionPlan";
import ReportCard  from "./components/ReportCard";
import { analyzeWeaknesses, generatePlan, generateReport } from "./api/client";

const STEPS  = ["setup", "heatmap", "session", "report"];
const LABELS = ["Setup", "Weaknesses", "Session", "Report"];

export default function App() {
  const [step,         setStep]         = useState("setup");
  const [sessionInput, setSessionInput] = useState(null);
  const [weaknesses,   setWeaknesses]   = useState([]);
  const [plan,         setPlan]         = useState(null);
  const [report,       setReport]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [theme,        setTheme]        = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => t === "light" ? "dark" : "light");
  }

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

  const currentIdx = STEPS.indexOf(step);

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
                  {i > 0 && (
                    <div className={`step-connector${i <= currentIdx ? " filled" : ""}`} />
                  )}
                  <div className="step-pip">
                    <div className={`step-pip-num ${state}`}>
                      {state === "done" ? "✓" : i + 1}
                    </div>
                    <span className={`step-pip-label ${state}`}>{LABELS[i]}</span>
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="header-right">
            <button className="theme-pill" onClick={toggleTheme} aria-label="Toggle dark mode">
              <span className="tp-icon">☀</span>
              <span className="tp-thumb" />
              <span className="tp-icon">☽</span>
            </button>
          </div>
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
            <div className="loader-dots">
              <div className="loader-dot" style={{ animationDelay: "0s" }} />
              <div className="loader-dot" style={{ animationDelay: "0.22s" }} />
              <div className="loader-dot" style={{ animationDelay: "0.44s" }} />
            </div>
            <p className="loader-text">Thinking…</p>
          </div>
        ) : (
          <div className="fade-in">
            {step === "setup"   && <SetupForm onSubmit={handleSetupSubmit} />}
            {step === "heatmap" && <Heatmap sessionInput={sessionInput} weaknesses={weaknesses} onNext={handleGeneratePlan} />}
            {step === "session" && <SessionPlan plan={plan} sessionInput={sessionInput} onFinish={handleGenerateReport} />}
            {step === "report"  && <ReportCard report={report} />}
          </div>
        )}
      </main>
    </div>
  );
}
