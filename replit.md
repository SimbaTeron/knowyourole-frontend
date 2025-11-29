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

- **Quiz Flow**: A multi-phase quiz includes multi-choice and binary questions, tailored by age tier, with randomization and a per-question timer. Timer morphs to circular progress ring when <3s remaining. Cards tilt on selection for tactile feedback. Auto-hiding "Tap or swipe" hint after first interaction. It tracks MBTI, DISC, Big Five, Critical Thinking, and First Principles traits.
- **Results Dashboard**: Displays a Big Five Radar chart (340px, single-letter axis labels O/C/E/A/N with color-coded matching trait colors), MBTI/DISC/Big Five stacked vertically with plain-language explanations ("How you think and make decisions", "How you act and work with others", "Your core personality strength"), and personalized role recommendations (200+ clusters including trades, first responders, manufacturing, agriculture) based on personality traits. Free tier gets 4-5 sentence personalized summary incorporating MBTI, DISC, and Big Five insights. "Also Consider" section moved to premium tier. Includes "Fun Mode" enhancements with playful titles and roasts, and a "Test Mode" for premium feature preview (persistent sticky header with Crown icon and "DONATE HERE" teal button).
- **Just Kidding Interstitial**: After clicking the $0.02 Unlock Premium button, users see a playful "Just Kidding!" overlay with "Premium is Free (For Now)" message, "Proceed to Results" button to unlock premium features for free during testing, and "Donate $0.02 (Alpha Feedback)" button for those who want to support development.
- **EmojiMoodMixer**: Interactive mood mixing component on the mood page where users tap two mood ingredients (Happy, Calm, Curious, Determined, Creative, Social) to "brew" a hybrid personality hint in a cauldron animation.
- **Feedback System**: Redesigned feedback section with 5 questions: Useful App?, Results feel accurate?, Questions engaging?, Would share with a friend? (No/Yes), and Suggestions (2000 char limit). Header displays "Complete for More Free Insights!" in 2x larger font, questions use larger labels, and no emojis on buttons.
- **Location and Geocoding**: Simplified zip code input (US and Canada only, no country selector) with auto-detection. Utilizes zippopotam.us API for postal code to city lookup, then maps to sports team colors via cityThemes.ts. Influences locality themes, locale insights, and regional salary adjustments.
- **Locale Insights System**: Provides metro-specific career insights based on personality traits, with regional fallbacks.
- **Regional Salary System**: Offers metro-adjusted salary ranges for common roles, with industry bonuses and growth outlook text.
- **Premium Follow-Up Flow** (Data in `client/src/data/premiumQuestions.ts`): Career path branching (trades/professional/creative/service) with refinement questions for personalized matches. Service branch includes "hands-on help", "guide through chats", and "care routines" options.
- **Premium Unlock Card**: Simplified design with tagline at top, 3 features (Deep Dive, Role Matches, 30-Day Quest), and ONE large orange button showing $0.02 price with "Unlock Premium Now" and "Lifetime access. No Subscription. Ever."

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
- **Google Sheets API**: Data export integration for quiz sessions, feedback, and questions database. Endpoints: POST `/api/export/sheets/sessions` (exports all quiz data with feedback to Google Sheets), POST `/api/export/sheets/questions` (exports questions database).

### Databases

- **PostgreSQL**: Primary database, hosted on Neon.