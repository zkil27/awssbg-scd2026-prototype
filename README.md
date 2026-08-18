<div align="center">
  <img src="awssbg-logo.svg" alt="AWS Student Builder Groups" width="150"/>
  <h1>AWS Student Community Day: South Summit 2026</h1>
  <p><strong>The official web portal for the AWS SCD: South Summit 2026</strong></p>
  
  [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](#)
  [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#)
  [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)
</div>

---

> Hosted by the **AWS Student Builder Groups – CALABARZON** (South Luzon, Philippines). This site provides event information, a branded Amazon Q chatbot assistant, and a lightweight, zero‑build deployment pipeline.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start (Local Development)](#quick-start-local-development)
- [Project Structure](#project-structure)
- [Documentation Hub](#documentation-hub)
- [Deployment](#deployment)
- [License](#license)

---

## Features

The portal showcases a modern, responsive UI built with vanilla web technologies, ensuring maximum compatibility and lightning-fast load times.

- **Dynamic Light/Dark Theme** – CSS-variables driven, persisted via `localStorage` (defaults to light mode).
- **Custom Theme Toggle** – 58×32 px sliding pill with mathematically precise Sun and Moon SVG icons.
- **Amazon Q Chatbot** – 56 px circular button, dual-theme support, floating-card UI.
- **Responsive Layout** – Fluid spacing, glass-morphism cards, and mobile-friendly navigation.
- **Zero-Build Deployment** – Works directly on GitHub Pages and static hosts — no bundlers or complex build steps required.

---

## Tech Stack

- **HTML5** – Semantic markup and SVG symbol definitions.
- **CSS3** – Custom properties, modern layout (Flexbox/Grid), transitions, and the Cyber-Pill switch.
- **JavaScript (ES6+)** – Modular UI logic, data layer isolation, and SPA-style routing.
- **GitHub Pages / Vercel** – Frictionless static site hosting.

---

## Quick Start (Local Development)

Because the project relies on native ES Modules (`<script type="module">`), a local HTTP server is recommended:

```bash
# Option 1 – Python built-in server (Mac/Linux/Windows)
python -m http.server 8000

# Option 2 – Node.js serve utility
npx serve .
```

Once running, open `http://localhost:8000` (or the port shown by the server) in your browser.

---

## Project Structure

```text
awssbg-scd2026-prototype/
├── index.html                   # Core layout & modal templates
├── styles.css                   # Component styles & responsive layouts
├── theme.css                    # Design system tokens & color palettes
├── assets/
│   ├── images/                  # Media assets (speakers, merch, sponsors)
│   └── js/
│       ├── main.js              # Central application entry point
│       ├── data/                # Pure Data Layer (Content Objects)
│       └── modules/             # Functional UI Presentation Layer
└── docs/                        # Documentation Hub (See below)
```

---

## Documentation Hub

We maintain comprehensive documentation to guide developers and organizers:

- **[TECHNICAL_MASTERPLAN.md](./docs/TECHNICAL_MASTERPLAN.md)**: Technical Master Plan & Architecture reference.
- **[FRAMEWORK_GUIDE.md](./docs/FRAMEWORK_GUIDE.md)**: Modular architecture guide and content updating instructions for non-technical team leads.
- **[EVENT_GUIDELINES.md](./docs/EVENT_GUIDELINES.md)**: Official event planning guidelines, departmental deliverables, and timeline milestones.
- **[CHANGELOG.md](./CHANGELOG.md)**: Version history tracking all incremental updates.

---

## Deployment

The site is configured for zero-build deployment via **GitHub Pages** or **Vercel**:
1. Keep `index.html` in the root folder.
2. Ensure relative paths are used for all assets (e.g., `assets/js/...`, `./theme.css`).
3. Any changes pushed to the `main` branch will immediately deploy live.

---

## License

This repository is open source and licensed under the [MIT License](./LICENSE).

<br>
<div align="center">
  <p><i>Organized by AWS Student Builder Groups — CALABARZON</i></p>
  <p><b>Event Date: October 7, 2026</b></p>
</div>
