// ─── Generative AI Follow-up Question Engine ─────────────────────────────────

interface Question {
  title: string;
  description: string;
  category: string;
  tags: string[];
}

const BEHAVIORAL_TEAM_KEYWORDS = [
  "team",
  "collaboration",
  "colleague",
  "coworker",
  "group",
  "together",
  "coordinated",
  "worked with",
];
const BEHAVIORAL_CONFLICT_KEYWORDS = [
  "conflict",
  "disagreement",
  "argument",
  "tension",
  "difficult",
  "challenge",
  "problem",
  "issue",
  "frustrated",
];
const BEHAVIORAL_RESULT_KEYWORDS = [
  "result",
  "outcome",
  "achieved",
  "accomplished",
  "improved",
  "increased",
  "reduced",
  "metric",
  "impact",
  "success",
];
const BEHAVIORAL_STAR_KEYWORDS = [
  "situation",
  "task",
  "action",
  "star",
  "example",
  "time when",
  "instance",
];

const BEHAVIORAL_TEAM_FOLLOWUPS = [
  "Can you elaborate on how you coordinated with your team to ensure everyone was aligned?",
  "How did you handle situations where team members had different working styles?",
  "What specific role did you take within the team, and why?",
  "How did you ensure clear communication across the team during that situation?",
];

const BEHAVIORAL_CONFLICT_FOLLOWUPS = [
  "How did you ensure all parties felt heard in that situation?",
  "What would you do differently if you faced the same conflict today?",
  "How did that experience change the way you approach disagreements?",
  "What was the most difficult part of navigating that conflict?",
];

const BEHAVIORAL_RESULT_FOLLOWUPS = [
  "What specific metrics or outcomes did you measure to determine success?",
  "How did you communicate those results to your stakeholders?",
  "What would you attribute as the single biggest driver of that outcome?",
  "How did you follow up after achieving that result to sustain it?",
];

const BEHAVIORAL_GENERAL_FOLLOWUPS = [
  "Can you give a concrete example that illustrates your point?",
  "What would you do differently in hindsight?",
  "How did that experience shape your professional approach going forward?",
  "What was the biggest lesson you took from that situation?",
  "How did you prioritize your actions when things became unclear?",
  "What feedback did you receive from others involved?",
  "How did you handle the emotional aspects of that situation?",
  "What resources or support did you seek out during that time?",
];

const TECHNICAL_DSA_FOLLOWUPS = [
  "Can you walk me through the time complexity of your approach?",
  "How would you optimize this solution for very large inputs?",
  "What edge cases did you consider, and how did you handle them?",
  "Is there a more space-efficient alternative to your solution?",
  "How would your approach change if the input was already sorted?",
  "Can you explain why you chose this data structure over alternatives?",
];

const TECHNICAL_DBMS_FOLLOWUPS = [
  "How would this solution scale with millions of records?",
  "Can you explain the tradeoffs of your indexing strategy?",
  "How would you handle concurrent read/write access in this scenario?",
  "What impact does normalization have on query performance here?",
  "How would you approach database sharding if the data volume grew 100x?",
];

const TECHNICAL_OS_FOLLOWUPS = [
  "How would the system behave under heavy load with this approach?",
  "What happens if a process holding a resource crashes unexpectedly?",
  "Can you explain how this concept relates to modern multi-core processors?",
  "How would you test or verify that this approach prevents deadlock?",
  "What are the performance implications of your locking strategy?",
];

const CAREER_FOLLOWUPS = [
  "How does this align with your 5-year career plan?",
  "What specifically about this company's mission drew you to apply?",
  "How would this role help you bridge from where you are to where you want to be?",
  "What skills do you hope to develop most in this position?",
  "How do you stay current in your field, and what does your learning look like?",
];

const STRENGTHS_WEAKNESSES_FOLLOWUPS = [
  "Can you give a specific example where this strength made a measurable difference?",
  "What steps have you taken recently to address that weakness?",
  "How have you received feedback on this from colleagues or managers?",
  "In what type of work environment does this strength shine most?",
];

const GENERAL_FALLBACK_FOLLOWUPS = [
  "Can you give a concrete example that supports your answer?",
  "What would you do differently if you had to approach this again?",
  "How have you applied this in a real professional setting?",
  "What was the hardest part of this for you personally?",
  "How do you measure success in this area?",
  "What feedback have you received from others on this topic?",
  "How does your answer change if the stakes are significantly higher?",
  "Can you describe a situation where this approach did not work as expected?",
  "What resources or learning helped you develop this perspective?",
  "How would you explain this to someone with no prior experience in the field?",
];

function detectCategory(question: Question): string {
  const text =
    `${question.title} ${question.description} ${question.category} ${question.tags.join(" ")}`.toLowerCase();

  if (
    text.includes("dsa") ||
    text.includes("algorithm") ||
    text.includes("data structure") ||
    text.includes("linked list") ||
    text.includes("array") ||
    text.includes("tree") ||
    text.includes("stack") ||
    text.includes("queue") ||
    text.includes("graph") ||
    text.includes("complexity") ||
    text.includes("sort") ||
    text.includes("search") ||
    text.includes("kadane") ||
    text.includes("subarray")
  ) {
    return "dsa";
  }
  if (
    text.includes("dbms") ||
    text.includes("database") ||
    text.includes("sql") ||
    text.includes("normalization") ||
    text.includes("index") ||
    text.includes("acid") ||
    text.includes("transaction") ||
    text.includes("query")
  ) {
    return "dbms";
  }
  if (
    text.includes("operating system") ||
    text.includes("deadlock") ||
    text.includes("thread") ||
    text.includes("mutex") ||
    text.includes("synchronization") ||
    text.includes("exclusive lock") ||
    text.includes("shared lock") ||
    text.includes("preemption")
  ) {
    return "os";
  }
  if (
    text.includes("strength") ||
    text.includes("weakness") ||
    text.includes("five year") ||
    text.includes("5 year") ||
    text.includes("why should we hire") ||
    text.includes("tell me about yourself") ||
    text.includes("leaving") ||
    text.includes("prioriti") ||
    text.includes("career") ||
    text.includes("why do you want") ||
    text.includes("questions for us")
  ) {
    return "career";
  }
  if (
    text.includes("behavioral") ||
    text.includes("challenge") ||
    text.includes("conflict") ||
    text.includes("team") ||
    text.includes("tell me about a time") ||
    text.includes("describe a time")
  ) {
    return "behavioral";
  }
  return "general";
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function containsAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

export function generateFollowUpQuestion(
  question: Question,
  answerText: string,
): string {
  const category = detectCategory(question);

  if (category === "dsa") return pickRandom(TECHNICAL_DSA_FOLLOWUPS);
  if (category === "dbms") return pickRandom(TECHNICAL_DBMS_FOLLOWUPS);
  if (category === "os") return pickRandom(TECHNICAL_OS_FOLLOWUPS);

  if (category === "career") {
    const qLower = `${question.title} ${question.description}`.toLowerCase();
    if (
      qLower.includes("strength") ||
      qLower.includes("weakness") ||
      qLower.includes("greatest")
    ) {
      return pickRandom(STRENGTHS_WEAKNESSES_FOLLOWUPS);
    }
    return pickRandom(CAREER_FOLLOWUPS);
  }

  if (category === "behavioral") {
    if (containsAny(answerText, BEHAVIORAL_TEAM_KEYWORDS))
      return pickRandom(BEHAVIORAL_TEAM_FOLLOWUPS);
    if (containsAny(answerText, BEHAVIORAL_CONFLICT_KEYWORDS))
      return pickRandom(BEHAVIORAL_CONFLICT_FOLLOWUPS);
    if (containsAny(answerText, BEHAVIORAL_RESULT_KEYWORDS))
      return pickRandom(BEHAVIORAL_RESULT_FOLLOWUPS);
    if (containsAny(answerText, BEHAVIORAL_STAR_KEYWORDS))
      return "Can you walk me through each part of the STAR method for your example — Situation, Task, Action, and Result?";
    return pickRandom(BEHAVIORAL_GENERAL_FOLLOWUPS);
  }

  return pickRandom(GENERAL_FALLBACK_FOLLOWUPS);
}
