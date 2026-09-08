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
    updateNavSolid();

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

    window.addEventListener('scroll', updateNavSolid, { passive: true });
    updateNavSolid();


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
