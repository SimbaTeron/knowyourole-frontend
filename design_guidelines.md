# KnowRole Design Guidelines

## Design Approach
**Nebula Navigator Aesthetic** - An immersive cosmic experience symbolizing personality trait constellations through procedural particle effects and celestial gradients. Focus on breathing room with **70% whitespace** to create a serene, contemplative discovery journey.

## Color Palette
- **nebula-core**: #E8F0FE (primary background, particle color)
- **indigo-deep**: #1E3A5F (text, borders)
- **spark-gold**: #FFD700 (gradient accent)
- **coral-drift**: #FF6B6B (energy states)
- **mint-veil**: #A8E6CF (selection buttons)
- **violet-echo**: #4834D4 (gradient accent, cosmic depth)
- **lavender-shift**: #B19CD9 (hover states, transitions)
- **pink-tide**: #FF9FF3 (fun mode, playful moments)

## Typography
- **Font Family**: Inter (sans-serif)
- **Title**: 4xl, bold, gradient text (spark-gold → violet-echo)
- **Subtitle/Headers**: text-xl to 2xl, 80% opacity for cosmic softness
- **Body**: text-lg, standard weight
- **Gradient Treatment**: Use `bg-gradient-to-r` with `bg-clip-text text-transparent` for magical cosmic glow on headings

## Layout System
- **Spacing Units**: Tailwind default scale (p-2, p-3, p-4, mb-2, mb-4, mb-6)
- **Container**: max-w-md centered with flex center, min-h-screen
- **Whitespace Philosophy**: 70% breathing room - generous padding and margins between elements
- **Z-Index Layers**: Nebula canvas at z-0 (fixed inset-0), UI content at z-10

## Component Library

### Nebula Particle Canvas
- Fixed background layer (inset-0, pointer-events-none, opacity-20%)
- 20 slow-moving circular particles in nebula-core color
- Hover-repulse interactivity creating ripple effects
- Symbolizes trait constellations and personality mapping

### Age Tier Selection Buttons
- Full-width blocks with mint-veil background
- Rounded-lg corners, shadow-md depth
- Hover state: lavender-shift background with transition-all
- 4 tiers: Mini Explorer (7-12), Teen Navigator (13-18), Young Trailblazer (19-25), Adult Anchor (25+)

### Mood Selector
- Native select dropdown with white background, indigo-deep border
- Emoji-prefixed options: 🚀 Energized, 🌌 Reflective, ? Stuck
- Rounded-lg styling, full padding

### Fun Mode Toggle
- Checkbox with white background, indigo-deep border
- Flex alignment with 😏 emoji prefix
- Label: "Fun Mode: Roast my results?"
- Rounded-lg container

### Dark Mode Toggle
- Small button positioned top-right
- 🌙 Moon emoji indicator
- Toggles 'dark' class on document.body

### Primary CTA Button
- Full-width, prominent styling
- Conditional rendering based on form state completion
- Clear call-to-action text

## Interactions & Animations
- **Particle Ripples**: Subtle hover-repulse on mouse movement across nebula canvas
- **Button Transitions**: Smooth color transitions (transition-all) on hover states
- **Gradient Shimmer**: Static gradients on title, no complex animations to maintain serenity
- **Procedural Tints**: Mood-driven color variations (energized = hsl(200,60%,70%), fun mode = pink-tide)
- **Minimal Motion**: Keep 90% of interface static; animations only for particle canvas and button hovers

## Responsive Behavior
- Mobile-first design with text-center default
- Max-width container (max-w-md) ensures readability on all devices
- Stack all components vertically in single column
- Maintain whitespace ratios across breakpoints

## Accessibility
- Aria-labels on all interactive elements (buttons, select, checkbox)
- Sufficient color contrast (indigo-deep on nebula-core)
- Clear focus states through Tailwind defaults
- Semantic HTML with proper heading hierarchy

## Images
**No hero images needed** - The immersive nebula particle canvas serves as the primary visual anchor, creating an animated cosmic background that eliminates the need for static imagery. The design relies on procedural effects and gradient typography for visual impact.