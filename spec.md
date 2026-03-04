# InterviewIQ

## Current State

A full-stack decentralized interview platform on ICP with:
- Question bank (10 seeded interview questions with descriptions)
- Assessment flow: auto-select 5 questions → timed session (30 min) → auto-score by answer length → results page
- Backend scoring: purely length-based (0/20/50/70/90 based on character count)
- Static question selection (random shuffle with difficulty distribution)
- Camera + screen share proctoring, anti-cheat tab monitoring
- Admin portal with role management and seed questions
- 14 frontend pages

## Requested Changes (Diff)

### Add

1. **Adaptive Question Engine (backend)** — New backend logic:
   - `AdaptiveSession` type that tracks the candidate's running performance score during a session
   - `getAdaptiveNextQuestion(sessionId, answeredQuestionIds)` — Given answered question IDs and the session's answer quality so far, returns the next best question ID from the bank. Algorithm: if avg score < 40 → prefer easy; if 40–70 → prefer medium; if >70 → prefer hard. Avoids already-answered questions.
   - `getAdaptiveFeedback(answerText, questionTitle)` — Returns smart keyword-based contextual feedback by analyzing whether the answer contains relevant terms and sufficient explanation, rather than just length.
   - `getRecommendedQuestions(sessionId)` — After a session, returns up to 3 question IDs from the bank the candidate should practice more based on their lowest-scoring answers' categories/tags.

2. **Smart Keyword Scoring (backend)** — Update `submitSession` to use hybrid scoring:
   - Length still contributes (40% weight)
   - Keyword density check: detect presence of key terms relevant to interview answers (situation/task/action/result for behavioral, specific technical terms, etc.) — contributes 60% weight
   - Richer auto-feedback messages that reference what was missing or well done

3. **Adaptive Assessment Page (frontend)** — New `/adaptive-assessment` page:
   - Explains the adaptive mode: questions get harder/easier based on your real-time answers
   - Start button creates a session, then enters a new adaptive session loop
   - After each answer is submitted, the frontend calls `getAdaptiveNextQuestion` to fetch the next question
   - Shows a "Adapting to your performance..." indicator between questions
   - Progress bar shows difficulty trend (easy → medium → hard) visually
   - 10 question adaptive session (vs 5 for standard)

4. **Adaptive Session Flow (frontend)** — New `/adaptive-session/$id` page:
   - Displays one question at a time (fetched adaptively)
   - Shows current difficulty level badge that updates after each question
   - Shows a mini "performance meter" that fills/empties based on running score
   - After submitting each answer, calls adaptive engine to get next question
   - On completion: navigates to results

5. **Enhanced Results with Recommendations (frontend)** — Update `AssessmentResults.tsx`:
   - Add "Recommended Practice" section at the bottom
   - After session is evaluated, calls `getRecommendedQuestions` and displays those question titles with a link to `/interview-answers`
   - Shows performance trend per question (improving/declining/stable)

6. **Adaptive Mode card on Assessment page** — Update `AssessmentPage.tsx`:
   - Add a second CTA card for "Adaptive Mode" alongside the standard assessment
   - Explains what adaptive means

### Modify

- `submitSession` in backend: upgrade auto-scoring to keyword-based hybrid scoring
- `AssessmentPage.tsx`: add Adaptive Mode CTA card
- `AssessmentResults.tsx`: add Recommended Practice section
- `App.tsx` / router: add `/adaptive-assessment` and `/adaptive-session/$id` routes
- Navbar: add link to Adaptive Assessment

### Remove

Nothing removed.

## Implementation Plan

1. Update `main.mo`:
   - Add `getAdaptiveNextQuestion(sessionId, answeredIds)` public query function
   - Add `getAdaptiveFeedback(answerText, questionTitle)` public query function
   - Add `getRecommendedQuestions(sessionId)` public query function
   - Upgrade `submitSession` scoring with keyword analysis (hybrid: length 40% + keyword 60%)
   - Keep all existing APIs unchanged

2. Update `backend.d.ts` with new function signatures

3. New frontend page: `AdaptiveAssessmentPage.tsx` — entry point for adaptive mode

4. New frontend page: `AdaptiveSession.tsx` — adaptive one-question-at-a-time session loop

5. Update `AssessmentPage.tsx` — add Adaptive Mode card

6. Update `AssessmentResults.tsx` — add Recommended Practice section with `getRecommendedQuestions`

7. Update `App.tsx` router + navbar with new routes
