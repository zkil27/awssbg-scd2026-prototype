/* ---------- PAGE ROUTING ---------- */
const PAGES = ['home', 'about', 'merch'];

let nav;

/**
 * Apply the "scrolled" visual state.
 */
export function updateNavSolid() {
    if (!nav) return;
    const page = document.documentElement.getAttribute('data-page') || 'home';
    const isScrolled = window.scrollY > 40;

    /* About/Merch open on light surfaces — keep solid nav so brand + links stay visible */
    const needsSolid = page !== 'home' || isScrolled;
    nav.classList.toggle('scrolled', needsSolid);
}

/**
 * Determine if the viewport is currently within the Hero section.
 */
export function isHeroActive() {
    const page = document.documentElement.getAttribute('data-page') || 'home';
    if (page === 'home') {
        const hero = document.querySelector('#page-home .hero');
        if (!hero) return window.scrollY < 600;
        const rect = hero.getBoundingClientRect();
        return rect.bottom > 70;
    }
    return window.scrollY < 60;
}

export function updateHeroNavState() {
    if (!nav) return;
    const inHero = isHeroActive();
    nav.classList.toggle('nav-in-hero', inHero);
}

export function updateNavState() {
    updateNavSolid();
    updateHeroNavState();
}

let isNavigating = false;
let currentTransition = null;

/**
 * Calculate the static top position of an element relative to the document,
 * unaffected by current window.scrollY or layout shifts.
 */
function getElementDocTop(el) {
    let top = 0;
    let curr = el;
    while (curr) {
        top += curr.offsetTop || 0;
        curr = curr.offsetParent;
    }
    return top;
}

/**
 * Perform the synchronous DOM update for a page switch.
 */
function switchPageDOM(name, record = true, targetSection = null) {
    // toggle active page container
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    const targetPage = document.getElementById('page-' + name);
    if (targetPage) targetPage.classList.add('active');

    // update data-page attribute
    document.documentElement.setAttribute('data-page', name);

    // update active nav button indicators
    document.querySelectorAll('.navbtn, .dock-tab, .assistive-hud-item, .sm-panel-item').forEach(b => {
        const on = b.dataset.page === name;
        b.classList.toggle('active', on);
        if (on) b.setAttribute('aria-current', 'page');
        else b.removeAttribute('aria-current');
    });

    // keep the Android back button inside the site
    if (record) {
        if (targetSection) {
            const sec = String(targetSection).replace(/^#/, '');
            history.pushState({ page: name, section: sec }, '', '#' + sec);
        } else {
            history.pushState({ page: name }, '', name === 'home' ? location.pathname + location.search : '#' + name);
        }
    }

    // merch came back stuck on the last opened card
    if (window.clearMerchFocus) window.clearMerchFocus();

    // If switching to home, ensure blueprint is reconciled and measured first
    if (name === 'home') {
        if (window.__reconcileBlueprint) window.__reconcileBlueprint();
        else if (window.__measureBlueprint) window.__measureBlueprint();
    }

    // Crucial: resize Lenis immediately after DOM is switched and layout heights updated
    // so that Lenis's limit is refreshed and does NOT clamp targetY to an old page's height!
    if (window.__lenis) {
        window.__lenis.resize();
    }

    let targetY = 0;
    if (targetSection) {
        const el = typeof targetSection === 'string' ? document.querySelector(targetSection) : targetSection;
        if (el) {
            const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
            const docTop = getElementDocTop(el);
            targetY = Math.max(0, docTop - navH + 10);
        }
    }

    // Scroll instantly inside the transition update callback so incoming snapshot is already at the target
    if (window.__lenis) {
        window.__lenis.resize();
        window.__lenis.scrollTo(targetY, { immediate: true });
    }
    window.scrollTo({ top: targetY, behavior: 'instant' });
    updateNavState();
}

export function showPage(name, record = true, animate = true, targetSection = null) {
    if (isNavigating) return currentTransition;

    const currentPage = document.documentElement.getAttribute('data-page') || 'home';
    if (name === currentPage) {
        if (targetSection) {
            const el = typeof targetSection === 'string' ? document.querySelector(targetSection) : targetSection;
            if (el) {
                const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
                const docTop = getElementDocTop(el);
                const targetY = Math.max(0, docTop - navH + 10);
                if (window.__lenis) {
                    window.__lenis.scrollTo(targetY, {
                        duration: 1.1,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                    });
                } else {
                    window.scrollTo({ top: targetY, behavior: 'smooth' });
                }
                const sec = String(targetSection).replace(/^#/, '');
                history.pushState({ page: name, section: sec }, '', '#' + sec);
                return null;
            }
        }
        if (window.__lenis) {
            window.__lenis.scrollTo(0);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return null;
    }

    const supportsVT = typeof document.startViewTransition === 'function';
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!supportsVT || prefersReducedMotion || !animate) {
        switchPageDOM(name, record, targetSection);
        return null;
    }

    isNavigating = true;
    document.documentElement.classList.add('in-page-transition');

    try {
        currentTransition = document.startViewTransition(() => {
            switchPageDOM(name, record, targetSection);
        });

        const cleanup = () => {
            isNavigating = false;
            currentTransition = null;
            document.documentElement.classList.remove('in-page-transition');
            if (targetSection) {
                const el = typeof targetSection === 'string' ? document.querySelector(targetSection) : targetSection;
                if (el) {
                    if (window.__measureBlueprint) window.__measureBlueprint();
                    if (window.__lenis) window.__lenis.resize();
                    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
                    const finalY = Math.max(0, getElementDocTop(el) - navH + 10);
                    if (window.__lenis) {
                        window.__lenis.scrollTo(finalY, { immediate: true });
                    }
                    window.scrollTo({ top: finalY, behavior: 'instant' });
                }
            }
        };

        currentTransition.finished.then(cleanup, cleanup);
        return currentTransition;
    } catch (e) {
        console.warn('[routing] View Transition failed; falling back to instant switch.', e);
        isNavigating = false;
        currentTransition = null;
        document.documentElement.classList.remove('in-page-transition');
        switchPageDOM(name, record, targetSection);
        return null;
    }
}

export function initRouter() {
    //assign variables
    nav = document.getElementById('siteNav');

    function parseRoute() {
        const raw = (location.hash || '').replace(/^#/, '').toLowerCase();
        if (raw.startsWith('about')) return 'about';
        if (raw.startsWith('merch')) return 'merch';
        return PAGES.includes(raw) ? raw : 'home';
    }

    const initial = parseRoute();

    window.addEventListener('popstate', (e) => {
        const page = (e.state && e.state.page) || parseRoute();
        if (window.closeSpeakerModal) window.closeSpeakerModal();
        if (window.showPage) window.showPage(page, false);
        else showPage(page, false);
    });

    window.addEventListener('scroll', updateNavState, { passive: true });
    window.addEventListener('resize', updateNavState, { passive: true });
    updateNavState();
    initNavAutoHide();

    // Delegated click handler for all interactive [data-page] elements (nav, footer, brand, hero CTA, HUD)
    document.addEventListener('click', (e) => {
        // Never intercept external links or target=_blank links
        const extLink = e.target.closest('a[target="_blank"], a[href^="http"], a[href^="mailto:"]');
        if (extLink) return;

        const target = e.target.closest('button[data-page], a[data-page], [role="button"][data-page]');
        if (!target || target === document.documentElement || target === document.body) return;
        const page = target.getAttribute('data-page');
        if (page && PAGES.includes(page)) {
            e.preventDefault();
            if (window.showPage) window.showPage(page);
            else showPage(page);
        }
    });

    history.replaceState({ page: initial }, '', location.href);
    if (initial !== 'home') {
        switchPageDOM(initial, false);
    } else {
        document.documentElement.setAttribute('data-page', 'home');
        const hashTarget = (location.hash || '').replace(/^#/, '');
        if (hashTarget && !PAGES.includes(hashTarget)) {
            const targetSelector = hashTarget === 'agenda' ? '#program' : '#' + hashTarget;
            setTimeout(() => {
                const el = document.querySelector(targetSelector);
                if (el) {
                    if (window.__measureBlueprint) window.__measureBlueprint();
                    if (window.__lenis) window.__lenis.resize();
                    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
                    const docTop = getElementDocTop(el);
                    const targetY = Math.max(0, docTop - navH + 10);
                    if (window.__lenis) {
                        window.__lenis.scrollTo(targetY, { immediate: true });
                    } else {
                        window.scrollTo({ top: targetY, behavior: 'instant' });
                    }
                }
            }, 100);
        }
    }

    window.showPage = showPage;
}

/**
 * Auto-hide navbar when not in mouse hover, with organic easing, hysteresis, and grace timeouts.
 */
function initNavAutoHide() {
    if (!nav || (window.matchMedia && window.matchMedia('(hover: none)').matches)) return;

    let isNavHovered = false;
    let hideTimer = null;

    function showNav() {
        if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }
        nav.classList.add('nav-visible');
    }

    function scheduleHide(delay = 240) {
        if (isHeroActive()) return;
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            if (!isNavHovered && !nav.contains(document.activeElement)) {
                nav.classList.remove('nav-visible');
            }
            hideTimer = null;
        }, delay);
    }

    nav.addEventListener('mouseenter', () => {
        isNavHovered = true;
        showNav();
    });

    nav.addEventListener('mouseleave', () => {
        isNavHovered = false;
        scheduleHide(260);
    });

    // Intent detection: upward motion towards top or cursor close to top edge
    window.addEventListener('mousemove', (e) => {
        if (isHeroActive()) return;

        if (e.clientY <= 45) {
            showNav();
        } else if (e.clientY <= 70 && e.movementY < -1) {
            // User moving upward towards header
            showNav();
        } else if (!isNavHovered && e.clientY > 75 && !nav.contains(document.activeElement)) {
            // Smooth retreat when cursor moves away
            scheduleHide(220);
        }
    }, { passive: true });

    // When mouse exits the browser window, gently schedule hide unless focused or in hero
    document.addEventListener('mouseleave', () => {
        if (!isHeroActive() && !nav.contains(document.activeElement)) {
            isNavHovered = false;
            scheduleHide(180);
        }
    });
}
