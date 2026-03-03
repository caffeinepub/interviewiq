# InterviewIQ

## Current State

- Full-stack interview platform with Motoko backend and React frontend
- Authorization mixin in place with `isCallerAdmin()`, `getCallerUserRole()`, `assignCallerUserRole()` APIs
- Backend: admin-only question CRUD, session management, candidate profiles
- Frontend: 9 pages (Landing, Onboarding, CandidateDashboard, EvaluatorDashboard, QuestionBank, InterviewSession, AssessmentReport, MockInterviewSetup, InterviewAnswers)
- Navbar shows Admin badge and routes based on `isCallerAdmin()` result
- QuestionBank already has 25 seed questions (15 technical + 10 interview), but seed button only appears when question count is 0
- No dedicated admin login or admin management page exists
- No way for an admin to assign the admin role to other users from the UI

## Requested Changes (Diff)

### Add
- `/admin` route: Admin Login & Management page
  - "Become Admin" section: button that calls `assignCallerUserRole(caller, #admin)` so the logged-in user grants themselves admin
  - "Assign Role to User" form: input for principal ID + role select (admin/user) + submit calling `assignCallerUserRole`
  - Current role display showing the caller's role
  - Clear instructions on what admin role unlocks
- Admin Dashboard page at `/admin/dashboard`:
  - Quick stats (question count, links to evaluator panel and question bank)
  - Role management table: display current user's role and quick action to self-promote to admin
- Seed Questions button should always be visible to admins (not just when count = 0)
- All 25 existing seed questions are already in the code; ensure they remain

### Modify
- Navbar: add "Admin" nav link for admin users pointing to `/admin/dashboard`
- OnboardingPage: after admin check, redirect admins to `/admin/dashboard` instead of `/evaluator`
- LandingPage: add "Admin Login" secondary link for admins/evaluators
- QuestionBank: show Seed Questions button to admins always (currently only shown when count === 0)

### Remove
- Nothing removed

## Implementation Plan

1. Add `getUsersByRole` query to backend to support admin user listing (optional, if feasible)
2. Add `/admin` and `/admin/dashboard` routes in App.tsx
3. Create `AdminPage.tsx` -- login + self-assign admin role + assign role to another principal
4. Create `AdminDashboard.tsx` -- admin overview with role management and quick navigation
5. Update Navbar to include Admin Dashboard link for admin users
6. Update OnboardingPage to redirect admins to `/admin/dashboard`
7. Update QuestionBank to always show Seed button for admins (not only when count = 0)
8. Ensure `useAssignUserRole` mutation hook exists in useQueries.ts
