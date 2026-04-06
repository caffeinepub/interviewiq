# InterviewIQ

## Current State
The admin portal (`/admin`) uses Internet Identity as its only authentication gate. There is no password protection — anyone who navigates to `/admin` can attempt to become admin immediately.

## Requested Changes (Diff)

### Add
- A password login screen as the **first gate** on the `/admin` route
- The password is a fixed admin secret stored as a constant (default: `admin@interviewiq2026`)
- On correct password entry the session is marked as password-verified in `sessionStorage` so the user isn't prompted again on the same tab
- A "Show/Hide password" toggle on the input
- Error feedback for wrong password
- The existing Internet Identity flow, admin claim, and all dashboard logic remain completely intact — password gate just wraps around them

### Modify
- `AdminPage.tsx`: render a premium password gate card when `passwordVerified` state is false; after correct entry set verified state and render the existing page content as-is

### Remove
- Nothing is removed — all existing admin features preserved

## Implementation Plan
1. Add `ADMIN_PASSWORD` constant at the top of `AdminPage.tsx`
2. Add `passwordVerified` state initialised from `sessionStorage` so same-tab sessions persist
3. Render a password gate card (with Eye/EyeOff toggle, error message, animated glow on error) when not verified
4. On correct password: set `sessionStorage` flag and flip `passwordVerified` to true
5. Existing JSX renders only when `passwordVerified === true`
