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
import { setShaderScroll } from './blueprintShader.js';

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
let panelData = [];         // cached panel geometry for 60/120fps scroll animation
let clipPathEl = null;      // SVG clipPath element for top curve transition
let strokePathEl = null;    // SVG stroke path for glowing top border
let strokeWrapEl = null;    // wrapper for curve stroke
let lastArch = -1;          // cached arch height for performance

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
 * Cache panel layout geometry once per measure so render() performs zero DOM reads.
 */
function measurePanels() {
  if (!track) return;
  const panelEls = track.querySelectorAll('.blueprint-panel');
  panelData = Array.from(panelEls).map((el) => ({
    el,
    isIntro: el.classList.contains('blueprint-panel--intro'),
    isAgenda: el.classList.contains('blueprint-panel--agenda'),
    isSchedule: el.classList.contains('blueprint-panel--schedule'),
    isOffsetUp: el.classList.contains('blueprint-panel--offset-up'),
    isOffsetDown: el.classList.contains('blueprint-panel--offset-down'),
    numEl: el.querySelector('.bp-num'),
    bodyEl: el.querySelector('.bp-agenda-body'),
    left: el.offsetLeft,
    width: el.offsetWidth,
  }));
}

/**
 * Recompute geometry: section offset, track width, and the horizontal range.
 * The spacer height (extra scroll distance) is written to a CSS var so the
 * section is exactly tall enough to pan the whole track.
 */
function measure() {
  if (!section || !track) return;
  if (!homeVisible()) return;

  viewportWidth = window.innerWidth;

  // Dynamically compute the exact right padding needed so that at the end of the
  // pan, the schedule panel ("The Running Order") is centered in the viewport
  // across every monitor size (from laptops up to 1440p, 4K, and Ultrawide displays):
  // Left space in viewport = viewportWidth - paddingRight - panelWidth
  // For Left space == Right space (paddingRight):
  // paddingRight = (viewportWidth - panelWidth) / 2
  const schedulePanel = track.querySelector('.blueprint-panel--schedule');
  if (schedulePanel) {
    const minPad = Math.max(48, Math.min(120, Math.round(viewportWidth * 0.06)));
    const panelWidth = schedulePanel.offsetWidth;
    const targetRightPad = Math.max(minPad, Math.round((viewportWidth - panelWidth) / 2));
    track.style.setProperty('--bp-track-pad-right', `${targetRightPad}px`);
  }

  trackWidth = track.scrollWidth;
  range = Math.max(0, trackWidth - viewportWidth);

  // Expose the extra scroll distance to CSS (#program height = 100vh + this).
  section.style.setProperty('--bp-extra', `${range}px`);

  // Section offset must be read AFTER the height var is applied so layout below
  // is accounted for. offsetTop is relative to the offsetParent; the page uses
  // position:relative containers, so add up to the document top.
  sectionTop = documentOffsetTop(section);

  measurePanels();
  clipPathEl = document.getElementById('bpCurveClipPath');
  strokePathEl = document.getElementById('bpCurveStrokePath');
  strokeWrapEl = document.querySelector('.bp-curve-stroke-wrap');
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
  const tx = computeTranslateX(progress, trackWidth, viewportWidth, 0.88);

  track.style.transform = `translate3d(${tx}px, 0, 0)`;

  if (fill) fill.style.width = `${(clamp01(progress / 0.88) * 100).toFixed(2)}%`;

  // Update WebGL procedural noise gradient shader with horizontal scroll progress
  setShaderScroll(progress);

  // Dynamic curved arch transition when entering from the sponsors section
  const viewportHeight = window.innerHeight;
  const enterStart = sectionTop - viewportHeight;
  const enterDistance = Math.min(viewportHeight * 0.95, 850);
  const currentY = scroll - enterStart;

  let enterProgress = 0;
  if (currentY <= 0) {
    enterProgress = 0;
  } else if (currentY >= enterDistance) {
    enterProgress = 1;
  } else {
    enterProgress = currentY / enterDistance;
  }

  if (enterProgress < 1 && clipPathEl && strokePathEl) {
    // Big prominent arch curvature: up to 240px peak in center, flattening as enterProgress -> 1
    const maxArch = Math.min(240, Math.max(120, Math.round(viewportWidth * 0.15)));
    const ease = 1 - Math.pow(1 - enterProgress, 2.2);
    const arch = parseFloat((maxArch * (1 - ease)).toFixed(1));

    if (Math.abs(arch - lastArch) >= 0.5) {
      lastArch = arch;
      const w = viewportWidth;
      const h = viewportHeight + 200;
      const curveD = `M 0,${arch} Q ${w / 2},${-arch} ${w},${arch}`;
      const clipD = `${curveD} L ${w},${h} L 0,${h} Z`;

      clipPathEl.setAttribute('d', clipD);
      pin.style.clipPath = `url(#bpCurveClip)`;
      strokePathEl.setAttribute('d', curveD);
      if (strokeWrapEl) strokeWrapEl.style.opacity = '1';
    }
  } else if (lastArch !== 0) {
    lastArch = 0;
    if (pin) pin.style.clipPath = '';
    if (strokeWrapEl) strokeWrapEl.style.opacity = '0';
  }

  // Dynamic horizontal scroll animation for each panel in the spread
  if (!panelData.length) measurePanels();
  const viewportCenter = viewportWidth * 0.5;
  const reach = viewportWidth * 0.55;

  for (let i = 0; i < panelData.length; i++) {
    const p = panelData[i];
    const panelCenter = p.left + p.width * 0.5 + tx;
    const dist = (panelCenter - viewportCenter) / reach;

    // Smooth Hermite focus curve: 1 at center, 0 when far away
    const u = clamp01(1 - Math.abs(dist));
    let focus = u * u * (3 - 2 * u);

    // Intro panel stays 100% visible before horizontal scroll engages
    if (p.isIntro && progress < 0.15) {
      focus = Math.max(focus, 1 - progress / 0.15);
    }
    // Schedule panel stays 100% visible in the resting dwell zone
    if (p.isSchedule && progress >= 0.85) {
      focus = 1;
    }

    // Optical focus: opacity and subtle scale
    const opacity = (0.35 + 0.65 * focus).toFixed(3);
    const scale = (0.96 + 0.04 * focus).toFixed(3);

    // Staggered vertical float
    let ty = 0;
    if (p.isOffsetUp) {
      ty = (1 - focus) * 16;
    } else if (p.isOffsetDown) {
      ty = -(1 - focus) * 16;
    } else if (p.isAgenda) {
      ty = (1 - focus) * 12;
    }

    p.el.style.opacity = opacity;
    p.el.style.transform = `scale(${scale}) translate3d(0, ${ty.toFixed(1)}px, 0)`;

    // Subtle parallax depth for the giant numeral (clamped within range)
    if (p.numEl) {
      const clampedDist = Math.max(-1, Math.min(1, dist));
      const numTx = (clampedDist * 16).toFixed(1);
      p.numEl.style.transform = `translate3d(${numTx}px, 0, 0)`;
      p.numEl.style.setProperty('--bp-bar-scale', (0.2 + 0.8 * focus).toFixed(3));
    }

    // Editorial copy body stays anchored to its column (no horizontal drift)
    if (p.bodyEl && p.bodyEl.style.transform) {
      p.bodyEl.style.transform = '';
    }

    // Active reading state
    if (focus > 0.6) {
      p.el.classList.add('is-focused');
    } else {
      p.el.classList.remove('is-focused');
    }
  }

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

  if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
  if (resizeObserver) { resizeObserver.disconnect(); resizeObserver = null; }

  // On desktop PC, preserve bp-active and layout styles across page switches
  // so that navigating between pages never flashes the mobile fallback layout.
  if (!shouldEnhance()) {
    document.documentElement.classList.remove('bp-active');

    if (track) {
      track.style.transform = '';
      track.style.willChange = '';
      track.style.removeProperty('--bp-track-pad-right');
    }
    const allPanels = track ? track.querySelectorAll('.blueprint-panel') : [];
    allPanels.forEach((el) => {
      el.style.opacity = '';
      el.style.transform = '';
      el.classList.remove('is-focused');
      const numEl = el.querySelector('.bp-num');
      if (numEl) {
        numEl.style.transform = '';
        numEl.style.removeProperty('--bp-bar-scale');
      }
      const bodyEl = el.querySelector('.bp-agenda-body');
      if (bodyEl) {
        bodyEl.style.transform = '';
      }
    });
    panelData = [];
    if (fill) fill.style.width = '';
    if (pin) {
      pin.classList.remove('bp-engaged', 'is-before', 'is-pinned', 'is-after');
      pin.style.backgroundPosition = '';
      pin.style.clipPath = '';
    }
    if (strokeWrapEl) strokeWrapEl.style.opacity = '0';
    lastArch = -1;
    setShaderScroll(0);
    pinState = '';
    if (section) {
      section.style.removeProperty('--bp-extra');
    }
  }
}

/** Expose synchronous measurement for page transitions to query accurate geometry. */
window.__measureBlueprint = function() {
  if (shouldEnhance() && section && track) {
    measure();
  }
};

/** Expose synchronous reconciliation so router can guarantee blueprint layout before snapshots. */
window.__reconcileBlueprint = function() {
  reconcile();
};

/** Enable or disable to match the current guard + page visibility. */
function reconcile() {
  if (shouldEnhance() && homeVisible()) {
    activate();
    measure();
    render(currentScroll());
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
    const update = () => {
      reconcile();
      if (active) render(currentScroll());
    };
    if (result && typeof result.finished?.then === 'function') {
      result.finished.then(() => requestAnimationFrame(update));
    } else {
      requestAnimationFrame(update);
    }
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
