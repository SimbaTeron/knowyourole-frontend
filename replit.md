# KnowRole - Everyday Compass Personality Discovery

## Overview

KnowRole is a personality discovery application that uses an "Everyday Compass" aesthetic to guide users through self-discovery. The app features a warm, grounded journey with hand-drawn path visuals and journal-like aesthetics, focusing on breathing room and contemplative design. Users progress through age tier selection, mood assessment, optional location-based landmarks, and personality trait discovery.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**React SPA with Component-Based Design**
- Built with React 18+ and TypeScript using Vite as the build tool
- Client-side routing via `wouter` for lightweight navigation
- Component library based on shadcn/ui (Radix UI primitives with custom styling)
- State management using React hooks (useState, useEffect) for local component state
- TanStack Query for server state management and API data fetching

**Design System**
- Tailwind CSS for utility-first styling with custom color palette
- Custom theme based on "Everyday Compass" aesthetic with terracotta, sage-green, dusty-blue, and warm cream colors
- Design guidelines emphasize 70% whitespace for contemplative experience
- Dark mode support with CSS class-based theming
- Custom animations for path drawing, card selections, and step transitions

**Key UI Components**
- `PathCanvas`: Fixed background with animated SVG paths using bezier curves
- `AgeTierSelector`: Four age tier cards (7-12, 13-18, 19-25, 25+) with clip-path blob shapes
- `MoodSelector`: Three mood options (energized, reflective, stuck) with icon indicators
- `PostalInput`: Country/postal code input with landmark discovery integration
- `FunModeToggle`: Toggle for playful personality insights
- `StepIndicator`: Progress visualization across multi-step flow

### Backend Architecture

**Express.js Server**
- Node.js/Express backend serving both API and static files
- Development mode uses Vite middleware for HMR (Hot Module Replacement)
- Production serves pre-built static assets from dist/public
- Logging middleware for request/response tracking

**Modular Route Structure**
- Routes registered through `registerRoutes` function in `server/routes.ts`
- API endpoints prefixed with `/api`
- Fallback to SPA for client-side routing

**Storage Layer**
- In-memory storage implementation (`MemStorage` class) for development
- Interface-based design (`IStorage`) allowing easy swapping to database implementations
- User CRUD operations (getUser, getUserByUsername, createUser)

### Data Storage Solutions

**Database Configuration**
- Drizzle ORM configured for PostgreSQL via `@neondatabase/serverless`
- Schema defined in `shared/schema.ts` with Zod validation
- Current schema includes users table with username/password fields
- Migration support via drizzle-kit with schema evolution

**Schema Design Pattern**
- Type-safe schema using Drizzle's type inference
- Separate insert schemas using `drizzle-zod` for validation
- UUID-based primary keys with PostgreSQL's `gen_random_uuid()`

### Build and Deployment

**Multi-Stage Build Process**
- Client build via Vite producing optimized static assets
- Server build via esbuild bundling dependencies for faster cold starts
- Allowlist approach for server dependencies to reduce file system calls
- Separate build script (`script/build.ts`) coordinating both builds

**Development Workflow**
- Hot module replacement for client code
- TypeScript compilation with path aliases (@/, @shared/)
- Concurrent dev server on port 3000

## External Dependencies

### UI and Component Libraries
- **Radix UI**: Headless component primitives (accordion, dialog, dropdown, popover, select, etc.)
- **Lucide React**: Icon library for UI elements (NO emoji icons - brand rule)
- **Framer Motion**: Spring animations for step transitions, tier cards, and interactions
- **react-select**: Enhanced dropdown/select for mood input with improved mobile UX
- **class-variance-authority & clsx**: Utility for conditional className composition
- **tailwind-merge**: Intelligent Tailwind class merging
- **cmdk**: Command menu component
- **wouter**: Lightweight client-side routing

### Theme System
- **Three-mode theme**: Light (clinical cream), Dark (mysterious amber), Random (7 vibrant themes)
- **Random themes**: Sunburst Trail, Neon Urban, Forest Whisper, Ocean Drift, Desert Bloom, City Pulse, Meadow Dream
- **Theme storage**: Persisted in localStorage with automatic application on page load
- **CSS architecture**: Theme classes applied to container div with PathCanvas background override via CSS selectors
- **Haptic feedback**: navigator.vibrate() on tier selection, mood input, fun-mode toggle, and CTA interactions

### Accessibility
- **StepIndicator**: ARIA roles/labels for VoiceOver compatibility
- **Theme toggle**: Keyboard accessible with focus indicators
- **Mobile-first**: Touch-optimized interactions with 44px+ tap targets

### Data and State Management
- **TanStack Query**: Server state management, caching, and data fetching
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation and type safety

### Backend Services
- **Express**: Web server framework
- **Drizzle ORM**: Type-safe database ORM
- **@neondatabase/serverless**: PostgreSQL serverless driver for Neon
- **connect-pg-simple**: PostgreSQL session store (configured but not currently active)

### Development Tools
- **Vite**: Build tool and dev server with React plugin
- **esbuild**: Fast JavaScript bundler for server code
- **TypeScript**: Type safety across full stack
- **PostCSS & Autoprefixer**: CSS processing for Tailwind
- **@replit plugins**: Replit-specific development tooling (cartographer, dev-banner, error overlay)

### Location and Geocoding
- Custom landmark mapping system via `client/src/data/landmarks.json`
- JSON-based landmark database mapping cities to cultural icons across 10 countries
- Supports 60+ cities with themed landmark classes (skyline-glow, ivory-dome, neon-tokyo, etc.)

### Future Integration Points
- Session management infrastructure present (express-session, connect-pg-simple)
- Authentication scaffolding with user schema
- Potential AI/personality analysis integration points (placeholder routes)