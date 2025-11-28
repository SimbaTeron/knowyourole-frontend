# KnowRole Design Guidelines

## Design Approach
**Everyday Compass Aesthetic** - A warm, grounded journey of self-discovery with hand-drawn path visuals and journal-like aesthetics. Focus on breathing room with **70% whitespace** for a contemplative, relatable experience. No cosmic/space imagery - instead use soft curved lines as "life trails" that symbolize trait branches.

## Color Palette
- **terracotta**: #C67B5C (primary accent, warmth)
- **terracotta-dark**: #A85D3F (hover states, depth)
- **sage-green**: #8B9A6D (secondary accent, growth)
- **sage-dark**: #6B7A4D (hover states)
- **warm-gray**: #6B6B6B (text, secondary information)
- **soft-cream**: #FDF8F3 (backgrounds, cards)
- **deep-cream**: #1F1B16 (dark mode background)
- **dusty-blue**: #7BA3B5 (accent, contrast)
- **warm-white**: #FFFBF7 (card backgrounds)

## Typography
- **Font Family**: Inter (sans-serif)
- **Title**: text-3xl to 4xl, bold, compass-gradient-text (terracotta → sage-green)
- **Headers**: text-xl to 2xl, font-semibold
- **Body**: text-sm to text-base
- **Labels**: text-xs, uppercase tracking-[0.15em]

## Layout System
- **Spacing**: Tailwind default scale (p-4, p-5, p-6, gap-3)
- **Container**: max-w-sm centered, min-h-screen
- **Whitespace**: 70% breathing room
- **Z-Index**: Path canvas at z-0, content at z-10, header at z-50

## Component Library

### Path Canvas
- Fixed background with animated SVG paths
- Curved bezier paths in terracotta, sage-green, and dusty-blue
- Draw animation on mount (stroke-dashoffset transition)
- Small dot markers at path intersections

### Tier Selection Blobs
- Clip-path polygon shape (beveled corners)
- Gradient background (soft-cream to slightly darker)
- Selected state: terracotta gradient with white text
- Hover: scale(1.02) with enhanced shadow

### Mood Selector Cards
- Rounded corners, bordered cards
- Selected: terracotta background with shadow
- Everyday emojis: ☕ (energized), 📖 (reflective), 🛤️ (finding way)

### Fun Mode Toggle
- Checkbox style toggle with sage-green checkmark
- "Add trail twists?" label with 😏 emoji
- Background changes to sage-green tint when enabled

### Trail Button (CTA)
- Full-width, terracotta gradient
- Subtle shadow and lift on hover
- Arrow icon animates on hover

## Interactions & Animations
- **Path Draw**: Paths animate in with stroke-dashoffset
- **Slide Up**: Cards and content slide up on mount
- **Gentle Float**: Enabled emoji floats when fun mode active
- **Hover Lift**: Buttons lift 2px on hover
- **Scale**: Tier cards scale 1.02 on hover

## Responsive Behavior
- Mobile-first design (max-w-sm)
- Stack all components vertically
- Maintain whitespace ratios
- Touch-friendly tap targets (min 44px)

## Accessibility
- ARIA labels on all interactive elements
- WCAG AA color contrast compliance
- Focus states with ring
- Semantic HTML with proper heading hierarchy

## Dark Mode
- Background: deep-cream (#1F1B16)
- Cards: rgba(31,27,22,0.9)
- Text: soft-cream with reduced opacity for secondary
- Borders: terracotta with increased opacity

## Images
**No hero images needed** - The animated path canvas serves as the visual anchor, creating a journal-like background. Design relies on path drawings and warm color gradients for visual impact.
