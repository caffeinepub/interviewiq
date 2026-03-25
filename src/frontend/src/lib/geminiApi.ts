export interface Question {
  question: string;
  type: string;
  difficulty: string;
}

export interface Evaluation {
  score: number;
  strengths: string;
  weaknesses: string;
  improvement_tip: string;
}

export interface FollowUp {
  follow_up_question: string;
  difficulty: string;
}

export interface SessionQuestion {
  question: Question;
  answer: string;
  evaluation: Evaluation | null;
  followUp: FollowUp | null;
}

const GEMINI_ENDPOINT = (apiKey: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(GEMINI_ENDPOINT(apiKey), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

function parseJSON(text: string): unknown {
  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
  return JSON.parse(cleaned);
}

const FALLBACK_QUESTIONS: Question[] = [
  {
    question: "Tell me about yourself and your background.",
    type: "behavioral",
    difficulty: "easy",
  },
  {
    question:
      "Describe a challenging project you worked on and how you handled it.",
    type: "scenario",
    difficulty: "medium",
  },
  {
    question:
      "What are your key technical skills and how have you applied them?",
    type: "conceptual",
    difficulty: "medium",
  },
  {
    question: "Where do you see yourself in 5 years?",
    type: "behavioral",
    difficulty: "easy",
  },
  {
    question: "How do you handle tight deadlines and pressure?",
    type: "scenario",
    difficulty: "medium",
  },
];

export async function generateQuestions(
  apiKey: string,
  role: string,
  difficulty: string,
  count: number,
): Promise<Question[]> {
  try {
    const prompt = `Generate ${count} interview questions for a ${role} position at ${difficulty} difficulty level. Include conceptual, practical, and scenario-based questions. Strictly return only valid JSON array with no explanation: [{"question":"...","type":"conceptual","difficulty":"medium"}]`;
    const text = await callGemini(apiKey, prompt);
    const parsed = parseJSON(text);
    if (Array.isArray(parsed)) return parsed as Question[];
    throw new Error("Not an array");
  } catch {
    return FALLBACK_QUESTIONS.slice(0, count);
  }
}

export async function evaluateAnswer(
  apiKey: string,
  question: string,
  answer: string,
): Promise<Evaluation> {
  try {
    const prompt = `Evaluate the candidate answer. Question: ${question} Answer: ${answer} Return JSON only: {"score":7,"strengths":"...","weaknesses":"...","improvement_tip":"..."}`;
    const text = await callGemini(apiKey, prompt);
    return parseJSON(text) as Evaluation;
  } catch {
    return {
      score: 5,
      strengths: "Good attempt at addressing the question.",
      weaknesses: "Could elaborate more with specific examples.",
      improvement_tip:
        "Add concrete examples and quantifiable results to strengthen your answer.",
    };
  }
}

export async function generateFollowUp(
  apiKey: string,
  question: string,
  answer: string,
  currentDifficulty: string,
): Promise<FollowUp> {
  try {
    const prompt = `Based on this interview Q&A, generate a follow-up question and adjust difficulty (increase if answer is strong/detailed, decrease if weak/short). Question: ${question} Answer: ${answer} Current difficulty: ${currentDifficulty}. Return JSON only: {"follow_up_question":"...","difficulty":"easy|medium|hard"}`;
    const text = await callGemini(apiKey, prompt);
    return parseJSON(text) as FollowUp;
  } catch {
    return {
      follow_up_question: "Can you elaborate further on that point?",
      difficulty: currentDifficulty,
    };
  }
}
