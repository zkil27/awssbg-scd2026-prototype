/**
 * stackedCards.js
 * --------------------------------------------------------------------------
 * High-fidelity click-to-expand accordion stacked cards for the About page.
 *
 * Motion architecture:
 *   - Unified 0.7s cubic-bezier(0.22, 1, 0.36, 1) Apple-grade deceleration curve.
 *   - In all-collapsed mode: 4 equal prominent panels filling 100% viewport below navbar.
 *   - On click: inactive cards smoothly compress to 64px strips; active card
 *     expands to fit natural content height with graceful opacity reveal.
 *   - Zero gaps to navbar and footer maintained at all times.
 *   - Overflow is strictly clipped during transition to eliminate visual bleed,
 *     then unlocked to auto/visible upon completion for full interactive capability.
 */

let deckContainer = null;
let cards = [];
let hasUserInteracted = false;
let animTimer = null;

const TAB_H = 64; // px (height of compact header strip when expanded)

function getDeck() {
  if (!deckContainer) deckContainer = document.getElementById('aboutStackDeck');
  return deckContainer;
}

function getCards() {
  if (!cards || cards.length === 0) {
    const deck = getDeck();
    if (deck) {
      const found = Array.from(deck.querySelectorAll('.sb-band, .stack-card'));
      cards = Array.from(new Set(found));
    }
  }
  return cards;
}

/** Returns current navbar height in px from CSS custom property */
function getNavH() {
  const deck = getDeck();
  if (!deck) return 76;
  const raw = getComputedStyle(deck).getPropertyValue('--nav-h').trim();
  return parseFloat(raw) || 76;
}

/** Returns available viewport height minus navbar */
function getCollapsedDeckH() {
  return (window.visualViewport?.height ?? window.innerHeight) - getNavH();
}

/**
 * Accurately measures the natural height of a card's body content
 * without triggering visible flashes, layout disruptions, or scoping errors.
 */
function getNaturalBodyHeight(card) {
  const body = card.querySelector('.sb-card-body');
  if (!body) return 0;

  const prevH = body.style.height;
  const prevMaxH = body.style.maxHeight;
  const prevVis = body.style.visibility;
  const prevPos = body.style.position;
  const prevLeft = body.style.left;
  const prevW = body.style.width;

  body.style.position = 'absolute';
  body.style.visibility = 'hidden';
  body.style.height = 'auto';
  body.style.maxHeight = 'none';
  body.style.left = '0';
  body.style.width = '100%';

  const naturalH = body.scrollHeight;

  body.style.position = prevPos;
  body.style.visibility = prevVis;
  body.style.height = prevH;
  body.style.maxHeight = prevMaxH;
  body.style.left = prevLeft;
  body.style.width = prevW;

  return naturalH;
}

/** Updates ARIA and accessibility attributes */
function updateAriaStates() {
  const deck = getDeck();
  const cList = getCards();
  const anyActive = cList.some(c => c.classList.contains('is-active'));

  if (deck) {
    deck.classList.toggle('all-collapsed', !anyActive);
  }

  cList.forEach(card => {
    const isActive = card.classList.contains('is-active');
    card.setAttribute('aria-expanded', String(isActive));
    const tab = card.querySelector('.sb-card-tab');
    if (tab) {
      tab.setAttribute('aria-expanded', String(isActive));
      tab.setAttribute('title', isActive ? 'Click to collapse this section' : 'Click to expand this section');
    }
  });
}

/**
 * Activates a card with a silky-smooth, coordinated 0.7s transition.
 * @param {number} targetIdx
 * @param {boolean} animate - false for instant initial paint
 */
export function activateCard(targetIdx, animate = true) {
  const deck = getDeck();
  const cList = getCards();
  if (!deck || !cList[targetIdx]) return;

  if (animTimer) clearTimeout(animTimer);

  const targetCard = cList[targetIdx];
  const targetBody = targetCard.querySelector('.sb-card-body');
  const naturalBodyH = getNaturalBodyHeight(targetCard);
  const targetActiveH = TAB_H + naturalBodyH;
  const targetTotalDeckH = targetActiveH + (cList.length - 1) * TAB_H;

  if (!animate) {
    // Instant layout application (e.g. for hash deep links on load)
    deck.classList.remove('all-collapsed');
    cList.forEach((c, i) => {
      const isActive = i === targetIdx;
      c.classList.toggle('is-active', isActive);
      c.style.transition = 'none';
      c.style.flex = 'none';
      c.style.height = isActive ? 'auto' : `${TAB_H}px`;

      const tab = c.querySelector('.sb-card-tab');
      if (tab) {
        tab.style.transition = 'none';
        tab.style.flex = 'none';
        tab.style.height = `${TAB_H}px`;
      }

      const body = c.querySelector('.sb-card-body');
      if (body) {
        body.style.transition = 'none';
        body.style.height = isActive ? 'auto' : '0px';
        body.style.opacity = isActive ? '1' : '0';
        body.style.overflow = isActive ? 'visible' : 'hidden';
        body.style.pointerEvents = isActive ? 'auto' : 'none';
      }
    });

    deck.style.transition = 'none';
    deck.style.height = 'auto';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        deck.style.transition = '';
        cList.forEach(c => {
          c.style.transition = '';
          const tab = c.querySelector('.sb-card-tab');
          if (tab) tab.style.transition = '';
          const body = c.querySelector('.sb-card-body');
          if (body) body.style.transition = '';
        });
      });
    });

    updateAriaStates();
    return;
  }

  // 1. Capture current concrete heights before transition starts
  const currentDeckH = deck.offsetHeight;
  const currentBandHeights = cList.map(c => c.offsetHeight);
  const currentTabHeights = cList.map(c => {
    const tab = c.querySelector('.sb-card-tab');
    return tab ? tab.offsetHeight : TAB_H;
  });

  // 2. Lock starting heights explicitly and remove all-collapsed class
  deck.classList.remove('all-collapsed');
  deck.style.height = `${currentDeckH}px`;

  cList.forEach((c, i) => {
    c.style.flex = 'none';
    c.style.height = `${currentBandHeights[i]}px`;
    const tab = c.querySelector('.sb-card-tab');
    if (tab) {
      tab.style.flex = 'none';
      tab.style.height = `${currentTabHeights[i]}px`;
    }

    const b = c.querySelector('.sb-card-body');
    if (b) {
      b.style.overflow = 'hidden';
      b.style.height = `${b.offsetHeight || 0}px`;
      b.style.opacity = getComputedStyle(b).opacity;
    }
  });

  // Force synchronous reflow so starting heights are registered
  void deck.offsetHeight;

  // 3. Mark active and interpolate to target heights
  cList.forEach((c, i) => {
    c.classList.toggle('is-active', i === targetIdx);
  });

  deck.style.height = `${targetTotalDeckH}px`;

  cList.forEach((c, i) => {
    const tab = c.querySelector('.sb-card-tab');
    if (tab) tab.style.height = `${TAB_H}px`;

    const b = c.querySelector('.sb-card-body');
    if (i === targetIdx) {
      c.style.height = `${targetActiveH}px`;
      if (b) {
        b.style.height = `${naturalBodyH}px`;
        b.style.opacity = '1';
        b.style.pointerEvents = 'auto';
      }
    } else {
      c.style.height = `${TAB_H}px`;
      if (b) {
        b.style.height = '0px';
        b.style.opacity = '0';
        b.style.pointerEvents = 'none';
      }
    }
  });

  updateAriaStates();

  // Gentle scroll alignment if user was scrolled down into a previous card
  const deckRect = deck.getBoundingClientRect();
  const navH = getNavH();
  if (deckRect.top < navH) {
    const targetScrollY = window.scrollY + deckRect.top - navH;
    window.scrollTo({
      top: Math.max(0, targetScrollY),
      behavior: 'smooth'
    });
  }

  // 4. On transition end (750ms), unlock active card & deck to auto
  animTimer = setTimeout(() => {
    if (cList.some(c => c.classList.contains('is-active'))) {
      deck.style.height = 'auto';
      targetCard.style.height = 'auto';
      if (targetBody) {
        targetBody.style.height = 'auto';
        targetBody.style.overflow = 'visible';
      }
    }
  }, 750);
}

/**
 * Collapses all cards with a smooth, coordinated 0.7s transition back to full-screen.
 * @param {boolean} animate - false for instant initial paint
 */
export function collapseAll(animate = true) {
  hasUserInteracted = true;
  const deck = getDeck();
  const cList = getCards();
  if (!deck || !cList.length) return;

  if (animTimer) clearTimeout(animTimer);

  const activeIdx = cList.findIndex(c => c.classList.contains('is-active'));
  const targetDeckH = getCollapsedDeckH();
  const targetCardH = targetDeckH / cList.length;

  if (!animate || activeIdx < 0) {
    // Instant or already collapsed
    deck.className = 'about-stacked-deck all-collapsed';
    deck.style.cssText = '';
    cList.forEach(c => {
      c.classList.remove('is-active');
      c.style.cssText = '';
      const tab = c.querySelector('.sb-card-tab');
      if (tab) tab.style.cssText = '';
      const body = c.querySelector('.sb-card-body');
      if (body) body.style.cssText = '';
    });
    updateAriaStates();
    return;
  }

  const activeCard = cList[activeIdx];
  const activeBody = activeCard.querySelector('.sb-card-body');

  // 1. Lock starting values
  const currentDeckH = deck.offsetHeight;
  deck.style.height = `${currentDeckH}px`;

  cList.forEach(c => {
    c.style.flex = 'none';
    c.style.height = `${c.offsetHeight}px`;
    const tab = c.querySelector('.sb-card-tab');
    if (tab) {
      tab.style.flex = 'none';
      tab.style.height = `${tab.offsetHeight}px`;
    }
    const b = c.querySelector('.sb-card-body');
    if (b) {
      b.style.height = `${b.offsetHeight || 0}px`;
      b.style.opacity = getComputedStyle(b).opacity;
      b.style.overflow = 'hidden';
    }
  });

  // Force synchronous reflow
  void deck.offsetHeight;

  // 2. Add all-collapsed and remove active class
  deck.classList.add('all-collapsed');
  cList.forEach(c => c.classList.remove('is-active'));

  deck.style.height = `${targetDeckH}px`;
  if (activeBody) {
    activeBody.style.height = '0px';
    activeBody.style.opacity = '0';
    activeBody.style.pointerEvents = 'none';
  }

  cList.forEach(c => {
    c.style.height = `${targetCardH}px`;
    const tab = c.querySelector('.sb-card-tab');
    if (tab) tab.style.height = `${targetCardH}px`;
  });

  updateAriaStates();

  // 3. On transition end (750ms), restore pure all-collapsed class & clean inline styles
  animTimer = setTimeout(() => {
    deck.className = 'about-stacked-deck all-collapsed';
    deck.style.cssText = '';
    cList.forEach(c => {
      c.style.cssText = '';
      const tab = c.querySelector('.sb-card-tab');
      if (tab) tab.style.cssText = '';
      const body = c.querySelector('.sb-card-body');
      if (body) body.style.cssText = '';
    });
  }, 750);
}

/**
 * Toggles a card: collapses if active, otherwise expands it.
 * @param {number} index
 */
export function toggleCard(index) {
  hasUserInteracted = true;
  const cList = getCards();
  const card = cList[index];
  if (!card) return;

  if (card.classList.contains('is-active')) {
    collapseAll(true);
  } else {
    activateCard(index, true);
  }
}

/** Programmatically activate a card by index */
export function scrollToCard(index) {
  activateCard(index, true);
}

// Expose global helpers immediately
if (typeof window !== 'undefined') {
  window.activateStackedCard = activateCard;
  window.collapseAllStackedCards = collapseAll;
  window.toggleStackedCard = toggleCard;
}

/**
 * Initializes the Stacked Cards deck on the About page.
 */
export function initStackedCards() {
  deckContainer = document.getElementById('aboutStackDeck');
  if (!deckContainer) return;

  const found = Array.from(deckContainer.querySelectorAll('.sb-band, .stack-card'));
  cards = Array.from(new Set(found));

  cards.forEach((card, i) => {
    card.style.setProperty('--card-i', String(i));
    card.style.setProperty('--band-i', String(i));
    card.setAttribute('aria-expanded', 'false');

    const tab = card.querySelector('.sb-card-tab') || card;
    tab.setAttribute('role', 'button');
    tab.setAttribute('tabindex', '0');
    tab.style.cursor = 'pointer';

    tab.addEventListener('click', () => toggleCard(i));

    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCard(i);
      }
    });

  });

  window.activateStackedCard = activateCard;
  window.collapseAllStackedCards = collapseAll;
  window.toggleStackedCard = toggleCard;

  // Check for deep link hash
  const hash = window.location.hash.toLowerCase();
  let initialIndex = -1;
  if (hash.includes('lineup') || hash.includes('speakers')) initialIndex = 1;
  else if (hash.includes('chapters') || hash.includes('network')) initialIndex = 2;
  else if (hash.includes('directors') || hash.includes('leadership')) initialIndex = 3;
  else if (hash.includes('manifesto')) initialIndex = 0;

  if (initialIndex >= 0) {
    activateCard(initialIndex, false);
  } else {
    // Default to clean all-collapsed state
    collapseAll(false);
  }

  // Handle window resize smoothly
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const activeIndex = cards.findIndex(c => c.classList.contains('is-active'));
      if (activeIndex >= 0) {
        activateCard(activeIndex, false);
      } else {
        collapseAll(false);
      }
    }, 120);
  });

  // Handle hashchange for deep links
  window.addEventListener('hashchange', () => {
    const h = window.location.hash.toLowerCase();
    if (h.includes('lineup') || h.includes('speakers')) activateCard(1, true);
    else if (h.includes('chapters') || h.includes('network')) activateCard(2, true);
    else if (h.includes('directors') || h.includes('leadership')) activateCard(3, true);
    else if (h.includes('manifesto')) activateCard(0, true);
    else if (h === '#about' && !hasUserInteracted) collapseAll(false);
  });

  // SPA page routing hook
  const originalShowPage = window.showPage;
  if (typeof originalShowPage === 'function') {
    window.showPage = function (...args) {
      const res = originalShowPage.apply(this, args);
      if (args[0] === 'about') {
        const updateCards = () => {
          const h = window.location.hash.toLowerCase();
          if (h.includes('lineup') || h.includes('speakers')) activateCard(1, false);
          else if (h.includes('chapters') || h.includes('network')) activateCard(2, false);
          else if (h.includes('directors') || h.includes('leadership')) activateCard(3, false);
          else if (h.includes('manifesto')) activateCard(0, false);
          else if (!hasUserInteracted && cards.length > 0) collapseAll(false);
        };
        if (res && typeof res.ready?.then === 'function') {
          res.ready.then(() => requestAnimationFrame(updateCards));
        } else {
          requestAnimationFrame(updateCards);
        }
      }
      return res;
    };
  }
}