/**
 * iPhone AssistiveTouch Navigation Module
 * Provides an authentic draggable AssistiveTouch button with edge snapping,
 * idle fading, and a themed HUD overlay menu for mobile viewports.
 */

import { showPage } from './routing.js';
import { getTheme, toggleTheme } from './theme.js';

let podEl = null;
let hudEl = null;
let backdropEl = null;
let closeBtn = null;
let themeBtn = null;
let themeLabel = null;
let scrollTopBtn = null;
let hudItems = [];

// Drag state
let isDragging = false;
let hasDragged = false;
let startX = 0;
let startY = 0;
let initialLeft = 0;
let initialTop = 0;
let currentLeft = null;
let currentTop = null;

// Idle timer
let idleTimer = null;
const IDLE_DELAY_MS = 3500;

function resetIdleTimer() {
    if (!podEl) return;
    podEl.classList.remove('is-idle');
    clearTimeout(idleTimer);
    
    // Do not dim if HUD is open or currently dragging
    if (hudEl && hudEl.classList.contains('is-open')) return;
    if (isDragging) return;

    idleTimer = setTimeout(() => {
        if (!hudEl || !hudEl.classList.contains('is-open')) {
            podEl.classList.add('is-idle');
        }
    }, IDLE_DELAY_MS);
}

export function openAssistiveHUD() {
    if (!hudEl || !podEl) return;
    hudEl.classList.add('is-open');
    hudEl.setAttribute('aria-hidden', 'false');
    if (backdropEl) {
        backdropEl.classList.add('is-open');
        backdropEl.setAttribute('aria-hidden', 'false');
    }
    podEl.setAttribute('aria-expanded', 'true');
    podEl.classList.remove('is-idle');
    clearTimeout(idleTimer);
    updateThemeLabel();
}

export function closeAssistiveHUD() {
    if (!hudEl || !podEl) return;
    hudEl.classList.remove('is-open');
    hudEl.setAttribute('aria-hidden', 'true');
    if (backdropEl) {
        backdropEl.classList.remove('is-open');
        backdropEl.setAttribute('aria-hidden', 'true');
    }
    podEl.setAttribute('aria-expanded', 'false');
    resetIdleTimer();
}

export function toggleAssistiveHUD() {
    if (!hudEl) return;
    if (hudEl.classList.contains('is-open')) {
        closeAssistiveHUD();
    } else {
        openAssistiveHUD();
    }
}

function updateThemeLabel() {
    const theme = getTheme();
    if (themeLabel) {
        themeLabel.textContent = theme === 'dark' ? 'Light' : 'Dark';
    }
    if (themeBtn) {
        themeBtn.setAttribute('data-theme-current', theme);
    }
}

/**
 * Snap pod to nearest horizontal edge (left or right)
 */
function snapToEdge() {
    if (!podEl) return;
    const padding = 16;
    const podRect = podEl.getBoundingClientRect();
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    // Determine nearest horizontal edge
    const midX = podRect.left + podRect.width / 2;
    const snapLeft = midX < winWidth / 2;
    const targetLeft = snapLeft ? padding : (winWidth - podRect.width - padding);

    // Keep vertical within safe screen bounds
    const minTop = 64; // below header
    const maxTop = winHeight - podRect.height - 24; // above bottom
    let targetTop = podRect.top;
    if (targetTop < minTop) targetTop = minTop;
    if (targetTop > maxTop) targetTop = maxTop;

    podEl.classList.add('is-snapping');
    podEl.style.left = `${Math.round(targetLeft)}px`;
    podEl.style.top = `${Math.round(targetTop)}px`;
    podEl.style.right = 'auto';
    podEl.style.bottom = 'auto';

    currentLeft = targetLeft;
    currentTop = targetTop;

    setTimeout(() => {
        if (podEl) podEl.classList.remove('is-snapping');
    }, 400);
}

function handlePointerDown(e) {
    // Only left click or primary touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    isDragging = true;
    hasDragged = false;
    startX = e.clientX;
    startY = e.clientY;

    const rect = podEl.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    podEl.classList.remove('is-snapping');
    podEl.classList.remove('is-idle');
    clearTimeout(idleTimer);

    try {
        podEl.setPointerCapture(e.pointerId);
    } catch (_) {}
}

function handlePointerMove(e) {
    if (!isDragging || !podEl) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!hasDragged && Math.hypot(dx, dy) > 6) {
        hasDragged = true;
        podEl.classList.add('is-dragging');
    }

    if (hasDragged) {
        const podWidth = podEl.offsetWidth;
        const podHeight = podEl.offsetHeight;
        let newX = initialLeft + dx;
        let newY = initialTop + dy;

        // Constrain to viewport
        newX = Math.max(8, Math.min(window.innerWidth - podWidth - 8, newX));
        newY = Math.max(40, Math.min(window.innerHeight - podHeight - 16, newY));

        podEl.style.left = `${newX}px`;
        podEl.style.top = `${newY}px`;
        podEl.style.right = 'auto';
        podEl.style.bottom = 'auto';
    }
}

function handlePointerUp(e) {
    if (!isDragging || !podEl) return;
    isDragging = false;
    podEl.classList.remove('is-dragging');

    try {
        podEl.releasePointerCapture(e.pointerId);
    } catch (_) {}

    if (hasDragged) {
        snapToEdge();
        resetIdleTimer();
    } else {
        // Was a tap/click!
        toggleAssistiveHUD();
    }
}

function handlePointerCancel() {
    if (!isDragging || !podEl) return;
    isDragging = false;
    podEl.classList.remove('is-dragging');
    snapToEdge();
    resetIdleTimer();
}

export function initAssistiveTouch() {
    podEl = document.getElementById('assistivePod');
    hudEl = document.getElementById('assistiveHUD');
    backdropEl = document.getElementById('assistiveBackdrop');
    closeBtn = document.getElementById('assistiveHUDClose');
    themeBtn = document.getElementById('assistiveThemeToggle');
    themeLabel = document.getElementById('assistiveThemeLabel');
    scrollTopBtn = document.getElementById('assistiveScrollTop');

    if (!podEl || !hudEl) return;

    // Pointer events for dragging & tapping
    podEl.addEventListener('pointerdown', handlePointerDown);
    podEl.addEventListener('pointermove', handlePointerMove);
    podEl.addEventListener('pointerup', handlePointerUp);
    podEl.addEventListener('pointercancel', handlePointerCancel);

    // Hover / touch wakeup
    podEl.addEventListener('mouseenter', resetIdleTimer);
    podEl.addEventListener('touchstart', resetIdleTimer, { passive: true });

    // Backdrop click closes HUD
    if (backdropEl) {
        backdropEl.addEventListener('click', closeAssistiveHUD);
    }

    // Close button click
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAssistiveHUD);
    }

    // Theme toggle button
    if (themeBtn) {
        themeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleTheme(e);
            updateThemeLabel();
        });
    }

    // Scroll to top button
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            closeAssistiveHUD();
        });
    }

    // HUD page items
    hudItems = document.querySelectorAll('.assistive-hud-item[data-page]');
    hudItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            if (page) {
                showPage(page);
                closeAssistiveHUD();
            }
        });
    });

    // Close HUD on escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && hudEl && hudEl.classList.contains('is-open')) {
            closeAssistiveHUD();
        }
    });

    // Reposition on window resize / orientation change
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 980) {
            snapToEdge();
        }
    }, { passive: true });

    // Listen to theme changes from other toggles
    const observer = new MutationObserver(() => {
        updateThemeLabel();
    });
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });

    updateThemeLabel();
    resetIdleTimer();
}
