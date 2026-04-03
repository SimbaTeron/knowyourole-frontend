# KnowYouRole Design Guidelines - Futuristic Premium Dark Theme

## Design Philosophy
A sophisticated, futuristic aesthetic inspired by premium tech/AI companies. Dark backgrounds with elegant typography, subtle glow effects, and refined minimalism. The design should feel like a premium AI-powered personality discovery platform.

## Color Palette

### Primary Colors
- **Background**: Near-black (#0A0A0F) with subtle purple undertones
- **Surface/Cards**: Dark gray (#12121A) with slight transparency
- **Elevated Surface**: Slightly lighter (#1A1A24)

### Accent Colors
- **Primary Accent**: Electric purple/violet (#A78BFA) - main interactive elements
- **Secondary Accent**: Soft lavender (#C4B5FD) - highlights and glows
- **Tertiary Accent**: Cool cyan (#67E8F9) - secondary highlights
- **Success**: Emerald (#34D399)
- **Warning**: Amber (#FBBF24)
- **Error**: Rose (#F87171)

### Text Colors
- **Primary Text**: Near-white (#F8FAFC) - headings, important content
- **Secondary Text**: Light gray (#94A3B8) - body text, descriptions
- **Muted Text**: Dim gray (#64748B) - labels, hints
- **Accent Text**: Purple (#A78BFA) - links, emphasis

## Typography

### Font Families
- **Headings**: 'Playfair Display' - elegant serif for large headlines
- **Body**: 'Inter' or 'Plus Jakarta Sans' - clean sans-serif for readability
- **Accent/Labels**: 'Space Grotesk' - modern geometric for labels and badges
- **Mono**: 'JetBrains Mono' - for stats and numbers

### Font Sizes (Mobile First)
- Hero heading: 2.5rem (40px) to 4rem (64px) on desktop
- Section heading: 1.875rem (30px) to 2.5rem (40px) on desktop
- Subheading: 1.25rem (20px) to 1.5rem (24px) on desktop
- Body: 1rem (16px)
- Small: 0.875rem (14px)
- Caption: 0.75rem (12px)

### Typography Styles
- Headlines use italic serif for artistic words
- Labels use ALL CAPS with letter-spacing: 0.1em
- Stats/Numbers use large bold weights

## Spacing System
- Base unit: 4px
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px

## Effects and Decorations

### Glow Effects
- Primary glow: box-shadow: 0 0 60px rgba(167, 139, 250, 0.15)
- Accent glow on hover: box-shadow: 0 0 80px rgba(167, 139, 250, 0.25)
- Text glow: text-shadow: 0 0 40px rgba(167, 139, 250, 0.5)

### Gradients
- Hero gradient overlay: linear-gradient(180deg, transparent 0%, #0A0A0F 100%)
- Card gradient border: linear-gradient(135deg, rgba(167, 139, 250, 0.2) 0%, rgba(103, 232, 249, 0.1) 100%)
- Accent gradient: linear-gradient(135deg, #A78BFA 0%, #67E8F9 100%)

### Borders
- Subtle borders: 1px solid rgba(148, 163, 184, 0.1)
- Accent borders: 1px solid rgba(167, 139, 250, 0.3)
- Border radius: 12px for cards, 8px for buttons, 9999px for pills

### Background Patterns
- Dot grid pattern for hero sections
- Subtle noise/grain overlay
- Animated particle effects

## Components

### Buttons
- **Primary**: Purple gradient background, white text, glow on hover
- **Secondary**: Transparent with border, light text
- **Ghost**: No background, subtle hover state

### Cards
- Dark background (#12121A)
- Subtle border (rgba(148, 163, 184, 0.1))
- Glow on hover
- Icon in top-left with colored background

### Badges/Pills
- Small, rounded-full
- Colored background with opacity (purple-500/20)
- Matching text color
- Used for labels like "PERSONALITY DISCOVERY"

### Stats Display
- Large serif number
- Small uppercase label above
- Subtle glow behind number

## Animation Guidelines
- Subtle fade-ins (300-500ms)
- Smooth hover transitions (200ms)
- Floating animations for decorative elements
- Particle/dot animations in backgrounds
- No jarring or fast animations

## Layout Principles
- Generous whitespace (70% rule)
- Asymmetric layouts for visual interest
- Full-bleed hero sections
- Grid-based card layouts
- Sticky navigation

## Mobile Responsiveness
- Stack layouts vertically on mobile
- Reduce heading sizes by 20-30%
- Full-width cards on mobile
- Touch-friendly tap targets (min 44px)
- Simplified navigation

## Accessibility
- Minimum contrast ratio 4.5:1 for text
- Focus states with visible outlines
- Reduced motion support
- Screen reader friendly labels
