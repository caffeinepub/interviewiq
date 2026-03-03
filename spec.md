# InterviewIQ

## Current State
- Question bank seeding from the Answer Guide is broken: `getAllQuestions` in the backend requires `#user` permission, so unauthenticated/guest callers cannot load questions. The seed button in QuestionBank.tsx only shows for admins, and seed attempts silently fail if the actor isn't ready.
- Admin role assignment is broken: `assignCallerUserRole` is gated — only existing admins can call it. There's no bootstrap path for the very first admin. The "Become Admin" button on AdminPage.tsx calls the same gated function and will fail for non-admins.
- The `getAllQuestions` query returns an error for guest users, so the assessment page cannot auto-select questions for candidates who haven't logged in yet.

## Requested Changes (Diff)

### Add
- Backend: a public `bootstrapAdmin` function that lets the **first** caller promote themselves to admin (only works when no admins exist yet — a one-time operation).
- Backend: make `getAllQuestions` callable by anyone (public query, no permission check) so guests and candidates can always browse questions.
- Frontend: AdminPage — after signing in, show a clear "Activate Admin Role" button that calls `bootstrapAdmin` (not `assignCallerUserRole`) so the first user can always self-promote without requiring pre-existing admin access.
- Frontend: AdminDashboard — add a "Seed Questions from Answer Guide" button directly on the dashboard so admins can seed without navigating to /questions.
- Frontend: QuestionBank — always show the Seed Questions button to admins (already done), but also fix the seeding flow to handle errors per-question and show progress.
- Frontend: AssessmentPage — ensure question loading works for all authenticated users.

### Modify
- Backend: `getAllQuestions` — remove the `#user` permission guard, make it a fully public query.
- Backend: add `bootstrapAdmin` public shared function that sets caller as admin only if no admins exist.
- Frontend: AdminPage `handleBecomeAdmin` — call `bootstrapAdmin` backend function instead of `assignCallerUserRole`.
- Frontend: useQueries.ts — add `useBootstrapAdmin` mutation hook.

### Remove
- Nothing removed.

## Implementation Plan
1. Update `main.mo`: make `getAllQuestions` public (no auth check), add `bootstrapAdmin` function.
2. Update `backend.d.ts`: add `bootstrapAdmin(): Promise<void>` to the interface.
3. Update `useQueries.ts`: add `useBootstrapAdmin` mutation.
4. Update `AdminPage.tsx`: use `useBootstrapAdmin` for the "Become Admin" button, add clear instructions.
5. Update `AdminDashboard.tsx`: add a "Seed Questions" button that triggers seeding from the Answer Guide data inline.
6. Ensure QuestionBank seed button is visible and functional for admins.
