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
 * Perform the synchronous DOM update for a page switch.
 */
function switchPageDOM(name, record = true) {
    // toggle active page container
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    const targetPage = document.getElementById('page-' + name);
    if (targetPage) targetPage.classList.add('active');

    // update data-page attribute
    document.documentElement.setAttribute('data-page', name);

    // update active nav button indicators
    document.querySelectorAll('.navbtn, .dock-tab, .assistive-hud-item').forEach(b => {
        const on = b.dataset.page === name;
        b.classList.toggle('active', on);
        if (on) b.setAttribute('aria-current', 'page');
        else b.removeAttribute('aria-current');
    });

    // keep the Android back button inside the site
    if (record) {
        history.pushState({ page: name }, '', name === 'home' ? location.pathname + location.search : '#' + name);
    }

    // merch came back stuck on the last opened card
    if (window.clearMerchFocus) window.clearMerchFocus();

    // Scroll to top instantly inside the transition update callback so the incoming snapshot is at top
    if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    updateNavState();
}

export function showPage(name, record = true, animate = true) {
    if (isNavigating) return currentTransition;

    const currentPage = document.documentElement.getAttribute('data-page') || 'home';
    if (name === currentPage) {
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
        switchPageDOM(name, record);
        return null;
    }

    isNavigating = true;
    document.documentElement.classList.add('in-page-transition');

    try {
        currentTransition = document.startViewTransition(() => {
            switchPageDOM(name, record);
        });

        const cleanup = () => {
            isNavigating = false;
            currentTransition = null;
            document.documentElement.classList.remove('in-page-transition');
        };

        currentTransition.finished.then(cleanup, cleanup);
        return currentTransition;
    } catch (e) {
        console.warn('[routing] View Transition failed; falling back to instant switch.', e);
        isNavigating = false;
        currentTransition = null;
        document.documentElement.classList.remove('in-page-transition');
        switchPageDOM(name, record);
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
    document.documentElement.setAttribute('data-page', initial);

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

    // Delegated click handler for all [data-page] elements (nav, footer, brand, hero CTA, HUD)
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-page]');
        if (!target) return;
        const page = target.getAttribute('data-page');
        if (page && PAGES.includes(page)) {
            e.preventDefault();
            if (window.showPage) window.showPage(page);
            else showPage(page);
        }
    });

    history.replaceState({ page: initial }, '', location.href);
    if (initial !== 'home') {
        if (window.showPage) window.showPage(initial, false, false);
        else showPage(initial, false, false);
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
