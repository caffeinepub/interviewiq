# InterviewIQ

## Current State
Full-stack interview platform with backend (Motoko on ICP) and React frontend. Features include role-based access (admin/user/guest), question bank, timed interview sessions, assessment with auto-scoring, camera proctoring, tab-switch anti-cheat, and evaluator scoring. Admin access is claimed via a one-click "Become Admin" button on `/admin`.

**Critical bug:** `access-control.mo` `getUserRole()` calls `Runtime.trap("User is not registered")` when a user is not in the roles map. This means `isCallerAdmin()`, `isAdmin()`, and `hasPermission()` all crash for any first-time user — including when they try to call `claimFirstAdmin()`. The "Fail to claim admin role" error seen by the user is caused by this trap propagating up through `isCallerAdmin` which is called before the admin check.

## Requested Changes (Diff)

### Add
- Nothing new — this is a targeted bug fix.

### Modify
- `access-control.mo`: `getUserRole()` must return `#guest` (not trap) for unregistered users. This makes all role-check functions safe to call for any authenticated principal.
- `main.mo`: `claimFirstAdmin()` logic remains the same but will now work correctly since `getUserRole` no longer traps.
- `MixinAuthorization.mo`: `getCallerUserRole()` now safely returns `#guest` for new users instead of trapping.

### Remove
- Nothing removed.

## Implementation Plan
1. Regenerate backend with `getUserRole` returning `#guest` for null/unregistered users (no trap).
2. Verify all dependent functions (`isAdmin`, `hasPermission`, `isCallerAdmin`) work safely for unregistered users.
3. Keep frontend `AdminPage.tsx` flow as-is (selfRegister → claimFirstAdmin → redirect) since it's correct.
4. Deploy.
