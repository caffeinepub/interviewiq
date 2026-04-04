# InterviewIQ — Premium 2026 AI SaaS UI Modernization

## Current State

InterviewIQ is a fully functional decentralized AI interview platform built on ICP/Motoko with React 19 + TypeScript + Tailwind CSS + shadcn/ui. All logic, routes, hooks, backend bindings, and component functionality are working correctly. The current UI uses a dark professional theme (deep navy + electric violet) with some glassmorphism and gradient elements, but lacks the premium 2026 AI SaaS aesthetic — it reads as a competent developer app rather than a funded startup product.

Existing design tokens: OKLCH-based dark theme, Bricolage Grotesque (display), Plus Jakarta Sans (body), JetBrains Mono. Primary color: electric violet `oklch(0.6 0.22 277)`. Cyan accent, success green, warning colors. Motion/Framer Motion already installed. Box shadow utilities (shadow-glow, shadow-glow-lg, glow-cyan, glow-violet) already defined.

All 28 routes and pages are implemented and functional. Backend bindings in `backend.d.ts` and all hooks in `useQueries.ts` must not be touched.

## Requested Changes (Diff)

### Add
- Floating gradient orbs / mesh background on hero and key sections
- Animated waveform/pulse visual for AI speaking states
- Glassmorphism card style across all dashboards
- Glow intensification on hover for all interactive cards
- Shimmer loading skeletons replacing plain ones
- Animated tab slider indicator
- Sticky floating action bar on interview session screens
- Timer ring component (circular animated SVG timer)
- Premium stat cards with gradient borders and glow
- Immersive interview console layout (centered stage, floating camera, chat feed)
- Cyber-security aesthetic for PrivacySettingsPage
- Career cockpit layout for CandidateDashboard
- Executive control tower layout for AdminDashboard
- Additional CSS utilities: gradient-mesh, glow-blue, glow-emerald, animate-float, animate-waveform, shimmer pattern
- Hover lift transitions (`hover:-translate-y-1 hover:shadow-glow`)
- Route transition fade wrapper

### Modify
- `index.css`: Enrich with more gradient utilities, floating orb CSS, waveform animation, mesh background, improve gradient-hero to be more vivid
- `Navbar.tsx`: Upgrade portal switcher with glow on active pill, glass navbar background, gradient logo icon
- `Footer.tsx`: Full premium 4-col investor-grade footer with gradient divider
- `LandingPage.tsx`: Transform into Vercel/Perplexity-inspired startup landing with floating orbs, animated hero text, richer feature grid, mockup section, trust band, premium CTAs
- `CandidateDashboard.tsx`: Career intelligence cockpit with KPI cards, score gauges, skill chips, quick-launch cards, role tracker
- `AdminDashboard.tsx`: Executive control tower with large analytics cards, glowing ban/suspend states, sticky toolbar, danger zone
- `RecruiterDashboard.tsx`: Hiring intelligence workspace with premium search, analytics, modern modal
- `InterviewSession.tsx`: Immersive AI interview console with centered question stage, floating timer ring, camera preview panel, chat-style answer feed, speech waveform, violation toast stack
- `VoiceInterviewPage.tsx`: Premium voice interview setup and session UI
- `AIInterviewerSession.tsx`: Immersive one-question-at-a-time AI console
- `PanelInterviewPage.tsx`: Multi-persona panel UI with interviewer chips
- `StudentDashboard.tsx`: Premium AI learning workspace with skill badges, progress bars, MCQ cards
- `PrivacySettingsPage.tsx`: Cyber-security SaaS settings with encrypted vault cards, glowing toggles, danger zone
- `AssessmentPage.tsx`, `AssessmentReport.tsx`, `MockInterviewSetup.tsx`: Modernize UI consistent with new design system
- `GeminiInterviewSetup.tsx`, `GeminiInterviewSession.tsx`, `GeminiInterviewResults.tsx`: Premium Gemini AI interview UI

### Remove
- Flat enterprise card styles replaced by glassmorphism variants
- Dense plain tables replaced with modern card-based layouts on mobile
- Bootstrap-admin look replaced with premium SaaS spacing

## Implementation Plan

1. **Enhance index.css** — add animated-float, waveform-bars, mesh-bg, shimmer-card, richer gradient-hero, orb CSS, glow-blue, glow-emerald utilities
2. **Navbar** — glass bg, gradient logo, glow active portal pill, premium spacing
3. **Footer** — full premium investor-grade footer
4. **LandingPage** — floating orbs, animated hero, feature grid rework, mockup placeholder, trust band, premium CTAs
5. **CandidateDashboard** — KPI cards with gradient borders, skill chip badges, quick-launch interview cards with glow, role request with premium status UI
6. **AdminDashboard** — analytics cards with large numbers, glowing flagged/banned rows, sticky header, danger zone section
7. **RecruiterDashboard** — premium search bar, category filter tabs with animated indicator, candidate list cards
8. **InterviewSession** — full console redesign: timer ring, centered question card, floating camera panel, answer textarea with glow focus, violation badge stack
9. **VoiceInterviewPage + AIInterviewerSession + PanelInterviewPage** — immersive AI console variants
10. **StudentDashboard** — skill badge grid, subject accordions with progress meters, MCQ challenge cards
11. **PrivacySettingsPage** — vault cards, toggle glow, danger zone with red border
12. **Remaining pages** (AssessmentPage, GeminiInterviewSetup/Session/Results, MockInterviewSetup, AssessmentReport) — consistent premium styling
13. Validate (typecheck + build)
