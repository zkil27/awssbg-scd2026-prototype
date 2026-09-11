/**
 * iPhone AssistiveTouch Navigation Module
 * Provides an authentic draggable AssistiveTouch button with edge snapping,
 * idle fading, and a themed HUD overlay modal for mobile viewports.
 * Aligned with the desktop Staggered Menu design system.
 */

import { getTheme, toggleTheme } from './theme.js';

const GSAP_CDN = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm';

let gsap = window.gsap || null;

async function ensureGSAP() {
    if (window.gsap) {
        gsap = window.gsap;
        return gsap;
    }
    try {
        const mod = await import(/* @vite-ignore */ GSAP_CDN);
        gsap = mod.gsap || mod.default || mod;
        window.gsap = gsap;
        return gsap;
    } catch (err) {
        console.warn('[AssistiveTouch] Failed to load GSAP:', err);
        return null;
    }
}

let podEl = null;
let hudEl = null;
let backdropEl = null;
let modalEl = null;
let hudCard = null;
let prelayersContainer = null;
let prelayers = [];
let themeBtn = null;
let themeLabel = null;
let scrollTopBtn = null;
let openTimeline = null;

// Drag state
let isDragging = false;
let hasDragged = false;
let lastPointerUpTime = 0;
let startX = 0;
let startY = 0;
let initialLeft = 0;
let initialTop = 0;
let currentLeft = null;
let currentTop = null;

// Idle timer
let idleTimer = null;
const IDLE_DELAY_MS = 3500;

export function isHUDOpen() {
    return !!(hudEl && hudEl.classList.contains('is-open'));
}

function resetIdleTimer() {
    if (!podEl) return;
    podEl.classList.remove('is-idle');
    clearTimeout(idleTimer);

    // Do not dim if HUD modal is open or currently dragging
    if (isHUDOpen() || isDragging) return;

    idleTimer = setTimeout(() => {
        if (!isHUDOpen()) {
            podEl.classList.add('is-idle');
        }
    }, IDLE_DELAY_MS);
}

export async function openAssistiveHUD() {
    if (!hudEl) return;
    hudEl.classList.add('is-open');
    if (backdropEl) backdropEl.classList.add('is-open');
    hudEl.setAttribute('aria-hidden', 'false');
    if (backdropEl) backdropEl.setAttribute('aria-hidden', 'false');

    if (podEl) {
        podEl.setAttribute('aria-expanded', 'true');
        podEl.classList.remove('is-idle');
    }
    clearTimeout(idleTimer);
    updateThemeLabel();
    updateActiveItem();

    // GSAP signature entrance: multi-color staggered prelayers wave into modal, followed by main card & roll-up items
    const _gsap = await ensureGSAP();
    if (_gsap && modalEl && hudCard) {
        if (openTimeline) {
            openTimeline.kill();
            openTimeline = null;
        }
        _gsap.killTweensOf([modalEl, hudCard, backdropEl, ...prelayers]);

        const itemLabels = Array.from(hudCard.querySelectorAll('.assistive-hud-itemLabel'));
        const numberEls = Array.from(hudCard.querySelectorAll('.assistive-hud-list[data-numbering] .assistive-hud-item'));
        const headerEl = hudCard.querySelector('.assistive-hud-header');

        // Initial setup for items & layers
        if (itemLabels.length) {
            _gsap.set(itemLabels, { yPercent: 140, rotate: 10 });
        }
        if (numberEls.length) {
            _gsap.set(numberEls, { '--hud-num-opacity': 0 });
        }
        if (headerEl) {
            _gsap.set(headerEl, { opacity: 0 });
        }

        const tl = _gsap.timeline();

        // 1. Backdrop fade in
        if (backdropEl) {
            tl.fromTo(backdropEl, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: 'power2.out' }, 0);
        }

        // 2. Modal card shell pops in with subtle scale
        tl.fromTo(
            modalEl,
            { scale: 0.92, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' },
            0
        );

        // 3. Staggered brand color prelayers slide in from bottom to top across the modal (Blue -> Green -> Pink -> Orange -> Purple)
        prelayers.forEach((layer, i) => {
            tl.fromTo(
                layer,
                { yPercent: 100, y: 0, xPercent: 0, x: 0 },
                { yPercent: 0, y: 0, xPercent: 0, x: 0, duration: 0.38, ease: 'power4.out' },
                0.02 + i * 0.04
            );
        });

        // 4. Main modal card content sweeps up from bottom right after the last prelayer (Purple)
        const cardStartTime = 0.02 + (prelayers.length ? prelayers.length * 0.04 : 0.2);
        tl.fromTo(
            hudCard,
            { yPercent: 100, y: 0, xPercent: 0, x: 0 },
            { yPercent: 0, y: 0, xPercent: 0, x: 0, duration: 0.44, ease: 'power4.out' },
            cardStartTime
        );

        // 5. Header fade in
        if (headerEl) {
            tl.to(
                headerEl,
                { opacity: 1, duration: 0.25, ease: 'power2.out' },
                cardStartTime + 0.06
            );
        }

        // 6. Navigation item labels roll-up with staggered spring animation (matching desktop staggered menu)
        const itemsStartTime = cardStartTime + 0.08;
        if (itemLabels.length) {
            tl.to(
                itemLabels,
                {
                    yPercent: 0,
                    rotate: 0,
                    duration: 0.48,
                    ease: 'power4.out',
                    stagger: { each: 0.035, from: 'start' }
                },
                itemsStartTime
            );

            if (numberEls.length) {
                tl.to(
                    numberEls,
                    {
                        duration: 0.3,
                        ease: 'power2.out',
                        '--hud-num-opacity': 1,
                        stagger: { each: 0.03, from: 'start' }
                    },
                    itemsStartTime + 0.02
                );
            }
        }

        openTimeline = tl;
    }
}

export async function closeAssistiveHUD() {
    if (!hudEl) return;

    const _gsap = await ensureGSAP();
    if (_gsap && modalEl && hudCard && hudEl.classList.contains('is-open')) {
        if (openTimeline) {
            openTimeline.kill();
            openTimeline = null;
        }
        _gsap.killTweensOf([modalEl, hudCard, backdropEl, ...prelayers]);

        const closeTl = _gsap.timeline({
            onComplete: () => {
                hudEl.classList.remove('is-open');
                if (backdropEl) backdropEl.classList.remove('is-open');
                hudEl.setAttribute('aria-hidden', 'true');
                if (backdropEl) backdropEl.setAttribute('aria-hidden', 'true');

                // Reset positions for next entrance
                _gsap.set([hudCard, ...prelayers], { yPercent: 100, y: 0, xPercent: 0, x: 0 });
                _gsap.set(modalEl, { scale: 0.94, opacity: 0 });
                const itemLabels = Array.from(hudCard.querySelectorAll('.assistive-hud-itemLabel'));
                if (itemLabels.length) {
                    _gsap.set(itemLabels, { yPercent: 140, rotate: 10 });
                }
                const numberEls = Array.from(hudCard.querySelectorAll('.assistive-hud-list[data-numbering] .assistive-hud-item'));
                if (numberEls.length) {
                    _gsap.set(numberEls, { '--hud-num-opacity': 0 });
                }
            }
        });

        // Fast cascade out to the bottom
        closeTl.to([hudCard, ...prelayers], {
            yPercent: 100,
            y: 0,
            xPercent: 0,
            x: 0,
            duration: 0.24,
            ease: 'power3.in',
            stagger: { each: 0.015, from: 'start' }
        }, 0);

        closeTl.to(modalEl, { scale: 0.94, opacity: 0, duration: 0.2, ease: 'power2.in' }, 0.04);
        if (backdropEl) {
            closeTl.to(backdropEl, { opacity: 0, duration: 0.2, ease: 'power2.in' }, 0.04);
        }
    } else {
        hudEl.classList.remove('is-open');
        if (backdropEl) backdropEl.classList.remove('is-open');
        hudEl.setAttribute('aria-hidden', 'true');
        if (backdropEl) backdropEl.setAttribute('aria-hidden', 'true');
    }

    if (podEl) {
        podEl.setAttribute('aria-expanded', 'false');
    }
    resetIdleTimer();
}

export function toggleAssistiveHUD() {
    if (isHUDOpen()) {
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
        const isDark = theme === 'dark';
        const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
        themeBtn.setAttribute('aria-label', label);
        themeBtn.setAttribute('title', label);
    }
}

function updateActiveItem() {
    if (!hudEl) return;
    const curPage = document.documentElement.getAttribute('data-page') || 'home';
    const hash = window.location.hash || '';

    hudEl.querySelectorAll('.assistive-hud-item').forEach(item => {
        const page = item.getAttribute('data-page');
        const section = item.getAttribute('data-section');

        let isActive = false;
        if (section) {
            isActive = (curPage === 'home' && hash === `#${section}`);
        } else if (page) {
            isActive = (curPage === page && !hash);
        }
        item.classList.toggle('active', isActive);
    });
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

    if (!hasDragged && Math.hypot(dx, dy) > 14) {
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
    lastPointerUpTime = Date.now();
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

function handlePointerCancel(e) {
    if (!isDragging || !podEl) return;
    isDragging = false;
    podEl.classList.remove('is-dragging');
    try {
        if (e && e.pointerId) podEl.releasePointerCapture(e.pointerId);
    } catch (_) {}
    if (hasDragged) {
        snapToEdge();
    }
    resetIdleTimer();
}

export function initAssistiveTouch() {
    podEl = document.getElementById('assistivePod');
    hudEl = document.getElementById('assistiveHUD');
    backdropEl = document.getElementById('assistiveBackdrop');
    modalEl = document.getElementById('assistiveHUDModal');
    hudCard = document.getElementById('assistiveHUDCard') || (hudEl ? hudEl.querySelector('.assistive-hud-card') : null);
    prelayersContainer = document.getElementById('assistiveHUDPrelayers');
    prelayers = prelayersContainer ? Array.from(prelayersContainer.querySelectorAll('.hud-prelayer')) : [];
    themeBtn = document.getElementById('assistiveThemeToggle');
    themeLabel = document.getElementById('assistiveThemeLabel');
    scrollTopBtn = document.getElementById('assistiveScrollTop');

    if (!podEl) return;

    // Set initial states once GSAP is ready
    ensureGSAP().then((_gsap) => {
        if (_gsap) {
            if (prelayers.length) _gsap.set(prelayers, { yPercent: 100, y: 0, xPercent: 0, x: 0 });
            if (hudCard) _gsap.set(hudCard, { yPercent: 100, y: 0, xPercent: 0, x: 0 });
            if (modalEl) _gsap.set(modalEl, { scale: 0.94, opacity: 0 });
            const itemLabels = hudCard ? Array.from(hudCard.querySelectorAll('.assistive-hud-itemLabel')) : [];
            if (itemLabels.length) _gsap.set(itemLabels, { yPercent: 140, rotate: 10 });
            const numberEls = hudCard ? Array.from(hudCard.querySelectorAll('.assistive-hud-list[data-numbering] .assistive-hud-item')) : [];
            if (numberEls.length) _gsap.set(numberEls, { '--hud-num-opacity': 0 });
        }
    });

    // Pointer events for dragging & tapping
    podEl.addEventListener('pointerdown', handlePointerDown);
    podEl.addEventListener('pointermove', handlePointerMove);
    podEl.addEventListener('pointerup', handlePointerUp);
    podEl.addEventListener('pointercancel', handlePointerCancel);

    // Dedicated click fallback (keyboard / accessibility / browsers where pointerup is suppressed)
    podEl.addEventListener('click', (e) => {
        if (Date.now() - lastPointerUpTime < 350) return;
        if (hasDragged) return;
        e.preventDefault();
        toggleAssistiveHUD();
    });

    // Hover / touch wakeup
    podEl.addEventListener('mouseenter', resetIdleTimer);
    podEl.addEventListener('touchstart', resetIdleTimer, { passive: true });

    // Backdrop click to dismiss modal
    if (backdropEl) {
        backdropEl.addEventListener('click', () => {
            closeAssistiveHUD();
        });
    }

    // Theme toggle button in modal (clean single toggle)
    if (themeBtn) {
        themeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleTheme();
        });
    }

    // Scroll to top button in modal
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.__lenis && typeof window.__lenis.scrollTo === 'function') {
                window.__lenis.scrollTo(0, { duration: 1 });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            closeAssistiveHUD();
        });
    }

    // Dismiss when clicking outside modal card, or handle navigation item clicks inside
    if (hudEl) {
        hudEl.addEventListener('click', (e) => {
            const modal = e.target.closest('.assistive-hud-modal');
            if (!modal) {
                // User clicked outside the modal card
                closeAssistiveHUD();
                return;
            }

            const item = e.target.closest('.assistive-hud-item');
            if (!item) return;

            const page = item.getAttribute('data-page');
            const section = item.getAttribute('data-section');

            if (page) {
                e.preventDefault();
                closeAssistiveHUD();
                if (window.showPage) {
                    window.showPage(page);
                }
            } else if (section) {
                e.preventDefault();
                closeAssistiveHUD();

                const targetSelector = `#${section}`;
                const curPage = document.documentElement.getAttribute('data-page') || 'home';

                if (curPage !== 'home') {
                    if (window.showPage) {
                        window.showPage('home', true, true, targetSelector);
                    }
                } else {
                    const el = document.querySelector(targetSelector);
                    if (el) {
                        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
                        const targetY = Math.max(0, el.getBoundingClientRect().top + window.scrollY - navH + 10);
                        if (window.__lenis && typeof window.__lenis.scrollTo === 'function') {
                            window.__lenis.scrollTo(targetY, { duration: 1 });
                        } else {
                            window.scrollTo({ top: targetY, behavior: 'smooth' });
                        }
                        history.pushState({ page: 'home', section }, '', targetSelector);
                    }
                }
            } else {
                // External action (e.g. Register link)
                setTimeout(() => {
                    closeAssistiveHUD();
                }, 150);
            }
        });
    }

    // Close modal on escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isHUDOpen()) {
            closeAssistiveHUD();
        }
    });

    // Reposition on window resize / orientation change if previously moved
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 980) {
            document.documentElement.removeAttribute('data-staggered-menu-open');
            document.body.classList.remove('staggered-menu-open');
            if (currentLeft !== null) {
                snapToEdge();
            }
        }
    }, { passive: true });

    if (window.innerWidth <= 980) {
        document.documentElement.removeAttribute('data-staggered-menu-open');
        document.body.classList.remove('staggered-menu-open');
    }

    // Listen to theme & page changes
    const observer = new MutationObserver(() => {
        updateThemeLabel();
        updateActiveItem();
    });
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme', 'data-page']
    });

    window.addEventListener('hashchange', () => {
        updateActiveItem();
    });

    updateThemeLabel();
    updateActiveItem();
    resetIdleTimer();
}
