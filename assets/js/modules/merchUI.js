/**
 * Merch UI Module
 * Renders the merch cards rail, interactive spotlight zoom, and mode switching.
 */
import { merchItems } from '../data/merch.js';

const colors = ['blue', 'green', 'pink'];

let merchExplorer, merchRail, merchSpotlight;
let merchActive = -1;

function merchCardHTML(m, i) {
    const color = colors[i % colors.length];
    const name = m.name || `Merch Item ${i + 1}`;
    const graphic = m.imgUrl
        ? `<img src="${m.imgUrl}" alt="${name}" style="max-width:100%; max-height:100%; object-fit:contain;">`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="#0B1526" stroke-width="1.4">${m.icon || ''}</svg>`;

    return `
    <button type="button" class="merch-card ${color}" data-merch-index="${i}" aria-pressed="false">
      <div class="stair"><span class="c1"></span><span class="c2"></span></div>
      <div class="merch-top">
        <img class="chip" src="assets/South%20Summit%20logo.svg" alt="South Summit 2026">
        <span class="merch-badge">SOON</span>
      </div>
      <div class="merch-icon">
        ${graphic}
      </div>
      <div class="merch-body">
        <h5>${name}</h5>
        <span>Coming soon</span>
      </div>
    </button>
  `;
}

function merchSpotlightHTML(m, index) {
    const color = colors[index % colors.length];
    const name = m.name || 'Merch Item';
    const blurb = m.blurb || 'Details coming soon.';
    const graphic = m.imgUrl
        ? `<img src="${m.imgUrl}" alt="${name}" style="max-width:120px; max-height:120px; object-fit:contain;">`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="#0B1526" stroke-width="1.4">${m.icon || ''}</svg>`;

    return `
    <div class="merch-spotlight-card ${color}">
      <div class="stair"><span class="c1"></span><span class="c2"></span><span class="c3"></span></div>
      <div class="merch-spotlight-top">
        <img class="chip" src="assets/South%20Summit%20logo.svg" alt="South Summit 2026">
        <span class="merch-badge">SOON</span>
      </div>
      <div class="merch-spotlight-icon">
        ${graphic}
      </div>
      <div class="merch-spotlight-body">
        <h3>${name}</h3>
        <p>${blurb}</p>
        <span>Coming soon · SCD South Summit 2026</span>
      </div>
      <button type="button" class="merch-spotlight-close btn btn-ghost" id="merchCloseFocus">Show all</button>
    </div>
  `;
}

export function clearMerchFocus() {
    if (!merchExplorer || !merchSpotlight || !merchRail) return;
    merchActive = -1;
    merchExplorer.dataset.mode = 'grid';
    merchSpotlight.classList.remove('is-visible');
    merchSpotlight.innerHTML = `
    <div class="merch-spotlight-placeholder">
      <p>Select a merch item</p>
      <span>Tap a card to zoom the preview</span>
    </div>
  `;
    merchRail.querySelectorAll('.merch-card').forEach(card => {
        card.classList.remove('is-selected');
        card.setAttribute('aria-pressed', 'false');
    });
}

export function setMerchFocus(index) {
    if (!merchExplorer || !merchSpotlight || !merchRail) return;
    merchActive = index;
    const m = merchItems[index];
    if (!m) return;

    merchExplorer.dataset.mode = 'focus';
    merchExplorer.classList.add('is-animating');
    merchSpotlight.innerHTML = merchSpotlightHTML(m, index);

    merchRail.querySelectorAll('.merch-card').forEach((card, i) => {
        const on = i === index;
        card.classList.toggle('is-selected', on);
        card.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    requestAnimationFrame(() => {
        merchSpotlight.classList.add('is-visible');
        merchExplorer.classList.remove('is-animating');
    });

    const closeBtn = document.getElementById('merchCloseFocus');
    if (closeBtn) closeBtn.addEventListener('click', clearMerchFocus);
}

export function initMerch() {
    merchExplorer = document.getElementById('merchExplorer');
    merchRail = document.getElementById('merchRail');
    merchSpotlight = document.getElementById('merchSpotlight');

    if (!merchRail) return;

    merchRail.innerHTML = merchItems.map((m, i) => merchCardHTML(m, i)).join('');

    merchRail.addEventListener('click', (e) => {
        const card = e.target.closest('.merch-card');
        if (!card) return;
        const index = Number(card.dataset.merchIndex);
        if (Number.isNaN(index)) return;

        if (merchActive === index && merchExplorer?.dataset.mode === 'focus') {
            clearMerchFocus();
            return;
        }
        setMerchFocus(index);
    });
}
