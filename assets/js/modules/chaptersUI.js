/**
 * Chapters UI Module
 * Renders the participating AWS Student Builder Group chapter cards.
 */
import { chapters } from '../data/chapters.js';

function chapterCardHTML(c) {
    const name = c.name || 'AWS Student Builder Group';
    const university = c.university || c.uni || 'CALABARZON Campus';
    const fbUrl = c.facebookUrl || '#';
    const liUrl = c.linkedInUrl || '#';

    return `
    <div class="chapter-card">
      <div class="mark">
        <img class="chip" src="assets/South%20Summit%20logo.svg" alt="${name}">
      </div>
      <div>
        <h5>${name}</h5>
        <span>${university}</span>
      </div>
      <div class="chapter-socials">
        <a href="${fbUrl}" target="_blank" rel="noopener" aria-label="${name} Facebook">
          <svg width="14" height="14"><use href="#fb-icon"></use></svg>
        </a>
        <a href="${liUrl}" target="_blank" rel="noopener" aria-label="${name} LinkedIn">
          <svg width="14" height="14"><use href="#li-icon"></use></svg>
        </a>
      </div>
    </div>
  `;
}

export function initChapters() {
    const chapterGrid = document.getElementById('chapterGrid');
    if (!chapterGrid) return;

    chapterGrid.innerHTML = chapters.map(chapterCardHTML).join('');
}
