import { useState, useEffect, useRef } from "react";
import { pollSession, heartbeat } from "../api/client";

// Polls GET /sessions/:id every `intervalMs`.
// Optionally sends a heartbeat to mark `memberName` as online.
export function useSessionPoll(sessionId, memberName = null, intervalMs = 2500) {
  const [state, setState] = useState(null);
  const nameRef = useRef(memberName);
  nameRef.current = memberName;

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    async function poll() {
      try {
        const data = await pollSession(sessionId);
        if (!cancelled) setState(data);
        if (nameRef.current) heartbeat(sessionId, nameRef.current).catch(() => {});
      } catch { /* silent */ }
    }

    poll();
    const iv = setInterval(poll, intervalMs);
    return () => { cancelled = true; clearInterval(iv); };
  }, [sessionId, intervalMs]);

  return state;
}
