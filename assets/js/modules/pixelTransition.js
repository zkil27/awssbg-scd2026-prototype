/**
 * AWS Student Community Day: South Summit 2026
 * PixelTransition Animation Module (React Bits Port)
 * --------------------------------------------------------------------------
 * GSAP-powered pixel grid transition.
 * Provides both standalone interactive card support and full-screen splash transition.
 */

const GSAP_CDN = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm';

let gsap = window.gsap || null;

/**
 * Ensure GSAP is loaded and ready.
 */
export async function ensureGSAP() {
  if (window.gsap) {
    gsap = window.gsap;
    return gsap;
  }
  try {
    const mod = await import(/* @vite-ignore */ GSAP_CDN);
    gsap = mod.gsap || mod.default || mod;
    window.gsap = gsap;
    return gsap;
  } catch (err) {
    console.warn('[PixelTransition] Failed to load GSAP from CDN:', err);
    return null;
  }
}

/**
 * Create a standalone PixelTransition instance on an element.
 * Follows the React Bits PixelTransition props and structure.
 *
 * @param {HTMLElement|string} target - Container element or selector
 * @param {Object} options
 * @param {string|HTMLElement} [options.firstContent] - Default content
 * @param {string|HTMLElement} [options.secondContent] - Active/hover content
 * @param {number} [options.gridSize=7] - Number of rows & columns
 * @param {string} [options.pixelColor='currentColor'] - Pixel background color
 * @param {number} [options.animationStepDuration=0.3] - Duration of reveal/hide step (seconds)
 * @param {boolean} [options.once=false] - If true, does not revert on leave
 * @param {string} [options.aspectRatio='100%'] - Padding-top aspect ratio
 * @param {string} [options.className=''] - Additional CSS classes
 * @param {Object} [options.style={}] - Inline styles
 */
export async function createPixelTransition(target, options = {}) {
  await ensureGSAP();

  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) return null;

  const {
    firstContent,
    secondContent,
    gridSize = 7,
    pixelColor = 'currentColor',
    animationStepDuration = 0.3,
    once = false,
    aspectRatio = '100%',
    className = '',
    style = {}
  } = options;

  container.classList.add('pixelated-image-card');
  if (className) container.classList.add(...className.split(' ').filter(Boolean));
  Object.assign(container.style, style);
  container.tabIndex = 0;

  const isTouchDevice =
    'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;

  // Build internal DOM if not already structured
  let defaultEl = container.querySelector('.pixelated-image-card__default');
  let activeEl = container.querySelector('.pixelated-image-card__active');
  let pixelGridEl = container.querySelector('.pixelated-image-card__pixels');

  if (!defaultEl || !activeEl || !pixelGridEl) {
    container.innerHTML = `
      <div style="padding-top: ${aspectRatio};"></div>
      <div class="pixelated-image-card__default"></div>
      <div class="pixelated-image-card__active" style="display: none;"></div>
      <div class="pixelated-image-card__pixels"></div>
    `;
    defaultEl = container.querySelector('.pixelated-image-card__default');
    activeEl = container.querySelector('.pixelated-image-card__active');
    pixelGridEl = container.querySelector('.pixelated-image-card__pixels');

    if (firstContent) {
      if (typeof firstContent === 'string') defaultEl.innerHTML = firstContent;
      else defaultEl.appendChild(firstContent);
    }
    if (secondContent) {
      if (typeof secondContent === 'string') activeEl.innerHTML = secondContent;
      else activeEl.appendChild(secondContent);
    }
  }

  // Populate pixel elements
  pixelGridEl.innerHTML = '';
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const pixel = document.createElement('div');
      pixel.classList.add('pixelated-image-card__pixel');
      pixel.style.backgroundColor = pixelColor;

      const size = 100 / gridSize;
      pixel.style.width = `${size}%`;
      pixel.style.height = `${size}%`;
      pixel.style.left = `${col * size}%`;
      pixel.style.top = `${row * size}%`;
      pixelGridEl.appendChild(pixel);
    }
  }

  let isActive = false;
  let delayedCall = null;

  const animatePixels = activate => {
    isActive = activate;
    const pixels = pixelGridEl.querySelectorAll('.pixelated-image-card__pixel');
    if (!pixels.length || !gsap) {
      activeEl.style.display = activate ? 'block' : 'none';
      return;
    }

    gsap.killTweensOf(pixels);
    if (delayedCall) delayedCall.kill();

    gsap.set(pixels, { display: 'none' });

    const totalPixels = pixels.length;
    const staggerDuration = animationStepDuration / totalPixels;

    gsap.to(pixels, {
      display: 'block',
      duration: 0,
      stagger: {
        each: staggerDuration,
        from: 'random'
      }
    });

    delayedCall = gsap.delayedCall(animationStepDuration, () => {
      activeEl.style.display = activate ? 'block' : 'none';
      activeEl.style.pointerEvents = activate ? 'none' : '';
    });

    gsap.to(pixels, {
      display: 'none',
      duration: 0,
      delay: animationStepDuration,
      stagger: {
        each: staggerDuration,
        from: 'random'
      }
    });
  };

  const handleEnter = () => {
    if (!isActive) animatePixels(true);
  };
  const handleLeave = () => {
    if (isActive && !once) animatePixels(false);
  };
  const handleClick = () => {
    if (!isActive) animatePixels(true);
    else if (isActive && !once) animatePixels(false);
  };

  if (!isTouchDevice) {
    container.addEventListener('mouseenter', handleEnter);
    container.addEventListener('mouseleave', handleLeave);
    container.addEventListener('focus', handleEnter);
    container.addEventListener('blur', handleLeave);
  } else {
    container.addEventListener('click', handleClick);
  }

  return {
    container,
    animatePixels,
    destroy() {
      if (!isTouchDevice) {
        container.removeEventListener('mouseenter', handleEnter);
        container.removeEventListener('mouseleave', handleLeave);
        container.removeEventListener('focus', handleEnter);
        container.removeEventListener('blur', handleLeave);
      } else {
        container.removeEventListener('click', handleClick);
      }
    }
  };
}

/**
 * Initialize PixelTransition for all elements with [data-pixel-transition].
 */
export function initPixelTransition() {
  const cards = document.querySelectorAll('[data-pixel-transition]');
  cards.forEach(card => {
    const gridSize = parseInt(card.getAttribute('data-grid-size') || '7', 10);
    const pixelColor = card.getAttribute('data-pixel-color') || 'currentColor';
    const duration = parseFloat(card.getAttribute('data-duration') || '0.3');
    const once = card.getAttribute('data-once') === 'true';
    createPixelTransition(card, {
      gridSize,
      pixelColor,
      animationStepDuration: duration,
      once
    });
  });
}

/**
 * Branded Splash Screen Pixel Transition.
 * Orchestrates the full-screen pixel dissolve transition from #splashScreen to the main screen.
 *
 * @param {Object} [options]
 * @param {number} [options.gridSize=12] - Base grid resolution for viewport
 * @param {string} [options.pixelColor] - Color for pixel blocks (defaults to --splash-pixel-color)
 * @param {number} [options.animationStepDuration=0.35] - Half-phase animation duration (seconds)
 */
export async function initSplashPixelTransition(options = {}) {
  const splash = document.getElementById('splashScreen');
  if (!splash) return;

  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const {
    gridSize = 12,
    pixelColor = null,
    animationStepDuration = 0.35
  } = options;

  let isDismissing = false;
  let hasDismissed = false;
  let delayedCall = null;
  let pixelGridEl = null;

  function finishDismissal() {
    if (hasDismissed) return;
    hasDismissed = true;
    window.__splashDismissed = true;

    if (pixelGridEl && pixelGridEl.parentNode) {
      pixelGridEl.parentNode.removeChild(pixelGridEl);
    }
    splash.hidden = true;
    splash.style.display = 'none';
    splash.classList.add('is-hidden');

    // Notify listeners (e.g. splitText ScrollTrigger refresh)
    splash.dispatchEvent(new Event('transitionend'));
    window.dispatchEvent(new CustomEvent('splash:dismissed'));
    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
  }

  async function triggerDismiss() {
    if (hasDismissed) return;
    if (isDismissing) {
      if (gsap && pixelGridEl) {
        gsap.killTweensOf(pixelGridEl.querySelectorAll('.splash-pixel'));
        if (delayedCall) delayedCall.kill();
        finishDismissal();
      }
      return;
    }
    isDismissing = true;

    // Accessibility: immediate dismissal if reduced-motion preferred
    if (isReduced) {
      finishDismissal();
      return;
    }

    const gsapInstance = await ensureGSAP();
    if (!gsapInstance) {
      finishDismissal();
      return;
    }

    const lockup = splash.querySelector('.splash-lockup');

    // Create full-viewport pixel overlay
    pixelGridEl = document.createElement('div');
    pixelGridEl.className = 'splash-pixel-grid';
    pixelGridEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(pixelGridEl);

    // Compute aspect-ratio adjusted grid so pixel blocks remain clean squares
    const aspect = window.innerWidth / (window.innerHeight || 1);
    let cols = gridSize;
    let rows = gridSize;
    if (aspect >= 1) {
      cols = Math.round(gridSize * aspect);
      rows = gridSize;
    } else {
      cols = gridSize;
      rows = Math.round(gridSize / aspect);
    }

    const splashComputed = window.getComputedStyle(splash);
    const resolvedColor = pixelColor ||
      window.getComputedStyle(document.documentElement).getPropertyValue('--splash-pixel-color').trim() ||
      (splashComputed ? splashComputed.backgroundColor : '') ||
      (document.documentElement.getAttribute('data-theme') === 'dark' ? '#0B0F17' : '#FAFBFC');

    const colWidthPct = 100 / cols;
    const rowHeightPct = 100 / rows;

    const frag = document.createDocumentFragment();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const pixel = document.createElement('div');
        pixel.className = 'splash-pixel';
        pixel.style.width = `${colWidthPct + 0.05}%`; // tiny overlap prevents hairline rounding gaps
        pixel.style.height = `${rowHeightPct + 0.05}%`;
        pixel.style.left = `${c * colWidthPct}%`;
        pixel.style.top = `${r * rowHeightPct}%`;
        pixel.style.backgroundColor = resolvedColor;
        frag.appendChild(pixel);
      }
    }
    pixelGridEl.appendChild(frag);

    const pixels = pixelGridEl.querySelectorAll('.splash-pixel');
    const totalPixels = pixels.length;
    const staggerDuration = animationStepDuration / totalPixels;

    // Disable CSS transition on splash screen so it doesn't fight GSAP
    splash.style.transition = 'none';

    // Phase 1: Pixels rapidly pop in randomly to cover the splash screen
    gsapInstance.set(pixels, { display: 'none' });
    gsapInstance.to(pixels, {
      display: 'block',
      duration: 0,
      stagger: {
        each: staggerDuration,
        from: 'random'
      }
    });

    // Midpoint: When pixels cover the screen, switch off splash content and background
    delayedCall = gsapInstance.delayedCall(animationStepDuration, () => {
      if (lockup) {
        lockup.style.display = 'none';
      }
      splash.style.background = 'transparent';
      splash.style.pointerEvents = 'none';
    });

    // Phase 2: Pixels pop out randomly to reveal the main screen underneath
    gsapInstance.to(pixels, {
      display: 'none',
      duration: 0,
      delay: animationStepDuration,
      stagger: {
        each: staggerDuration,
        from: 'random'
      },
      onComplete() {
        finishDismissal();
      }
    });
  }

  // Fast-forward or trigger immediately on user click or Escape key
  function onUserSkip() {
    if (!isDismissing) {
      triggerDismiss();
    } else if (gsap && pixelGridEl) {
      // User clicked during animation: fast-forward to finish
      gsap.killTweensOf(pixelGridEl.querySelectorAll('.splash-pixel'));
      if (delayedCall) delayedCall.kill();
      finishDismissal();
    }
  }

  splash.addEventListener('click', onUserSkip);
  const onKey = e => {
    if (e.key === 'Escape') {
      onUserSkip();
      document.removeEventListener('keydown', onKey);
    }
  };
  document.addEventListener('keydown', onKey);

  // Expose global dismiss hook so inline script or external callers can trigger cleanly
  window.__dismissSplashWithPixelTransition = triggerDismiss;

  return {
    dismiss: triggerDismiss,
    finish: finishDismissal
  };
}
