# InterviewIQ — FAQ Dashboard

## Current State
InterviewIQ is a full-featured AI interview platform with many pages. No dedicated FAQ/Help Center page exists.

## Requested Changes (Diff)

### Add
- New `/faq` route and `FAQPage` component
- Professional help center layout with:
  - Hero section with search bar and category pill filters
  - 3-column grid: left sidebar (FAQ sections), center accordion (questions), right sidebar (popular articles)
  - Support/contact CTA band with X (Twitter), Instagram social links and default email button
  - Footer social icons (X, Instagram)
- FAQ data: ~20 questions across categories (Getting Started, Assessments, AI Features, Proctoring, Account & Billing, Privacy)
- Social links: X → https://x.com/interviewiq, Instagram → https://instagram.com/interviewiq
- Default email: mailto:support@interviewiq.ai

### Modify
- `App.tsx` — add `/faq` route
- `Navbar.tsx` — add "Help" or "FAQ" link in nav

### Remove
- Nothing removed

## Implementation Plan
1. Create `FAQPage.tsx` with hero, search, category pills, accordion FAQ, sidebars, contact CTA, social links
2. Register `/faq` route in `App.tsx`
3. Add FAQ link to Navbar
