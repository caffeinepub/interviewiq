# InterviewIQ

## Current State

A full-stack decentralized interview platform on ICP. The backend has a critical bug: `access-control.mo`'s `getUserRole` traps with "User is not registered" for any unregistered principal. This causes `hasPermission`, `isAdmin`, and `isCallerAdmin` to all crash for new users — breaking `selfRegisterAsUser`, `claimFirstAdmin`, and `createMockInterview` (the assessment session creation entry point).

The frontend AssessmentPage calls `selfRegisterAsUser` then `createMockInterview` to start a session. The InterviewSession page fetches the session and displays the timed test.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- **`access-control.mo`**: `getUserRole` must return `#guest` (not trap) for unregistered users
- **`main.mo`**: `selfRegisterAsUser` must work without any prior role check — directly insert `#user` if not present. `claimFirstAdmin` must not call any function that checks roles first. `createMockInterview` uses `autoRegisterUserIfNeeded` which already directly writes to the map — keep this pattern. `getCallerUserProfile` and `getUserProfile` must use a safe role check (not trap for unregistered). `createCandidateProfile` and `getCandidateProfile` must use safe checks.
- All functions that gate on `hasPermission(..., #user)` must now work correctly since `getUserRole` no longer traps — this is the only change needed in access-control.mo

### Remove
- Nothing

## Implementation Plan

1. Regenerate backend with the `getUserRole` fix: return `#guest` for null/unregistered principals instead of trapping
2. Ensure `selfRegisterAsUser` directly checks the map (no role check before writing)
3. Ensure `claimFirstAdmin` directly checks `adminAssigned` flag then writes — no getUserRole call before
4. `createMockInterview` continues using `autoRegisterUserIfNeeded` pattern (direct map write)
5. All other query/permission checks now work safely because getUserRole returns #guest (not admin) for unknown users, so hasPermission returns false gracefully instead of trapping
6. Frontend: no changes needed — the existing flow (selfRegister then createMockInterview) will work once the backend trap is fixed
