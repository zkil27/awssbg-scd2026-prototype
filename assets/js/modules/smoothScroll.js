/**
 * smoothScroll.js
 * --------------------------------------------------------------------------
 * Owns the site-wide smooth scrolling layer, powered by Lenis — the single
 * sanctioned third-party dependency (see AGENTS.md / project-conventions.md).
 * Lenis is imported as a CDN ES module so the zero-build promise is intact.
 *
 * Responsibilities:
 *   - Create a Lenis instance with tuned easing/duration and run its rAF loop.
 *   - Expose the instance (`getLenis`) and a scroll-subscribe hook (`onScroll`)
 *     so modules/blueprintScroll.js can drive the horizontal pan from the SAME
 *     smoothed scroll value instead of raw window.scrollY.
 *   - Reset scroll + notify subscribers on pseudo-SPA page switches (wraps
 *     window.showPage, mirroring scrollReveal.js).
 *
 * Accessibility & device fallback: Lenis is NEVER created under
 * prefers-reduced-motion or on touch / non-(pointer:fine) devices — those users
 * get native scrolling. The guard is re-evaluated live on media-query changes.
 *
 * NOTE: while Lenis is active the CSS `html { scroll-behavior: smooth }` from
 * theme.css must be neutralized (Lenis manages scroll itself). We toggle a
 * `lenis` class on <html> for that; see styles.css.
 */

const LENIS_CDN = 'https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.mjs';

/** Minimum viewport width for the enhanced (Lenis + horizontal pan) experience. */
export const DESKTOP_MIN_WIDTH = 1024;

/* ================================ State ================================= */

let lenis = null;
let rafId = 0;
let showPageWrapped = false;
let active = false;

/** Subscribers notified on every Lenis scroll frame with the scroll value. */
const scrollSubscribers = new Set();

/* ============================== Guards ================================== */

const reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
const pointerFineMQ = window.matchMedia('(pointer: fine)');
const desktopMQ = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`);

/**
 * Whether the enhanced smooth-scroll experience should run. Shared shape with
 * blueprintScroll's guard: pointer:fine + no reduced-motion + desktop width.
 */
export function shouldEnhance() {
  return (
    !reducedMotionMQ.matches &&
    pointerFineMQ.matches &&
    desktopMQ.matches
  );
}

/* ============================= Public API =============================== */

/** The live Lenis instance, or null when the native-scroll fallback is used. */
export function getLenis() {
  return lenis;
}

/**
 * Subscribe to smoothed scroll updates. The callback receives the current
 * scroll offset (px). Returns an unsubscribe function. When Lenis is inactive
 * (fallback), subscribers simply never fire — callers must have their own
 * native-scroll path or a static layout.
 */
export function onScroll(cb) {
  scrollSubscribers.add(cb);
  return () => scrollSubscribers.delete(cb);
}

function emitScroll(value) {
  for (const cb of scrollSubscribers) {
    try {
      cb(value);
    } catch (e) {
      /* keep other subscribers alive if one throws */
      console.error('[smoothScroll] subscriber error', e);
    }
  }
}

/* =============================== Lifecycle ============================== */

async function createLenis() {
  if (lenis) return;

  let Lenis;
  try {
    ({ default: Lenis } = await import(/* @vite-ignore */ LENIS_CDN));
  } catch (e) {
    console.warn('[smoothScroll] Lenis failed to load; using native scroll.', e);
    return;
  }

  lenis = new Lenis({
    duration: 1.1,
    // easeOutExpo — heavy, premium settle that matches the brand spring feel.
    easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    // Leave touch to the native scroller; the enhanced mode is desktop-only.
    syncTouch: false,
  });

  document.documentElement.classList.add('lenis');
  active = true;
  window.__lenis = lenis;

  lenis.on('scroll', ({ scroll }) => emitScroll(scroll));

  const raf = (time) => {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);
}

function destroyLenis() {
  if (!lenis) return;
  cancelAnimationFrame(rafId);
  rafId = 0;
  lenis.destroy();
  lenis = null;
  window.__lenis = null;
  active = false;
  document.documentElement.classList.remove('lenis');
  // Reset any subscriber-driven state to the top of the range.
  emitScroll(0);
}

/** Create or tear down Lenis to match the current guard state. */
function reconcile() {
  if (shouldEnhance()) {
    createLenis();
  } else {
    destroyLenis();
  }
}

/**
 * Wrap window.showPage so switching pages jumps to the top immediately (Lenis
 * carries momentum otherwise) and re-measures dependent modules on next frame.
 * Guarded against double-wrapping — scrollReveal wraps it too.
 */
function wrapShowPage() {
  if (showPageWrapped) return;
  const original = window.showPage;
  if (typeof original !== 'function') return;

  window.showPage = function wrappedShowPage(...args) {
    const result = original.apply(this, args);
    // If a ViewTransition is active, scroll reset is handled cleanly inside switchPageDOM.
    // We emit the final settled scroll position once the transition completes.
    if (result && typeof result.finished?.then === 'function') {
      result.finished.then(() => {
        emitScroll(lenis ? lenis.scroll : 0);
      });
    } else {
      requestAnimationFrame(() => emitScroll(lenis ? lenis.scroll : 0));
    }
    return result;
  };
  showPageWrapped = true;
}

/* =============================== Setup ================================== */

export function initSmoothScroll() {
  reconcile();
  wrapShowPage();

  // Re-evaluate when the user toggles reduced-motion, or device/viewport
  // characteristics change (e.g. rotating a hybrid device, DevTools resize).
  const onChange = () => reconcile();
  reducedMotionMQ.addEventListener('change', onChange);
  pointerFineMQ.addEventListener('change', onChange);
  desktopMQ.addEventListener('change', onChange);
}

/** Exposed for other modules that need to know if smoothing is live. */
export function isSmoothActive() {
  return active;
}
