// ─────────────────────────────────────────
// All API calls in one place. Import these in components.
// ─────────────────────────────────────────
const BASE = "http://localhost:8000";

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error on ${path}: ${res.status}`);
  return res.json();
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error on ${path}: ${res.status}`);
  return res.json();
}

export const analyzeWeaknesses = (sessionInput) =>
  post("/analyze", sessionInput);

export const generatePlan = (sessionInput, prioritizedTopics) =>
  post("/plan", { session_input: sessionInput, prioritized_topics: prioritizedTopics });

export const generateQuestions = (topic, course, depth = "normal") =>
  post("/questions", { topic, course, depth });

export const generateReport = (sessionInput, prioritizedTopics) =>
  post("/report", { session_input: sessionInput, prioritized_topics: prioritizedTopics });

export const gradeAnswer = (question, correctAnswer, userAnswer) =>
  post("/grade", { question, correct_answer: correctAnswer, user_answer: userAnswer });

export const pollSession  = (id)                => get(`/sessions/${id}`);
export const joinSession  = (id, name)          => post(`/sessions/${id}/join`,      { name });
export const heartbeat    = (id, name)          => post(`/sessions/${id}/heartbeat`, { name });
export const recordAnswer = (id, topic, result) => post(`/sessions/${id}/answer`,    { topic, result });