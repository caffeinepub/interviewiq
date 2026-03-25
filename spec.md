# InterviewIQ — Gemini AI Adaptive Interview

## Current State
InterviewIQ is a full-stack ICP interview platform with standard, adaptive, and panel interview modes. The frontend uses React 19 + TypeScript + Tailwind + shadcn/ui with TanStack Router. Pages exist at `/adaptive-assessment`, `/adaptive-session/:id`, `/panel-interview`, `/candidate`, etc. The existing adaptive engine uses keyword scoring without an external AI API.

## Requested Changes (Diff)

### Add
- New page `/gemini-interview` — Setup screen: API key input (stored in localStorage), job role (free text or dropdown), difficulty level (Easy/Medium/Hard), number of questions (5/8/10). Shows brief explanation of what Gemini AI interview is.
- New page `/gemini-interview/session` — Live interview session:
  - Calls Gemini API to generate initial questions on load
  - Shows "AI is generating next question..." loading state
  - Displays difficulty level badge (color-coded: green/yellow/red)
  - One question at a time with a textarea for answer
  - After each answer: calls Gemini to evaluate + generate adaptive follow-up
  - Shows inline feedback (score, strengths, weaknesses, improvement tip) after submission
  - Progress bar showing question X of Y
  - Tracks difficulty progression across questions
  - Avoids repeating questions (tracks asked questions)
  - Fallback to hardcoded questions if API fails
- New page `/gemini-interview/results` — Final results summary:
  - Overall score (average of all question scores)
  - Full Q&A breakdown with scores and feedback per question
  - Difficulty progression chart (text-based)
  - Print/share button
- New file `src/frontend/src/lib/geminiApi.ts` — Gemini API utility:
  - `generateQuestions(apiKey, role, difficulty, count)` → questions array
  - `evaluateAnswer(apiKey, question, answer)` → score/strengths/weaknesses/tip
  - `generateFollowUp(apiKey, question, answer)` → follow_up_question + new difficulty
  - Each function handles errors gracefully with fallback data
- Session data stored in localStorage under `gemini-interview-session`

### Modify
- `App.tsx`: Add 3 new routes (`/gemini-interview`, `/gemini-interview/session`, `/gemini-interview/results`)
- `CandidateDashboard.tsx`: Add a new card/button "AI Interview (Gemini)" linking to `/gemini-interview` alongside existing assessment options
- `LandingPage.tsx`: Optionally add Gemini AI interview as a feature highlight

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/lib/geminiApi.ts` with 3 Gemini API functions + fallbacks
2. Create `src/frontend/src/pages/GeminiInterviewSetup.tsx` — setup/config page
3. Create `src/frontend/src/pages/GeminiInterviewSession.tsx` — live session page
4. Create `src/frontend/src/pages/GeminiInterviewResults.tsx` — results summary page
5. Update `App.tsx` to add 3 new routes
6. Update `CandidateDashboard.tsx` to add the Gemini interview card
7. Validate (lint + typecheck + build)
