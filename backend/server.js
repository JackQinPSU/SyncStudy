// ─────────────────────────────────────────
// Entry point. Registers all routes.
// Run with: npm run dev
// ─────────────────────────────────────────
import "dotenv/config";
import express from "express";
import cors from "cors";

import analyzeRouter    from "./routes/analyze.js";
import planRouter       from "./routes/plan.js";
import questionsRouter  from "./routes/questions.js";
import reportRouter     from "./routes/report.js";
import gradeRouter      from "./routes/grade.js";
import sessionsRouter   from "./routes/sessions.js";

const app  = express();
const PORT = 8000;

app.use(cors({ origin: /^http:\/\/localhost:\d+$/ }));
app.use(express.json());

app.use("/analyze",   analyzeRouter);
app.use("/plan",      planRouter);
app.use("/questions", questionsRouter);
app.use("/report",    reportRouter);
app.use("/grade",     gradeRouter);
app.use("/sessions",  sessionsRouter);

app.listen(PORT, () =>
  console.log(`✅ Backend running at http://localhost:${PORT}`)
);