---
name: vanilla-coding
description: Standards for writing high-performance Vanilla HTML, CSS, and JS without frameworks.
---

# Vanilla Web Coding Skill

When this skill is loaded, ensure all code modifications adhere to these strict vanilla web development guidelines:

## 1. Zero External Frameworks
- Do not introduce structural libraries like React, Next.js, Vue, or jQuery.
- Do not use utility CSS frameworks like TailwindCSS or Bootstrap.
- Stick exclusively to vanilla DOM APIs and native, semantic CSS.

## 2. Modern ES Modules
- Encapsulate JavaScript logic using modular ES6+ functions.
- Keep scopes clean and avoid polluting the global `window` object unnecessarily.
- Handle state locally within module scopes.

## 3. Performance First
- Limit heavy DOM manipulation. Cache DOM selections where possible.
- Utilize `requestAnimationFrame` for continuous visual updates (e.g., the compute grid).
- Always use `{ passive: true }` on touch and scroll event listeners.

## 4. CSS Architecture
- Rely heavily on CSS variables (`var(--name)`) as the primary source of truth, typically defined in `theme.css`.
- Avoid writing inline styles entirely unless calculating dynamic values (like cursor positions) via JavaScript.
