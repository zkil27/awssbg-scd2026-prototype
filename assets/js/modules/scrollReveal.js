/**
 * Scroll Reveal Module
 * --------------------------------------------------------------------------
 * Scroll-triggered entrance motion for page sections and their cards. As an
 * element scrolls into view it rises + fades in (see [data-reveal] rules in
 * styles.css); card grids stagger item-by-item, echoing the compute-grid boot
 * sweep, with a brief brand-colored edge accent that settles as each card lands.
 *
 * Design notes:
 *   - One shared IntersectionObserver watches every tagged element. On first
 *     intersection the element gets `.is-revealed` and is unobserved (one-shot,
 *     so scrolling back up never replays it).
 *   - Pages are toggled via `.active` on `.page` containers (see routing.js),
 *     not real navigation. Elements on inactive pages have no layout box, so
 *     they never intersect until their page is shown. We wrap `window.showPage`
 *     to re-scan (`refresh()`) on the next frame after a page switch, so About
 *     and Merch animate the first time they're opened.
 *   - Runs after the init*UI() calls (registered last in main.js) so the cards
 *     they inject via innerHTML already exist to be tagged.
 *
 * Accessibility & fallbacks: honors prefers-reduced-motion and degrades when
 * IntersectionObserver is unavailable by revealing everything immediately, so
 * content is never left hidden. The CSS carries a matching reduced-motion
 * safety net.
 */

/* ============================ Configuration ============================= */

/** Section-level blocks: reveal as a single rise + fade (no stagger). */
const SECTION_SELECTORS = [
  '.section-head',
  '.tier-editorial',
  '.sponsor-cta-banner',
  '.about-grid',
  '.quote-inner',
  '.register-inner',
  '.schedule-container',
];

/** Item-level targets: revealed with a per-item stagger + card accent. */
const CARD_SELECTORS = [
  '.speaker-card',
  '.organizer-feature-card',
  '.pro-card-editorial',
  '.chapter-ledger-card',
  '.agenda-item',
  '.venue-photo-card',
  '.venue-floor-card',
  '.venue-map-card',
  '.chapter-card',
  '.merch-card',
  '.about-outcomes li',
];

/** Brand accent colors cycled across staggered cards (matches theme.css). */
const ACCENT_VARS = ['--blue', '--purple', '--orange', '--green', '--pink'];

const CFG = {
  rootMargin: '0px 0px -10% 0px', // reveal a touch before fully in view
  threshold: 0.15,
  maxStagger: 8,                  // clamp stagger index so long grids don't crawl
  settleMs: 700,                  // when to drop will-change + fade the accent
};

/* ================================ State ================================= */

let observer = null;
let reducedMotion = false;
let supported = false;
let showPageWrapped = false;

/* ============================== Utilities =============================== */

/**
 * Tag matching, not-yet-tagged elements with data-reveal. Card groups also get
 * `.reveal-card`, a clamped stagger index (--reveal-i) scoped to their parent
 * group, and a cycling brand accent color (--reveal-accent).
 */
function tag(root = document) {
  // Section-level blocks: simple rise + fade.
  for (const sel of SECTION_SELECTORS) {
    root.querySelectorAll(sel).forEach((el) => {
      if (el.dataset.reveal === undefined) el.dataset.reveal = '';
    });
  }

  // Card-level groups: stagger index is per-group (per parent) so each grid
  // sweeps independently instead of continuing one global counter.
  for (const sel of CARD_SELECTORS) {
    const groups = new Map(); // parent -> running index

    root.querySelectorAll(sel).forEach((el) => {
      if (el.dataset.reveal !== undefined) return; // already tagged

      const parent = el.parentElement || document.body;
      const i = groups.get(parent) || 0;
      groups.set(parent, i + 1);

      const clamped = Math.min(i, CFG.maxStagger);
      el.dataset.reveal = '';
      el.classList.add('reveal-card');
      el.style.setProperty('--reveal-i', String(clamped));
      el.style.setProperty(
        '--reveal-accent',
        `var(${ACCENT_VARS[i % ACCENT_VARS.length]})`
      );
    });
  }
}

/** Mark an element revealed, then schedule cleanup of will-change/accent. */
function reveal(el) {
  el.classList.add('is-revealed');
  window.setTimeout(() => el.classList.add('reveal-done'), CFG.settleMs);
}

/** Reveal every tagged element immediately (reduced-motion / no-IO path). */
function revealAll(root = document) {
  root.querySelectorAll('[data-reveal]').forEach((el) => {
    el.classList.add('is-revealed', 'reveal-done');
  });
}

/** Observe any tagged elements that aren't revealed yet. */
function observeNew(root = document) {
  if (!observer) return;
  root.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach((el) => {
    observer.observe(el);
  });
}

/* ============================= Public API =============================== */

/**
 * Re-scan for new/unrevealed targets and observe them. Called after page
 * switches (elements on a newly-shown page finally have a layout box) and
 * safe to call any time content is injected.
 */
export function refresh() {
  if (reducedMotion || !supported) {
    tag();
    revealAll();
    return;
  }
  tag();
  observeNew();
}

/**
 * Wrap window.showPage so switching pages re-scans on the next frame, after
 * `.active` is applied and the newly-visible page has layout. Guarded against
 * double-wrapping.
 */
function wrapShowPage() {
  if (showPageWrapped) return;
  const original = window.showPage;
  if (typeof original !== 'function') return;

  window.showPage = function wrappedShowPage(...args) {
    const result = original.apply(this, args);
    requestAnimationFrame(() => refresh());
    return result;
  };
  showPageWrapped = true;
}

/* =============================== Setup ================================== */

export function initScrollReveal() {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  supported = 'IntersectionObserver' in window;

  // Tag everything currently in the DOM up front.
  tag();

  // No motion (or no observer support): show everything and stop.
  if (reducedMotion || !supported) {
    revealAll();
    // Still wrap showPage so pages shown later also reveal-all their content.
    wrapShowPage();
    return;
  }

  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      reveal(entry.target);
      observer.unobserve(entry.target);
    }
  }, { rootMargin: CFG.rootMargin, threshold: CFG.threshold });

  observeNew();
  wrapShowPage();

  // React to OS-level reduced-motion changes: if the user turns it on, reveal
  // whatever's still pending so nothing stays hidden.
  const rmq = window.matchMedia('(prefers-reduced-motion: reduce)');
  rmq.addEventListener('change', (e) => {
    reducedMotion = e.matches;
    if (reducedMotion) revealAll();
  });
}
