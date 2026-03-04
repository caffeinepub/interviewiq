# InterviewIQ

## Current State
Full-stack interview platform with 14 pages, Motoko backend, React/TypeScript frontend. Features: admin portal, question bank, timed assessments, camera proctoring, adaptive AI question mode, evaluator dashboard.

## Requested Changes (Diff)

### Add
- selfRegisterAsUser() call in OnboardingPage.handleSubmit before createCandidateProfile and saveCallerUserProfile

### Modify
- OnboardingPage.tsx: import useSelfRegisterAsUser; call it in handleSubmit before the profile save calls; include it in isPending state
- useQueries.ts: useGetCandidateProfile — wrap getCandidateProfile in try/catch returning null on error (unregistered user)

### Remove
- Nothing removed

## Implementation Plan
1. OnboardingPage.tsx — already patched: selfRegisterAsUser called first in handleSubmit, isPending includes selfRegister.isPending
2. useQueries.ts — already patched: useGetCandidateProfile has try/catch
3. Validate build (typecheck + lint)
