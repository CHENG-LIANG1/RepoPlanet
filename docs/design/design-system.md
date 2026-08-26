# RepoPlanet visual system

The primary-screen concept in `repoplanet-primary-screen.png` is the visual source of truth.

## Direction

- Theme: cinematic deep space with a handcrafted architectural diorama.
- Primary focal point: the living repository planet, never the surrounding UI.
- Background: near-black navy, sparse crisp stars, no purple wash or cyber grid.
- Motion: slow orbital drift, commit pulses, contributor movement, restrained release fireworks.

## Tokens

- Background: `#020711`
- Elevated background: `rgba(7, 17, 29, 0.78)`
- Text: `#f4f5ef`
- Muted text: `#9aa5b5`
- Border: `rgba(176, 197, 224, 0.24)`
- Accent: `#d8ff3e`
- Cyan: `#43ccff`
- Violet: `#9f73ff`
- Warning: `#ffc857`
- Heading/UI type: Space Grotesk Variable
- Repository/data type: JetBrains Mono Variable
- Functional radii: 12-16px
- Icon family: Lucide, 1.75px stroke, outline style

## Component rules

- Keep the layout open. Do not wrap the complete viewport in a giant card.
- Glass surfaces are reserved for the inspector, tooltips, and transient panels.
- The repository input is the dominant control and uses a visible chartreuse focus state.
- Desktop keeps the introduction left, planet center-right, inspector right, timeline along the bottom.
- Mobile stacks the introduction above the canvas and converts repository details into a compact strip.
