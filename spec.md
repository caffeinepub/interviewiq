# InterviewIQ

## Current State
Full-stack interview platform with question bank, admin portal, assessment center, and answer guide. Admin can self-promote and assign roles. Seed Questions button loads 25 generic tech + interview questions. Admin Dashboard shows principal ID but lacks easy copy or self-assign shortcut.

## Requested Changes (Diff)

### Add
- "Use Mine" shortcut button in Admin Dashboard role form to pre-fill the admin's own Principal ID
- Copy-to-clipboard button next to the admin's principal ID in the Admin Info bar
- Helpful description in role management card explaining how to get a user's Principal ID

### Modify
- Seed Questions in QuestionBank: replace all 25 generic questions with the 10 classic interview questions sourced directly from the Answer Guide page (with full descriptions, what-they-want-to-know context, and model answer strategies)

### Remove
- The 15 generic tech questions (Two Sum, LRU Cache, System Design, etc.) from SEED_QUESTIONS

## Implementation Plan
1. Replace SEED_QUESTIONS array in QuestionBank.tsx with the 10 Interview Answer Guide questions (already done)
2. Add Copy icon and copy-to-clipboard handler to Admin Info bar in AdminDashboard.tsx (done)
3. Add "Use Mine" quick-fill button in Role Management form in AdminDashboard.tsx (done)
4. Deploy
