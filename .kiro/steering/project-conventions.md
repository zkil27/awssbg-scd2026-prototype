# Project Conventions — AWS SCD: South Summit 2026

This is the web portal for **AWS Student Community Day: South Summit 2026**, a student-led
event by AWS Student Builder Groups — CALABARZON. Keep the following conventions in mind
whenever you edit or extend this project.

## Stack & Constraints

- **Zero-build, vanilla stack.** Plain HTML5, CSS3, and native ES Modules
  (`<script type="module">`). No bundler, transpiler, framework, or npm build step.
- **Static hosting.** Deploys directly from the repo root to GitHub Pages / Vercel.
  Keep `index.html` in the root and use **relative paths** for every asset
  (e.g. `assets/js/...`, `assets/images/...`, `./theme.css`). Never introduce
  absolute or root-relative (`/`) asset paths.
- Do not add a `package.json` build pipeline or a JS framework unless explicitly asked.
- **Sanctioned exception — Lenis (smooth scroll).** [Lenis](https://github.com/darkroomengineering/lenis)
  powers site-wide smooth scrolling and drives the `#program` ("The Blueprint") horizontal-pan
  section. It is imported as a **CDN ES module** (e.g. `https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.mjs`)
  from `modules/smoothScroll.js` — this keeps the zero-build, no-`package.json` promise intact.
  Lenis must be **disabled** (never created) when the user prefers reduced motion or is on a
  touch / non-`(pointer: fine)` device, so those users get native scrolling and a plain
  vertical layout.
- **Sanctioned exception — OGL (WebGL background).** [OGL](https://github.com/oframe/ogl) is a
  minimal WebGL library used only to render the animated "grainient" shader background. Unlike
  Lenis, it is **vendored locally** at `assets/js/vendor/ogl.js` and imported by
  `modules/grainient.js` — no CDN, npm, or build step — so the zero-build promise holds.
- **Sanctioned exception — GSAP (menu animation).** [GSAP](https://gsap.com) powers the layered
  "staggered menu" drawer in `modules/staggeredMenu.js`. The module self-loads GSAP as a CDN ES
  module (`https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm`) through its own `ensureGSAP()` loader,
  preferring `window.gsap` if present; `index.html` also eager-loads `gsap.min.js` so the menu
  animates on first open without a lazy-load delay. Keep the built-in non-animated fallback for
  when GSAP is unavailable. No npm/build step is introduced.
- **These three (Lenis, OGL, GSAP) are the complete set of sanctioned dependencies.** They are not
  a precedent for adding others; everything else stays vanilla.
- **`docs/reference/react-bits/` is reference source, not a dependency.** Its `.jsx` files are the
  upstream [reactbits.dev](https://reactbits.dev) originals that the vanilla `modules/grainient.js`
  and `modules/staggeredMenu.js` were ported from. They are never imported or shipped, and there
  is no React runtime in this project. Keep them as read-only reference only.

## File & Naming Conventions

- **All media assets live under `assets/images/`.** Do not leave loose image files in
  the `assets/` root. Speaker headshots go in `assets/images/speakers/`.
- **Asset filenames are lowercase kebab-case with no spaces.**
  Correct: `south-summit-logo.svg`, `sbg-calabarzon-logo.png`, `jon-bonso.webp`.
  Avoid spaces (they force `%20` URL-encoding everywhere) and PascalCase.
- Speaker headshots use `.webp` and are named after the speaker in kebab-case,
  matching the `id` in `assets/js/data/speakers.js` (e.g. `jon-bonso.webp`).
- The primary brand mark used site-wide is `assets/images/south-summit-logo.svg`.
  It is also the standard fallback image for missing speaker/merch photos.

## Architecture: Data vs. UI Separation

The JS is split into two layers under `assets/js/`. Preserve this separation:

- **`data/`** — Pure content only. Exported plain arrays/objects
  (`speakers.js`, `merch.js`, `chapters.js`, `sponsors.js`). No DOM access, no logic.
  Non-technical organizers update content here without touching layout code.
- **`modules/`** — UI/presentation and behavior. Each module exports an `init*()`
  function (e.g. `initSpeakers`) that reads from a data module and renders into the DOM.
- **`main.js`** is the single entry point and calls the `init*()` functions on
  `DOMContentLoaded`. Register new modules there.

When adding content (a speaker, sponsor, merch item), edit the relevant `data/*.js`
file only. When changing how something renders, edit the matching `modules/*UI.js` file.

## Styling & Theming

- `theme.css` holds design tokens and light/dark palettes (CSS custom properties).
  `styles.css` holds component and layout styles. Put new colors/tokens in `theme.css`
  and reference them via `var(--token)` — avoid hard-coded color literals in `styles.css`.
- Theme is persisted in `localStorage` under the key `scd-theme` and applied via the
  `data-theme` attribute on `<html>` before paint. Default is light mode.

## Accessibility

- Keep images captioned with meaningful `alt` text, preserve ARIA attributes on the
  modal, nav, and countdown, and keep interactive elements keyboard-reachable.

## Documentation

- The structure trees in `README.md`, `docs/TECHNICAL_MASTERPLAN.md`, and
  `docs/FRAMEWORK_GUIDE.md` should stay in sync with the real layout. If you move or
  rename files, update these trees in the same change.
