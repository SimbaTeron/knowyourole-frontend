# KnowYouRole - Everyday Compass Personality Discovery

## Overview

KnowYouRole is a personality discovery application with an "Everyday Compass" aesthetic, guiding users through self-discovery. It uses hand-drawn visuals and journal-like designs to offer a warm, grounded journey. The application helps users discover personality traits via age-tier selection, mood assessment, optional location integration, and a comprehensive quiz. The business vision is to provide a contemplative and insightful self-discovery tool, with future potential for advanced AI-driven personality analysis and personalized growth features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The frontend is a React 18+ SPA using TypeScript and Vite. It features a custom "Everyday Compass" theme with terracotta, sage-green, dusty-blue, and warm cream colors, emphasizing 70% whitespace. Typography uses Nunito (sans-serif) and Lora (headings). Key UI components include `PathCanvas` for animated SVG paths, `AgeTierSelector`, `MoodSelector`, and a `StepIndicator`. Animations are powered by Framer Motion. The application supports a two-mode theme (light/dark) and locality-based accent colors. Accessibility is prioritized with ARIA roles, keyboard navigation, and mobile-first design.

### Technical Implementations

- **Frontend**: React 18+, TypeScript, Vite, `wouter` for routing, `shadcn/ui` for components, `TanStack Query` for server state, Tailwind CSS for styling.
- **Backend**: Express.js server (Node.js) with modular routes and in-memory storage (`MemStorage`) for development.
- **Data Storage**: Drizzle ORM configured for PostgreSQL (`@neondatabase/serverless`), with Zod-validated type-safe schema and UUIDs for primary keys.
- **Build**: Multi-stage process using Vite for client and esbuild for server.

### Feature Specifications

- **User Journey**: Home (age) → Mood Selection → Mood Mixer → Location → Pre-Quiz Demo → Quiz → Results.
- **Mood Interaction**: Separate pages for mood selection and an interactive "Mood Mixer" cauldron.
- **Pre-Quiz Demo**: Animated 3-card walkthrough of question types.
- **Quiz Flow**: Age-tiered binary swipe questions with strategic breaks. Features include a timer, tactile feedback, dynamic difficulty scaling, and strategic checkpoint pauses. Supports MBTI, DISC, Big Five, Critical Thinking, and First Principles traits. Includes a `Slider UI Component` for nuanced responses.
  - **Question Database**: 1,200 total questions across all tiers:
    - Youth (7-12): 200 questions (6s timer)
    - Teen (13-18): 200 questions (7s timer)
    - Young Adult (19-25): 400 questions (8s timer)
    - Adult (25+): 400 questions (8-9s timer)
    - 72 slider-type questions, 28 wildcard questions (Critical Thinking + First Principles)
  - **Tier-Specific Quiz Configurations**:
    - Youth (7-12): 25 questions - superpower (Q6), energy (Q12), mystery (Q18), no checkpoints
    - Teen (13-18): 30 questions - superpower (Q6), checkpoint (Q11), energy (Q16), mystery (Q21)
    - Young Adult (19-25): 35 questions - superpower (Q11), checkpoint1 (Q11), checkpoint2 (Q21), energy (Q27), mystery (Q32)
    - Adult (25+): 40 questions - checkpoint1 (Q10), checkpoint2 (Q20), superpower (Q25), energy (Q30), mystery (Q35)
  - **Removed mid-quiz circular badges** (Bold Explorer, 2x, random events, frequency badges) - only square insight badges in top-right corner remain
- **Results Dashboard**: Displays Big Five Radar chart, MBTI/DISC/Big Five explanations, and personalized role recommendations. Includes percentile comparisons and a "Just Kidding!" interstitial for premium features.
- **Donation System**: Two-tier donation modal integrated with Stripe.
- **Feedback System**: 5-question feedback form that auto-exports quiz results to Google Sheets.
- **Location & Geocoding**: Simplified zip code input (US/Canada) with auto-detection via `zippopotam.us` and mapping to sports team colors.
- **Market Research Algorithm**:
    - **Weighted Scoring**: 5-point scale for slider questions (-2 to +2), 0/1 for binary.
    - **Z-Score Normalization**: Big Five traits normalized against population research norms.
    - **Weighted Proxy Calculations**: Research-validated weighted averages for Critical Thinking and First Principles.
    - **Internal Consistency Checks**: Cronbach's Alpha per trait group to flag low consistency.
    - **Framework Quota Balancing**: Questions shuffled to maintain MBTI/DISC/Big Five distribution.
    - **Hybrid Type Detection**: Identifies nuanced personality types (e.g., Ambivert) when trait differences are within a threshold.
    - **Variable Boosts**: Randomized boost percentages for scoring.
    - **Post-Quiz Validation Gate**: 2-question overlay to refine results based on user perception.
    - **Adaptive Branching (IRT)**: Prioritizes questions for ambiguous traits.
    - **Dynamic Question Wording**: Adjusts question prompts based on mood.
- **Mood Alchemist Badge**: Highlights mood blend influence on results:
    - Displays blend title (e.g., "Wonder Seeker", "Inventive Mind") with trait boosts
    - Shows proxy impact (Critical Thinking, First Principles boosts)
    - Tracks unique blends in localStorage for "Master Alchemist" meta-badge (3+ unique blends)
    - Animated Framer Motion pop entrance with sparkle effects
- **PDF Sharing**: Multi-channel result sharing via SharePDFModal component:
    - **Download**: Generates structured PDF with personality overview, MBTI type, Big Five breakdown, and mood blend using pdf-lib.
    - **Email**: Sends beautifully designed HTML email with embedded results via Nodemailer (requires SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS secrets).
    - **SMS**: Sends formatted text summary with download link via Twilio (requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER secrets).

## External Dependencies

### Frontend Libraries

- React, TypeScript, Vite, wouter, shadcn/ui, TanStack Query, Tailwind CSS, Radix UI, Lucide React, Framer Motion, react-select, class-variance-authority, clsx, tailwind-merge, cmdk, React Hook Form, Zod.

### Backend Libraries

- Express, Node.js, Drizzle ORM, @neondatabase/serverless, connect-pg-simple, esbuild, pdf-lib, nodemailer, twilio.

### APIs & Services

- **zippopotam.us**: Postal code lookup.
- **Stripe**: Payment processing.
- **Google Sheets API**: Data export for quiz sessions, feedback, and questions database. Auto-exports new quiz results to a specific Google Sheet upon feedback submission.

### Databases

- **PostgreSQL**: Primary database, hosted on Neon.