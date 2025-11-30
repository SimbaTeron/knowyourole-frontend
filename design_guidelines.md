# KnowRole Design Guidelines

## Design Approach
**Reference-Based:** Drawing inspiration from modern career platforms like LinkedIn Learning and Headspace's calm interface aesthetics. The "Everyday Compass" maintains its warm, grounded journey of self-discovery with hand-drawn path visuals and journal-like feel, now with a refreshed contemporary palette suitable for professional career guidance.

**Key Principles:**
- 70% whitespace for contemplative breathing room
- Warm professionalism balanced with approachability
- Hand-drawn path visuals as journey metaphors (no cosmic imagery)
- Soft curved lines symbolizing life trails and trait branches

## Color Palette

**Light Mode:**
- **coral-warm**: #E57A6F (primary accent - inviting, energetic)
- **coral-deep**: #C85F54 (hover states, emphasis)
- **amber-soft**: #D4A574 (secondary accent - guidance, clarity)
- **amber-dark**: #B8895E (hover states)
- **slate-cool**: #5D6F7F (text, professional anchor)
- **slate-muted**: #8A99A8 (secondary text)
- **cream-soft**: #FAF7F4 (page background)
- **cream-warm**: #FFFDFB (card backgrounds)
- **lavender-mist**: #9FA8C7 (accent, calm contrast)
- **stone-light**: #E8E4DF (borders, subtle divisions)

**Dark Mode:**
- **Background**: #1A1715 (deep warm charcoal)
- **Card Surface**: #2A2522 (elevated warm gray)
- **Text Primary**: #F5F1ED (warm white)
- **Text Secondary**: #B8AFA6 (muted warm gray)
- **coral-warm**: #F08B7F (brighter for visibility)
- **amber-soft**: #E3B886 (enhanced warmth)
- **Borders**: #3D3632 (subtle warm divisions)

## Typography
- **Font**: Inter via Google Fonts CDN
- **Titles**: text-3xl to 4xl, font-bold, gradient from coral-warm to amber-soft
- **Section Headers**: text-xl to 2xl, font-semibold, slate-cool
- **Body Text**: text-sm to base, slate-cool/slate-muted
- **Labels**: text-xs, uppercase, tracking-[0.15em], slate-muted
- **Hierarchy**: Clear size jumps (3xl → xl → base → xs)

## Layout System
**Spacing Units:** Consistent use of Tailwind's 4, 6, 8, 12 spacing scale
- **Component Padding**: p-6, p-8
- **Section Gaps**: gap-6, gap-8
- **Vertical Rhythm**: mt-12, mb-16 for sections
- **Container**: max-w-md centered with mx-auto
- **Mobile Touch**: Minimum 44px tap targets

## Component Library

### Path Canvas Background
Animated SVG paths as fixed background (z-0) creating the journey visual:
- Smooth bezier curves in coral-warm, amber-soft, and lavender-mist
- Stroke-dashoffset draw animation on mount
- Small circular markers at intersections (4px diameter)
- Semi-transparent strokes (opacity-30 in light, opacity-20 in dark)
- Positioned absolutely behind all content

### Tier Selection Cards
Beveled corner cards using clip-path polygon:
- Default: cream-warm background with stone-light border
- Selected: coral-warm gradient with shadow-lg, white text
- Hover: scale-[1.02], enhanced shadow
- Padding: p-6
- Border radius simulation via clip-path

### Mood Selector Grid
Horizontal scrollable grid of emoji-led mood cards:
- Bordered rounded cards (rounded-xl)
- Everyday emojis: ☕ (energized), 📖 (reflective), 🛤️ (navigating)
- Selected: coral-warm background with shadow-md
- Unselected: cream-warm with stone-light border
- Size: min-w-[120px] for touch comfort

### Fun Mode Toggle
Checkbox-style toggle with personality:
- Sage-style checkmark when enabled
- "Add trail twists?" label with 😏 emoji
- Background tint shifts to amber-soft/10 when active
- Animated emoji float when enabled

### Primary CTA Button
Full-width journey activation:
- Gradient background: coral-warm to coral-deep
- White text, font-semibold
- Shadow-md with shadow-lg on hover
- Arrow icon (→) that slides right 4px on hover
- Padding: py-4 px-8

### Progress Indicators
Stepped progress bar for quiz flow:
- Completed steps: coral-warm circles
- Current step: coral-warm ring with pulse animation
- Future steps: stone-light circles
- Connecting lines in stone-light

## Interactions & Animations
- **Path Draw**: 2s ease-out stroke-dashoffset on mount
- **Content Entrance**: Slide up 20px with fade-in, stagger delay
- **Hover Lift**: translateY(-2px) with shadow enhancement
- **Selection**: Quick scale-[1.02] with color transition
- **Fun Mode Float**: Gentle 0-8px translateY bounce (3s infinite)

## Accessibility
- WCAG AA contrast ratios maintained across all color pairs
- Focus rings using coral-warm at ring-2 ring-offset-2
- ARIA labels on all interactive elements
- Semantic heading hierarchy (h1 → h2 → h3)
- Screen reader text for icon-only buttons
- Keyboard navigation support for all interactions

## Responsive Behavior
Mobile-first, single-column design:
- Base: max-w-md (448px)
- Padding: px-4 on mobile, px-6 on sm+
- Vertical stacking of all components
- Maintain 70% whitespace ratio at all breakpoints
- Touch-optimized spacing and targets

## Images
**No hero images** - The animated path canvas serves as the primary visual anchor. The journal-like, hand-drawn path background creates sufficient visual interest without traditional hero imagery. Focus remains on the interactive journey elements and warm color palette.