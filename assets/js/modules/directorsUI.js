/**
 * AWS Student Community Day: South Summit 2026
 * Directors UI Module
 * Renders the organizing committee directors and handles department filtering.
 */

import { directors } from '../data/directors.js';

/**
 * Generate 2-letter monogram initials from a person's full name.
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  if (!name) return 'SCD';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  // First initial and last initial
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Renders a single director card markup.
 * @param {import('../data/directors.js').Director} d
 * @returns {string}
 */
function directorCardHTML(d) {
  const initials = getInitials(d.name);
  const deptLower = d.department.toLowerCase();
  const isAssoc = d.role.toLowerCase().includes('assoc');
  const isSecretary = d.role.toLowerCase().includes('secretary');
  const roleType = isAssoc ? 'ASSOCIATE' : isSecretary ? 'SECRETARY' : 'DIRECTOR';

  const avatarMarkup = d.avatar
    ? `<img class="director-avatar-img" src="${d.avatar}" alt="${d.name}" loading="lazy">`
    : `<div class="director-monogram" aria-hidden="true" style="--dept-accent: var(${d.accentColor || '--blue'});">
         <span class="monogram-text">${initials}</span>
       </div>`;

  return `
    <article class="director-card dept-${deptLower}" data-dept="${deptLower}" aria-label="${d.name}, ${d.role}">
      <div class="director-card-top">
        <span class="director-badge dept-badge-${d.deptTag.toLowerCase()}">${d.deptTag}</span>
        <span class="director-role-badge ${roleType.toLowerCase()}">${roleType}</span>
      </div>

      <div class="director-header-block">
        <div class="director-avatar-frame">
          ${avatarMarkup}
        </div>
        <div class="director-identity">
          <h4 class="director-name">${d.name}</h4>
          <span class="director-role-title">${d.role}</span>
          <span class="director-dept-label">${d.department} Directorate</span>
        </div>
      </div>
    </article>
  `;
}

/**
 * Initialize Directors section and filter navigation.
 */
export function initDirectors() {
  const directorsGrid = document.getElementById('directorsGrid');
  if (!directorsGrid) return;

  // Render cards
  directorsGrid.innerHTML = directors.map(directorCardHTML).join('');

  // Setup department filter tabs if present
  const filterPills = document.querySelectorAll('.director-filter-pill');
  if (filterPills.length > 0) {
    filterPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const target = pill.getAttribute('data-target') || 'all';

        // Update active tab state
        filterPills.forEach((p) => {
          p.classList.remove('active');
          p.setAttribute('aria-selected', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-selected', 'true');

        // Filter cards
        const cards = directorsGrid.querySelectorAll('.director-card');
        cards.forEach((card) => {
          const cardDept = card.getAttribute('data-dept');
          if (target === 'all' || cardDept === target) {
            card.classList.remove('is-filtered-out');
            card.removeAttribute('hidden');
          } else {
            card.classList.add('is-filtered-out');
            card.setAttribute('hidden', '');
          }
        });
      });
    });
  }
}
