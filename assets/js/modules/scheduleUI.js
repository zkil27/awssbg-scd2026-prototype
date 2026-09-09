/**
 * scheduleUI.js
 * --------------------------------------------------------------------------
 * Manages the Program Flow (The Running Order) interactive focus mode:
 * - Opens the comprehensive #programFlowModal with full session details
 * - Coordinates with Lenis to freeze background scroll during focus
 * - Supports morning / afternoon block filtering
 * - Connects schedule speaker chips directly to the speaker modal
 */

import { speakers } from '../data/speakers.js';
import { getLenis } from './smoothScroll.js';
import { openSpeakerModal, closeSpeakerModal } from './speakersUI.js';

let isScheduleModalOpen = false;
let closeScheduleTimeout = null;

/* ============================ Schedule Data ============================= */

export const scheduleSessions = [
  {
    id: 'session-doors-open',
    block: 'morning',
    blockName: 'BLOCK 01 // MORNING',
    time: '8:00 AM – 9:00 AM',
    duration: '60 MIN',
    category: 'REGISTRATION & CHECK-IN',
    categoryTheme: 'theme-orange',
    title: 'Doors Open & Registration',
    location: 'Biñan People\'s Center · 2nd Floor & 4th Floor',
    description: 'Attendee check-in, Summit ID kit & lanyard pickup, early sponsor booth tours, community hub setup, and interactive photobooth activation.',
    speakerIndices: []
  },
  {
    id: 'session-keynote',
    block: 'morning',
    blockName: 'BLOCK 01 // MORNING',
    time: '9:00 AM – 10:30 AM',
    duration: '90 MIN',
    category: 'OPENING & KEYNOTE',
    categoryTheme: 'theme-orange',
    title: 'Opening Ceremony & Keynote: Cloud × AI: Build. Power. Lead.',
    location: 'Main Auditorium · 4th Floor',
    description: 'National Anthem, Opening Remarks by university representatives, and the vision keynote exploring emerging trends in AWS Cloud architecture and generative applied AI across CALABARZON.',
    speakerIndices: [0, 2, 6, 7, 10, 11] // Gaile, Trisha, Maxine, Ace, Kimi, Kate
  },
  {
    id: 'session-tracks',
    block: 'morning',
    blockName: 'BLOCK 01 // MORNING',
    time: '10:30 AM – 12:00 PM',
    duration: '90 MIN',
    category: 'TECHNICAL & CAREER TRACKS',
    categoryTheme: 'theme-green',
    title: 'Technical & Career Tracks: Cloud Foundations & Applied AI',
    location: 'Main Auditorium · 4th Floor',
    description: 'Practical demos and beginner-friendly sessions on cloud fundamentals, scalable infrastructure, open community pipelines, and student builder career acceleration.',
    speakerIndices: [1, 9, 12, 13] // Isaeus (Asi), John Danmel, Darla, Samuel Jedidiah
  },
  {
    id: 'session-women-in-tech',
    block: 'afternoon',
    blockName: 'BLOCK 02 // AFTERNOON',
    time: '1:00 PM – 2:30 PM',
    duration: '90 MIN',
    category: 'PANEL & SHOWCASE',
    categoryTheme: 'theme-purple',
    title: 'Women in Tech & Industry Flagship Panel: Beyond the Hype',
    location: 'Main Auditorium · 4th Floor',
    description: 'Unfiltered debates, enterprise startup journeys, tech leadership realities, and empowering women builders to architect solutions and lead organizations.',
    speakerIndices: [3, 4, 5, 8, 14, 15, 16] // Indaleen, Mc Joben, Jon, Mark Achiles, Sonny, Raphael, David
  },
  {
    id: 'session-booths',
    block: 'afternoon',
    blockName: 'BLOCK 02 // AFTERNOON',
    time: '2:30 PM – 4:15 PM',
    duration: '105 MIN',
    category: 'COMMUNITY & SPONSOR HUB',
    categoryTheme: 'theme-blue',
    title: 'Sponsor & Community Booths: Interactive Challenges & Networking',
    location: 'Community Hub · 2nd Floor & Exhibition Hall',
    description: 'Hands-on developer challenges, speed mentorship with industry leads, cloud quiz raffles, merch booth, partner community displays, and peer networking.',
    speakerIndices: []
  },
  {
    id: 'session-closing',
    block: 'afternoon',
    blockName: 'BLOCK 02 // AFTERNOON',
    time: '4:15 PM – 5:00 PM',
    duration: '45 MIN',
    category: 'FINALE & RECOGNITION',
    categoryTheme: 'theme-pink',
    title: 'Closing Ceremony, Grand Raffle & Community Photo',
    location: 'Main Auditorium · 4th Floor',
    description: 'Major sponsor raffle prize drawing, recognition of student volunteers, organizers, and partner chapters, followed by the official South Summit 2026 group photo.',
    speakerIndices: []
  }
];

/* ============================ HTML Builders ============================= */

function renderSpeakerChipHTML(speaker, originalIndex) {
  if (!speaker) return '';
  const avatar = speaker.picUrl || 'assets/images/south-summit-logo.svg';
  const name = speaker.name || 'Speaker';
  const role = speaker.role ? speaker.role.split('·')[0].trim() : 'Leader';

  return `
    <div class="pf-speaker-chip" data-speaker-index="${originalIndex}" role="button" tabindex="0" title="View bio for ${name}">
      <img src="${avatar}" alt="${name}" class="pf-speaker-chip-avatar" loading="lazy">
      <div class="pf-speaker-chip-info">
        <span class="pf-speaker-chip-name">${name}</span>
        <span class="pf-speaker-chip-role">${role}</span>
      </div>
    </div>
  `;
}

function renderSessionCardHTML(session) {
  const sessionSpeakers = (session.speakerIndices || [])
    .map(idx => {
      const spk = speakers[idx];
      return spk ? renderSpeakerChipHTML(spk, idx) : '';
    })
    .filter(Boolean)
    .join('');

  const hasSpeakers = sessionSpeakers.length > 0;
  const shortBlock = session.block === 'morning' ? '01 // MORNING' : '02 // AFTERNOON';

  return `
    <article class="pf-session-card ${session.categoryTheme}" data-block="${session.block}" id="${session.id}">
      <div class="pf-card-content">
        <div class="pf-card-meta-row">
          <div class="pf-card-tags">
            <span class="pf-card-cat-pill">${session.category}</span>
            <span class="pf-card-block-sub">${shortBlock}</span>
          </div>
          <div class="pf-card-time-pill">
            <span class="pf-time-clock">⏱</span>
            <span class="pf-time-text">${session.time}</span>
            <span class="pf-card-dur">${session.duration}</span>
          </div>
        </div>

        <h4 class="pf-card-title">${session.title}</h4>
        <p class="pf-card-desc">${session.description}</p>

        <div class="pf-card-loc">
          <span class="pf-loc-icon">📍</span>
          <span>${session.location}</span>
        </div>

        ${hasSpeakers ? `
          <div class="pf-card-speakers-section">
            <span class="pf-speakers-label">Featured Speakers (${session.speakerIndices.length})</span>
            <div class="pf-card-speakers-grid">
              ${sessionSpeakers}
            </div>
          </div>
        ` : ''}
      </div>
    </article>
  `;
}

/* ============================ Modal Controls ============================ */

export function openScheduleModal(initialFilter = 'all') {
  const modal = document.getElementById('programFlowModal');
  if (!modal) return;

  if (closeScheduleTimeout) {
    clearTimeout(closeScheduleTimeout);
    closeScheduleTimeout = null;
  }
  modal.classList.remove('is-closing', 'closing');

  // Align background pan to show schedule panel in blueprint section
  const section = document.getElementById('program');
  const panel = document.getElementById('blueprintSchedulePanel');
  if (section && panel && document.documentElement.classList.contains('bp-active')) {
    const extra = parseFloat(section.style.getPropertyValue('--bp-extra')) || 0;
    if (extra > 0) {
      let top = 0;
      let node = section;
      while (node) {
        top += node.offsetTop;
        node = node.offsetParent;
      }
      const targetScroll = top + extra;
      const lenis = getLenis();
      if (lenis && typeof lenis.scrollTo === 'function') {
        lenis.scrollTo(targetScroll, { immediate: true });
      } else {
        window.scrollTo({ top: targetScroll });
      }
    }
  }

  isScheduleModalOpen = true;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');

  // Freeze smooth scroll without jumping
  const lenis = getLenis();
  if (lenis && typeof lenis.stop === 'function') {
    lenis.stop();
  }
  document.documentElement.classList.add('modal-scroll-lock');

  // Set filter
  filterSchedule(initialFilter);

  // Focus close button for accessibility
  requestAnimationFrame(() => {
    const closeBtn = document.getElementById('pfModalClose');
    if (closeBtn) closeBtn.focus();
  });
}

export function closeScheduleModal(options = {}) {
  const modal = document.getElementById('programFlowModal');
  if (!modal || !modal.classList.contains('open') || modal.classList.contains('is-closing')) return;

  isScheduleModalOpen = false;

  const speakerModal = document.getElementById('speakerModal');
  if (speakerModal && speakerModal.classList.contains('open')) {
    closeSpeakerModal(options);
  }

  const finalize = () => {
    if (closeScheduleTimeout) {
      clearTimeout(closeScheduleTimeout);
      closeScheduleTimeout = null;
    }
    modal.classList.remove('open', 'is-closing', 'closing');
    modal.setAttribute('aria-hidden', 'true');

    document.documentElement.classList.remove('modal-scroll-lock');

    const lenis = getLenis();
    if (lenis && typeof lenis.start === 'function') {
      lenis.start();
    }
  };

  if (options.instant || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    finalize();
    return;
  }

  modal.classList.add('is-closing');
  closeScheduleTimeout = setTimeout(finalize, 260);
}

function filterSchedule(filterKey) {
  const modal = document.getElementById('programFlowModal');
  if (!modal) return;

  const filterBtns = modal.querySelectorAll('.pf-filter-btn');
  filterBtns.forEach(btn => {
    const isTarget = btn.getAttribute('data-filter') === filterKey;
    btn.classList.toggle('active', isTarget);
    btn.setAttribute('aria-pressed', isTarget ? 'true' : 'false');
  });

  const cards = modal.querySelectorAll('.pf-session-card');
  cards.forEach(card => {
    const cardBlock = card.getAttribute('data-block');
    if (filterKey === 'all' || cardBlock === filterKey) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

/* =============================== Setup ================================== */

export function initScheduleUI() {
  const modal = document.getElementById('programFlowModal');
  const modalBody = document.getElementById('pfModalBody');
  const btnFocus = document.getElementById('btnFocusSchedule');
  const triggerContainer = document.getElementById('schedInteractiveTrigger');
  const btnClose = document.getElementById('pfModalClose');
  const btnDone = document.getElementById('pfBtnDone');

  // 1. Populate modal body with rich session cards
  if (modalBody) {
    modalBody.innerHTML = scheduleSessions.map(renderSessionCardHTML).join('');
  }

  // 2. Wire up open triggers
  if (btnFocus) {
    btnFocus.addEventListener('click', (e) => {
      e.stopPropagation();
      openScheduleModal('all');
    });
  }

  if (triggerContainer) {
    triggerContainer.addEventListener('click', (e) => {
      // Allow speaker chips to be clicked without opening schedule modal
      if (e.target.closest('.speaker-inline-card') || e.target.closest('a')) {
        return;
      }
      openScheduleModal('all');
    });

    triggerContainer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (!e.target.closest('.speaker-inline-card') && !e.target.closest('a')) {
          e.preventDefault();
          openScheduleModal('all');
        }
      }
    });
  }

  // 3. Wire up filter buttons
  if (modal) {
    const filterBtns = modal.querySelectorAll('.pf-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filterKey = btn.getAttribute('data-filter') || 'all';
        filterSchedule(filterKey);
      });
    });

    // Wire up speaker chips inside modal
    modal.addEventListener('click', (e) => {
      const chip = e.target.closest('.pf-speaker-chip');
      if (!chip) return;

      const idx = Number(chip.getAttribute('data-speaker-index'));
      if (!Number.isNaN(idx) && speakers[idx]) {
        // Find parent card theme for matching tile color
        const parentCard = chip.closest('.pf-session-card');
        const themeMatch = parentCard ? parentCard.className.match(/theme-(orange|purple|green|blue|pink)/) : null;
        const theme = themeMatch ? themeMatch[0] : '';
        openSpeakerModal(speakers[idx], theme);
      }
    });

    // Close on overlay backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeScheduleModal();
      }
    });
  }

  if (btnClose) {
    btnClose.addEventListener('click', closeScheduleModal);
  }

  if (btnDone) {
    btnDone.addEventListener('click', closeScheduleModal);
  }

  // 4. Global keyboard ESC listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isScheduleModalOpen) {
      // Only close schedule modal if speaker modal is not open (or closing) on top of it
      const speakerModal = document.getElementById('speakerModal');
      if (!speakerModal || (!speakerModal.classList.contains('open') && !speakerModal.classList.contains('is-closing'))) {
        closeScheduleModal();
      }
    }
  });

  // 5. Wire up inline block layout switcher (Dual Block / Morning / Afternoon)
  const switcher = document.querySelector('.sched-view-switcher');
  const blocksContainer = document.getElementById('schedBlocksContainer');
  if (switcher && blocksContainer) {
    const tabs = switcher.querySelectorAll('.sched-view-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.stopPropagation();
        const view = tab.getAttribute('data-view') || 'both';

        tabs.forEach(t => {
          const isActive = t === tab;
          t.classList.toggle('active', isActive);
          t.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        blocksContainer.classList.remove('view-morning', 'view-afternoon');
        if (view === 'morning') {
          blocksContainer.classList.add('view-morning');
        } else if (view === 'afternoon') {
          blocksContainer.classList.add('view-afternoon');
        }

        // Notify blueprintScroll to re-measure track width
        window.dispatchEvent(new Event('resize'));
      });
    });
  }

  // Expose helpers globally
  window.openScheduleModal = openScheduleModal;
  window.closeScheduleModal = closeScheduleModal;
  window.getLenis = getLenis;
}
