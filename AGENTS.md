# AWS SCD 2026 - Agent Rules

This file outlines the core guidelines, UI/UX standards, and coding constraints for AI assistants working on the AWS SCD South Summit 2026 prototype.

## 1. Tech Stack & Architecture
- **Vanilla Everything**: Stick exclusively to Vanilla HTML, CSS, and JavaScript. Do NOT introduce frameworks or libraries like React, Vue, or TailwindCSS.
- **Module Pattern**: Use ES Modules for JavaScript (e.g., `assets/js/modules/`). Keep logic encapsulated.

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
