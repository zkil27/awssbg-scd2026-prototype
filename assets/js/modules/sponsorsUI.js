/**
 * Sponsors UI Module
 * Renders sponsor tiers (Platinum, Gold, Community) from sponsors data.
 */
import { sponsors } from '../data/sponsors.js';

function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function sponsorSlotHTML(s) {
    const name = escapeHTML(s.name || 'Partner');

    // Open / prospective slot — the tier still has room. A CTA-flavored slot
    // (e.g. Platinum "+ Become a Sponsor") reads a little louder than a plain
    // named placeholder chapter.
    if (s.open) {
        if (s.cta) {
            return `
      <div class="sponsor-slot open-slot">
        <div class="slot-inner">
          <span class="slot-badge">${escapeHTML(s.cta)}</span>
          <p>${name}</p>
        </div>
      </div>`;
        }
        return `
      <div class="sponsor-slot open-slot">
        <div class="slot-inner"><span>${name}</span></div>
      </div>`;
    }

    // Confirmed partner with a logo — featured partners get the emphasized
    // "active" treatment (logo chip + name + role, left-aligned).
    const roleHTML = s.role ? `<span>${escapeHTML(s.role)}</span>` : '';
    if (s.imgUrl) {
        return `
      <div class="sponsor-slot${s.featured ? ' active-sponsor' : ''}" title="${name}">
        <div class="sponsor-logo-wrap">
          <img src="${escapeHTML(s.imgUrl)}" alt="${name}" data-fallback="${name}" class="sponsor-logo">
        </div>
        <div class="sponsor-info">
          <strong>${name}</strong>
          ${roleHTML}
        </div>
      </div>`;
    }

    // Confirmed partner without a logo — name (+ role) as a simple info block.
    return `
      <div class="sponsor-slot${s.featured ? ' active-sponsor' : ''}">
        <div class="sponsor-info">
          <strong>${name}</strong>
          ${roleHTML}
        </div>
      </div>`;
}

function wireLogoFallbacks(grid) {
    grid.querySelectorAll('img[data-fallback]').forEach(img => {
        img.addEventListener('error', () => {
            // Swap a broken logo for the standard brand mark so the slot keeps
            // its editorial shape (logo chip + name) instead of collapsing.
            img.src = 'assets/images/south-summit-logo.svg';
        }, { once: true });
    });
}

export function initSponsors() {
    const quantumGrid = document.querySelector('.tier-grid.quantum, .tier-grid.platinum');
    const clusterGrid = document.querySelector('.tier-grid.cluster, .tier-grid.gold');
    const coreGrid = document.querySelector('.tier-grid.core, .tier-grid.community');

    const quantumSponsors = sponsors.filter(s => s.tier === 'quantum' || s.tier === 'platinum');
    const clusterSponsors = sponsors.filter(s => s.tier === 'cluster' || s.tier === 'gold');
    const coreSponsors = sponsors.filter(s => s.tier === 'core' || s.tier === 'community' || s.tier === 'partner');

    // Only override if data is provided for that tier
    if (quantumGrid && quantumSponsors.length > 0) {
        quantumGrid.innerHTML = quantumSponsors.map(sponsorSlotHTML).join('');
        wireLogoFallbacks(quantumGrid);
    }

    if (clusterGrid && clusterSponsors.length > 0) {
        clusterGrid.innerHTML = clusterSponsors.map(sponsorSlotHTML).join('');
        wireLogoFallbacks(clusterGrid);
    }

    if (coreGrid && coreSponsors.length > 0) {
        coreGrid.innerHTML = coreSponsors.map(sponsorSlotHTML).join('');
        wireLogoFallbacks(coreGrid);
    }
}
