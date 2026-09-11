/**
 * Sponsors UI Module
 * AWS Student Community Day: South Summit 2026
 * Pure editorial layout: Quantum, Pro, and Lite Partner tiers
 */
import { sponsors } from '../data/sponsors.js';

function escapeHTML(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function renderQuantumSlot(s) {
  const name = escapeHTML(s.name || '');
  const color = s.color || 'purple';
  const logoSrc = escapeHTML(s.imgUrl || 'assets/images/south-summit-logo.svg');

  return `
    <article class="sponsor-card sponsor-card-quantum color-${color}" data-reveal>
      <div class="sponsor-logo-frame">
        <img class="sponsor-logo"
             src="${logoSrc}"
             alt="${name}"
             loading="lazy"
             onerror="this.onerror=null;this.src='assets/images/south-summit-logo.svg';">
      </div>
      <h3 class="sponsor-name">${name}</h3>
    </article>`;
}

function renderVenueSlot(s) {
  const name = escapeHTML(s.name || '');
  const color = s.color || 'orange';
  const logoSrc = escapeHTML(s.imgUrl || 'assets/images/south-summit-logo.svg');

  return `
    <article class="sponsor-card sponsor-card-venue color-${color}" data-reveal>
      <div class="sponsor-logo-frame">
        <img class="sponsor-logo"
             src="${logoSrc}"
             alt="${name}"
             loading="lazy"
             onerror="this.onerror=null;this.src='assets/images/south-summit-logo.svg';">
      </div>
      <h3 class="sponsor-name">${name}</h3>
    </article>`;
}

function renderProSlot(s) {
  const name = escapeHTML(s.name || '');
  const color = s.color || 'green';
  const logoSrc = escapeHTML(s.imgUrl || 'assets/images/south-summit-logo.svg');

  return `
    <article class="sponsor-card sponsor-card-pro color-${color}" data-reveal>
      <div class="sponsor-logo-frame">
        <img class="sponsor-logo"
             src="${logoSrc}"
             alt="${name}"
             loading="lazy"
             onerror="this.onerror=null;this.src='assets/images/south-summit-logo.svg';">
      </div>
      <h4 class="sponsor-name">${name}</h4>
    </article>`;
}

function renderLiteSlot(s) {
  const name = escapeHTML(s.name || '');
  const color = s.color || 'blue';
  const logoSrc = escapeHTML(s.imgUrl || 'assets/images/south-summit-logo.svg');

  return `
    <article class="sponsor-card sponsor-card-lite color-${color}" data-reveal>
      <div class="sponsor-logo-frame">
        <img class="sponsor-logo"
             src="${logoSrc}"
             alt="${name}"
             loading="lazy"
             onerror="this.onerror=null;this.src='assets/images/south-summit-logo.svg';">
      </div>
      <h4 class="sponsor-name">${name}</h4>
    </article>`;
}

function wireLogoFallbacks(container) {
  container.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      img.src = 'assets/images/south-summit-logo.svg';
    }, { once: true });
  });
}

export function initSponsors() {
  const quantumStage = document.querySelector('.tier-stage.quantum');
  const venueStage = document.querySelector('.tier-stage.venue');
  const proStage = document.querySelector('.tier-stage.pro, .pro-cards-grid');
  const liteStage = document.querySelector('.tier-stage.lite, .chapter-ledger-grid');

  const quantumSponsors = sponsors.filter(s => s.tier === 'quantum');
  const venueSponsors = sponsors.filter(s => s.tier === 'venue');
  const proSponsors = sponsors.filter(s => s.tier === 'pro');
  const liteSponsors = sponsors.filter(s => s.tier === 'lite');

  if (quantumStage && quantumSponsors.length > 0) {
    quantumStage.innerHTML = quantumSponsors.map(renderQuantumSlot).join('');
    wireLogoFallbacks(quantumStage);
  }

  if (venueStage && venueSponsors.length > 0) {
    venueStage.innerHTML = venueSponsors.map(renderVenueSlot).join('');
    wireLogoFallbacks(venueStage);
  }

  if (proStage && proSponsors.length > 0) {
    proStage.innerHTML = proSponsors.map(renderProSlot).join('');
    wireLogoFallbacks(proStage);
  }

  if (liteStage && liteSponsors.length > 0) {
    liteStage.innerHTML = liteSponsors.map(renderLiteSlot).join('');
    wireLogoFallbacks(liteStage);
  }
}
