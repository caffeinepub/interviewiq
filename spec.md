# InterviewIQ

## Current State

InterviewIQ is a full-stack AI interview platform built on ICP with a Motoko backend and React/TypeScript frontend. The app has all features implemented including:
- Internet Identity authentication
- Admin portal with one-click claim, question seeding, user management
- Candidate onboarding with profile creation
- Multiple interview modes (standard, adaptive, Gemini AI, voice, panel, AI interviewer)
- Evaluator and recruiter dashboards
- Student dashboard with resume upload
- Role request/approval system
- Proctoring (camera, screen share, tab-switch detection)

The app expired and needs to be rebuilt. The main concern is that profile saving (onboarding flow) must work reliably.

## Requested Changes (Diff)

### Add
- Nothing new — full rebuild of existing features

### Modify
- Fix profile saving: ensure the onboarding flow correctly calls `selfRegisterAsUser` first, then `updateCallerUserProfile`, then `updateCandidateProfile` in sequence with proper error handling
- Ensure the `useActor` hook provides a stable actor reference once Internet Identity is ready
- Ensure `OnboardingPage` properly waits for actor readiness before attempting to save
- Admin portal: fix `AdminPage` and `AdminDashboard` to use `useEffect` correctly (not `useState` for side effects)

### Remove
- Nothing

## Implementation Plan

1. **Fix profile save flow in `OnboardingPage.tsx`**: The registration and save calls must be sequential with sufficient delays and robust error handling. The actor must be verified as non-null before each call.

2. **Fix `AdminPage.tsx` and `AdminDashboard.tsx`**: Ensure all side effects (self-registration, redirect logic) use `useEffect` not `useState`. Remove any `Runtime.trap` behavior for unregistered users in admin check paths.

3. **Ensure `useActor` hook is stable**: The actor hook must correctly provide the actor once the identity is available, and `isFetching` must accurately reflect loading state.

4. **Rebuild and validate**: Run lint, typecheck, and build to ensure clean compilation before deploying.
