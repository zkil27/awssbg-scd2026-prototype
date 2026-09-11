---
name: frontend-design
description: Maintained by Anthropic to guide AI on high-craft, production-ready interface styling and structure.
---

# Frontend Design

Guidelines for high-craft, production-ready interface styling:

## 1. High Craft & Polish
- Ensure every element feels deliberate. Use micro-animations, smooth easing (`cubic-bezier(0.4, 0, 0.2, 1)`), and thoughtful hover states.
- Perfect alignment: elements should strictly snap to the layout grid.

## 2. Production-Ready Structure
- Output clean, semantic HTML. Use appropriate `<section>`, `<article>`, `<header>`, and `<aside>` tags.
- Avoid nesting `<div>` elements too deeply (Div soup). Keep DOM structures as flat as possible.

## 3. Theming & Variables
- Rely on CSS custom properties for colors, spacing scales, and typography sizes.
- Ensure all styles seamlessly adapt to both Light and Dark modes where applicable.

## 4. Robustness
- Anticipate edge cases: ensure long text wraps or truncates gracefully without breaking layouts.
- Always use relative units (`rem`, `em`) for typography to respect user accessibility preferences.
