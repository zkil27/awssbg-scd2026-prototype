---
name: ui-ux-expert
description: Guidelines for crafting premium, highly accessible, and visually stunning user interfaces.
---

# UI/UX Expert Skill

When this skill is loaded, always ensure UI/UX changes follow these core principles:

## 1. Visual Excellence
- Do not settle for basic or generic designs. 
- Use the project's CSS variables (found in `theme.css`) to maintain consistent, rich aesthetics including gradients and glassmorphism.
- Focus on spacing, rhythm, and layout alignment.

## 2. Micro-Interactions
- Ensure smooth CSS transitions for hover, focus, and active states. 
- All interactive elements must provide visual feedback (e.g., scale up/down, color shifts, box-shadows).

## 3. Accessibility (A11y)
- Maintain high contrast text ratios.
- Do not remove focus outlines for keyboard navigation; style them if necessary but keep them visible.
- Use semantic HTML tags (`<nav>`, `<main>`, `<article>`, etc.) and proper ARIA labels.

## 4. Consistency
- Follow existing layout patterns exactly.
- Prefer CSS Grid for macro-layouts and Flexbox for micro-layouts.

## 5. Avoiding "AI Generated Slop"
- **Reclaim the Design North Star**: Don't default to the "median" aesthetic (generic 3-column grids, centered heroes, default fonts, or purple-to-cyan gradients). Every design choice must align with the specific bespoke brand identity.
- **Purposeful Design & Edges**: Do not throw random gradients, excessive box-shadows, or bouncy animations onto elements just to make them "pop". Instead, focus on refining the "edges" (sophisticated micro-interactions, distinct typography pairings) that AI typically ignores.
- **Strict Hierarchy & Intentional Spacing**: Maintain strict typographical and visual hierarchy. Do not invent random margin or padding values. Stick strictly to geometric spacing scales (e.g., 4, 8, 16, 24, 32, 48, 64px) and embrace intentional spaciousness over default "tight" AI layouts.
- **No Cliché Components**: Avoid generic, auto-generated looking UI structures (like standard Bootstrap-style cards). Carefully mimic the bespoke, sophisticated design language already present in the codebase.
