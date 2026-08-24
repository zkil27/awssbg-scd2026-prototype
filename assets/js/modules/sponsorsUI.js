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
    if (s.imgUrl) {
        /* The fallback is wired up after render — an inline handler breaks on
           any partner whose name contains an apostrophe. */
        return `
      <div class="sponsor-slot" title="${name}">
        <img src="${escapeHTML(s.imgUrl)}" alt="${name}" data-fallback="${name}" style="max-width:100%; max-height:40px; object-fit:contain;">
      </div>
    `;
    }
    return `<div class="sponsor-slot">${name}</div>`;
}

function wireLogoFallbacks(grid) {
    grid.querySelectorAll('img[data-fallback]').forEach(img => {
        img.addEventListener('error', () => {
            img.parentElement.textContent = img.dataset.fallback;
        }, { once: true });
    });
}

export function initSponsors() {
    const platinumGrid = document.querySelector('.tier-grid.platinum');
    const goldGrid = document.querySelector('.tier-grid.gold');
    const communityGrid = document.querySelector('.tier-grid.community');

    const platinumSponsors = sponsors.filter(s => s.tier === 'platinum');
    const goldSponsors = sponsors.filter(s => s.tier === 'gold');
    const communitySponsors = sponsors.filter(s => s.tier === 'community' || s.tier === 'partner');

    // Only override if data is provided for that tier
    if (platinumGrid && platinumSponsors.length > 0) {
        platinumGrid.innerHTML = platinumSponsors.map(sponsorSlotHTML).join('');
        wireLogoFallbacks(platinumGrid);
    }

    if (goldGrid && goldSponsors.length > 0) {
        goldGrid.innerHTML = goldSponsors.map(sponsorSlotHTML).join('');
        wireLogoFallbacks(goldGrid);
    }

    if (communityGrid && communitySponsors.length > 0) {
        communityGrid.innerHTML = communitySponsors.map(sponsorSlotHTML).join('');
        wireLogoFallbacks(communityGrid);
    }
}
