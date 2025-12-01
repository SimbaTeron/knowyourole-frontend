# KnowRole - Everyday Compass Personality Discovery

## Overview

KnowRole is a personality discovery application designed with an "Everyday Compass" aesthetic to guide users through self-discovery. It offers a warm, grounded journey using hand-drawn visuals and journal-like designs. The application helps users discover their personality traits through a multi-step process including age-tier selection, mood assessment, optional location-based landmark integration, and a comprehensive quiz. The business vision is to provide a contemplative and insightful self-discovery tool, with future potential for advanced AI-driven personality analysis and personalized growth features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

The frontend is a React 18+ SPA built with TypeScript and Vite. It uses `wouter` for routing, `shadcn/ui` for components, and `TanStack Query` for server state management. Styling is handled by Tailwind CSS with a custom "Everyday Compass" theme featuring terracotta, sage-green, dusty-blue, and warm cream colors, emphasizing 70% whitespace. Key UI components include `PathCanvas` for animated SVG paths, `AgeTierSelector` (with age tiers: "Ages 12 and under", "Ages 13-18", "Ages 19-25", "Ages 25+" - displayed with large, prominent text), `MoodSelector`, and a `StepIndicator` for progress visualization. Animations are powered by Framer Motion. The application supports a two-mode theme (light/dark) and a locality-based accent color system derived from sports teams of major US cities, persisted in local and session storage. Accessibility is a priority with ARIA roles, keyboard navigation, and mobile-first design.

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
- **Pre-Quiz Demo Page** (/pre-quiz): Animated walkthrough showing what to expect in the quiz - swipe mechanics, timer, and multi-choice breaks. Helps users understand the format before starting.
- **Quiz Flow**: Age-tiered binary swipe questions with strategic break phases. Timer per question (10s for Mini/Teen, 9s for Young Adult/Adult). Cards tilt on selection for tactile feedback. Auto-hiding "Tap or swipe" hint after first interaction. Tracks MBTI, DISC, Big Five, Critical Thinking, and First Principles traits.
  - **Mini Explorer (12 and under)**: 16 questions - 5 binary → MC1 → 4 binary → Superpower → 4 binary → Mystery → 3 binary → MC2
  - **Teen (13-18)**: 22 questions - 7 binary → MC1 → 6 binary → Superpower → 5 binary → Mystery → 4 binary → MC2
  - **Young Adult (19-25)**: 28 questions - 8 binary → MC1 → 7 binary → Superpower → 7 binary → Mystery → 6 binary → MC2
  - **Adult (25+)**: 34 questions - 9 binary → MC1 → 9 binary → Superpower → 9 binary → Mystery → 7 binary → MC2
  - **UI Design**: 2x larger question text (text-3xl), 150% larger answer boxes with directional arrows (← left option, → right option), diagonal offset layout
- **Results Dashboard**: Displays Big Five Radar chart (340px, single-letter axis labels O/C/E/A/N with color-coded trait colors), MBTI/DISC/Big Five stacked vertically with plain-language explanations. Personalized role recommendations (200+ clusters including trades, first responders, manufacturing, agriculture). Premium tier shows salary data without "premium" labeling. Free tier gets 4-5 sentence personalized summary.
- **Just Kidding Interstitial**: After clicking Unlock Premium button, users see a playful "Just Kidding!" overlay with "Premium is Free (For Now)" message, "Proceed to Results" button to unlock premium features for free during testing, and two donation tier options ($3.33 and $33.33).
- **Donation System**: Two-tier donation modal with $3.33 and $33.33 options plus back button. Stripe integration for payment processing.
- **Feedback System**: 5 questions (Useful App?, Results accurate?, Questions engaging?, Would share?, Suggestions). Auto-exports quiz results to Google Sheets when feedback is submitted.
- **Location and Geocoding**: Simplified zip code input (US and Canada only) with auto-detection via zippopotam.us API. Maps to sports team colors via cityThemes.ts.
- **Locale Insights System**: Metro-specific career insights based on personality traits with regional fallbacks.
- **Regional Salary System**: Metro-adjusted salary ranges for common roles with industry bonuses and growth outlook text. Displayed in premium tier only.

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
- **Google Sheets API**: Data export integration for quiz sessions, feedback, and questions database. **Auto-export enabled**: New quiz results are automatically appended to the Quiz Sessions spreadsheet (ID: 1VT6hlq-AM1DKjB4l9SrFx_WqqPwFjI3cCZpZnjoRvRI) when feedback is submitted. Preserves existing formatting. Manual export endpoints: POST `/api/export/sheets/sessions` (full re-export), POST `/api/export/sheets/questions` (exports questions database), POST `/api/export/sheets/colors` (exports city color schemes and tier configuration), POST `/api/export/sheets/full` (**Complete Blueprint Export** - 11-sheet comprehensive workbook with everything needed to understand and rebuild the app: App Overview, Technical Stack, Database Schema, Quiz Algorithm, API Endpoints, Component Map, Questions Database, City Themes, Tier Configuration, Quiz Sessions, Feedback Data).

### Databases

- **PostgreSQL**: Primary database, hosted on Neon.