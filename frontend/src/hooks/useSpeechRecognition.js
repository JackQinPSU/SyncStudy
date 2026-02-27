// ─────────────────────────────────────────
// Wraps the browser Web Speech API.
// No backend or API key required — runs entirely in the browser.
// Supported: Chrome, Edge. Not supported: Firefox (falls back gracefully).
// ─────────────────────────────────────────
import { useState, useRef, useCallback } from "react";

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  /**
   * Start speech recognition.
   * @param {(text: string) => void} onFinal   - called with each finalized transcript chunk
   * @param {(text: string) => void} onInterim - called with live interim text (may be empty)
   * @param {() => void}             onEnd     - called when recognition stops for any reason
   */
  const start = useCallback(
    (onFinal, onInterim, onEnd) => {
      if (!isSupported) return;

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let finalText = "";
        let interimText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += chunk;
          } else {
            interimText += chunk;
          }
        }
        if (finalText && onFinal) onFinal(finalText);
        if (onInterim) onInterim(interimText);
      };

      recognition.onstart = () => setIsListening(true);

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
        if (onEnd) onEnd();
      };

      recognition.onerror = (e) => {
        // "no-speech" and "aborted" are normal; don't log them as errors
        if (e.error !== "no-speech" && e.error !== "aborted") {
          console.warn("SpeechRecognition error:", e.error);
        }
        setIsListening(false);
        recognitionRef.current = null;
        if (onEnd) onEnd();
      };

      recognitionRef.current = recognition;
      recognition.start();
    },
    [isSupported]
  );

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return { isSupported, isListening, start, stop };
}
