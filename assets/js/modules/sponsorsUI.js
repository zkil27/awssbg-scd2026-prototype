/**
 * Sponsors UI Module
 * AWS Student Community Day: South Summit 2026
 * Option 3: Hero Showcase (Spotlight Keystone Cards) + Infinite Marquee Stream
 */
import { sponsors } from '../data/sponsors.js';

function escapeHTML(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function renderHeroCard(s) {
  const name = escapeHTML(s.name || '');
  const color = s.color || 'purple';
  const logoSrc = escapeHTML(s.imgUrl || 'assets/images/south-summit-logo.svg');
  const darkLogoSrc = s.imgDarkUrl ? escapeHTML(s.imgDarkUrl) : null;
  const tierTagLabel = s.tier === 'quantum' ? 'QUANTUM SPONSOR' : 'VENUE PARTNER';

  const logoMarkup = darkLogoSrc ? `
          <img class="hero-logo hero-logo--theme-light"
               src="${logoSrc}"
               alt="${name}"
               loading="lazy"
               onerror="this.onerror=null;this.src='assets/images/south-summit-logo.svg';">
          <img class="hero-logo hero-logo--theme-dark"
               src="${darkLogoSrc}"
               alt="${name}"
               loading="lazy"
               onerror="this.onerror=null;this.src='assets/images/south-summit-logo.svg';">
  ` : `
          <img class="hero-logo"
               src="${logoSrc}"
               alt="${name}"
               loading="lazy"
               onerror="this.onerror=null;this.src='assets/images/south-summit-logo.svg';">
  `;

  return `
    <article class="sponsors-hero-card color-${color}" data-card-color="${color}" data-reveal>
      <div class="hero-card-spotlight" aria-hidden="true"></div>
      <div class="hero-card-top">
        <span class="hero-tier-tag ${s.tier}">${tierTagLabel}</span>
      </div>
      <div class="hero-card-media">
        <div class="hero-logo-frame ${s.tier === 'venue' ? 'emblem' : ''}">
${logoMarkup}
        </div>
      </div>
      <div class="hero-card-body">
        <h3 class="hero-card-title">${name}</h3>
      </div>
    </article>`;
}

function renderMarqueeChip(partner) {
  const name = escapeHTML(partner.name || '');
  const color = partner.color || 'blue';
  const logoSrc = escapeHTML(partner.imgUrl || 'assets/images/south-summit-logo.svg');

  return `
    <div class="marquee-chip chip-${color}" tabindex="0" role="listitem">
      <div class="marquee-chip-logo-wrap">
        <img class="marquee-chip-logo"
             src="${logoSrc}"
             alt="${name}"
             loading="lazy"
             onerror="this.onerror=null;this.src='assets/images/south-summit-logo.svg';">
      </div>
      <div class="marquee-chip-meta">
        <span class="marquee-chip-name">${name}</span>
      </div>
    </div>`;
}

function initSpotlightEffect() {
  const cards = document.querySelectorAll('.sponsors-hero-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
    });
  });
}

function wireLogoFallbacks(container) {
  if (!container) return;
  container.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      img.src = 'assets/images/south-summit-logo.svg';
    }, { once: true });
  });
}

export function initSponsors() {
  const heroGrid = document.getElementById('sponsorsHeroGrid');
  const track1 = document.getElementById('marqueeTrack1');
  const track2 = document.getElementById('marqueeTrack2');

  const headlineSponsors = sponsors.filter(s => s.tier === 'quantum' || s.tier === 'venue');
  const networkPartners = sponsors.filter(s => s.tier === 'pro' || s.tier === 'lite');

  // 1. Render Hero Showcase Cards if container exists
  if (heroGrid && headlineSponsors.length > 0) {
    heroGrid.innerHTML = headlineSponsors.map(renderHeroCard).join('');
    wireLogoFallbacks(heroGrid);
    initSpotlightEffect();
  }

  // 2. Populate and duplicate Marquee tracks for seamless loop
  if (track1 && track2 && networkPartners.length > 0) {
    const half = Math.ceil(networkPartners.length / 2);
    const track1List = networkPartners.slice(0, half);
    const track2List = networkPartners.slice(half);

    // Render items and duplicate once to enable seamless 50% translation infinite loop
    const track1HTML = track1List.map(renderMarqueeChip).join('');
    const track2HTML = track2List.map(renderMarqueeChip).join('');

    track1.innerHTML = track1HTML + track1HTML;
    track2.innerHTML = track2HTML + track2HTML;

    wireLogoFallbacks(track1);
    wireLogoFallbacks(track2);
  }
}

