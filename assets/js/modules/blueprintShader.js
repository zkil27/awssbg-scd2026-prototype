/**
 * blueprintShader.js — SCD South Summit 2026
 *
 * Integrates React Bits <Grainient /> procedural WebGL component onto the
 * #program Agenda / Blueprint section with exact React Bits settings.
 */

import { createGrainient } from './grainient.js';

let grainientInstance = null;

/**
 * Update scroll progress uniform from blueprintScroll.js.
 * Gently shifts Grainient center offset and blend angle as user pans horizontally.
 */
export function setShaderScroll(progress) {
  if (!grainientInstance) return;

  // Drift center offset and blend angle gently as user pans
  grainientInstance.setOffset(progress * 0.25, 0.0);
  grainientInstance.update({
    blendAngle: progress * 25.0
  });
}

/**
 * Initialize the React Bits <Grainient /> on the Agenda/Blueprint background.
 */
export function initBlueprintShader() {
  const container = document.querySelector('#agendaGrainient') || document.querySelector('.bp-shader-canvas');
  if (!container) return;

  if (grainientInstance) {
    grainientInstance.destroy();
    grainientInstance = null;
  }

  // Exact React Bits Grainient configuration matching Summit Brand Palette:
  // Pink (left), Purple (top), Blue (right), Green (bottom)
  grainientInstance = createGrainient(container, {
    color1: '#FE55EB', // Summit Pink (left gear quadrant)
    color2: '#AD5CFD', // Summit Purple (top gear quadrant)
    color3: '#42B2FE', // Summit Azure Blue (right gear quadrant)
    color4: '#00E681', // Summit Emerald Green (bottom gear quadrant)
    timeSpeed: 0.25,
    colorBalance: 0.0,
    warpStrength: 1.0,
    warpFrequency: 5.0,
    warpSpeed: 2.0,
    warpAmplitude: 50.0,
    blendAngle: 0.0,
    blendSoftness: 0.05,
    rotationAmount: 500.0,
    noiseScale: 2.0,
    grainAmount: 0.035, // Lessened grain per user request
    grainScale: 2.0,
    grainAnimated: false,
    contrast: 1.5,
    gamma: 1.0,
    saturation: 1.0,
    centerX: 0.0,
    centerY: 0.0,
    zoom: 0.9,
    lightMode: false
  });

  // Observe vertical scroll on mobile/stacked view to drive scroll progress
  const section = document.getElementById('program');
  if (section) {
    window.addEventListener('scroll', () => {
      if (document.documentElement.classList.contains('bp-active')) return;
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total > 0) {
        const progress = Math.max(0, Math.min(1, -rect.top / total));
        setShaderScroll(progress);
      }
    }, { passive: true });
  }

  return grainientInstance;
}
