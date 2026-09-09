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

export function showPage(name, record = true) {
    //toggle active page container
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    const targetPage = document.getElementById('page-' + name)
    if (targetPage) targetPage.classList.add('active');

    //update data-page attribute
    document.documentElement.setAttribute('data-page', name);

    //update active nav button indicators
    document.querySelectorAll('.navbtn, .dock-tab, .assistive-hud-item').forEach(b => {
        const on = b.dataset.page === name;
        b.classList.toggle('active', on);
        if (on) b.setAttribute('aria-current', 'page');
        else b.removeAttribute('aria-current');
    });

    //keep the Android back button inside the site
    if (record) {
        history.pushState({ page: name }, '', name === 'home' ? location.pathname + location.search : '#' + name);
    }

    //merch came back stuck on the last opened card
    if (window.clearMerchFocus) window.clearMerchFocus();

    //Scroll to top instantly
    window.scrollTo({ top: 0, behavior: 'instant' });
    updateNavState();

}

export function initRouter() {
    //assign variables
    nav = document.getElementById('siteNav');

    const initial = PAGES.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home';
    document.documentElement.setAttribute('data-page', initial);

    window.addEventListener('popstate', (e) => {
        const page = (e.state && e.state.page) || (PAGES.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home');
        if (window.closeSpeakerModal) window.closeSpeakerModal();
        showPage(page, false);
    });

    window.addEventListener('scroll', updateNavState, { passive: true });
    window.addEventListener('resize', updateNavState, { passive: true });
    updateNavState();
    initNavAutoHide();


    // Only listen to actual buttons/links with data-page (NOT <html>)
    document.querySelectorAll('button[data-page], a[data-page]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = btn.getAttribute('data-page');
            if (page) {
                e.preventDefault();
                showPage(page);
            }
        });
    });

    history.replaceState({ page: initial }, '', location.href);
    if (initial !== 'home') showPage(initial, false);

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
