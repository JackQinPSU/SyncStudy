# Study Orchestrator — Setup Guide

## Prerequisites
- Node.js 18+
- An OpenAI API key (GPT-4o access)

---

## Backend Setup

```bash
cd backend
npm install

# Edit .env and paste your key:
# OPENAI_API_KEY=sk-your-key-here

npm run dev
# → Running at http://localhost:8000
```

---

## Frontend Setup (separate terminal)

```bash
cd frontend
npm install
npm run dev
# → Running at http://localhost:5173
```

Open http://localhost:5173 in your browser. Done.

---

## Who Owns What

| Person | Files | Responsibility |
|--------|-------|----------------|
| Dev 1 | `routes/analyze.js` | Weakness algorithm (no GPT) |
| Dev 2 | `services/openaiService.js`, `routes/plan.js`, `routes/questions.js`, `routes/report.js` | All GPT calls + prompts |
| Dev 3 | `components/SetupForm.jsx`, `components/Heatmap.jsx`, `styles/index.css` | Input form + heatmap visual |
| Dev 4 | `App.jsx`, `components/SessionPlan.jsx`, `components/QuestionPanel.jsx`, `components/ReportCard.jsx` | App flow + session UI |

---

## Data Flow (simple version)

```
Form submit
  → POST /analyze      (instant, no GPT)  → Heatmap
  → POST /plan         (GPT ~3s)          → Session blocks + roles
  → POST /questions    (GPT per topic)    → Practice questions
  → POST /report       (GPT ~3s)          → Weakness report
```

---

## Demo Fallback (if GPT is slow)

In `services/openaiService.js`, comment out the real `chat()` call
and return hardcoded mock JSON. Prepare this before the demo.

```js
// MOCK FALLBACK — uncomment if API is slow
// return { session_plan: [ ...hardcoded blocks... ] };
```