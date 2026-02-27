// ─────────────────────────────────────────
// All GPT calls live here. One place to edit prompts.
// ─────────────────────────────────────────
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL  = "gpt-4o";

async function chat(systemPrompt, userPrompt) {
  const res = await client.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    temperature: 0.4,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt   },
    ],
  });
  return JSON.parse(res.choices[0].message.content);
}

// ── Generate session plan with role assignments ──
export async function generateSessionPlan(course, examDate, durationMinutes, prioritizedTopics) {
  const system = "You are an expert study session designer. Return ONLY valid JSON — no prose, no markdown.";
  const user   = `
Design a ${durationMinutes}-minute group study session for the course "${course}" (exam on ${examDate}).

Topics ranked by priority (1 = most urgent):
${JSON.stringify(prioritizedTopics, null, 2)}

Return JSON exactly like this:
{
  "session_plan": [
    {
      "block": 1,
      "topic": "Recursion",
      "duration_minutes": 20,
      "roles": {
        "Explainer":  "Alice",
        "Questioner": "Bob",
        "Challenger": "Carol",
        "Reviewer":   "Dave"
      },
      "goal": "One sentence goal for this block"
    }
  ]
}

Rules:
- Total time must equal exactly ${durationMinutes} minutes.
- Higher-priority topics get more time.
- Assign the member with the highest score on this topic as Explainer, lowest as Questioner.
- Each block must have a clear, specific goal sentence.
`;
  return chat(system, user);
}

// ── Generate 3 practice questions for a topic ──
export async function generateQuestions(topic, course, depth = "normal") {
  const system = "You are an expert educator generating targeted practice questions. Return ONLY valid JSON — no prose, no markdown.";
  const depthNote = depth === "deeper"
    ? "Make questions simpler and more scaffolded — the group is stuck on the basics."
    : depth === "harder"
    ? "Make questions advanced and challenging — push well beyond standard exam prep. Include edge cases, multi-step reasoning, and synthesis across concepts."
    : "Make questions appropriately challenging for exam prep.";

  const user = `
Generate 3 practice questions for the topic "${topic}" in the course "${course}".
${depthNote}

Return JSON exactly like this:
{
  "topic": "${topic}",
  "questions": [
    {
      "id": 1,
      "question": "...",
      "answer": "A clear, complete model answer (2-4 sentences)",
      "hint": "A one-sentence hint if they get stuck",
      "type": "conceptual"
    }
  ]
}

Question types to choose from: conceptual, application, debugging, comparison.
Use a different type for each of the 3 questions.
`;
  return chat(system, user);
}

// ── Grade a student's answer against the model answer ──
export async function gradeAnswer(question, correctAnswer, userAnswer) {
  const system = "You are a strict but fair academic grader. Return ONLY valid JSON — no prose, no markdown.";
  const user = `
Question: ${question}

Model Answer: ${correctAnswer}

Student's Answer: ${userAnswer}

Evaluate the student's answer. Return JSON exactly like this:
{
  "result": "correct",
  "feedback": "One or two sentences explaining what was right or wrong."
}

Rules:
- "result" must be exactly one of: "correct", "partial", "incorrect"
- "correct": captures all key concepts accurately
- "partial": right idea but missing important details or has a minor error
- "incorrect": fundamentally wrong, off-topic, or blank
`;
  return chat(system, user);
}

// ── Generate post-session weakness report ──
export async function generateReport(course, examDate, prioritizedTopics, members) {
  const system = "You are an academic coach writing a post-session report. Return ONLY valid JSON — no prose, no markdown.";
  const user   = `
Generate a post-session weakness report for a group study session.

Course: ${course}
Exam date: ${examDate}
Members: ${JSON.stringify(members.map(m => m.name))}
Topic priorities (by weakness): ${JSON.stringify(prioritizedTopics, null, 2)}

Return JSON exactly like this:
{
  "report": {
    "summary": "2-sentence overall summary of the group's readiness",
    "critical_topics": ["topic1", "topic2"],
    "per_member": [
      {
        "name": "Alice",
        "focus_before_exam": ["topic1"],
        "strength": "The topic she can review least"
      }
    ],
    "recommended_next_session": "What to tackle next time in one sentence"
  }
}
`;
  return chat(system, user);
}