import { useState, useEffect, useRef } from "react";
import { joinSession, heartbeat, pollSession } from "../api/client";

export default function JoinView({ sessionId }) {
  const [name,    setName]    = useState("");
  const [joined,  setJoined]  = useState(false);
  const [session, setSession] = useState(null);
  const [error,   setError]   = useState("");
  const nameRef = useRef(name);
  nameRef.current = name;

  async function handleJoin() {
    const n = name.trim();
    if (!n) return;
    try {
      const data = await joinSession(sessionId, n);
      setJoined(true);
      setSession(data);
    } catch {
      setError("Session not found. Check the ID and try again.");
    }
  }

  // Poll + heartbeat after joining
  useEffect(() => {
    if (!joined) return;
    let cancelled = false;

    async function tick() {
      try {
        const data = await pollSession(sessionId);
        if (!cancelled) setSession(data);
        heartbeat(sessionId, nameRef.current).catch(() => {});
      } catch {}
    }

    tick();
    const iv = setInterval(tick, 2500);
    return () => { cancelled = true; clearInterval(iv); };
  }, [joined, sessionId]);

  if (!joined) {
    return (
      <div>
        <div className="page-head">
          <p className="page-eyebrow">Session {sessionId}</p>
          <h1 className="page-title">Join this session.</h1>
          <p className="page-sub">Enter your name to join the live study session.</p>
        </div>

        {error && <div className="error-banner"><span>⚠</span><span>{error}</span></div>}

        <div className="form-group">
          <label className="form-label">Your Name</label>
          <input
            className="form-input"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleJoin()}
            placeholder="e.g. Alice"
            autoFocus
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-dark btn-lg" onClick={handleJoin} disabled={!name.trim()}>
            Join Session →
          </button>
        </div>
      </div>
    );
  }

  const priorities = session?.prioritizedTopics ?? [];
  const online     = session?.onlineMembers ?? [];

  return (
    <div>
      <div className="page-head">
        <p className="page-eyebrow">Session {sessionId}</p>
        <h1 className="page-title">You're in, {name}.</h1>
        <p className="page-sub">{session?.course ? `${session.course} — ` : ""}Session in progress.</p>
      </div>

      <div className="presence-bar">
        <span className="section-label">Online now</span>
        <div className="presence-dots">
          {online.map(m => (
            <span key={m} className={`presence-dot${m === name ? " self" : ""}`}>{m}</span>
          ))}
          {online.length === 0 && <span style={{ color: "#555", fontSize: "0.82rem" }}>No one else yet…</span>}
        </div>
      </div>

      {priorities.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <p className="section-label" style={{ marginBottom: "10px" }}>Live Priority Ranking</p>
          <div className="priority-list">
            {priorities.map(t => (
              <div key={t.topic} className={`priority-item${t.critical ? " critical" : ""}`}>
                <div className="priority-num">{t.priority}</div>
                <span className="priority-topic">{t.topic}</span>
                {t.critical && <span className="critical-badge">Critical</span>}
                <span style={{ marginLeft: "auto", color: "#888", fontSize: "0.82rem" }}>
                  {t.allocatedMinutes} min
                </span>
              </div>
            ))}
          </div>
          <p style={{ color: "#555", fontSize: "0.78rem", marginTop: "8px" }}>
            Priorities update live as the group answers questions.
          </p>
        </div>
      )}
    </div>
  );
}
