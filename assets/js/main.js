/**
 * AWS Student Community Day: South Summit 2026
 * Main Application Entry Point
 */

import { initTheme } from './modules/theme.js';
import { initRouter } from './modules/routing.js';
import { initCountdown } from './modules/countdown.js';
import { initSpeakers } from './modules/speakersUI.js';
import { initMerch } from './modules/merchUI.js';
import { initChapters } from './modules/chaptersUI.js';
import { initSponsors } from './modules/sponsorsUI.js';
import { initComputeGrid } from './modules/computeGrid.js';
import { initScrollReveal } from './modules/scrollReveal.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize core system modules
    initTheme();
    initRouter();
    initCountdown();

    // 2. Initialize UI views & dynamic content
    initSpeakers();
    initMerch();
    initChapters();
    initSponsors();

    // 3. Reactive background animation (sits behind all content)
    initComputeGrid();

    // 4. Scroll-triggered entrance motion — last, so the cards injected by the
    //    init*UI() calls above already exist to be tagged and observed.
    initScrollReveal();
});
