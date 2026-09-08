/***
 * Speakers UI Module
 * Renders the Speakers UI, the marquee cards and grids, and manages the
 * modal pop-up shown when a speaker card is clicked.
 */

import { speakers } from '../data/speakers.js';
import { getLenis } from './smoothScroll.js';

const colors = ['blue', 'green', 'pink'];

const FALLBACK_AVATAR = 'assets/images/south-summit-logo.svg';

let scrollLockY = 0;
let isModalOpen = false;

export function openSpeakerModal(speaker, tileTheme = '') {
    const modal = document.getElementById('speakerModal');
    if (!modal) return;

    // Apply on-theme styling matching the clicked card
    const modalCard = modal.querySelector('.modal-card');
    if (modalCard) {
        modalCard.classList.remove(
            'theme-orange', 'theme-purple', 'theme-green', 'theme-blue', 'theme-pink'
        );

        let finalTheme = 'theme-orange';
        if (tileTheme) {
            const clean = tileTheme.replace('bg-tile-', '').replace('theme-', '');
            finalTheme = `theme-${clean}`;
        } else if (speaker?.tileTheme) {
            const clean = speaker.tileTheme.replace('bg-tile-', '').replace('theme-', '');
            finalTheme = `theme-${clean}`;
        } else if (speaker?.status === 'KEYNOTE' || (speaker?.sessionTitle && speaker.sessionTitle.toLowerCase().includes('keynote'))) {
            finalTheme = 'theme-orange';
        } else if (speaker?.status === 'PANEL' || (speaker?.sessionTitle && speaker.sessionTitle.toLowerCase().includes('panel'))) {
            finalTheme = 'theme-purple';
        } else {
            finalTheme = 'theme-green';
        }
        modalCard.classList.add(finalTheme);
    }

    const name = speaker?.name || 'Speaker Name';
    const role = speaker?.role || 'Speaker Role · Company';
    const status = speaker?.status
        || (speaker?.sessionTitle?.toLowerCase().includes('keynote')
            ? 'KEYNOTE'
            : (speaker?.sessionTitle?.toLowerCase().includes('panel') ? 'PANEL' : 'SPEAKER'));

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
        sessionEl.textContent = speaker?.sessionTitle
            ? `${speaker.sessionTitle}`
            : 'Details regarding the presentation and discussion.';
    }

    const bioEl = document.getElementById('smBio');
    if (bioEl) {
        bioEl.innerHTML = speaker?.abstract
            || 'A brief biography highlighting their journey into tech, their work with Cloud & AI, and community contributions.';
    }

    const avatarEl = document.getElementById('smAvatar');
    if (avatarEl) {
        avatarEl.src = speaker?.picUrl || FALLBACK_AVATAR;
        avatarEl.alt = name;
    }

    const linkedInBtn = document.getElementById('smLinkedIn');
    if (linkedInBtn) {
        linkedInBtn.href = speaker?.linkedInUrl
            || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name)}`;
    }

    isModalOpen = true;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    /* Freeze background scrolling without altering document flow or breaking the pinned stage */
    const lenis = getLenis();
    if (lenis && typeof lenis.stop === 'function') {
        lenis.stop();
    }
    document.documentElement.classList.add('modal-scroll-lock');

    /* Wait for the visibility flip before moving focus */
    requestAnimationFrame(() => {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
    });
}

export function closeSpeakerModal() {
    const modal = document.getElementById('speakerModal');
    if (!modal || !modal.classList.contains('open')) return;

    isModalOpen = false;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');

    const scheduleModal = document.getElementById('programFlowModal');
    const isScheduleOpen = scheduleModal && scheduleModal.classList.contains('open');

    if (!isScheduleOpen) {
        document.documentElement.classList.remove('modal-scroll-lock');
        const lenis = getLenis();
        if (lenis && typeof lenis.start === 'function') {
            lenis.start();
        }
    }
}

function speakerCardHTML(speaker, index, isClone = false, extraClasses = '', isHero = false) {
    const color = colors[index % colors.length];
    const name = speaker.name || `Speaker ${index + 1}`;
    const role = speaker.role || 'Cloud Engineer · AWS Partner';
    const abstract = speaker.abstract || 'A brief intro about what this speaker will cover during their slot at the summit.';
    const status = speaker.status || 'TBA';
    const avatar = speaker.picUrl || FALLBACK_AVATAR;
    const linkedin = speaker.linkedInUrl || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name)}`;
    const eager = index < 4;

    return `
    <div class="speaker-card ${color} ${extraClasses}${isClone ? ' marquee-clone' : ''}" data-speaker-index="${index}"${isClone ? ' aria-hidden="true"' : ''}>
      ${isHero ? '<span class="sc-hero-badge">★ KEYNOTE HERO</span>' : ''}
      <div class="sc-img-wrap">
        <img class="sc-portrait" src="${avatar}" alt="${name}" width="260" height="270"
             loading="${eager ? 'eager' : 'lazy'}" decoding="async" ${eager ? 'fetchpriority="high"' : ''}
             onerror="this.onerror=null;this.src='${FALLBACK_AVATAR}';this.classList.add('sc-portrait-fallback')">
        <span class="sc-status-badge ${status.toLowerCase()}">${status}</span>
        <a class="sc-li-overlay-btn" href="${linkedin}" target="_blank" rel="noopener"${isClone ? ' tabindex="-1"' : ''} title="View ${name} on LinkedIn" onclick="event.stopPropagation()">
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
          <a class="sc-li-link" href="${linkedin}" target="_blank" rel="noopener"${isClone ? ' tabindex="-1"' : ''} onclick="event.stopPropagation()">
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

// 1. Architectural Chapter Broadsheet Folio
function editorialCoverHTML(num, stage, time, count, title, desc, specs, tileClass, id, cat, scatterClasses = '') {
    return `
    <article class="asym-spread-cover ${tileClass} ${scatterClasses}" id="${id}" data-category="${cat}">
      <div class="card-hover-cover" aria-hidden="true"></div>
      <div class="asc-crosshair top-left">+</div>
      <div class="asc-crosshair top-right">+</div>
      <div class="asc-meta-row">
        <span class="asc-index">// ${num}</span>
        <span class="asc-label">${stage}</span>
        <span class="asc-time">${time}</span>
        <span class="asc-count">${count}</span>
      </div>
      <div class="asc-folio-body">
        <span class="asc-num" aria-hidden="true">${num}</span>
        <h3 class="asc-title">${title}</h3>
        <p class="asc-desc">${desc}</p>
        <div class="asc-specs-strip">
          ${specs.map(s => `<span class="asc-spec-item">${s}</span>`).join('')}
        </div>
      </div>
      <div class="asc-meta-foot">
        <span class="asc-tag">AWS SCD: SOUTH SUMMIT 2026</span>
        <span class="asc-motion-hint">PULL TO EXPLORE &rarr;</span>
      </div>
    </article>
    `;
}

// 2. Unified Speaker Card: identical 8-col x 10-row dimensions (416px x 520px) for equal impact
function speakerCardRunwayHTML(speaker, index, kicker, quote, tileClass, scatterClasses = '') {
    const name = speaker.name || 'Speaker';
    const role = speaker.role || 'Cloud Leader';
    const status = speaker.status || 'SPEAKER';
    const avatar = speaker.picUrl || FALLBACK_AVATAR;
    const sessionTitle = speaker.sessionTitle || 'Summit Presentation';
    const linkedin = speaker.linkedInUrl || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name)}`;

    return `
    <article class="asym-speaker-card ${tileClass} ${scatterClasses}" data-speaker-index="${index}">
      <div class="card-hover-cover" aria-hidden="true"></div>
      <div class="spk-crosshair top-left">+</div>
      <div class="spk-crosshair top-right">+</div>
      
      <div class="spk-media">
        <img class="spk-img" src="${avatar}" alt="${name}" loading="lazy" decoding="async"
             onerror="this.onerror=null;this.src='${FALLBACK_AVATAR}'">
        <span class="spk-badge"><span class="spk-dot"></span>${status}</span>
        <span class="spk-tag-pill">${kicker}</span>
      </div>

      <div class="spk-content">
        <div class="spk-top-block">
          <h4 class="spk-name">${name}</h4>
          <span class="spk-role">${role}</span>
          ${quote ? `<blockquote class="spk-quote">“${quote}”</blockquote>` : `<div class="spk-topic"><span class="spk-topic-label">SESSION //</span><span class="spk-topic-title">${sessionTitle}</span></div>`}
        </div>

        <div class="spk-foot">
          <button type="button" class="spk-btn-bio">
            Bio &amp; Abstract &rarr;
          </button>
          <a class="spk-li" href="${linkedin}" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="LinkedIn Profile" aria-label="LinkedIn Profile">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.67a1.64 1.64 0 0 0-1.64 1.63c0 .91.73 1.64 1.64 1.64s1.64-.73 1.64-1.64c0-.9-.73-1.63-1.64-1.63Z"/>
            </svg>
          </a>
        </div>
      </div>
    </article>
    `;
}

// 2. Widescreen Hero Feature Spread (620px wide)
function heroWideCardHTML(speaker, index, kicker, quote, tags, tileClass, scatterClasses = '') {
    const name = speaker.name || 'Featured Speaker';
    const role = speaker.role || 'Cloud Leader';
    const status = speaker.status || 'KEYNOTE';
    const avatar = speaker.picUrl || FALLBACK_AVATAR;
    const linkedin = speaker.linkedInUrl || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name)}`;

    return `
    <article class="asym-hero-card ${tileClass} ${scatterClasses}" data-speaker-index="${index}">
      <div class="ahc-crosshair top-left">+</div>
      <div class="ahc-media">
        <img class="ahc-img" src="${avatar}" alt="${name}" loading="lazy" decoding="async"
             onerror="this.onerror=null;this.src='${FALLBACK_AVATAR}'">
        <span class="ahc-badge"><span class="ahc-dot"></span>${status}</span>
        <span class="ahc-tag-pill">CALABARZON 2026</span>
      </div>
      <div class="ahc-content">
        <div class="ahc-top-block">
          <div class="ahc-kicker">${kicker}</div>
          <h4 class="ahc-name">${name}</h4>
          <span class="ahc-role">${role}</span>
          ${quote ? `<blockquote class="ahc-quote">“${quote}”</blockquote>` : ''}
          <div class="ahc-tag-row">
            ${tags.map(t => `<span class="ahc-tag">${t}</span>`).join('')}
          </div>
        </div>
        <div class="ahc-foot">
          <button type="button" class="ahc-btn-bio">
            Bio &amp; Abstract &rarr;
          </button>
          <a class="ahc-li" href="${linkedin}" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="LinkedIn Profile" aria-label="LinkedIn Profile">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.67a1.64 1.64 0 0 0-1.64 1.63c0 .91.73 1.64 1.64 1.64s1.64-.73 1.64-1.64c0-.9-.73-1.63-1.64-1.63Z"/>
            </svg>
          </a>
        </div>
      </div>
    </article>
    `;
}

// 3. 2-Up Stacked Column (Dual Speaker Mini-Cards)
function stackedColumnHTML(sTop, iTop, colorTop, sBottom, iBottom, colorBottom, scatterClasses = '') {
    function miniCard(s, idx, subIndex, colorClass) {
        const name = s.name || 'Speaker';
        const role = s.role || 'Builder';
        const status = s.status || 'SPEAKER';
        const avatar = s.picUrl || FALLBACK_AVATAR;
        const topic = s.sessionTitle || 'Summit Session';

        return `
        <div class="asym-mini-card ${colorClass}" data-speaker-index="${idx}">
          <div class="amc-crosshair">+</div>
          <div class="amc-avatar-wrap">
            <img class="amc-avatar" src="${avatar}" alt="${name}" loading="lazy" decoding="async"
                 onerror="this.onerror=null;this.src='${FALLBACK_AVATAR}'">
          </div>
          <div class="amc-info">
            <div class="amc-header-row">
              <span class="amc-subindex">// ${subIndex}</span>
              <span class="amc-badge">${status}</span>
            </div>
            <h5 class="amc-name">${name}</h5>
            <span class="amc-role">${role}</span>
            <span class="amc-topic">${topic}</span>
          </div>
        </div>
        `;
    }

    return `
    <div class="asym-stack-col ${scatterClasses}">
      ${miniCard(sTop, iTop, '01.A', colorTop)}
      ${miniCard(sBottom, iBottom, '01.B', colorBottom)}
    </div>
    `;
}

// 4. Tall Editorial Poster Card (320px wide)
function posterCardHTML(speaker, index, kicker, tileClass, scatterClasses = '') {
    const name = speaker.name || 'Speaker';
    const role = speaker.role || 'Cloud Engineer';
    const status = speaker.status || 'SPEAKER';
    const avatar = speaker.picUrl || FALLBACK_AVATAR;
    const sessionTitle = speaker.sessionTitle || 'Keynote Presentation';
    const linkedin = speaker.linkedInUrl || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name)}`;

    return `
    <article class="asym-poster-card ${tileClass} ${scatterClasses}" data-speaker-index="${index}">
      <div class="apc-crosshair top-left">+</div>
      <div class="apc-media">
        <img class="apc-img" src="${avatar}" alt="${name}" loading="lazy" decoding="async"
             onerror="this.onerror=null;this.src='${FALLBACK_AVATAR}'">
        <span class="apc-badge"><span class="apc-dot"></span>${status}</span>
        <span class="apc-kicker">${kicker}</span>
      </div>
      <div class="apc-content">
        <h4 class="apc-name">${name}</h4>
        <span class="apc-role">${role}</span>
        <div class="apc-topic">
          <span class="apc-topic-label">SESSION //</span>
          <span class="apc-topic-title">${sessionTitle}</span>
        </div>
        <div class="apc-foot">
          <button type="button" class="apc-btn">
            Bio &rarr;
          </button>
          <a class="apc-li" href="${linkedin}" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="LinkedIn Profile" aria-label="LinkedIn Profile">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.67a1.64 1.64 0 0 0-1.64 1.63c0 .91.73 1.64 1.64 1.64s1.64-.73 1.64-1.64c0-.9-.73-1.63-1.64-1.63Z"/>
            </svg>
          </a>
        </div>
      </div>
    </article>
    `;
}

// 5. Typographic Manifesto / Quote Interstitial
function quoteInterstitialHTML(quote, citation, tag, tileClass, scatterClasses = '') {
    return `
    <div class="asym-quote-interstitial ${tileClass} ${scatterClasses}">
      <div class="aqi-crosshair top-left">+</div>
      <div class="aqi-crosshair bottom-right">+</div>
      <div class="aqi-tag-bar">
        <span class="aqi-tag">${tag}</span>
        <span class="aqi-coords">14.2144° N, 121.1683° E</span>
      </div>
      <div class="aqi-glyph" aria-hidden="true">“</div>
      <blockquote class="aqi-quote">${quote}</blockquote>
      <div class="aqi-foot">
        <span class="aqi-cite">${citation}</span>
        <span class="aqi-mark">AWS SCD SOUTH 2026</span>
      </div>
    </div>
    `;
}

export function initSpeakers() {
    const marqueeTrack = document.getElementById('marqueeTrack');
    const speakerGrid = document.getElementById('speakerGridStatic');
    const aboutCarousel = document.getElementById('aboutSpeakerCarousel');
    const schedKeynotesGrid = document.getElementById('schedGridKeynotes');
    const schedPanelsGrid = document.getElementById('schedGridPanels');
    const schedSessionsGrid = document.getElementById('schedGridSessions');
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
        const cards = speakers.map((s, i) => speakerCardHTML(s, i)).join('');
        const clones = speakers.map((s, i) => speakerCardHTML(s, i, true)).join('');
        marqueeTrack.innerHTML = cards + clones;
    }

    // Render static grid (if present on any page)
    if (speakerGrid) {
        speakerGrid.innerHTML = speakers.map((s, i) => speakerCardHTML(s, i)).join('');
    }

    // Render true editorial runway on About page: every speaker has an identical size card for equal impact
    if (aboutCarousel) {
        let carouselHTML = '';

        // ==========================================
        // 01 // KEYNOTES SPREAD (6 LEADERS)
        // ==========================================
        if (keynotes.length > 0) {
            // Chapter Cover: Solid Orange Tile
            carouselHTML += editorialCoverHTML(
                '01',
                'KEYNOTE STAGE',
                '09:00 - 12:00',
                `${keynotes.length} LEADERS`,
                'Visionaries &amp;<br>Cloud Leaders',
                'Opening keynotes, Women in Tech highlights, and visionary presentations setting the stage for Cloud &amp; AI across CALABARZON.',
                ['6 KEYNOTES', 'MAIN THEATRE', 'LEADERSHIP & AI'],
                'bg-tile-orange',
                'section-keynotes',
                'keynotes',
                'scatter-mid'
            );

            // 1. Gaile Espinosa
            carouselHTML += speakerCardRunwayHTML(
                keynotes[0],
                keynotes[0].originalIndex,
                'KEYNOTE // 01 · 09:00 AM',
                'Empowering the next generation of builders through technical education, scalable cloud architecture, and community leadership.',
                'bg-tile-purple',
                'scatter-high'
            );

            // 2. Trisha Pelagio
            if (keynotes.length > 1) {
                carouselHTML += speakerCardRunwayHTML(
                    keynotes[1],
                    keynotes[1].originalIndex,
                    'KEYNOTE // 02 · 09:45 AM',
                    'Demystifying cloud architecture and leading hands-on student communities to build at scale.',
                    'bg-tile-blue',
                    'scatter-low'
                );
            }

            // 3. Maxine Sofia Llamas
            if (keynotes.length > 2) {
                carouselHTML += speakerCardRunwayHTML(
                    keynotes[2],
                    keynotes[2].originalIndex,
                    'KEYNOTE // 03 · 10:30 AM',
                    'Pioneering student innovation and architecting cloud solutions across higher education.',
                    'bg-tile-pink',
                    'scatter-mid'
                );
            }

            // 4. Ace Batacandulo
            if (keynotes.length > 3) {
                carouselHTML += speakerCardRunwayHTML(
                    keynotes[3],
                    keynotes[3].originalIndex,
                    'KEYNOTE // 04 · 11:15 AM',
                    'Demystifying DevSecOps and embedding enterprise security into the core of student cloud architectures.',
                    'bg-tile-green',
                    'scatter-high'
                );
            }

            // 5. Kimi Valenzuela
            if (keynotes.length > 4) {
                carouselHTML += speakerCardRunwayHTML(
                    keynotes[4],
                    keynotes[4].originalIndex,
                    'WOMEN IN TECH // 01',
                    'Inspiring future female founders and builders to master cloud computing and lead engineering teams.',
                    'bg-tile-orange',
                    'scatter-low'
                );
            }

            // 6. Kate Balgos
            if (keynotes.length > 5) {
                carouselHTML += speakerCardRunwayHTML(
                    keynotes[5],
                    keynotes[5].originalIndex,
                    'WOMEN IN TECH // 02',
                    'Architecting resilient cloud native solutions and championing student community growth.',
                    'bg-tile-purple',
                    'scatter-mid'
                );
            }
        }

        // ==========================================
        // 02 // PANELS SPREAD (6 PANELISTS)
        // ==========================================
        if (panels.length > 0) {
            // Chapter Cover: Solid Green Tile
            carouselHTML += editorialCoverHTML(
                '02',
                'INDUSTRY STAGE',
                '13:00 - 15:30',
                `${panels.length} PANELISTS`,
                'Industry Founders<br>&amp; Operators',
                'Unfiltered debates, enterprise startup trajectories, and unscripted career lessons from cloud pioneers and engineering leaders across the Philippines.',
                ['6 PANELISTS', 'DEBATE FORUM', 'FOUNDER STORIES'],
                'bg-tile-green',
                'section-panels',
                'panels',
                'scatter-mid'
            );

            // 1. Indaleen Quinsayas
            carouselHTML += speakerCardRunwayHTML(
                panels[0],
                panels[0].originalIndex,
                'PANEL // 01 · FOUNDER',
                'Scaling enterprise engineering and fostering authentic tech community connections.',
                'bg-tile-blue',
                'scatter-high'
            );

            // 2. Mc Joben Reyes
            if (panels.length > 1) {
                carouselHTML += speakerCardRunwayHTML(
                    panels[1],
                    panels[1].originalIndex,
                    'PANEL // 02 · LEADER',
                    'Bridging academic innovation with enterprise cloud infrastructure and engineering leadership.',
                    'bg-tile-pink',
                    'scatter-low'
                );
            }

            // 3. Jon Bonso
            if (panels.length > 2) {
                carouselHTML += speakerCardRunwayHTML(
                    panels[2],
                    panels[2].originalIndex,
                    'PANEL // 03 · HEADLINER',
                    'From newsrooms and telecommunications to educating thousands of engineers globally — bridging the gap between student ambition and cloud mastery.',
                    'bg-tile-orange',
                    'scatter-mid'
                );
            }

            // 4. Sonny Carlos
            if (panels.length > 3) {
                carouselHTML += speakerCardRunwayHTML(
                    panels[3],
                    panels[3].originalIndex,
                    'PANEL // 04 · OPERATOR',
                    'Unfiltered debate on startup resilience, enterprise infrastructure, and tech leadership in the Philippines.',
                    'bg-tile-purple',
                    'scatter-high'
                );
            }

            // 5. Raphael Quisumbing
            if (panels.length > 4) {
                carouselHTML += speakerCardRunwayHTML(
                    panels[4],
                    panels[4].originalIndex,
                    'PANEL // 05 · BUILDER',
                    'Engineering at scale and navigating the shifting landscape of enterprise cloud architectures.',
                    'bg-tile-green',
                    'scatter-low'
                );
            }

            // 6. David Marquez
            if (panels.length > 5) {
                carouselHTML += speakerCardRunwayHTML(
                    panels[5],
                    panels[5].originalIndex,
                    'PANEL // 06 · ENTREPRENEUR',
                    'Tactical lessons from launching, growing, and scaling software companies in the Philippines.',
                    'bg-tile-blue',
                    'scatter-mid'
                );
            }
        }

        // ==========================================
        // 03 // SESSIONS SPREAD (4 BUILDERS)
        // ==========================================
        if (sessions.length > 0) {
            // Chapter Cover: Solid Purple Tile
            carouselHTML += editorialCoverHTML(
                '03',
                'BUILDER STAGE',
                '15:30 - 18:00',
                `${sessions.length} BUILDERS`,
                'Builders &amp;<br>Student Stories',
                'Deep-dive technical architectures, real-world data pipelines, and authentic student builder journeys across Laguna, Batangas, Cavite, and Rizal.',
                ['4 SESSIONS', 'TECHNICAL DEMOS', 'STUDENT STORIES'],
                'bg-tile-purple',
                'section-sessions',
                'sessions',
                'scatter-mid'
            );

            // 1. Isaeus (Asi) Guiang
            carouselHTML += speakerCardRunwayHTML(
                sessions[0],
                sessions[0].originalIndex,
                'SESSION // 01 · CLOUD PRO',
                'From leading AWS Cloud Club Philippines to architecting enterprise cloud solutions — the tactical blueprint for accelerating your student tech career.',
                'bg-tile-green',
                'scatter-high'
            );

            // 2. John Danmel Laranga
            if (sessions.length > 1) {
                carouselHTML += speakerCardRunwayHTML(
                    sessions[1],
                    sessions[1].originalIndex,
                    'SESSION // 02 · DEVCON',
                    'Real-world data pipelines, modern application development, and open community building across CALABARZON.',
                    'bg-tile-orange',
                    'scatter-low'
                );
            }

            // 3. Darla David
            if (sessions.length > 2) {
                carouselHTML += speakerCardRunwayHTML(
                    sessions[2],
                    sessions[2].originalIndex,
                    'SESSION // 03 · DATA & AI',
                    'Practical machine learning architectures and applied AI solutions for next-generation builders.',
                    'bg-tile-pink',
                    'scatter-mid'
                );
            }

            // 4. Samuel Jedidiah Uy
            if (sessions.length > 3) {
                carouselHTML += speakerCardRunwayHTML(
                    sessions[3],
                    sessions[3].originalIndex,
                    'SESSION // 04 · APPLIED LLMS',
                    'Building real-world applications with Large Language Models and generative cloud services.',
                    'bg-tile-blue',
                    'scatter-high'
                );
            }
        }

        aboutCarousel.innerHTML = carouselHTML;
    }

    // Pinned Horizontal Runway Scroll Controller
    const carouselSection = document.getElementById('about-speakers-carousel');
    const carouselPin = document.getElementById('aboutCarouselPin');
    const progressFill = document.getElementById('aboutProgressFill');
    const activeLabel = document.getElementById('aboutActiveCategoryLabel');
    const pillKeynotes = document.getElementById('pillKeynotes');
    const pillPanels = document.getElementById('pillPanels');
    const pillSessions = document.getElementById('pillSessions');

    function documentOffsetTop(el) {
        let top = 0;
        let node = el;
        while (node) {
            top += node.offsetTop;
            node = node.offsetParent;
        }
        return top;
    }

    if (carouselSection && carouselPin && aboutCarousel) {
        let sectionTop = 0;
        let range = 0;
        let trackWidth = 0;
        let viewportWidth = 0;
        let keynotesOffset = 0;
        let panelsOffset = 0;
        let sessionsOffset = 0;

        function measure() {
            if (!carouselSection || !carouselPin || !aboutCarousel) return;
            viewportWidth = window.innerWidth;
            trackWidth = aboutCarousel.scrollWidth;
            range = Math.max(0, trackWidth - viewportWidth + 80);

            // Set spacer height on desktop
            if (viewportWidth >= 1024) {
                carouselSection.style.height = `${window.innerHeight + range}px`;
            } else {
                carouselSection.style.height = 'auto';
            }
            sectionTop = documentOffsetTop(carouselSection);

            const keynotesEl = document.getElementById('section-keynotes');
            const panelsEl = document.getElementById('section-panels');
            const sessionsEl = document.getElementById('section-sessions');

            if (keynotesEl) keynotesOffset = keynotesEl.offsetLeft;
            if (panelsEl) panelsOffset = panelsEl.offsetLeft;
            if (sessionsEl) sessionsOffset = sessionsEl.offsetLeft;
        }

        function render(scroll) {
            if (window.innerWidth < 1024) {
                carouselPin.classList.remove('is-before', 'is-pinned', 'is-after');
                aboutCarousel.style.transform = '';
                // Reset card properties on mobile
                const children = aboutCarousel.children;
                for (let i = 0; i < children.length; i++) {
                    children[i].style.removeProperty('--card-scale');
                    children[i].style.removeProperty('--card-rotate-y');
                    children[i].style.removeProperty('--card-ty');
                    children[i].style.removeProperty('--card-opacity');
                }

                // Vertical category tracking on mobile
                const keynotesEl = document.getElementById('section-keynotes');
                const panelsEl = document.getElementById('section-panels');
                const sessionsEl = document.getElementById('section-sessions');
                const currentY = scroll + 220;

                let mobileCat = 'keynotes';
                if (sessionsEl && currentY >= documentOffsetTop(sessionsEl)) {
                    mobileCat = 'sessions';
                } else if (panelsEl && currentY >= documentOffsetTop(panelsEl)) {
                    mobileCat = 'panels';
                }

                if (pillKeynotes && pillPanels && pillSessions) {
                    pillKeynotes.classList.toggle('active', mobileCat === 'keynotes');
                    pillPanels.classList.toggle('active', mobileCat === 'panels');
                    pillSessions.classList.toggle('active', mobileCat === 'sessions');
                }
                return;
            }

            // Pin state management
            if (scroll < sectionTop) {
                carouselPin.classList.remove('is-pinned', 'is-after');
                carouselPin.classList.add('is-before');
            } else if (scroll >= sectionTop + range) {
                carouselPin.classList.remove('is-before', 'is-pinned');
                carouselPin.classList.add('is-after');
            } else {
                carouselPin.classList.remove('is-before', 'is-after');
                carouselPin.classList.add('is-pinned');
            }

            // Calculate translation progress
            const progress = range > 0 ? Math.max(0, Math.min(1, (scroll - sectionTop) / range)) : 0;
            const tx = -progress * range;
            aboutCarousel.style.transform = `translate3d(${tx}px, 0, 0)`;

            // Cards remain cleanly grid-aligned and uniform without any dynamic scaling or 3D tilt
            const children = aboutCarousel.children;
            for (let i = 0; i < children.length; i++) {
                const card = children[i];
                card.style.removeProperty('--card-scale');
                card.style.removeProperty('--card-rotate-y');
                card.style.removeProperty('--card-ty');
                card.style.removeProperty('--card-opacity');
            }

            if (progressFill) {
                progressFill.style.width = `${(progress * 100).toFixed(1)}%`;
            }

            // Category tracking based on horizontal translation
            const currentX = -tx + (viewportWidth * 0.35);
            let activeCat = 'keynotes';
            if (sessionsOffset > 0 && currentX >= sessionsOffset) {
                activeCat = 'sessions';
            } else if (panelsOffset > 0 && currentX >= panelsOffset) {
                activeCat = 'panels';
            }

            if (pillKeynotes && pillPanels && pillSessions) {
                pillKeynotes.classList.toggle('active', activeCat === 'keynotes');
                pillPanels.classList.toggle('active', activeCat === 'panels');
                pillSessions.classList.toggle('active', activeCat === 'sessions');
            }

            if (activeLabel) {
                if (activeCat === 'keynotes') activeLabel.textContent = '01 // KEYNOTE LEADERS';
                else if (activeCat === 'panels') activeLabel.textContent = '02 // INDUSTRY PANELISTS';
                else activeLabel.textContent = '03 // TECHNICAL SESSIONS';
            }
        }

        function getScroll() {
            const lenis = getLenis();
            return (lenis && typeof lenis.scroll === 'number') ? lenis.scroll : window.scrollY;
        }

        let rafId = 0;
        function tick() {
            if (!isModalOpen) {
                render(getScroll());
            }
            rafId = requestAnimationFrame(tick);
        }

        requestAnimationFrame(() => {
            measure();
            rafId = requestAnimationFrame(tick);
        });

        window.addEventListener('resize', () => {
            measure();
        });

        // Pill click smooth navigation (handles mobile vertical scroll vs desktop horizontal pan)
        function scrollToCategory(targetId, catOffset) {
            if (window.innerWidth < 1024) {
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    const navH = 65;
                    const hudH = 55;
                    const top = documentOffsetTop(targetEl) - navH - hudH;
                    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
                }
                return;
            }
            measure();
            const targetScroll = sectionTop + Math.max(0, Math.min(range, catOffset - 100));
            const lenis = getLenis();
            if (lenis && typeof lenis.scrollTo === 'function') {
                lenis.scrollTo(targetScroll);
            } else {
                window.scrollTo({ top: targetScroll, behavior: 'smooth' });
            }
        }

        if (pillKeynotes) pillKeynotes.addEventListener('click', () => scrollToCategory('section-keynotes', keynotesOffset));
        if (pillPanels) pillPanels.addEventListener('click', () => scrollToCategory('section-panels', panelsOffset));
        if (pillSessions) pillSessions.addEventListener('click', () => scrollToCategory('section-sessions', sessionsOffset));

        // Wrap showPage to re-measure when switching to About page
        const origShowPage = window.showPage;
        if (typeof origShowPage === 'function' && !window.__speakersShowPageWrapped) {
            window.showPage = function (...args) {
                const res = origShowPage.apply(this, args);
                requestAnimationFrame(() => {
                    measure();
                });
                return res;
            };
            window.__speakersShowPageWrapped = true;
        }
    }

    // Render tiny inline cards for schedule on Home page
    function speakerInlineHTML(speaker, index) {
        const color = colors[index % colors.length];
        const name = speaker.name || `Speaker ${index + 1}`;
        const avatar = speaker.picUrl || FALLBACK_AVATAR;
        return `
        <div class="speaker-inline-card ${color}" data-speaker-index="${index}">
          <img src="${avatar}" alt="${name}" class="speaker-inline-avatar">
          <span class="speaker-inline-name">${name}</span>
        </div>
        `;
    }

    if (schedKeynotesGrid) {
        schedKeynotesGrid.innerHTML = '<div class="speaker-inline-row">' + keynotes.map((s) => speakerInlineHTML(s, s.originalIndex)).join('') + '</div>';
    }
    if (schedPanelsGrid) {
        schedPanelsGrid.innerHTML = '<div class="speaker-inline-row">' + panels.map((s) => speakerInlineHTML(s, s.originalIndex)).join('') + '</div>';
    }
    if (schedSessionsGrid) {
        schedSessionsGrid.innerHTML = '<div class="speaker-inline-row">' + sessions.map((s) => speakerInlineHTML(s, s.originalIndex)).join('') + '</div>';
    }

    function handleCardClick(e) {
        //let the LinkedIn links do their thing without opening the modal
        if (e.target.closest('a') || e.target.closest('.spk-li')) return;

        const card = e.target.closest('.asym-speaker-card, .speaker-card, .asym-hero-card, .asym-mini-card, .asym-poster-card, .speaker-inline-card');
        if (!card) return;

        const index = Number(card.dataset.speakerIndex);
        if (!Number.isNaN(index) && speakers[index]) {
            const tileMatch = card.className.match(/bg-tile-(orange|purple|green|blue|pink)/)
                || card.className.match(/\b(blue|green|pink)\b/);
            const tileClass = tileMatch ? (tileMatch[0].startsWith('bg-tile-') ? tileMatch[0] : `bg-tile-${tileMatch[0]}`) : '';
            openSpeakerModal(speakers[index], tileClass);
        }
    }

    [marqueeTrack, speakerGrid, aboutCarousel, schedKeynotesGrid, schedPanelsGrid, schedSessionsGrid].forEach((container) => {
        if (container) container.addEventListener('click', handleCardClick);
    });

    // Handle close (click on overlay or the close button)
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.closest('.modal-close')) {
                closeSpeakerModal();
            }
        });
    }

    // Dismiss on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSpeakerModal();
    });

    window.openSpeakerModal = openSpeakerModal;
    window.closeSpeakerModal = closeSpeakerModal;
    window.speakers = speakers;
}

