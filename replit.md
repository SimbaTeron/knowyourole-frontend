# KnowRole - Everyday Compass Personality Discovery

## Overview

KnowRole is a personality discovery application designed with an "Everyday Compass" aesthetic to guide users through self-discovery. It offers a warm, grounded journey using hand-drawn visuals and journal-like designs. The application helps users discover their personality traits through a multi-step process including age-tier selection, mood assessment, optional location-based landmark integration, and a comprehensive quiz. The business vision is to provide a contemplative and insightful self-discovery tool, with future potential for advanced AI-driven personality analysis and personalized growth features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend is a React 18+ SPA built with TypeScript and Vite. It uses `wouter` for routing, `shadcn/ui` for components, and `TanStack Query` for server state management. Styling is handled by Tailwind CSS with a custom "Everyday Compass" theme featuring terracotta, sage-green, dusty-blue, and warm cream colors, emphasizing 70% whitespace. **Typography**: Nunito as primary sans-serif with Lora for headings (imported via Google Fonts). Key UI components include `PathCanvas` for animated SVG paths, `AgeTierSelector` (with age tiers: "Ages 12 and under", "Ages 13-18", "Ages 19-25", "Ages 25+" - displayed with large, prominent text), `MoodSelector`, and a `StepIndicator` for progress visualization. Animations are powered by Framer Motion. The application supports a two-mode theme (light/dark) and a locality-based accent color system derived from sports teams of major US cities, persisted in local and session storage. Accessibility is a priority with ARIA roles, keyboard navigation, and mobile-first design.

### Backend

The backend is an Express.js server built with Node.js, serving both API endpoints and static files. It features a modular route structure and uses an in-memory storage implementation (`MemStorage`) for development, designed with an `IStorage` interface for future database integration.

### Data Storage

Drizzle ORM is configured for PostgreSQL via `@neondatabase/serverless`, with a type-safe schema defined in `shared/schema.ts` using Zod validation. It supports schema migrations and uses UUIDs for primary keys.

### Build and Deployment

A multi-stage build process uses Vite for the client and esbuild for the server. The development workflow includes Hot Module Replacement and TypeScript compilation.

### Feature Specifications

- **User Journey Flow**: Home (age tier selection) → Mood Selection (/mood) → Mood Mixer (/mood-mixer) → Location (/location) → Pre-Quiz Demo (/pre-quiz) → Quiz (/quiz) → Results
- **Mood Pages (Split)**: 
  - **/mood**: Mood selection page with three options (Energized, Stuck, Reflective). Clear instructions explain that mood helps personalize the journey.
  - **/mood-mixer**: Interactive cauldron where users tap two mood ingredients (Happy, Calm, Curious, Determined, Creative, Social) to "brew" a hybrid personality hint. Optional step.
- **Pre-Quiz Demo Page** (/pre-quiz): Consolidated 3-card animated walkthrough: 1) Binary Questions (shows timer + swipe animation), 2) Slider Questions (interactive slider preview), 3) Your Results (badges and insight preview). Swipe to navigate between cards.
- **Quiz Flow**: Age-tiered binary swipe questions with strategic break phases. Timer per question (10s for Mini/Teen, 9s for Young Adult/Adult). Cards tilt on selection for tactile feedback. Auto-hiding "Tap or swipe" hint after first interaction. Tracks MBTI, DISC, Big Five, Critical Thinking, and First Principles traits.
  - **Mini Explorer (12 and under)**: 20 questions - 6 binary → MC1 → 5 binary → Superpower → 5 binary → Mystery → 4 binary → MC2
  - **Teen (13-18)**: 30 questions - 8 binary → MC1 → 7 binary → Superpower → 7 binary → Mystery → 6 binary → MC2
  - **Young Adult (19-25)**: 35 questions - 9 binary → MC1 → 9 binary → Superpower → 9 binary → Mystery → 8 binary → MC2
  - **Adult (25+)**: 40 questions - 10 binary → MC1 → 10 binary → Superpower → 10 binary → Mystery → 9 binary → MC2
  - **UI Design**: 2x larger question text (text-3xl), 150% larger answer boxes with directional arrows (← left option, → right option), diagonal offset layout
- **Results Dashboard**: Displays Big Five Radar chart (340px, single-letter axis labels O/C/E/A/N with color-coded trait colors), MBTI/DISC/Big Five stacked vertically with plain-language explanations. Personalized role recommendations (200+ clusters including trades, first responders, manufacturing, agriculture). Premium tier shows salary data without "premium" labeling. Free tier gets 4-5 sentence personalized summary.
- **Just Kidding Interstitial**: After clicking Unlock Premium button, users see a playful "Just Kidding!" overlay with "Premium is Free (For Now)" message, "Proceed to Results" button to unlock premium features for free during testing, and two donation tier options ($3.33 and $33.33).
- **Donation System**: Two-tier donation modal with $3.33 and $33.33 options plus back button. Stripe integration for payment processing.
- **Feedback System**: 5 questions (Useful App?, Results accurate?, Questions engaging?, Would share?, Suggestions). Auto-exports quiz results to Google Sheets when feedback is submitted.
- **Location and Geocoding**: Simplified zip code input (US and Canada only) with auto-detection via zippopotam.us API. Maps to sports team colors via cityThemes.ts.
- **Locale Insights System**: Metro-specific career insights based on personality traits with regional fallbacks.
- **Regional Salary System**: Metro-adjusted salary ranges for common roles with industry bonuses and growth outlook text. Displayed in premium tier only.

### Market Research Algorithm Improvements (December 2025)

- **Weighted Scoring (-2 to +2)**: Enhanced scoring model replaces binary true/false with 5-point scale supporting slider questions. Values map as: Strongly Disagree (-2), Disagree (-1), Neutral (0), Agree (+1), Strongly Agree (+2). Binary questions continue using 0/1 mapping.
- **Z-Score Normalization**: Big Five traits now normalized using population research norms stored in `research_norms` table. Enables percentile-based comparisons: raw scores converted to z-scores ((raw - mean) / stdDev), then to normalized 0-100 scale.
- **Framework Quota Balancing**: Questions shuffled to maintain target distribution: 30% MBTI, 30% DISC, 40% Big Five. Tier-adaptive: Adult tier gets 40% Big Five vs 30% for younger tiers.
- **Hybrid Type Detection**: Automatically identifies personality nuances when dimension differences fall within threshold (20%): Ambivert (E/I balanced), Intuitive-Sensing Blend (S/N balanced), Thinking-Feeling Balance (T/F balanced), Flexer (J/P balanced), plus Big Five balanced traits.
- **Variable Boosts (10-30%)**: Randomized boost percentages replace fixed modifiers, adding natural variance to scoring while preventing exploitation patterns.
- **Dynamic Difficulty Scaling**: Swipe time tracking adjusts question difficulty based on response speed (<2s average = hard questions, 2-4s = medium, >4s = easy). Implemented in Quiz.tsx with `swipeTimes` array and difficulty state.
- **Achievement Badges**: 8 badge types awarded based on quiz behavior: Speed Demon (<2s avg), Thoughtful Analyst (>6s avg), Balanced Explorer (well-rounded Big5), Pattern Seeker (high consistency), Risk Taker (quick decisions), Consistent Completer (finished quiz), Early Bird (morning completion), Night Owl (evening completion). Stored in `badges` table with awarding logic in routes.ts.
- **Random Event Pop-ups**: 8-15% chance per question (capped at 15% max) with engagement-based dynamic calculation. Events: Surprise Insight, Lightning Round, Wild Card, Reflection Pause, Streak Bonus, Mystery Modifier, Time Warp, Power-Up. 3-second display with themed styling.
- **Slider UI Component**: Interactive slider in Quiz.tsx for nuanced responses, color-coded feedback (green = agree, red = disagree, amber = neutral), immediate value display with descriptive labels. Enhanced readability with larger text (text-base to text-lg for labels, text-xl to text-2xl for value display), larger slider thumb (w-10 h-10), and Nunito font styling.
- **Feedback Refinement Endpoint**: POST `/api/quiz/refine` accepts sessionId and adjustments object, recalculates normalized scores using latest research norms, supports iterative result refinement.
- **New Database Tables**: `research_norms` (population statistics by age group), `badges` (achievement definitions), `quiz_events` (triggered events log), `story_nodes` (branching narrative content), `mini_games` (interactive game definitions), `slider_responses` (detailed slider tracking).
- **Mood Integration**: getMoodEffects() applies mood-based boosts to Big Five traits: "Stuck" +10% Critical Thinking, "Reflective" +5% First Principles, "Energized" +5% Openness. Blend moods (e.g., "Reflective+Stuck") get combined boosts. Applied both client-side and server-side.
- **Mid-Quiz Recaps**: Every 10 questions (10, 20, 30), users see running trait tendencies with friendly descriptions like "Looking curious and creative so far!" Auto-dismiss after 3 seconds.
- **Percentile Comparisons**: Results display Big Five scores with population percentile comparisons using z-score calculation: percentile = 50 + (z * 34.13). Shows "Higher than X% of people" for each trait.
- **Adaptive Sharpen Thinking**: Prioritizes weak proxy categories. If Critical < FirstPrinciples, focuses on Logic Puzzles and Cause & Effect. Category progress tracked in localStorage ('knowrole-category-progress') with accuracy by category.
- **Post-Quiz Validation**: 2 quick questions before premium unlock to personalize insights. Questions about decision-making style and collaboration preference.
- **PDF Download**: Share results as printable PDF via browser print dialog. Opens styled HTML summary with MBTI, DISC, and Big Five percentages.
- **IRT Adaptive Branching**: detectAmbiguousTraits() identifies traits with <15% score difference mid-quiz and prioritizes questions targeting those traits. Works for MBTI dimensions and Big Five traits in 40-60 range.
- **Dynamic Question Wording**: adjustQuestionWording() modifies question prompts based on mood tone. Introspective mood adds phrases like "When you pause to reflect...", energetic adds "Right now...", analytical adds "Thinking it through..."
- **Spin Wheel Checkpoint**: Mid-quiz recap (every 10 questions) uses RecapSpinWheel component that cycles through random insights rapidly, slows down like a spin wheel, then settles on 2 accurate insights within 5 seconds. Keep Going button activates only after settling.

## External Dependencies

### Frontend Libraries

- **React**: UI library
- **TypeScript**: Language
- **Vite**: Build tool
- **wouter**: Client-side routing
- **shadcn/ui**: Component library (built on Radix UI)
- **TanStack Query**: Server state management
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Headless component primitives
- **Lucide React**: Icon library
- **Framer Motion**: Animation library
- **react-select**: Enhanced dropdowns
- **class-variance-authority & clsx**: Conditional className composition
- **tailwind-merge**: Tailwind class merging
- **cmdk**: Command menu component
- **React Hook Form**: Form state management
- **Zod**: Schema validation

### Backend Libraries

- **Express**: Web server framework
- **Node.js**: Runtime environment
- **Drizzle ORM**: Type-safe database ORM
- **@neondatabase/serverless**: PostgreSQL driver for Neon
- **connect-pg-simple**: PostgreSQL session store (configured)
- **esbuild**: JavaScript bundler

### APIs & Services

- **zippopotam.us**: Postal code to city lookup.
- **Stripe**: Payment processing for KnowRole Pro, integrated via `stripe-replit-sync` for managing subscriptions and webhooks.
- **Google Sheets API**: Data export integration for quiz sessions, feedback, and questions database. **Auto-export enabled**: New quiz results are automatically appended to the Quiz Sessions spreadsheet (ID: 1VT6hlq-AM1DKjB4l9SrFx_WqqPwFjI3cCZpZnjoRvRI) when feedback is submitted. Preserves existing formatting. Manual export endpoints: POST `/api/export/sheets/sessions` (full re-export), POST `/api/export/sheets/questions` (exports questions database), POST `/api/export/sheets/colors` (exports city color schemes and tier configuration), POST `/api/export/sheets/full` (**Complete Blueprint Export** - 13-sheet comprehensive workbook with everything needed to understand and rebuild the app: 1. App Overview, 2. Technical Stack, 3. Database Schema (18 Tables), 4. Quiz Algorithm (Complete), 5. API Endpoints, 6. Component Map, 7. Questions Database, 8. City Themes, 9. Tier Configuration, 10. Quiz Sessions, 11. Feedback Data, 12. Premium Insights System, 13. Sharpen Thinking Section).

### Databases

- **PostgreSQL**: Primary database, hosted on Neon.