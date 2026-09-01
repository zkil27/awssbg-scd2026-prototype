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
