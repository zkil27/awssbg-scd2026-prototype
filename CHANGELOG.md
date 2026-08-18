# Changelog

All notable changes to the **AWS Student Community Day: South Summit 2026** website are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) principles, and versioning follows [Semantic Versioning](https://semver.org/).

---

## [1.7.0] - 2026-08-12

### Changed — Documentation & Repository Hygiene

- **Rewrote** `README.md` to a professional standard: added a Table of Contents, project overview, feature list, tech stack, Quick Start guide, project structure diagram, Documentation Hub links, deployment instructions, and a Contributing section.
- **Standardized** `CHANGELOG.md` formatting to align strictly with [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) — removed informal commentary blocks and consolidated same-day micro-iterations into coherent release entries.

---

## [1.6.0] - 2026-08-12

### Changed — Theme Toggle Visual Overhaul

- **Redesigned** the light/dark mode toggle as a 58×32 px sliding pill switch with gradient thumb fills, spring-based transitions, and ambient glow effects.
- **Rebuilt** Sun and Moon icons as mathematically precise, stroke-based SVGs (2.2 px stroke weight, rounded line-caps) replacing earlier path-based approximations; both icons now render consistently at any scale.
- **Improved** contrast of the inactive icon state against the dark toggle track, including an amber glow treatment for the sun icon.

### Fixed

- Corrected asymmetry in the sun icon ray geometry and resolved stroke-rendering inconsistency via explicit `currentColor` binding.

---

## [1.5.0] - 2026-08-12

### Changed — Amazon Q Assistant Branding & UX

- **Redesigned** the trigger as a 56 px circular button using the official Amazon Q hexagon mark, replacing placeholder iconography and capsule-style layouts.
- **Implemented** full light/dark dual-theme support across the assistant surface, header, message bubbles, quick-action chips, and footer input — all bound to CSS design tokens.
- **Converted** the assistant from a full-screen modal to a lightweight fixed-position floating chat card, allowing concurrent site browsing.
- **Optimised** the Amazon Q SVG asset (viewBox, padding, clipping) to a single consolidated source file.

### Removed

- Legacy background frames, borders, and shadows from the assistant header badge.

---

## [1.4.0] - 2026-08-12

### Added — Amazon Q Interactive Assistant

- **Introduced** an Amazon Q–branded concierge assistant with a keyword-matching FAQ engine covering event overview, dates/venue, registration, speakers/sponsors, and merchandise.
- **Added** modal styling, chat bubble layout, and quick-reply chip UI.

---

## [1.3.0] - 2026-08-12

### Changed — Soft Launch Preparation

- **Removed** internal draft/prototype indicators from the production build.
- **Verified** all "Register Now" CTAs link to the official event registration URL.
- **Completed** final visual QA pass on the local staging environment.

---

## [1.2.0] - 2026-08-12

### Added — Repository Standardisation

- **Created** root `README.md` with project overview, folder tree, and local-setup instructions.
- **Added** `.gitignore`, `.editorconfig`, and MIT `LICENSE`.
- **Reorganised** all developer and event documentation into a central `docs/` directory; normalised filenames and updated all cross-references.

---

## [1.1.0] - 2026-08-12

### Added — Data Layer Governance

- **Applied** JSDoc `@typedef` annotations across speakers, sponsors, merchandise, and chapter datasets.
- **Defined** status/tier enums (`CONFIRMED`, `TBA`, `KEYNOTE`; `platinum`, `gold`, `community`).
- **Verified** zero runtime errors across Home, About, and Merch views post-schema standardisation.

---

## [1.0.0] - 2026-08-12

### Added — Initial Release

- **Refactored** the monolithic HTML prototype into a modular ES Module architecture (`assets/js/modules/`, `assets/js/data/`).
- **Implemented** a light/dark theme engine with preference persistence via `localStorage`.
- **Established** base styling (`styles.css`, `theme.css`) and the project's design token system.

---

> **Changelog policy:** This log records meaningful, shippable changes — not every intermediate commit. During active feature work, use an `[Unreleased]` section and fold it into a versioned entry once the feature is complete.
