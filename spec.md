# InterviewIQ

## Current State
- Admin Portal (`/admin`) requires an admin activation token to become admin. The token comes from `CAFFEINE_ADMIN_TOKEN` env var injected by the platform, which users don't have direct access to.
- The `_initializeAccessControlWithSecret` function is the only way to become admin — it requires the exact token string.
- Admin Dashboard (`/admin/dashboard`) has role assignment form and seed questions button.
- Backend has `assignCallerUserRole` which only admins can call.

## Requested Changes (Diff)

### Add
- A new backend function `claimFirstAdmin()` that allows the first authenticated (non-anonymous) caller to become admin with no token required — but only if no admin has been assigned yet (`adminAssigned == false`). This eliminates the need for a token for the very first admin.
- A `getAdminAssigned()` query function so the frontend can check if admin has been claimed yet.
- In Admin Portal (`/admin`): show a "Claim Admin (First Setup)" button when no admin has been assigned yet, allowing the signed-in user to become admin in one click.
- Keep the existing token-based activation as a fallback for cases where the token IS available.

### Modify
- Admin Portal UI: show a clear two-path flow: (1) "First Setup — Claim Admin" if `adminAssigned` is false, (2) "Token Activation" if admin already exists.
- Admin Dashboard role assignment: make the "Use Mine" shortcut more prominent; ensure the role select includes admin, user, and guest options clearly.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `claimFirstAdmin()` and `getAdminAssigned()` functions to `main.mo` — `claimFirstAdmin` sets caller as admin only if `adminAssigned` is false.
2. Update `AdminPage.tsx` to query `getAdminAssigned`, show "Claim Admin" button (no token needed) when first setup, and keep token input as secondary option.
3. Update `AdminDashboard.tsx` role select to include guest role and improve "Use Mine" shortcut UX.
