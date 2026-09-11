# AWS SCD 2026 - Agent Rules

This file outlines the core guidelines, UI/UX standards, and coding constraints for AI assistants working on the AWS SCD South Summit 2026 prototype.

## 1. Tech Stack & Architecture
- **Vanilla Everything**: Stick exclusively to Vanilla HTML, CSS, and JavaScript. Do NOT introduce frameworks or libraries like React, Vue, or TailwindCSS.
- **Module Pattern**: Use ES Modules for JavaScript (e.g., `assets/js/modules/`). Keep logic encapsulated.
- **Sanctioned exception — Lenis**: [Lenis](https://github.com/darkroomengineering/lenis) is an approved third-party library, used only for smooth scrolling (whole-page inertia + driving the `#program` horizontal-pan). It is loaded as a CDN ES module (e.g. `https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.mjs`) inside `modules/smoothScroll.js` — no npm/build step is introduced. Lenis MUST be disabled (never instantiated) under `prefers-reduced-motion: reduce` and on touch / non-`(pointer: fine)` devices, falling back to native scrolling.
- **Sanctioned exception — OGL**: [OGL](https://github.com/oframe/ogl) is the approved minimal WebGL library, used only to render the animated "grainient" background shader. It is **vendored locally** at `assets/js/vendor/ogl.js` and imported by `modules/grainient.js` — no CDN, npm, or build step is introduced, preserving the zero-build promise.
- **Sanctioned exception — GSAP**: [GSAP](https://gsap.com) drives the layered "staggered menu" drawer animation in `modules/staggeredMenu.js` and the "The Lineup" fluid masonry grid in `modules/masonry.js`. Modules prefer an existing `window.gsap` (eager-loaded in `index.html`) with CDN ES module fallback. No npm/build step is introduced.
- **These three exceptions (Lenis, OGL, GSAP) are the complete list.** They do NOT open the door to other libraries; keep everything else vanilla.
- **`docs/reference/react-bits/` is reference source, NOT a dependency.** The `.jsx` files there are the upstream [reactbits.dev](https://reactbits.dev) originals that the vanilla modules (`modules/grainient.js`, `modules/staggeredMenu.js`, `modules/masonry.js`) were ported from. They are never imported or shipped — no React runtime exists in this project. Treat them as read-only reference; do not wire them into the app.

## 2. UI/UX & Design System
- **Strict Adherence**: Always adhere to the established custom design system. Do not invent new visual styles or arbitrary dimensions.
- **CSS Variables First**: ALWAYS consult `theme.css` for existing CSS variables (colors, grids, spacing, fonts, cursor tokens, easing functions) before using hardcoded values.
- **Layouts & Grids**: Use modern CSS Grid and Flexbox for layouts. Match the existing component shell structure (e.g., `.wrap`, `.section-head`, `.deco-layer`).
- **Premium Feel**: Ensure hover states, focus states, and animations feel smooth, precise, and responsive.

## 3. Coding Constraints
- **No Inline Styles**: Avoid inline styles unless strictly necessary for dynamic JavaScript behavior (like coordinates). Add standard classes and update `styles.css` instead.
- **Targeted Edits**: When editing files, prioritize small, targeted diffs over full-file replacements to preserve existing codebase structure and comments.
- **Code Cleanliness**: Maintain existing comments and use descriptive naming conventions for any new variables or classes.

## 4. Anti-Patterns (Never Do This)
- Never use Tailwind or Bootstrap classes; this project relies heavily on vanilla semantic CSS.
- Never use generic generic colors (e.g., `#FF0000`, `blue`); always use the exact theme variables (e.g., `var(--blue)`).
- Never arbitrarily change the project's layout foundation (like `.page` structure or the global grid canvas) without explicit user permission.
