/**
 * blueprintScroll.js
 * --------------------------------------------------------------------------
 * Turns the #program ("The Blueprint") section into a scroll-pinned horizontal
 * pan on desktop: the section sticks to the viewport and its .blueprint-track
 * translates sideways as the user scrolls, driven by the SAME smoothed scroll
 * value that Lenis produces (modules/smoothScroll.js). Content, progress bar,
 * and scroll hint all update in one place.
 *
 * Activation mirrors smoothScroll's guard (shouldEnhance): pointer:fine +
 * no prefers-reduced-motion + desktop width. When the guard fails the module
 * fully deactivates — it removes html.bp-active so the CSS reverts #program to
 * a plain vertical stack, and never touches transforms. The guard is
 * re-evaluated on media-query changes and on resize.
 *
 * Pseudo-SPA: #program only exists on the home page. We reuse the wrapShowPage
 * pattern (guarded against double-wrap; scrollReveal + smoothScroll wrap it too)
 * to re-measure when returning to home and to skip work when it's not visible.
 */

import { computeProgress, computeTranslateX, clamp01 } from './blueprintMath.js';
import { getLenis, shouldEnhance, DESKTOP_MIN_WIDTH } from './smoothScroll.js';

/* ================================ State ================================= */

let section = null;   // #program (the tall spacer)
let pin = null;       // .blueprint-pin (sticky frame)
let track = null;     // .blueprint-track (translated)
let fill = null;      // .blueprint-progress-fill

let sectionTop = 0;   // document offset of #program, px
let range = 0;        // horizontal scroll distance = trackWidth - viewportWidth
let trackWidth = 0;
let viewportWidth = 0;

let active = false;         // is the enhanced pan currently engaged?
let engaged = false;        // has the user progressed past the hint threshold?
let rafId = 0;              // self-owned pan loop handle
let resizeObserver = null;
let showPageWrapped = false;
let lastProgress = 0;
let pinState = '';          // 'is-before' | 'is-pinned' | 'is-after'

const HINT_ENGAGE_AT = 0.04; // fade the "scroll →" hint after this progress

/* ============================== Guards ================================== */

const reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
const pointerFineMQ = window.matchMedia('(pointer: fine)');
const desktopMQ = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`);

/** True only on the home page (where #program lives) AND it's laid out. */
function homeVisible() {
  const home = document.getElementById('page-home');
  return !!home && home.classList.contains('active');
}

/* ============================ Measurement =============================== */

/**
 * Recompute geometry: section offset, track width, and the horizontal range.
 * The spacer height (extra scroll distance) is written to a CSS var so the
 * section is exactly tall enough to pan the whole track.
 */
function measure() {
  if (!section || !track) return;

  viewportWidth = window.innerWidth;
  trackWidth = track.scrollWidth;
  range = Math.max(0, trackWidth - viewportWidth);

  // Expose the extra scroll distance to CSS (#program height = 100vh + this).
  section.style.setProperty('--bp-extra', `${range}px`);

  // Section offset must be read AFTER the height var is applied so layout below
  // is accounted for. offsetTop is relative to the offsetParent; the page uses
  // position:relative containers, so add up to the document top.
  sectionTop = documentOffsetTop(section);
}

/** Absolute distance from the document top, walking offsetParent chain. */
function documentOffsetTop(el) {
  let top = 0;
  let node = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent;
  }
  return top;
}

/* ============================== Rendering =============================== */

/**
 * Set the manual pin state (before / pinned / after) for the current scroll.
 * We can't use position:sticky because `body { overflow-x: clip }` breaks it,
 * so we drive the pin ourselves: absolute-top before the window, fixed during,
 * absolute-bottom after.
 */
function setPinState(scroll) {
  if (!pin) return;
  let state;
  if (scroll < sectionTop) state = 'is-before';
  else if (scroll >= sectionTop + range) state = 'is-after';
  else state = 'is-pinned';

  if (state !== pinState) {
    pin.classList.remove('is-before', 'is-pinned', 'is-after');
    pin.classList.add(state);
    pinState = state;
  }
}

/** Map the given (smoothed) scroll value to the track transform + progress. */
function render(scroll) {
  if (!active || !track) return;

  setPinState(scroll);

  const progress = computeProgress(scroll, sectionTop, range);
  const tx = computeTranslateX(progress, trackWidth, viewportWidth);

  track.style.transform = `translate3d(${tx}px, 0, 0)`;

  if (fill) fill.style.width = `${(clamp01(progress) * 100).toFixed(2)}%`;

  // Engage (hide hint) once the user has meaningfully scrolled in.
  if (!engaged && progress > HINT_ENGAGE_AT) {
    engaged = true;
    if (pin) pin.classList.add('bp-engaged');
  }

  lastProgress = progress;
}

/** Current scroll offset — Lenis's smoothed value when present, else native. */
function currentScroll() {
  const lenis = getLenis();
  return lenis && typeof lenis.scroll === 'number' ? lenis.scroll : window.scrollY;
}

/* ============================== Activation ============================== */

/**
 * Self-owned rAF loop. We read currentScroll() every frame rather than relying
 * only on Lenis's scroll event, so the pan works whether Lenis loaded or not
 * (and has no init-timing dependency on the async Lenis import). Lenis, when
 * present, still supplies the smoothed scroll value — we just sample it here.
 */
function tick() {
  if (!active) return;
  render(currentScroll());
  rafId = requestAnimationFrame(tick);
}

function activate() {
  if (active) return;
  active = true;
  engaged = false;

  document.documentElement.classList.add('bp-active');
  if (track) track.style.willChange = 'transform';

  measure();

  // Re-measure when the track's content box changes (fonts load, speaker chips
  // inject into the schedule panel, viewport resize, etc.).
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(track);
  }

  // Start the per-frame pan loop (paints the initial frame immediately).
  rafId = requestAnimationFrame(tick);
}

function deactivate() {
  if (!active) return;
  active = false;
  engaged = false;

  document.documentElement.classList.remove('bp-active');

  if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
  if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }

  if (track) {
    track.style.transform = '';
    track.style.willChange = '';
  }
  if (fill) fill.style.width = '';
  if (pin) pin.classList.remove('bp-engaged', 'is-before', 'is-pinned', 'is-after');
  pinState = '';
  if (section) section.style.removeProperty('--bp-extra');
}

/** Enable or disable to match the current guard + page visibility. */
function reconcile() {
  if (shouldEnhance() && homeVisible()) {
    activate();
    // A late measure after layout settles keeps the final panel flush.
    requestAnimationFrame(measure);
  } else {
    deactivate();
  }
}

/* ============================ showPage hook ============================= */

function wrapShowPage() {
  if (showPageWrapped) return;
  const original = window.showPage;
  if (typeof original !== 'function') return;

  window.showPage = function wrappedShowPage(...args) {
    const result = original.apply(this, args);
    // After the page swap settles, re-evaluate (deactivate off-home,
    // re-measure on return to home).
    requestAnimationFrame(() => {
      reconcile();
      if (active) render(currentScroll());
    });
    return result;
  };
  showPageWrapped = true;
}

/* =============================== Setup ================================== */

export function initBlueprintScroll() {
  section = document.getElementById('program');
  if (!section) return;

  pin = section.querySelector('.blueprint-pin');
  track = section.querySelector('.blueprint-track');
  fill = section.querySelector('.blueprint-progress-fill');
  if (!pin || !track) return;

  reconcile();
  wrapShowPage();

  // Plain window resize also re-measures (viewport width feeds range).
  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      reconcile();
      if (active) { measure(); render(currentScroll()); }
    });
  });

  // Re-evaluate the guard live when device/motion characteristics change.
  const onChange = () => reconcile();
  reducedMotionMQ.addEventListener('change', onChange);
  pointerFineMQ.addEventListener('change', onChange);
  desktopMQ.addEventListener('change', onChange);
}
