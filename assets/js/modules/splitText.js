/**
 * AWS Student Community Day: South Summit 2026
 * SplitText Animation Module (React Bits Port)
 * Splits text into lines and orchestrates scroll-triggered GSAP entrance animations.
 */

const GSAP_CDN = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm';
const SCROLL_TRIGGER_CDN = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger/+esm';

let gsap = window.gsap || null;
let ScrollTrigger = window.ScrollTrigger || null;

/**
 * Ensure GSAP and ScrollTrigger are loaded and registered.
 */
async function ensureGSAP() {
  if (window.gsap && window.ScrollTrigger) {
    gsap = window.gsap;
    ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    return { gsap, ScrollTrigger };
  }

  if (window.gsap && !window.ScrollTrigger) {
    gsap = window.gsap;
    try {
      const modST = await import(/* @vite-ignore */ SCROLL_TRIGGER_CDN);
      ScrollTrigger = modST.ScrollTrigger || modST.default || modST;
      window.ScrollTrigger = ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    } catch (err) {
      console.warn('[SplitText] Failed to load ScrollTrigger from CDN:', err);
    }
  }

  try {
    const [modGSAP, modST] = await Promise.all([
      import(/* @vite-ignore */ GSAP_CDN),
      import(/* @vite-ignore */ SCROLL_TRIGGER_CDN)
    ]);
    gsap = modGSAP.gsap || modGSAP.default || modGSAP;
    ScrollTrigger = modST.ScrollTrigger || modST.default || modST;
    window.gsap = gsap;
    window.ScrollTrigger = ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    return { gsap, ScrollTrigger };
  } catch (err) {
    console.warn('[SplitText] Failed to load GSAP/ScrollTrigger from CDN:', err);
    return null;
  }
}

/**
 * Safely wrap text nodes into .split-word spans while preserving
 * child inline elements (e.g. <span class="accent">, <strong>, <em>, <a>).
 */
function wrapWordSpans(el) {
  const words = [];

  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!text || !text.trim()) return node;

      const tokens = text.split(/(\s+)/);
      const frag = document.createDocumentFragment();

      for (const token of tokens) {
        if (!token) continue;
        if (/^\s+$/.test(token)) {
          frag.appendChild(document.createTextNode(token));
        } else {
          const span = document.createElement('span');
          span.className = 'split-word';
          span.textContent = token;
          words.push(span);
          frag.appendChild(span);
        }
      }
      return frag;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      if (['svg', 'canvas', 'script', 'style', 'path', 'img', 'br'].includes(tag)) {
        return node;
      }

      const children = Array.from(node.childNodes);
      children.forEach(child => {
        const replacement = processNode(child);
        if (replacement && replacement !== child) {
          node.replaceChild(replacement, child);
        }
      });
      return node;
    }
    return node;
  }

  const childNodes = Array.from(el.childNodes);
  childNodes.forEach(child => {
    const replacement = processNode(child);
    if (replacement && replacement !== child) {
      el.replaceChild(replacement, child);
    }
  });

  return words;
}

/**
 * Split an element into visual lines by grouping words according to their
 * rendered vertical offset, wrapping each line into a .split-line span.
 */
export function splitIntoLines(el) {
  if (el.dataset.splitDone) {
    return Array.from(el.querySelectorAll('.split-line'));
  }

  const words = wrapWordSpans(el);
  if (!words.length) {
    el.dataset.splitDone = 'true';
    return [];
  }

  // Group words into lines according to bounding rect tops
  const linesMap = new Map();
  words.forEach(w => {
    const top = Math.round(w.getBoundingClientRect().top);
    let matchedKey = null;
    for (const key of linesMap.keys()) {
      if (Math.abs(key - top) <= 6) {
        matchedKey = key;
        break;
      }
    }
    if (matchedKey !== null) {
      linesMap.get(matchedKey).push(w);
    } else {
      linesMap.set(top, [w]);
    }
  });

  const lineGroups = Array.from(linesMap.values());
  const topNodes = Array.from(el.childNodes);
  const createdLines = [];

  let currentLineIdx = 0;
  let currentLineWrapper = document.createElement('span');
  currentLineWrapper.className = 'split-line';
  createdLines.push(currentLineWrapper);

  topNodes.forEach(node => {
    const wordInside = node.nodeType === 1
      ? (node.classList.contains('split-word') ? node : node.querySelector('.split-word'))
      : null;

    if (wordInside) {
      const lineIdx = lineGroups.findIndex(grp => grp.includes(wordInside));
      if (lineIdx !== -1 && lineIdx !== currentLineIdx) {
        currentLineIdx = lineIdx;
        currentLineWrapper = document.createElement('span');
        currentLineWrapper.className = 'split-line';
        createdLines.push(currentLineWrapper);
      }
    }
    currentLineWrapper.appendChild(node);
  });

  // Re-attach grouped line elements into parent
  createdLines.forEach(line => el.appendChild(line));

  el.dataset.splitDone = 'true';
  el.classList.add('split-parent');
  return createdLines;
}

/**
 * Filter out navigation, interactive buttons, live timers, and system HUDs.
 */
function isExcluded(el) {
  if (!el || !el.textContent || !el.textContent.trim()) return true;

  const excludedAncestor = el.closest(
    '.nav, #siteNav, .staggered-menu-panel, .sm-toggle, .dock, .dock-inner, ' +
    '.assistive-hud, .assistive-hud-wrap, #assistiveTouch, button, .btn, ' +
    '#countdown, .cd-digit, .cd-num, .cd-label, #splashScreen, svg, ' +
    '.chip, .badge, .schedule-pill, .sm-panel-itemWrap, .sm-socials-item, ' +
    '.sb-card-tab, .sb-card-label, .about-stacked-deck .sb-card-tab'
  );

  return Boolean(excludedAncestor);
}

/**
 * Check if an element is currently in the visible layout (has layout box).
 */
function isRendered(el) {
  return Boolean(el.offsetParent !== null || el.getClientRects().length > 0);
}

let pendingSplashAnimations = [];
let splashDoneListenerAttached = false;
let splashDoneExecuted = false;

/**
 * Checks if the branded splash screen is currently active and visible.
 */
function isSplashActive() {
  if (window.__splashDismissed || splashDoneExecuted) return false;
  const splash = document.getElementById('splashScreen');
  return Boolean(
    splash &&
    !splash.hidden &&
    !splash.classList.contains('is-hidden') &&
    splash.style.display !== 'none'
  );
}

/**
 * Flushes all pending text animations once the splash screen is fully dismissed.
 */
function onSplashDone() {
  if (splashDoneExecuted) return;
  splashDoneExecuted = true;
  window.__splashDismissed = true;

  requestAnimationFrame(() => {
    const toRun = pendingSplashAnimations.slice();
    pendingSplashAnimations = [];

    toRun.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.warn('[SplitText] Error executing pending animation:', err);
      }
    });

    if (ScrollTrigger) {
      ScrollTrigger.refresh();
    }
  });
}

/**
 * Queues an animation trigger function until the splash screen is dismissed.
 */
function queueAnimationUntilSplashDone(fn) {
  pendingSplashAnimations.push(fn);

  if (!splashDoneListenerAttached) {
    splashDoneListenerAttached = true;

    window.addEventListener('splash:dismissed', onSplashDone, { once: true });

    const splash = document.getElementById('splashScreen');
    if (splash) {
      splash.addEventListener('transitionend', onSplashDone, { once: true });
    }

    // Safety fallback: ensure text animations play even if splash dismissal events fail
    setTimeout(onSplashDone, 3000);
  }
}

/**
 * Animate a single element using the SplitText configuration.
 */
export function animateElement(el, options = {}) {
  const {
    delay = 80,
    duration = 0.7,
    ease = 'power3.out',
    splitType = 'lines',
    from = { opacity: 0, y: 40 },
    to = { opacity: 1, y: 0 },
    threshold = 0.1,
    rootMargin = '-100px',
    onComplete
  } = options;

  let targets = [];
  if (splitType === 'lines') {
    targets = splitIntoLines(el);
  } else {
    targets = wrapWordSpans(el);
    el.dataset.splitDone = 'true';
    el.classList.add('split-parent');
  }

  if (!targets.length) return null;

  // Set initial state immediately to avoid any flash of unstyled content
  gsap.set(targets, { ...from, willChange: 'transform, opacity', force3D: true });

  const startAnimation = () => {
    if (el._animationStarted) return el._splitTween || null;
    el._animationStarted = true;

    const startPct = (1 - threshold) * 100;
    const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
    const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
    const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
    const sign =
      marginValue === 0
        ? ''
        : marginValue < 0
          ? `-=${Math.abs(marginValue)}${marginUnit}`
          : `+=${marginValue}${marginUnit}`;
    const start = `top ${startPct}%${sign}`;

    const tween = gsap.fromTo(
      targets,
      { ...from },
      {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        scrollTrigger: {
          trigger: el,
          start,
          once: true,
          fastScrollEnd: true,
          anticipatePin: 0.4
        },
        onComplete: () => {
          el._animationCompleted = true;
          if (typeof onComplete === 'function') onComplete();
        },
        willChange: 'transform, opacity',
        force3D: true
      }
    );

    el._splitTween = tween;
    return tween;
  };

  if (isSplashActive()) {
    queueAnimationUntilSplashDone(startAnimation);
    return null;
  }

  return startAnimation();
}

let showPageWrapped = false;
let savedOptions = {};

/**
 * Scan DOM and register SplitText animations on visible text elements.
 */
function scanAndAnimate(options) {
  const candidates = document.querySelectorAll(
    'h1, h2, h3, h4, h5, h6, p, blockquote, .quote-text, .quote-author'
  );

  candidates.forEach(el => {
    if (!isExcluded(el) && isRendered(el) && !el.dataset.splitDone) {
      animateElement(el, options);
    }
  });
}

/**
 * Wrap window.showPage to initialize text animations on newly visible pages.
 */
function wrapShowPage() {
  if (showPageWrapped) return;
  const original = window.showPage;
  if (typeof original !== 'function') return;

  window.showPage = function wrappedShowPage(...args) {
    const result = original.apply(this, args);
    const onReady = () => {
      // Elements on the target page now have layout; scan and split them
      scanAndAnimate(savedOptions);
      if (ScrollTrigger) {
        ScrollTrigger.refresh();
      }
    };

    if (result && typeof result.ready?.then === 'function') {
      result.ready.then(() => requestAnimationFrame(onReady));
    } else {
      requestAnimationFrame(onReady);
    }
    return result;
  };
  showPageWrapped = true;
}

/**
 * Main initialization entry point for SplitText animations.
 */
export async function initSplitText(config = {}) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    return;
  }

  const loaded = await ensureGSAP();
  if (!loaded || !gsap || !ScrollTrigger) {
    console.warn('[SplitText] GSAP or ScrollTrigger could not be initialized.');
    return;
  }

  // Ensure fonts are loaded before splitting lines to guarantee precise line wrapping
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (_) {}
  }

  if (window.__lenis) {
    window.__lenis.on('scroll', ScrollTrigger.update);
  }

  savedOptions = {
    delay: 80,
    duration: 0.7,
    ease: 'power3.out',
    splitType: 'lines',
    from: { opacity: 0, y: 40 },
    to: { opacity: 1, y: 0 },
    threshold: 0.1,
    rootMargin: '-100px',
    ...config
  };

  scanAndAnimate(savedOptions);
  wrapShowPage();
}

/**
 * Refresh ScrollTrigger calculations or scan for newly injected DOM elements.
 */
export function refreshSplitText() {
  scanAndAnimate(savedOptions);
  if (ScrollTrigger) {
    ScrollTrigger.refresh();
  }
}
