# AWS Student Community Day (SCD) South Summit 2026 — Framework Guide

Welcome to the frontend framework guide for **AWS Student Community Day: South Summit 2026**. 
This guide documents the modular architecture of the codebase, how to update content, and best practices for collaborating and deploying on **GitHub Pages**.

---

## Architecture & File Structure

The project has been refactored from a monolithic HTML file into a clean, decoupled static architecture:

```text
awssbg-scd2026-prototype/
├── index.html                   # HTML structure & semantic layout
├── styles.css                   # Core typography, animations, components & layout
├── theme.css                    # Color palette, light/dark mode variables & tokens
├── awssbg-logo.svg              # SVG brand mark
├── FRAMEWORK_GUIDE.md           # This developer & team guide
└── assets/
    ├── amazon-aws-logo.png      # AWS brand assets
    ├── Event-Primer.png         # Design primer graphic
    ├── images/                  # Media directories
    │   ├── speakers/            # Speaker headshots
    │   ├── merch/               # Merch photos & previews
    │   ├── chapters/            # Chapter logos
    │   └── sponsors/            # Sponsor logos
    └── js/
        ├── main.js              # Central entry point (bootstraps all modules)
        ├── data/                # Pure Data Layer (Content only)
        │   ├── speakers.js      # Speaker details & talks
        │   ├── merch.js         # Merchandise catalog
        │   ├── chapters.js      # University student builder groups
        │   └── sponsors.js      # Sponsor tiers & partner links
        └── modules/             # Functional UI Layer
            ├── theme.js         # Light/Dark mode toggling & localStorage
            ├── routing.js       # Page navigation (Home/About/Merch) & mobile menu
            ├── countdown.js     # Live countdown timer to Oct 7, 2026
            ├── speakersUI.js    # Marquee track, speaker grid & modal popup
            ├── merchUI.js       # Merch rail & interactive spotlight zoom
            ├── chaptersUI.js    # University chapter cards grid
            ├── sponsorsUI.js    # Sponsor tier containers
            └── amazonQ.js       # Interactive Amazon Q floating widget
```

---

## How to Update Website Content

Team members can add or update event content without touching any HTML or CSS files.

### 1. Adding or Editing a Speaker
Open `assets/js/data/speakers.js` and edit or append a speaker object:
```javascript
{
  id: 'speaker-6',
  name: 'Jane Doe',
  role: 'Solutions Architect · AWS',
  sessionTitle: 'Deploying Generative AI at Scale with AWS Bedrock',
  abstract: 'An overview of foundation models and serverless architectures on AWS.',
  status: 'CONFIRMED', // or 'TBA', 'KEYNOTE', 'WORKSHOP'
  picUrl: 'assets/images/speakers/jane-doe.png'
}
```

### 2. Updating Merchandise
Open `assets/js/data/merch.js`:
```javascript
{
  id: 'merch-5',
  name: 'SCD Summit Cap',
  blurb: 'Embroidered summit cap for twin-venue attendees.',
  imgUrl: 'assets/images/merch/cap.png'
}
```

### 3. Adding University Chapters
Open `assets/js/data/chapters.js`:
```javascript
{
  name: 'AWS SBG – Your University',
  university: 'University Campus Name',
  facebookUrl: 'https://facebook.com/your-page',
  linkedInUrl: 'https://linkedin.com/company/your-page',
  email: 'sbg@youruni.edu.ph',
  imgUrl: 'assets/images/chapters/your-chapter.png'
}
```

### 4. Adding Sponsors
Open `assets/js/data/sponsors.js`:
```javascript
{
  id: 'sponsor-4',
  name: 'Partner Name',
  tier: 'platinum', // 'platinum' | 'gold' | 'community'
  imgUrl: 'assets/images/sponsors/partner.png'
}
```

---

## GitHub Pages & Deployment Rules

1. **Keep `index.html` in the root folder**: GitHub Pages is configured to serve static assets directly from the repository root.
2. **Always use Relative Paths**:
   - Correct: `assets/js/main.js`, `./theme.css`, `assets/images/...`
   - Avoid: `/assets/js/main.js` (Absolute leading slashes break if hosted on repository subpaths like `username.github.io/repo-name/`).
3. **No Build Step Required**:
   - The framework uses native ES Modules (`<script type="module">`), supported by all modern browsers.
   - When pushing to GitHub, changes will deploy live immediately without requiring Vite or Webpack compilation.

---

## Local Development

To test locally with live reload:
1. **VS Code Live Server**: Right click `index.html` → *Open with Live Server*.
2. **Node.js**: Run `npx serve .` in your terminal and visit `http://localhost:3000`.
3. **Python**: Run `python -m http.server 8000` and visit `http://localhost:8000`.
