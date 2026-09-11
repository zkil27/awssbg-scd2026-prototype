---
name: web-design-guidelines
description: Provided via Vercel Labs Agent Skills to audit code against strict usability and layout best practices.
---

# Web Design Guidelines

Use this skill to audit all generated code against strict usability and layout standards:

## 1. Usability Auditing
- Verify sufficient contrast ratios (WCAG AA or AAA).
- Ensure minimum tap target sizes (44x44px for mobile interfaces).
- Confirm that focus states are visible and logical for keyboard navigation.

## 2. Layout Standards
- Audit spacing consistency. Ensure spacing scales are mathematically sound (e.g., 4px baseline grid).
- Verify that forms are accessible, properly labeled, and easily readable with clear error states.
- Ensure that the layout scales fluidly and never breaks or overflows horizontally on narrow viewports.

## 3. Performance & Polish
- Ensure image assets are sized appropriately and use modern formats (WebP).
- Avoid layout thrashing by reserving space for dynamically loaded content (e.g., images).
- Eliminate any layout shifts (Cumulative Layout Shift) during page load.
