---
name: ui-layout-design
description: Guidelines for creating exceptional, pixel-perfect, and responsive UI layouts.
---

# UI Layout Design Skill

When this skill is loaded, apply the following layout design principles to ensure a structured, balanced, and responsive interface:

## 1. Grid & Flexbox Mastery
- **Macro-Layouts**: Always default to **CSS Grid** for main page structure and complex 2D alignments (e.g., card grids, main navigation, sidebar + content).
- **Micro-Layouts**: Use **Flexbox** for 1D alignments (e.g., centering content within a button, aligning icons with text, stacking horizontal lists).
- Avoid relying on absolute positioning or float-based layouts unless absolutely necessary.

## 2. Intentional Spacing & Rhythm
- Implement a strict, geometric spacing scale (e.g., multiples of 4px or 8px: 4, 8, 16, 24, 32, 48, 64) for all margins and paddings.
- **Proximity Principle**: Group related elements closer together than unrelated elements. Ensure padding inside a container is proportional to the margin outside of it.
- Never use random integer pixel values (like `13px` or `27px`) for spacing.

## 3. Responsive by Default
- Design mobile-first or ensure responsive fluidity using relative units (`rem`, `vh`, `vw`, `%`).
- Use CSS `clamp()` for fluid typography and spacing that smoothly scales between viewport sizes.
- Rely on modern CSS features like Grid `minmax()` and `auto-fit`/`auto-fill` to create layouts that respond gracefully without needing dozens of media queries.

## 4. Alignment & Balance
- Elements should always align along distinct vertical or horizontal axes.
- Avoid centering large blocks of text; left-align (or right-align for RTL) to preserve readability.
- Maintain a clear visual hierarchy by balancing heavy components (large images, solid color blocks) with adequate negative (white) space.

## 5. Constraint & Containment
- Use `max-width` on main content containers to prevent lines of text from becoming too long (ideal reading line length is 60-80 characters).
- Ensure interactive targets (buttons, links) have a minimum clickable area of 44x44px.
