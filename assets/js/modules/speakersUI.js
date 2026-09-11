/***
 * Speakers UI Module
 * Renders the Speakers UI, the marquee cards and grids, and manages the
 * modal pop-up shown when a speaker card is clicked.
 */

import { speakers } from '../data/speakers.js';
import { getLenis } from './smoothScroll.js';
import { Masonry } from './masonry.js';

const colors = ['blue', 'green', 'pink'];

const FALLBACK_AVATAR = 'assets/images/south-summit-logo.svg';

/**
 * Re-trigger the spotlight "reveal moment" (the `.is-entering` choreography in
 * styles.css) each time the active speaker changes. Removing → forcing a reflow
 * → re-adding the class restarts the CSS animations even though the element is
 * reused. Skipped entirely under reduced motion or on coarse-pointer / narrow
 * viewports (the separate spotlight column is hidden below 1024px anyway), so
 * those users just get an instant content swap. rAF-gated so a fast hover sweep
 * across rows collapses to a single trigger on the final frame instead of
 * strobing the card.
 */
let spotlightRaf = 0;
function playSpotlightEntrance(card) {
    if (!card) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (reduceMotion || !finePointer || window.innerWidth < 1024) {
        card.classList.remove('is-entering');
        return;
    }
    if (spotlightRaf) cancelAnimationFrame(spotlightRaf);
    card.classList.remove('is-entering');
    // Force reflow so the animation can restart from frame 0.
    void card.offsetWidth;
    spotlightRaf = requestAnimationFrame(() => {
        card.classList.add('is-entering');
        spotlightRaf = 0;
    });
}

let scrollLockY = 0;
let isModalOpen = false;
let closeSpeakerTimeout = null;

export function openSpeakerModal(speaker, tileTheme = '') {
    const modal = document.getElementById('speakerModal');
    if (!modal) return;

    if (closeSpeakerTimeout) {
        clearTimeout(closeSpeakerTimeout);
        closeSpeakerTimeout = null;
    }
    modal.classList.remove('is-closing', 'closing');

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
        } else if (speaker?.id === 'speaker-kimi-annika-villareal' || speaker?.id === 'speaker-maxine-sofia-llamas') {
            finalTheme = 'theme-pink';
        } else if (speaker?.id === 'speaker-kate-callao' || speaker?.id === 'speaker-trisha-pelagio' || speaker?.id === 'speaker-isaeus-asi-guiang') {
            finalTheme = 'theme-blue';
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

export function closeSpeakerModal(options = {}) {
    const modal = document.getElementById('speakerModal');
    if (!modal || !modal.classList.contains('open') || modal.classList.contains('is-closing')) return;

    isModalOpen = false;

    const finalize = () => {
        if (closeSpeakerTimeout) {
            clearTimeout(closeSpeakerTimeout);
            closeSpeakerTimeout = null;
        }
        modal.classList.remove('open', 'is-closing', 'closing');
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
    };

    if (options.instant || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
        finalize();
        return;
    }

    modal.classList.add('is-closing');
    closeSpeakerTimeout = setTimeout(finalize, 260);
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

export function initSpeakers() {
    const marqueeTrack = document.getElementById('marqueeTrack');
    const speakerGrid = document.getElementById('speakerGridStatic');
    const schedKeynotesGrid = document.getElementById('schedGridKeynotes');
    const schedPanelsGrid = document.getElementById('schedGridPanels');
    const schedSessionsGrid = document.getElementById('schedGridSessions');
    const modal = document.getElementById('speakerModal');

    // Categorize speakers by role: Panels, Keynotes, Builders
    const panels = [];
    const keynotes = [];
    const builders = [];

    speakers.forEach((s, idx) => {
        const item = { ...s, originalIndex: idx };
        if (s.status === 'PANEL') {
            panels.push(item);
        } else if (s.status === 'KEYNOTE') {
            keynotes.push(item);
        } else {
            builders.push(item);
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

    // Render Clean Minimal Kinetic Roster on About page
    const aboutRosterStage = document.getElementById('aboutRosterStage');
    const rosterList = document.getElementById('rosterListColumn');
    const spotlightCard = document.getElementById('rosterSpotlightCard');
    const pillAll = document.getElementById('pillAll');
    const pillPanels = document.getElementById('pillPanels');
    const pillKeynotes = document.getElementById('pillKeynotes');
    const pillBuilders = document.getElementById('pillBuilders') || document.getElementById('pillSessions');

    function getSpeakerColor(s) {
        if (!s) return 'purple';
        if (s.tileTheme) {
            return s.tileTheme.replace('bg-tile-', '').replace('theme-', '');
        }
        const id = s.id || '';
        if (id === 'speaker-kimi-annika-villareal' || id === 'speaker-maxine-sofia-llamas') return 'pink';
        if (id === 'speaker-kate-callao' || id === 'speaker-trisha-pelagio' || id === 'speaker-isaeus-asi-guiang') return 'blue';
        if (s.status === 'PANEL') return 'purple';
        if (s.status === 'KEYNOTE') return 'orange';
        if (s.status === 'BUILDER') return 'green';
        return 'blue';
    }

    // ---------------------------------------------------------------------
    // Editorial Gallery Wall (About page "The Lineup").
    // Every speaker gets their own tile so no one is buried in a list; keynotes
    // render as larger feature tiles for hierarchy. Tiles carry bg-tile-${color}
    // so the shared modal (via handleCardClick delegated on #aboutRosterStage)
    // themes correctly for all five brand colors. Replaces the old two-column
    // list + single spotlight (that block below is now dormant — its ids no
    // longer exist in the DOM).
    // ---------------------------------------------------------------------
    // ---------------------------------------------------------------------
    // React Bits Masonry Wall (About page "The Lineup").
    // Upgraded from static CSS-grid to GSAP-driven responsive multi-column
    // masonry layout with image preloading, directional entrance animation,
    // blur-to-focus resolution, and hover scaling.
    // ---------------------------------------------------------------------
    if (aboutRosterStage && aboutRosterStage.classList.contains('lineup-wall')) {
        let wallCategory = 'all';

        function getWallList() {
            if (wallCategory === 'panels') return panels;
            if (wallCategory === 'keynotes') return keynotes;
            if (wallCategory === 'builders' || wallCategory === 'sessions') return builders;
            return [...keynotes, ...panels, ...builders];
        }

        function speakerToMasonryItem(s, index) {
            const color = getSpeakerColor(s);
            const isKeynote = s.status === 'KEYNOTE';
            const name = s.name || 'Speaker';
            const role = s.role || 'Cloud Leader';
            const status = s.status || 'SPEAKER';
            const avatar = s.picUrl || FALLBACK_AVATAR;
            const linkedin = s.linkedInUrl
                || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name)}`;

            // Varied heights (child.height / 2 in layout) for dynamic masonry rhythm
            let h = 500;
            if (isKeynote) {
                h = (index % 3 === 0) ? 660 : (index % 3 === 1 ? 600 : 560);
            } else if (s.status === 'PANEL') {
                h = (index % 3 === 0) ? 520 : (index % 3 === 1 ? 480 : 500);
            } else {
                h = (index % 2 === 0) ? 440 : 390;
            }

            return {
                id: s.id || `speaker-${s.originalIndex ?? index}`,
                img: avatar,
                url: linkedin,
                height: h,
                speaker: s,
                color,
                isKeynote,
                status,
                name,
                role,
                linkedin,
                originalIndex: s.originalIndex,
                tileTheme: `bg-tile-${color}`,
                extraClasses: isKeynote ? 'is-keynote' : ''
            };
        }

        function renderLineupItem(item) {
            return `
            <div class="item-img" style="--tile-accent: var(--${item.color});">
              <img class="lt-photo" src="${item.img}" alt="${item.name}" loading="lazy" decoding="async"
                   onerror="this.onerror=null;this.src='${FALLBACK_AVATAR}';this.classList.add('lt-photo-fallback')">
              <span class="lt-scrim" aria-hidden="true"></span>
              <span class="sc-status-badge ${item.status.toLowerCase()}">${item.status}</span>
              <a class="lt-li" href="${item.linkedin}" target="_blank" rel="noopener"
                 onclick="event.stopPropagation()" title="LinkedIn Profile" aria-label="${item.name} on LinkedIn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.67a1.64 1.64 0 0 0-1.64 1.63c0 .91.73 1.64 1.64 1.64s1.64-.73 1.64-1.64c0-.9-.73-1.63-1.64-1.63Z"/>
                </svg>
              </a>
              <span class="lt-info">
                <h3 class="lt-name">${item.name}</h3>
                <span class="lt-role">${item.role}</span>
              </span>
              <div class="color-overlay"></div>
            </div>`;
        }

        const initialItems = getWallList().map(speakerToMasonryItem);

        const lineupMasonry = new Masonry(aboutRosterStage, {
            items: initialItems,
            ease: 'power3.out',
            duration: 0.6,
            stagger: 0.05,
            animateFrom: 'bottom',
            scaleOnHover: true,
            hoverScale: 0.95,
            blurToFocus: true,
            colorShiftOnHover: false,
            renderItem: renderLineupItem,
            onItemClick: (e, item) => {
                if (e.target.closest('.lt-li') || e.target.closest('a')) return;
                openSpeakerModal(item.speaker, item.tileTheme);
            }
        });

        window.lineupMasonry = lineupMasonry;

        function setWallCategory(cat) {
            wallCategory = cat;
            [pillAll, pillPanels, pillKeynotes, pillBuilders].forEach((p) => {
                if (!p) return;
                const isMatch = p.dataset.target === cat
                    || ((cat === 'sessions' || cat === 'builders')
                        && (p.dataset.target === 'sessions' || p.dataset.target === 'builders'));
                p.classList.toggle('active', isMatch);
            });
            const updatedItems = getWallList().map(speakerToMasonryItem);
            lineupMasonry.setItems(updatedItems);
            lineupMasonry.playEntranceAnimation(0.04);
        }

        if (pillAll) pillAll.addEventListener('click', () => setWallCategory('all'));
        if (pillPanels) pillPanels.addEventListener('click', () => setWallCategory('panels'));
        if (pillKeynotes) pillKeynotes.addEventListener('click', () => setWallCategory('keynotes'));
        if (pillBuilders) pillBuilders.addEventListener('click', () => setWallCategory(pillBuilders.dataset.target || 'sessions'));
    }

    if (rosterList && spotlightCard) {
        let activeCategory = 'all';
        let activeSpeakerIndex = 0;
        let expandedMobileIndex = 0;

        function getFilteredGroups() {
            if (activeCategory === 'panels') {
                return [{ id: 'panels', title: 'Panels', color: 'purple', items: panels }];
            }
            if (activeCategory === 'keynotes') {
                return [{ id: 'keynotes', title: 'Keynotes', color: 'orange', items: keynotes }];
            }
            if (activeCategory === 'builders' || activeCategory === 'sessions') {
                return [{ id: 'builders', title: 'Builders', color: 'green', items: builders }];
            }
            return [
                { id: 'panels', title: 'Panels', color: 'purple', items: panels },
                { id: 'keynotes', title: 'Keynotes', color: 'orange', items: keynotes },
                { id: 'builders', title: 'Builders', color: 'green', items: builders }
            ];
        }

        function getFilteredList() {
            const groups = getFilteredGroups();
            return groups.flatMap((g) => g.items);
        }

        function renderSpotlight(speaker, displayIndex, totalCount, animate = false) {
            if (!spotlightCard || !speaker) return;
            const color = getSpeakerColor(speaker);
            const num = String(displayIndex + 1).padStart(2, '0');
            const name = speaker.name || 'Speaker';
            const role = speaker.role || 'Cloud Leader';
            const status = speaker.status || 'KEYNOTE';
            const avatar = speaker.picUrl || FALLBACK_AVATAR;
            const linkedin = speaker.linkedInUrl || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name)}`;
            const tileClass = `bg-tile-${color}`;

            spotlightCard.style.setProperty('--sp-accent', `var(--${color})`);
            spotlightCard.className = `roster-spotlight-card ${tileClass}`;
            spotlightCard.dataset.speakerIndex = speaker.originalIndex;

            spotlightCard.innerHTML = `
              <img class="sp-img" src="${avatar}" alt="${name}" loading="lazy" decoding="async"
                   onerror="this.onerror=null;this.src='${FALLBACK_AVATAR}'">
              <div class="sp-overlay-gradient" aria-hidden="true"></div>

              <div class="sp-meta-bar">
                <span class="sp-index">${num} · ${status}</span>
                <span class="sp-count">${num} / ${String(totalCount).padStart(2, '0')}</span>
              </div>

              <div class="sp-badge"><span class="sp-dot"></span>${status}</div>

              <div class="sp-info">
                <div class="sp-headline">
                  <h3 class="sp-name">${name}</h3>
                  <span class="sp-role">${role}</span>
                </div>

                <div class="sp-actions">
                  <button type="button" class="sp-btn-bio" data-speaker-index="${speaker.originalIndex}">
                    Bio &amp; Abstract &rarr;
                  </button>
                  <a class="sp-li-btn" href="${linkedin}" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="LinkedIn Profile" aria-label="LinkedIn Profile">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.67a1.64 1.64 0 0 0-1.64 1.63c0 .91.73 1.64 1.64 1.64s1.64-.73 1.64-1.64c0-.9-.73-1.63-1.64-1.63Z"/>
                    </svg>
                  </a>
                </div>
              </div>
            `;

            // Replay the choreographed "spotlight moment" only on a committed
            // selection (click / keyboard / filter / initial reveal). Hover is
            // exploratory, so it does a quiet swap (content + accent-border
            // morph) without the full entrance — this keeps a slow mouse sweep
            // down the list from strobing the card.
            if (animate) {
                playSpotlightEntrance(spotlightCard);
            } else {
                spotlightCard.classList.remove('is-entering');
            }
        }

        /**
         * One-shot staggered entrance for the roster rows. Runs only when the
         * list is (re)built by initial load or a category filter change — NOT
         * on keyboard arrow nav (which also re-renders but should just move the
         * highlight without re-sweeping the whole list). Each row gets a
         * clamped per-row index (--ri-reveal-i) and the `.ri-reveal` one-shot
         * class; the keyframe lives in styles.css. Skipped under reduced motion
         * so those users see the list immediately.
         */
        function staggerRosterRows() {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const items = rosterList.querySelectorAll('.roster-item');
            items.forEach((el, i) => {
                el.style.setProperty('--ri-reveal-i', String(Math.min(i, 10)));
                el.classList.add('ri-reveal');
                el.addEventListener('animationend', () => {
                    el.classList.remove('ri-reveal');
                    el.style.removeProperty('--ri-reveal-i');
                }, { once: true });
            });
        }

        function renderRoster(stagger = false) {
            const groups = getFilteredGroups();
            const list = getFilteredList();
            if (list.length === 0) return;

            if (activeSpeakerIndex >= list.length) {
                activeSpeakerIndex = 0;
            }
            if (expandedMobileIndex >= list.length) {
                expandedMobileIndex = 0;
            }

            let globalIdx = 0;
            let html = '';

            groups.forEach((group) => {
                html += `
                <div class="roster-group-header">
                  <div class="rgh-left">
                    <span class="rgh-dot ${group.color}"></span>
                    <span class="rgh-title">${group.title}</span>
                  </div>
                  <span class="rgh-count">${group.items.length} ${group.items.length === 1 ? 'Speaker' : 'Speakers'}</span>
                </div>
                `;

                group.items.forEach((s) => {
                    const currentIdx = globalIdx;
                    const isActive = currentIdx === activeSpeakerIndex;
                    const isExpanded = currentIdx === expandedMobileIndex;
                    const color = getSpeakerColor(s);
                    const num = String(currentIdx + 1).padStart(2, '0');
                    const name = s.name || 'Speaker';
                    const track = s.status || 'SPEAKER';
                    const role = s.role || 'Cloud Leader';
                    const avatar = s.picUrl || FALLBACK_AVATAR;
                    const linkedin = s.linkedInUrl || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name)}`;
                    const tileClass = `bg-tile-${color}`;

                    html += `
                    <div class="roster-item ${isActive ? 'is-active' : ''} ${isExpanded ? 'is-expanded-mobile' : ''}" 
                         data-speaker-index="${s.originalIndex}" 
                         data-display-index="${currentIdx}"
                         style="--item-accent: var(--${color}); --item-accent-text: var(--${color}-text, var(--${color})); --sp-accent: var(--${color});"
                         role="tab" 
                         aria-selected="${isActive ? 'true' : 'false'}"
                         tabindex="0">
                      <div class="ri-row">
                        <div class="ri-indicator" aria-hidden="true"></div>
                        <div class="ri-content">
                          <div class="ri-header">
                            <span class="ri-num">${num}</span>
                            <span class="ri-track">${track}</span>
                          </div>
                          <h4 class="ri-name">${name}</h4>
                          <span class="ri-role">${role}</span>
                        </div>
                        <div class="ri-arrow" aria-hidden="true">&rarr;</div>
                      </div>

                      <div class="ri-bloom-card ${tileClass}" data-speaker-index="${s.originalIndex}" aria-hidden="${isExpanded ? 'false' : 'true'}">
                        <img class="sp-img" src="${avatar}" alt="${name}" loading="lazy" decoding="async"
                             onerror="this.onerror=null;this.src='${FALLBACK_AVATAR}'">
                        <div class="sp-overlay-gradient" aria-hidden="true"></div>

                        <div class="sp-badge"><span class="sp-dot"></span>${track}</div>

                        <div class="sp-info">
                          <div class="sp-headline">
                            <h3 class="sp-name">${name}</h3>
                            <span class="sp-role">${role}</span>
                          </div>

                          <div class="sp-actions">
                            <button type="button" class="sp-btn-bio" data-speaker-index="${s.originalIndex}">
                              Bio &amp; Abstract &rarr;
                            </button>
                            <a class="sp-li-btn" href="${linkedin}" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="LinkedIn Profile" aria-label="LinkedIn Profile">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.67a1.64 1.64 0 0 0-1.64 1.63c0 .91.73 1.64 1.64 1.64s1.64-.73 1.64-1.64c0-.9-.73-1.63-1.64-1.63Z"/>
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    `;

                    globalIdx++;
                });
            });

            rosterList.innerHTML = html;
            if (stagger) staggerRosterRows();
            // renderRoster is always a committed action (initial load, filter,
            // or keyboard nav), so the spotlight plays its full moment.
            renderSpotlight(list[activeSpeakerIndex], activeSpeakerIndex, list.length, true);
        }

        // Hover updates spotlight (desktop only)
        rosterList.addEventListener('mouseover', (e) => {
            if (window.innerWidth < 1024) return;
            const item = e.target.closest('.roster-item');
            if (!item) return;
            const displayIdx = Number(item.dataset.displayIndex);
            if (!Number.isNaN(displayIdx) && displayIdx !== activeSpeakerIndex) {
                activeSpeakerIndex = displayIdx;
                expandedMobileIndex = displayIdx;
                const list = getFilteredList();
                const items = rosterList.querySelectorAll('.roster-item');
                items.forEach((el, idx) => {
                    el.classList.toggle('is-active', idx === activeSpeakerIndex);
                    el.setAttribute('aria-selected', idx === activeSpeakerIndex ? 'true' : 'false');
                });
                renderSpotlight(list[activeSpeakerIndex], activeSpeakerIndex, list.length);
            }
        });

        // Click handler: handles desktop spotlight selection and mobile accordion bloom toggle
        rosterList.addEventListener('click', (e) => {
            // Let LinkedIn and Bio button actions bubble directly
            if (e.target.closest('a') || e.target.closest('.sp-li-btn') || e.target.closest('.sp-btn-bio')) return;

            const item = e.target.closest('.roster-item');
            if (!item) return;

            const displayIdx = Number(item.dataset.displayIndex);
            if (Number.isNaN(displayIdx)) return;

            const isMobile = window.innerWidth < 1024;
            const list = getFilteredList();

            if (isMobile) {
                // If clicked inside an open bloom card body (excluding buttons above), open modal
                if (e.target.closest('.ri-bloom-card')) {
                    const speakerIdx = Number(item.dataset.speakerIndex);
                    if (!Number.isNaN(speakerIdx) && speakers[speakerIdx]) {
                        const color = getSpeakerColor(speakers[speakerIdx]);
                        openSpeakerModal(speakers[speakerIdx], `bg-tile-${color}`);
                    }
                    return;
                }

                // Clicked on row header: toggle accordion
                const isCurrentlyExpanded = item.classList.contains('is-expanded-mobile');
                const items = rosterList.querySelectorAll('.roster-item');

                items.forEach((el) => {
                    el.classList.remove('is-expanded-mobile');
                    const bloom = el.querySelector('.ri-bloom-card');
                    if (bloom) bloom.setAttribute('aria-hidden', 'true');
                });

                if (!isCurrentlyExpanded) {
                    item.classList.add('is-expanded-mobile');
                    const bloom = item.querySelector('.ri-bloom-card');
                    if (bloom) bloom.setAttribute('aria-hidden', 'false');
                    expandedMobileIndex = displayIdx;
                    activeSpeakerIndex = displayIdx;

                    items.forEach((el, idx) => {
                        el.classList.toggle('is-active', idx === activeSpeakerIndex);
                        el.setAttribute('aria-selected', idx === activeSpeakerIndex ? 'true' : 'false');
                    });

                    // Ensure smooth view on mobile
                    setTimeout(() => {
                        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 120);
                } else {
                    expandedMobileIndex = -1;
                    activeSpeakerIndex = -1;
                    items.forEach((el) => {
                        el.classList.remove('is-active');
                        el.setAttribute('aria-selected', 'false');
                    });
                }
            } else {
                // Desktop click: update active speaker & stage (committed → animate)
                activeSpeakerIndex = displayIdx;
                expandedMobileIndex = displayIdx;
                const items = rosterList.querySelectorAll('.roster-item');
                items.forEach((el, idx) => {
                    el.classList.toggle('is-active', idx === activeSpeakerIndex);
                    el.setAttribute('aria-selected', idx === activeSpeakerIndex ? 'true' : 'false');
                });
                renderSpotlight(list[activeSpeakerIndex], activeSpeakerIndex, list.length, true);
            }
        });

        // Keyboard arrow navigation
        rosterList.addEventListener('keydown', (e) => {
            const list = getFilteredList();
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                activeSpeakerIndex = (activeSpeakerIndex + 1) % list.length;
                expandedMobileIndex = activeSpeakerIndex;
                renderRoster();
                const activeEl = rosterList.querySelector('.roster-item.is-active');
                if (activeEl) activeEl.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeSpeakerIndex = (activeSpeakerIndex - 1 + list.length) % list.length;
                expandedMobileIndex = activeSpeakerIndex;
                renderRoster();
                const activeEl = rosterList.querySelector('.roster-item.is-active');
                if (activeEl) activeEl.focus();
            }
        });

        // Category filter buttons
        function setCategory(cat) {
            activeCategory = cat;
            activeSpeakerIndex = 0;
            expandedMobileIndex = 0;
            [pillAll, pillPanels, pillKeynotes, pillBuilders].forEach((p) => {
                if (p) {
                    const isMatch = p.dataset.target === cat || 
                        ((cat === 'sessions' || cat === 'builders') && (p.dataset.target === 'sessions' || p.dataset.target === 'builders'));
                    p.classList.toggle('active', isMatch);
                }
            });
            renderRoster(true); // re-stagger the freshly filtered rows
        }

        if (pillAll) pillAll.addEventListener('click', () => setCategory('all'));
        if (pillPanels) pillPanels.addEventListener('click', () => setCategory('panels'));
        if (pillKeynotes) pillKeynotes.addEventListener('click', () => setCategory('keynotes'));
        if (pillBuilders) pillBuilders.addEventListener('click', () => setCategory(pillBuilders.dataset.target || 'sessions'));

        renderRoster(true); // initial staggered entrance
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
        schedSessionsGrid.innerHTML = '<div class="speaker-inline-row">' + builders.map((s) => speakerInlineHTML(s, s.originalIndex)).join('') + '</div>';
    }

    function handleCardClick(e) {
        // Let the LinkedIn links do their thing without opening the modal
        if (e.target.closest('a') || e.target.closest('.spk-li') || e.target.closest('.sp-li-btn')) return;

        const card = e.target.closest('.lineup-tile, .item-wrapper, .sp-btn-bio, .roster-spotlight-card, .ri-bloom-card, .asym-speaker-card, .speaker-card, .asym-hero-card, .asym-mini-card, .asym-poster-card, .speaker-inline-card');
        if (!card) return;

        const index = Number(card.dataset.speakerIndex);
        if (!Number.isNaN(index) && speakers[index]) {
            const parentWithTile = card.closest('[class*="bg-tile-"]');
            const tileMatch = (card.className && card.className.match && card.className.match(/bg-tile-(orange|purple|green|blue|pink)/))
                || (card.className && card.className.match && card.className.match(/\b(blue|green|pink)\b/))
                || (parentWithTile && parentWithTile.className && parentWithTile.className.match && parentWithTile.className.match(/bg-tile-(orange|purple|green|blue|pink)/));
            const tileClass = tileMatch ? (tileMatch[0].startsWith('bg-tile-') ? tileMatch[0] : `bg-tile-${tileMatch[0]}`) : '';
            openSpeakerModal(speakers[index], tileClass);
        }
    }

    [marqueeTrack, speakerGrid, aboutRosterStage, schedKeynotesGrid, schedPanelsGrid, schedSessionsGrid].forEach((container) => {
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

