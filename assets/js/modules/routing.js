/* ---------- PAGE ROUTING ---------- */
let nav, hamburgerBtn, mobilePanel;

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

export function showPage(name) {
    //toggle active page container
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    const targetPage = document.getElementById('page-' + name)
    if (targetPage) targetPage.classList.add('active');

    //update data-page attribute
    document.documentElement.setAttribute('data-page', name);

    //update active nav button indicators
    document.querySelectorAll('.navbtn, .dock-tab, #mobilePanel [data-page]').forEach(b => {
        b.classList.toggle('active', b.dataset.page === name);
    });

    //Scroll to top instantly
    window.scrollTo({ top: 0, behavior: 'instant' });
    updateNavSolid();

    //close mobile panel
    if (mobilePanel && hamburgerBtn) {
        mobilePanel.classList.remove('open');
        hamburgerBtn.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
    }
}

export function initRouter() {
    //assign variables
    nav = document.getElementById('siteNav');
    hamburgerBtn = document.getElementById('hamburgerBtn');
    mobilePanel = document.getElementById('mobilePanel');

    document.documentElement.setAttribute('data-page', 'home');

    window.addEventListener('scroll', updateNavSolid, { passive: true });
    updateNavSolid();

    if (hamburgerBtn && mobilePanel) {
        hamburgerBtn.addEventListener('click', () => {
            const isOpen = mobilePanel.classList.toggle('open');
            hamburgerBtn.classList.toggle('open', isOpen);
            hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
            document.documentElement.style.overflow = isOpen ? 'hidden' : '';
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
    }

    // Only listen to actual buttons/links with data-page (NOT <html>)
    document.querySelectorAll('button[data-page], a[data-page], .navbtn[data-page], #mobilePanel [data-page]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = btn.getAttribute('data-page');
            if (page) {
                e.preventDefault();
                showPage(page);
            }
        });
    });

    window.showPage = showPage;
}