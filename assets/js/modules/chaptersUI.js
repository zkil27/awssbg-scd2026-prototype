/**
 * Chapters UI Module
 * Renders the participating AWS Student Builder Group chapter cards.
 */
import { chapters } from '../data/chapters.js';

function chapterCardHTML(c) {
    const name = c.name || 'AWS Student Builder Group';
    const university = c.university || c.uni || 'CALABARZON Campus';
    // '#' + target=_blank opened a duplicate tab, so leave those as plain icons
    const social = (url, label, icon) => {
        const live = url && url !== '#';
        return live
            ? `<a href="${url}" target="_blank" rel="noopener" aria-label="${label}">
          <svg width="14" height="14"><use href="#${icon}"></use></svg>
        </a>`
            : `<span class="chapter-social-soon" aria-label="${label} — coming soon">
          <svg width="14" height="14"><use href="#${icon}"></use></svg>
        </span>`;
    };

    return `
    <div class="chapter-card">
      <div class="mark">
        <img class="chip" src="assets/images/south-summit-logo.svg" alt="${name}">
      </div>
      <div>
        <h5>${name}</h5>
        <span>${university}</span>
      </div>
      <div class="chapter-socials">
        ${social(c.facebookUrl, `${name} Facebook`, 'fb-icon')}
        ${social(c.linkedInUrl, `${name} LinkedIn`, 'li-icon')}
      </div>
    </div>
  `;
}

export function initChapters() {
    const chapterGrid = document.getElementById('chapterGrid');
    if (!chapterGrid) return;

    chapterGrid.innerHTML = chapters.map(chapterCardHTML).join('');
}
