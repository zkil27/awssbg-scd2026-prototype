/***
 * Speakers UI Module
 * Renders the Speakers UI, the marquee cards, grid and modal pop-up.
 */

import { speakers } from '../data/speakers.js';

const colors = ['blue', 'green', 'pink'];

export function openSpeakerModal(speaker) {
    const modal = document.getElementById('speakerModal');

    if (!modal) return;

    const name = speaker?.name || "Speaker Name";
    const role = speaker?.role || "Speaker Role · Company";
    const status = speaker?.status || (speaker?.sessionTitle?.toLowerCase().includes('keynote') ? 'KEYNOTE' : (speaker?.sessionTitle?.toLowerCase().includes('panel') ? 'PANEL' : 'SPEAKER'));

    const nameEl = document.getElementById('smName');
    if (nameEl) nameEl.textContent = name;

    const roleEl = document.getElementById('smRole');
    if (roleEl) roleEl.textContent = role;

    const badgeEl = document.getElementById('smBadge');
    if (badgeEl) {
        badgeEl.textContent = status;
        badgeEl.className = `sc-status-badge ${status.toLowerCase()}`;
    }

    const sessionEl = document.getElementById('smSession');
    if (sessionEl) {
        sessionEl.textContent = speaker?.sessionTitle ? `${speaker.sessionTitle}` : "Details regarding the presentation and discussion.";
    }

    const bioEl = document.getElementById('smBio');
    if (bioEl) {
        bioEl.innerHTML = speaker?.abstract || "A brief biography highlighting their journey into tech, their work with Cloud & AI, and community contributions.";
    }

    const avatarEl = document.getElementById('smAvatar');
    if (avatarEl) {
        avatarEl.src = speaker?.picUrl || 'assets/South%20Summit%20logo.svg';
        avatarEl.alt = name;
    }

    const linkedInBtn = document.getElementById('smLinkedIn');
    if (linkedInBtn) {
        linkedInBtn.href = speaker?.linkedInUrl || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name)}`;
    }

    modal.classList.add('open');
}

export function closeSpeakerModal() {
    const modal = document.getElementById('speakerModal');
    if (modal) modal.classList.remove('open');
}

function speakerCardHTML(speaker, index, isStatic = false) {
    const color = colors[index % colors.length];
    const name = speaker.name || `Speaker ${index + 1}`;
    const role = speaker.role || 'Cloud Engineer · AWS Partner';
    const abstract = speaker.abstract || 'A brief intro about what this speaker will cover during their slot at the summit.';
    const status = speaker.status || 'TBA';
    const avatar = speaker.picUrl || 'assets/South%20Summit%20logo.svg';
    const linkedin = speaker.linkedInUrl || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name)}`;

    return `
    <div class="speaker-card ${color}" data-speaker-index="${index}">
      <div class="sc-img-wrap">
        <img class="sc-portrait" src="${avatar}" alt="${name}" loading="lazy">
        <div class="sc-fade-overlay"></div>
        <span class="sc-status-badge ${status.toLowerCase()}">${status}</span>
        <a class="sc-li-overlay-btn" href="${linkedin}" target="_blank" rel="noopener" title="View ${name} on LinkedIn" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.67a1.64 1.64 0 0 0-1.64 1.63c0 .91.73 1.64 1.64 1.64s1.64-.73 1.64-1.64c0-.9-.73-1.63-1.64-1.63Z"/>
          </svg>
        </a>
      </div>
      <div class="sc-info">
        <h4 class="sc-name">${name}</h4>
        <span class="sc-role">${role}</span>
        <p class="sc-bio">${abstract}</p>
        <div class="sc-card-foot">
          <a class="sc-li-link" href="${linkedin}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.67a1.64 1.64 0 0 0-1.64 1.63c0 .91.73 1.64 1.64 1.64s1.64-.73 1.64-1.64c0-.9-.73-1.63-1.64-1.63Z"/>
            </svg>
            LinkedIn Profile
          </a>
        </div>
      </div>
    </div>
  `;
}

export function initSpeakers() {
    const marqueeTrack = document.getElementById('marqueeTrack');
    const speakerGrid = document.getElementById('speakerGridStatic');
    const keynotesGrid = document.getElementById('speakerGridKeynotes');
    const panelsGrid = document.getElementById('speakerGridPanels');
    const sessionsGrid = document.getElementById('speakerGridSessions');
    const modal = document.getElementById('speakerModal');

    // Categorize speakers
    const keynotes = [];
    const panels = [];
    const sessions = [];

    speakers.forEach((s, idx) => {
        const item = { ...s, originalIndex: idx };
        if (s.status === 'KEYNOTE' || (s.sessionTitle && s.sessionTitle.toLowerCase().includes('keynote'))) {
            keynotes.push(item);
        } else if (s.status === 'PANEL' || (s.sessionTitle && s.sessionTitle.toLowerCase().includes('panel'))) {
            panels.push(item);
        } else {
            sessions.push(item);
        }
    });

    // Render marquee Track (all speakers)
    if (marqueeTrack) {
        const cards = speakers.map((s, i) => speakerCardHTML(s, i, false)).join('');
        marqueeTrack.innerHTML = cards + cards;
    }

    // Render static grid (if present on any page)
    if (speakerGrid) {
        speakerGrid.innerHTML = speakers.map((s, i) => speakerCardHTML(s, i, true)).join('');
    }

    // Render categorized grids on About page
    if (keynotesGrid) {
        keynotesGrid.innerHTML = keynotes.map((s, i) => speakerCardHTML(s, s.originalIndex, true)).join('');
    }

    if (panelsGrid) {
        panelsGrid.innerHTML = panels.map((s, i) => speakerCardHTML(s, s.originalIndex, true)).join('');
    }

    if (sessionsGrid) {
        sessionsGrid.innerHTML = sessions.map((s, i) => speakerCardHTML(s, s.originalIndex, true)).join('');
    }

    function handleCardClick(e) {
        const card = e.target.closest('.speaker-card');
        if (!card) return;
        const index = Number(card.dataset.speakerIndex);
        if (!Number.isNaN(index) && speakers[index]) {
            openSpeakerModal(speakers[index]);
        }
    }

    if (marqueeTrack) marqueeTrack.addEventListener('click', handleCardClick);
    if (speakerGrid) speakerGrid.addEventListener('click', handleCardClick);
    if (keynotesGrid) keynotesGrid.addEventListener('click', handleCardClick);
    if (panelsGrid) panelsGrid.addEventListener('click', handleCardClick);
    if (sessionsGrid) sessionsGrid.addEventListener('click', handleCardClick);

    // Handle close and ESC key
    if (modal) {
        modal.addEventListener('click', e => {
            if (e.target === modal || e.target.closest('.modal-close')) {
                closeSpeakerModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSpeakerModal();
    });

    window.openSpeakerModal = openSpeakerModal;
    window.closeSpeakerModal = closeSpeakerModal;
}

