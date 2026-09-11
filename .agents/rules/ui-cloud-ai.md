---
description: Design principles and aesthetics for the Cloud x AI South Summit 2026 project
---

# Cloud × AI Aesthetic Rules

When working on UI/UX changes for the AWS SCD South Summit 2026 project, you **MUST** strictly adhere to the following design principles:

## 1. Dark Mode First
- The baseline theme is Dark Mode (`data-theme="dark"`).
- Backgrounds should use ultra-deep space colors (e.g., `#07090F`) rather than flat grays or standard blacks.
- Use neon glowing accents (electric blue, neon purple, bright orange) for contrast against the dark backgrounds.

## 2. Premium Glassmorphism
- Do not use solid, flat-colored boxes for UI cards. Use the `.glass-panel` approach.
- Rely on `backdrop-filter: blur(24px)` combined with semi-transparent backgrounds (e.g., `rgba(255,255,255,0.03)`).
- Apply subtle inner borders (`1px solid rgba(255,255,255,0.1)`) to simulate the glass edge.
- Use soft, sprawling box-shadows to represent glows rather than hard drop-shadows.

## 3. Immersive, Fluid Layouts
- Avoid rigid, blocky grid lines splitting the screen aggressively. Use grids subtly.
- Favor centered, cinematic typographic lockups for hero sections.
- Decorative elements should be soft (e.g., blurred glowing orbs drifting in the background) rather than sharp, distracting geometric shapes.

## 4. CSS Rules
- Stick to Vanilla CSS utilizing variables from `theme.css`. Do NOT use Tailwind or Bootstrap.
- Re-use established variables (`--glass-bg`, `--glow-shadow`) when adding new components.
