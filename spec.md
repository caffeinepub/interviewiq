# InterviewIQ

## Current State
The app has:
- Admin Portal at `/admin` (sign in, self-promote to admin)
- Admin Dashboard at `/admin/dashboard`
- Candidate Dashboard at `/candidate`
- Mock Interview setup at `/mock-interview/new`
- Interview Session at `/session/$id`
- Question Bank, Evaluator Dashboard, Answer Guide, Assessment Report pages
- Navbar only shows Admin Portal link when user is already admin — non-admin users have no way to find `/admin`
- Landing page doesn't surface a visible "Admin Portal" link consistently
- Candidate test process exists but lacks a guided entry point and clear step-by-step flow
- No dedicated "Candidate Test Portal" / admissions portal page

## Requested Changes (Diff)

### Add
- **Admissions Portal page** at `/admissions`: A dedicated portal for candidates to enter, see their status, begin a test, and track progress. Includes:
  - Sign in prompt for unauthenticated users
  - After login: onboarding check (if no candidate profile, prompt to complete it)
  - Test selection: browse available mock tests and start one
  - Active test card with "Continue" if session in progress
  - Completed test card with score and "View Report" link
  - Clear step-by-step test process guide (3 steps: Sign In → Select Test → Answer & Submit)
- **Navbar "Admissions" link**: visible to ALL users (authenticated or not) to surface the admissions portal
- **Admin Portal link visible always in navbar**: Move the Admin Portal link to a subtle "Admin" text link in navbar footer area or add it as a discrete link for unauthenticated users on the landing page

### Modify
- **Navbar**: Add "Admissions" link visible to everyone (not just admins). Keep existing admin/user nav links. Add "Admin Portal" link visible to unauthenticated/non-admin users as a small secondary link.
- **Landing page**: Add a visible "Candidate Test Portal" / "Admissions" CTA alongside the existing hero CTAs. Also surface the Admin Portal link clearly.
- **App.tsx**: Add route for `/admissions`

### Remove
- Nothing removed

## Implementation Plan
1. Create `AdmissionsPortal.tsx` page:
   - Unauthenticated: Hero with platform overview, sign in CTA, step-by-step test process (3 cards), and clear instructions
   - Authenticated: Show candidate profile summary (name, role), active sessions list from backend, option to start new mock test, completed sessions with scores
   - Step guide: Step 1 (Create Profile / Onboarding) → Step 2 (Select Questions) → Step 3 (Answer & Submit)
   - Uses `useGetCallerUserProfile`, `useGetCandidateProfile`, `useGetAllQuestions` hooks
   - "Start Test" button navigates to `/mock-interview/new`
   - Full data-ocid markers on all interactive elements

2. Update `App.tsx`: Add admissionsRoute at `/admissions`

3. Update `Navbar.tsx`:
   - Add "Admissions" NavLink visible to all users (authenticated or not)
   - Add "Admin Portal" link visible when NOT admin (subtle, secondary styling)
   - Move dropdown to include "Admissions" for candidate users

4. Update `LandingPage.tsx`:
   - Add "Candidate Portal" primary CTA button linking to `/admissions`
   - Add subtle "Admin Portal →" text link in hero section
