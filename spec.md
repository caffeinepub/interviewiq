# InterviewIQ

## Current State
Full-stack decentralized interview platform on ICP with Motoko backend and React frontend. Has 18 pages covering admin, candidate, evaluator, assessment, adaptive assessment, student dashboard, proctoring, and more. Backend is solid. Previous build failed before completing.

## Requested Changes (Diff)

### Add
- Nothing new; this is a rebuild/fix pass

### Modify
- AdminPage: Fix one-click admin claim flow — register user first, then claim, with clear error states
- AssessmentPage: Fix session creation — ensure selfRegisterAsUser() called before createMockInterview(), add proper error handling and retry logic
- InterviewSession: Fix camera access — ensure video element is mounted before calling getUserMedia, use ref callback pattern, add retry logic, permission error messages
- OnboardingPage: Fix profile save — register user first, then save profile sequentially
- All pages: Wrap all backend calls in try/catch, show actionable error messages

### Remove
- Nothing

## Implementation Plan
1. Fix AdminPage — sequential: selfRegisterAsUser → getAdminAssigned → show Claim or show Principal ID
2. Fix AssessmentPage — await selfRegisterAsUser, then createMockInterview, handle errors with user-friendly messages
3. Fix InterviewSession camera — use callback ref for video element, start camera only after element is mounted, retry getUserMedia up to 3 times, handle NotAllowedError/NotFoundError specifically
4. Fix OnboardingPage — sequential registration before profile save
5. Ensure all backend calls are wrapped in try/catch with toast error messages
