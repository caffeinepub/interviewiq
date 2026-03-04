import type { Question } from "../backend.d";
import { Difficulty } from "../backend.d";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdaptiveScore {
  score: number;
  feedback: string;
  keywords: string[];
}

// ─── Keyword Sets ──────────────────────────────────────────────────────────────

const KEYWORD_SETS = {
  behavioral: [
    "situation",
    "task",
    "action",
    "result",
    "challenge",
    "team",
    "resolved",
    "outcome",
    "learned",
    "problem",
    "solution",
    "impact",
    "improved",
    "achieved",
  ],
  strength_weakness: [
    "example",
    "skill",
    "improved",
    "developed",
    "working on",
    "growth",
    "better",
    "focus",
    "strength",
    "weakness",
  ],
  career: [
    "experience",
    "goal",
    "opportunity",
    "company",
    "role",
    "growth",
    "passion",
    "value",
    "mission",
    "contribute",
    "future",
    "career",
  ],
  prioritization: [
    "prioritize",
    "urgent",
    "deadline",
    "schedule",
    "plan",
    "organize",
    "manage",
    "calendar",
    "task",
    "list",
    "focus",
    "communicate",
  ],
  general: [
    "because",
    "therefore",
    "specifically",
    "example",
    "instance",
    "result",
    "achieved",
    "measured",
    "improved",
    "implemented",
    "developed",
    "managed",
    "led",
  ],
};

function selectKeywordSet(questionTitle: string): string[] {
  const lower = questionTitle.toLowerCase();
  if (
    lower.includes("challenge") ||
    lower.includes("conflict") ||
    lower.includes("time you") ||
    lower.includes("tell me about a")
  ) {
    return KEYWORD_SETS.behavioral;
  }
  if (lower.includes("strength") || lower.includes("weakness")) {
    return KEYWORD_SETS.strength_weakness;
  }
  if (
    lower.includes("why") ||
    lower.includes("see yourself") ||
    lower.includes("leaving")
  ) {
    return KEYWORD_SETS.career;
  }
  if (
    lower.includes("prioritize") ||
    lower.includes("manage") ||
    lower.includes("organize")
  ) {
    return KEYWORD_SETS.prioritization;
  }
  return KEYWORD_SETS.general;
}

// ─── Intelligent Scorer ───────────────────────────────────────────────────────

export function getIntelligentScore(
  answerText: string,
  questionTitle: string,
): AdaptiveScore {
  const text = answerText.trim();
  const lower = text.toLowerCase();

  // Length component (40% weight, max 40pts)
  let lengthScore = 0;
  const len = text.length;
  if (len === 0) {
    lengthScore = 0;
  } else if (len < 50) {
    lengthScore = 8;
  } else if (len < 150) {
    lengthScore = 20;
  } else if (len < 300) {
    lengthScore = 30;
  } else if (len < 500) {
    lengthScore = 36;
  } else {
    lengthScore = 40;
  }

  // Keyword component (60% weight, max 60pts)
  const keywordSet = selectKeywordSet(questionTitle);
  const matchedKeywords = keywordSet.filter((kw) => lower.includes(kw));
  const matchCount = matchedKeywords.length;

  let keywordScore = 0;
  if (matchCount === 0) {
    keywordScore = 0;
  } else if (matchCount === 1) {
    keywordScore = 15;
  } else if (matchCount <= 3) {
    keywordScore = 30;
  } else if (matchCount <= 5) {
    keywordScore = 45;
  } else {
    keywordScore = 60;
  }

  // Bonus: +5 if 3+ quality keywords found
  const qualityKeywords = keywordSet.filter((kw) =>
    [
      "situation",
      "task",
      "action",
      "result",
      "example",
      "achieved",
      "improved",
      "developed",
      "experience",
      "solution",
      "impact",
      "outcome",
    ].includes(kw),
  );
  const qualityMatched = qualityKeywords.filter((kw) =>
    lower.includes(kw),
  ).length;
  const bonus = qualityMatched >= 3 ? 5 : 0;

  const rawScore = lengthScore + keywordScore + bonus;
  const score = Math.min(100, rawScore);

  // Generate feedback
  let feedback: string;
  if (score >= 85) {
    feedback =
      "Excellent response! You demonstrated strong use of relevant keywords and provided a comprehensive answer.";
  } else if (score >= 70) {
    feedback =
      "Good answer with solid content. Adding a few more specific examples could strengthen it further.";
  } else if (score >= 50) {
    feedback =
      "Decent — try using the STAR method (Situation, Task, Action, Result) to structure your response better.";
  } else if (score >= 30) {
    feedback =
      "Brief — add specific examples, outcomes, and relevant keywords to improve your score significantly.";
  } else {
    feedback =
      "Needs improvement — try to be more specific and include context, examples, and measurable outcomes.";
  }

  return {
    score,
    feedback,
    keywords: matchedKeywords,
  };
}

// ─── Adaptive Question Selector ───────────────────────────────────────────────

export function getAdaptiveNextQuestion(
  questions: Question[],
  answeredIds: bigint[],
  runningScores: number[],
): Question | null {
  if (questions.length === 0) return null;

  // Compute average score
  const avgScore =
    runningScores.length === 0
      ? 50
      : runningScores.reduce((a, b) => a + b, 0) / runningScores.length;

  // Determine target difficulty based on performance
  let targetDifficulty: Difficulty;
  if (avgScore < 40) {
    targetDifficulty = Difficulty.easy;
  } else if (avgScore <= 70) {
    targetDifficulty = Difficulty.medium;
  } else {
    targetDifficulty = Difficulty.hard;
  }

  // Filter out answered questions
  const answeredSet = new Set(answeredIds.map((id) => id.toString()));
  const unanswered = questions.filter((q) => !answeredSet.has(q.id.toString()));

  if (unanswered.length === 0) return null;

  // Try to find a question of target difficulty
  const targetDifficultyQuestions = unanswered.filter(
    (q) => q.difficulty === targetDifficulty,
  );

  if (targetDifficultyQuestions.length > 0) {
    // Return a random one from target difficulty
    const idx = Math.floor(Math.random() * targetDifficultyQuestions.length);
    return targetDifficultyQuestions[idx];
  }

  // Fallback: return any unanswered question
  const idx = Math.floor(Math.random() * unanswered.length);
  return unanswered[idx];
}

// ─── Recommendation Engine ────────────────────────────────────────────────────

export function getRecommendedQuestions(
  questions: Question[],
  sessionQuestionIds: bigint[],
  answerScores: Record<string, number>,
): Question[] {
  // Find question IDs with score < 60
  const lowScoreIds = new Set<string>(
    Object.entries(answerScores)
      .filter(([, score]) => score < 60)
      .map(([id]) => id),
  );

  // Get their categories
  const weakCategories = new Set<string>(
    sessionQuestionIds
      .map((id) => id.toString())
      .filter((id) => lowScoreIds.has(id))
      .map((id) => questions.find((q) => q.id.toString() === id)?.category)
      .filter((cat): cat is string => !!cat),
  );

  // Questions not in the session
  const sessionIdSet = new Set(sessionQuestionIds.map((id) => id.toString()));
  const outsideSession = questions.filter(
    (q) => !sessionIdSet.has(q.id.toString()),
  );

  // First: questions in weak categories
  const inWeakCategories = outsideSession.filter((q) =>
    weakCategories.has(q.category),
  );

  const recommendations: Question[] = [...inWeakCategories];

  // Fill remaining slots with any outside-session questions
  if (recommendations.length < 3) {
    const notIncluded = outsideSession.filter(
      (q) => !inWeakCategories.some((r) => r.id === q.id),
    );
    recommendations.push(...notIncluded.slice(0, 3 - recommendations.length));
  }

  return recommendations.slice(0, 3);
}
