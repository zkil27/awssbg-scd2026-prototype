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
  const name = escapeHTML(s.name || 'AWS Cloud Clubs Philippines');
  const role = escapeHTML(s.role || 'Official Organizing Partner');
  const desc = escapeHTML(s.description || '');
  const metaRows = (s.meta || []).map(m => `
    <div class="organizer-meta-row">
      <span class="meta-label">${escapeHTML(m.label)}</span>
      <span class="meta-value">${escapeHTML(m.value)}</span>
    </div>
  `).join('');

  const urlLink = s.url
    ? `<a href="${escapeHTML(s.url)}" target="_blank" rel="noopener" class="editorial-link">
         <span>Learn about AWS Cloud Clubs</span>
         <svg class="editorial-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
           <path d="M7 17L17 7M17 7H7M17 7V17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>
       </a>`
    : '';

  return `
    <div class="organizer-feature-card color-purple" data-reveal>
      <div class="organizer-media">
        <div class="organizer-logo-frame">
          <img src="${escapeHTML(s.imgUrl || 'assets/images/south-summit-logo.svg')}"
               alt="${name}"
               data-fallback="${name}"
               class="organizer-logo">
        </div>
      </div>
      <div class="organizer-content">
        <div class="organizer-label-row">
          <span class="editorial-mono-tag">${role}</span>
          <span class="editorial-mono-num">01</span>
        </div>
        <h3 class="organizer-title">${name}</h3>
        <p class="organizer-bio">${desc}</p>
        ${metaRows ? `<div class="organizer-meta-table">${metaRows}</div>` : ''}
        ${urlLink ? `<div class="organizer-action">${urlLink}</div>` : ''}
      </div>
    </div>`;
}

function renderProSlot(s, i) {
  const name = escapeHTML(s.name || '');
  const role = escapeHTML(s.role || 'Pro Partner');
  const institution = escapeHTML(s.institution || '');
  const desc = escapeHTML(s.description || '');
  const track = escapeHTML(s.track || '');
  const location = escapeHTML(s.location || '');
  const color = s.color || 'green';
  const indexNum = String(i + 1).padStart(2, '0');

  const urlLink = s.url
    ? `<a href="${escapeHTML(s.url)}" target="_blank" rel="noopener" class="pro-card-link" aria-label="Visit ${name}">
         <svg class="editorial-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
           <path d="M7 17L17 7M17 7H7M17 7V17" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>
       </a>`
    : '';

  return `
    <article class="pro-card-editorial color-${color}" data-reveal>
      <div class="pro-card-masthead">
        <div class="pro-card-tags">
          <span class="pro-card-index">${indexNum}</span>
          <span class="pro-card-badge">${role}</span>
        </div>
        ${urlLink}
      </div>
      <div class="pro-card-main">
        <h4 class="pro-card-name">${name}</h4>
        ${institution ? `<span class="pro-card-institution">${institution}</span>` : ''}
        ${desc ? `<p class="pro-card-desc">${desc}</p>` : ''}
      </div>
      <div class="pro-card-foot">
        ${track ? `<span class="pro-card-track">${track}</span>` : ''}
        ${location ? `<span class="pro-card-location">${location}</span>` : ''}
      </div>
    </article>`;
}

function renderLiteSlot(s, i) {
  const name = escapeHTML(s.name || '');
  const role = escapeHTML(s.role || 'Student Chapter');
  const institution = escapeHTML(s.institution || s.description || '');
  const location = escapeHTML(s.location || '');
  const color = s.color || 'blue';
  const indexNum = String(i + 1).padStart(2, '0');

  return `
    <article class="chapter-ledger-card color-${color}" data-reveal>
      <div class="chapter-card-masthead">
        <span class="chapter-index">${indexNum}</span>
        <span class="chapter-badge">${role}</span>
      </div>
      <div class="chapter-card-main">
        <h4 class="chapter-name">${name}</h4>
        <p class="chapter-institution">${institution}</p>
      </div>
      <div class="chapter-card-meta">
        <span class="chapter-accent-indicator" aria-hidden="true"></span>
        <span class="chapter-location">${location}</span>
      </div>
    </article>`;
}

function wireLogoFallbacks(container) {
  container.querySelectorAll('img[data-fallback]').forEach(img => {
    img.addEventListener('error', () => {
      img.src = 'assets/images/south-summit-logo.svg';
    }, { once: true });
  });
}

export function initSponsors() {
  const quantumStage = document.querySelector('.tier-stage.quantum');
  const proStage = document.querySelector('.tier-stage.pro, .pro-cards-grid');
  const liteStage = document.querySelector('.tier-stage.lite, .chapter-ledger-grid');

  const quantumSponsors = sponsors.filter(s => s.tier === 'quantum');
  const proSponsors = sponsors.filter(s => s.tier === 'pro');
  const liteSponsors = sponsors.filter(s => s.tier === 'lite');

  if (quantumStage && quantumSponsors.length > 0) {
    quantumStage.innerHTML = quantumSponsors.map(renderQuantumSlot).join('');
    wireLogoFallbacks(quantumStage);
  }

  if (proStage && proSponsors.length > 0) {
    proStage.innerHTML = proSponsors.map((s, idx) => renderProSlot(s, idx)).join('');
    wireLogoFallbacks(proStage);
  }

  if (liteStage && liteSponsors.length > 0) {
    liteStage.innerHTML = liteSponsors.map((s, idx) => renderLiteSlot(s, idx)).join('');
    wireLogoFallbacks(liteStage);
  }
}
