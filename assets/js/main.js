/**
 * AWS Student Community Day: South Summit 2026
 * Main Application Entry Point
 */

import { initTheme } from './modules/theme.js';
import { initRouter } from './modules/routing.js';
import { initAssistiveTouch } from './modules/assistiveTouch.js';
import { initSmoothScroll } from './modules/smoothScroll.js';
import { initCountdown } from './modules/countdown.js';
import { initSpeakers } from './modules/speakersUI.js';
import { initScheduleUI } from './modules/scheduleUI.js';
import { initMerch } from './modules/merchUI.js';
import { initChapters } from './modules/chaptersUI.js';
import { initSponsors } from './modules/sponsorsUI.js';
import { initComputeGrid } from './modules/computeGrid.js';
import { initScrollReveal } from './modules/scrollReveal.js';
import { initBlueprintScroll } from './modules/blueprintScroll.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize core system modules
    initTheme();
    initRouter();
    initAssistiveTouch();
    // Smooth scroll (Lenis) — before content/reveal so its showPage wrap and
    // scroll source are ready for the blueprint horizontal pan. No-ops on
    // touch / reduced-motion (native scroll).
    initSmoothScroll();
    initCountdown();

    // 2. Initialize UI views & dynamic content
    initSpeakers();
    initScheduleUI();
    initMerch();
    initChapters();
    initSponsors();

    // 3. Reactive background animation (sits behind all content)
    initComputeGrid();

    // 4. Scroll-triggered entrance motion — last, so the cards injected by the
    //    init*UI() calls above already exist to be tagged and observed.
    initScrollReveal();

    // 5. Blueprint horizontal-pan — after content injection (schedule speaker
    //    chips affect the track width) and after Lenis is set up, since the pan
    //    reads Lenis's smoothed scroll. No-ops on touch / reduced-motion.
    initBlueprintScroll();
});
