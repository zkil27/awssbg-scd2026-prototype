/**
 * blueprintMath.js
 * --------------------------------------------------------------------------
 * Pure, side-effect-free math for the #program horizontal-pan (see
 * modules/blueprintScroll.js). Kept separate so the mapping logic can be
 * reasoned about and verified in isolation from any DOM/scroll wiring.
 */

/** Clamp a number to the 0..1 range. */
export function clamp01(n) {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

/**
 * Scroll progress through the pinned section, 0..1.
 *
 * @param {number} scroll     current (smoothed) scroll offset, px
 * @param {number} sectionTop distance from document top to the section, px
 * @param {number} range      scroll distance over which the pan happens, px
 *                            (typically trackWidth - viewportWidth)
 * @returns {number} 0 before/at the section start, 1 at/after the end.
 */
export function computeProgress(scroll, sectionTop, range) {
  if (!range || range <= 0) return 0;
  return clamp01((scroll - sectionTop) / range);
}

/**
 * Horizontal translate (px) for the track at a given progress.
 * Result is <= 0 (track moves left) and never scrolls past the last panel.
 * Returns 0 when there's nothing to pan (track fits the viewport).
 *
 * @param {number} progress       0..1
 * @param {number} trackWidth     total width of the flex track, px
 * @param {number} viewportWidth  visible width, px
 * @param {number} [panRatio=0.88] fraction of scroll progress where the horizontal pan
 *                                completes, creating a resting dwell with the panel centered
 * @returns {number} translateX in px (0 or negative)
 */
export function computeTranslateX(progress, trackWidth, viewportWidth, panRatio = 0.88) {
  const max = trackWidth - viewportWidth;
  if (max <= 0) return 0;
  const panProgress = clamp01(progress / panRatio);
  return -panProgress * max;
}
