# InterviewIQ

## Current State
Full-stack ICP-based interview platform with all major features implemented: RBAC, question bank, sessions, adaptive assessment, Gemini AI interview, voice interview, AI interviewer, panel interview, student dashboard, admin portal, proctoring, cheating detection, resume upload/skill extraction, and role request/approval system.

Critical backend bug: `getUserRole` in `access-control.mo` calls `Runtime.trap("User is not registered")` for any user not yet in the `userRoles` map. Since `isAdmin()` and `hasPermission()` both call `getUserRole`, any unregistered visitor attempting any admin-checked endpoint causes a full canister trap/crash. This makes the admin portal unusable for first-time users trying to claim admin.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `access-control.mo`: `getUserRole` returns `#guest` instead of trapping when user is not registered — safe fallback that lets `isAdmin()` return `false` cleanly

### Remove
- Dead `initialize()` function in `access-control.mo` (was never called)

## Implementation Plan
1. Fix `getUserRole` in `access-control.mo` to return `#guest` on null case (DONE)
2. Rebuild frontend unchanged
3. Deploy
