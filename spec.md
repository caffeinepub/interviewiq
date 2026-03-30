# InterviewIQ — Professional Polish & Feature Completeness

## Current State

InterviewIQ is a full-stack decentralized AI interview platform built on ICP (Motoko backend + React frontend). The app has all major features implemented but the UI needs professional polish for consistency, clarity, and orderly layout across all pages. The design system is in place (OKLCH dark theme, Bricolage Grotesque + Plus Jakarta Sans fonts, electric violet + cyan palette).

**Pages (22 routes):**
- `/` — Landing page (good quality)
- `/auth` — Auth / Login simulation
- `/onboarding` — Profile setup
- `/candidate` — Candidate dashboard
- `/student-dashboard` — Resume upload + Study Notes + Subject Guide + MCQ
- `/assessment` — Standard assessment entry
- `/adaptive-assessment` — Adaptive AI assessment entry
- `/session/$id` — Live interview session
- `/adaptive-session/$id` — Live adaptive session
- `/assessment/results/$id` — Results page
- `/candidate/report/$id` — Structured candidate report
- `/evaluator` — Evaluator dashboard
- `/recruiter` — Recruiter dashboard
- `/questions` — Question bank management
- `/interview-answers` — Classic interview answer guide
- `/admin` — Admin portal (claim / request role)
- `/admin/dashboard` — Admin dashboard (users, questions, role requests)
- `/admissions` — Admissions portal
- `/mock-interview/new` — Mock interview setup
- `/privacy-settings` — Privacy controls
- `/gemini-interview` + `/session` + `/results` — Gemini AI interview
- `/voice-interview` — Voice interview with camera
- `/ai-interviewer` + `/session` — AI interviewer (strict one-Q-at-a-time)
- `/panel-interview` — Panel simulation (HR/Tech/Manager)

**Backend functions (key):**
- `selfRegisterAsUser`, `claimFirstAdmin`, `isCallerAdmin`, `getUserRole`
- `addQuestion`, `getAllQuestions`, `seedQuestionsFromAnswerGuide`
- `createMockInterview`, `getSession`, `submitAnswer`, `submitSession`
- `saveCallerUserProfile`, `createCandidateProfile`, `getAllUserProfiles`
- `requestRoleUpgrade`, `approveRoleRequest`, `denyRoleRequest`, `getPendingRoleRequests`

## Requested Changes (Diff)

### Add
- Professional page headers with breadcrumbs or section titles on all inner pages
- Consistent empty states for all data-loading pages (with icons and clear action prompts)
- Loading skeletons on all pages that fetch data from the backend
- Micro-animations (fade-in, slide-up) on page mounts for major content sections
- `PanelInterviewPage` route at `/panel-interview` (it's referenced in navigation but the page component may be missing)
- Voice interview page at `/voice-interview` route (already exists but ensure it's wired)
- Status indicators on Candidate Dashboard for role request status

### Modify
- **Navbar**: Add AI Interview modes (Gemini, Voice, AI Interviewer) to dropdown menu for authenticated non-admin users; add Panel Interview link
- **Landing page**: Add feature cards for Gemini AI interview, Voice Interview, Panel Interview, AI Interviewer modes — the current feature grid only shows 4 features but the app has many more
- **Admin portal flow**: Ensure clean UX — sign in → register → check if admin exists → show "Become Admin" button OR "Admin already claimed, request role" card — must be bulletproof
- **Assessment page**: Make the camera/screen-share enable cards visually cleaner; ensure the "Start Assessment" button clearly leads to the session
- **All dashboard pages**: Consistent card layout, proper spacing, data tables with proper empty states
- **Footer**: Make professional with links to key sections, copyright, and a tagline

### Remove
- Any leftover debug/placeholder text or hardcoded TODO comments visible in UI
- Duplicate nav links that appear twice (some links appear in both nav bar and dropdown redundantly)

## Implementation Plan

1. **Polish Navbar**: Add all AI interview mode links (Gemini, Voice, AI Interviewer, Panel Interview) to the authenticated user dropdown. Clean up the nav link list — desktop nav should show only the 5-6 most important links; everything else in the dropdown.

2. **Update Landing Page**: Add 4 more feature cards for Gemini Interview, Voice Interview, AI Interviewer, and Panel Interview. Add a section showcasing all interview modes with CTAs.

3. **Professional page headers**: Add consistent page header pattern to all inner pages — title, subtitle, optional breadcrumb.

4. **Loading & empty states**: All pages that fetch backend data (question bank, evaluator, admin dashboard, candidate) need skeleton loaders and proper empty states.

5. **Admin Portal**: Bulletproof the admin claim UX — clear steps, visual feedback, error display, and direct link to seed questions after claiming admin.

6. **Panel Interview page**: Create `/panel-interview` page with the HR/Technical/Manager rotation flow (Gemini-powered), resume input, and final feedback.

7. **Voice Interview page**: Ensure `/voice-interview` route and page are wired with Gemini API key input, camera proctoring, and speech UI.

8. **Candidate Dashboard**: Add Role Request card with current status; add links to all assessment modes.

9. **Footer**: Professional footer with site sections, tagline, and ICP attribution.

10. **Consistent design polish**: Ensure all cards use consistent padding, border radius, and hover states. Page containers all use `container py-8` or similar consistent spacing.
