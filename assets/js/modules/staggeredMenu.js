/**
 * AWS Student Community Day: South Summit 2026
 * StaggeredMenu Navigation Module (React Bits)
 * GSAP-powered layered drawer navigation with animated rolling button.
 */

const GSAP_CDN = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm';

let gsap = window.gsap || null;

async function ensureGSAP() {
  if (window.gsap) {
    gsap = window.gsap;
    return gsap;
  }
  try {
    const mod = await import(/* @vite-ignore */ GSAP_CDN);
    gsap = mod.gsap || mod.default || mod;
    window.gsap = gsap;
    return gsap;
  } catch (err) {
    console.warn('[StaggeredMenu] Failed to load GSAP from CDN:', err);
    return null;
  }
}

export async function initStaggeredMenu(config = {}) {
  const options = {
    position: 'right',
    displaySocials: true,
    displayItemNumbering: true,
    closeOnClickAway: true,
    ...config
  };

  const wrapper = document.querySelector('.staggered-menu-wrapper');
  if (!wrapper) return;

  const panel = wrapper.querySelector('#staggered-menu-panel') || document.querySelector('#staggered-menu-panel');
  const preLayersContainer = wrapper.querySelector('.sm-prelayers') || document.querySelector('.sm-prelayers');
  const toggleBtn = document.querySelector('.sm-toggle');
  const plusH = toggleBtn ? toggleBtn.querySelector('.sm-icon-line:not(.sm-icon-line-v)') : null;
  const plusV = toggleBtn ? toggleBtn.querySelector('.sm-icon-line-v') : null;
  const icon = toggleBtn ? toggleBtn.querySelector('.sm-icon') : null;
  const textWrap = toggleBtn ? toggleBtn.querySelector('.sm-toggle-textWrap') : null;
  const textInner = toggleBtn ? toggleBtn.querySelector('.sm-toggle-textInner') : null;
  const backdrop = wrapper.querySelector('.sm-backdrop') || document.querySelector('.sm-backdrop');

  if (!panel || !toggleBtn) return;

  const preLayers = preLayersContainer ? Array.from(preLayersContainer.querySelectorAll('.sm-prelayer')) : [];

  let open = false;
  let busy = false;
  let openTl = null;
  let closeTween = null;
  let spinTween = null;
  let textCycleAnim = null;

  // Load GSAP
  await ensureGSAP();
  if (!gsap) {
    console.warn('[StaggeredMenu] GSAP unavailable, running in fallback mode.');
    setupFallback();
    return;
  }

  const offscreen = options.position === 'left' ? -100 : 100;

  // Initial layout setup
  gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1 });
  if (preLayersContainer) gsap.set(preLayersContainer, { xPercent: 0, opacity: 1 });
  if (plusH) gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
  if (plusV) gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
  if (icon) gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
  if (textInner) gsap.set(textInner, { yPercent: 0 });

  function buildOpenTimeline() {
    if (!panel) return null;

    if (openTl) openTl.kill();
    if (closeTween) {
      closeTween.kill();
      closeTween = null;
    }

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
    const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
    const socialTitle = panel.querySelector('.sm-socials-title');
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));

    const layerStates = preLayers.map(el => ({ el, start: offscreen }));
    const panelStart = offscreen;

    if (itemEls.length) {
      gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    }
    if (numberEls.length) {
      gsap.set(numberEls, { '--sm-num-opacity': 0 });
    }
    if (socialTitle) {
      gsap.set(socialTitle, { opacity: 0 });
    }
    if (socialLinks.length) {
      gsap.set(socialLinks, { y: 25, opacity: 0 });
    }

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
    });

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.65;

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: 'power4.out',
          stagger: { each: 0.1, from: 'start' }
        },
        itemsStart
      );

      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.6,
            ease: 'power2.out',
            '--sm-num-opacity': 1,
            stagger: { each: 0.08, from: 'start' }
          },
          itemsStart + 0.1
        );
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4;
      if (socialTitle) {
        tl.to(
          socialTitle,
          {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out'
          },
          socialsStart
        );
      }
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power3.out',
            stagger: { each: 0.08, from: 'start' },
            onComplete: () => {
              gsap.set(socialLinks, { clearProps: 'opacity' });
            }
          },
          socialsStart + 0.04
        );
      }
    }

    openTl = tl;
    return tl;
  }

  function playOpen() {
    if (busy) return;
    busy = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busy = false;
      });
      tl.play(0);
    } else {
      busy = false;
    }
  }

  function playClose() {
    if (openTl) {
      openTl.kill();
      openTl = null;
    }

    const all = [...preLayers, panel];
    if (closeTween) closeTween.kill();

    closeTween = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
        if (itemEls.length) {
          gsap.set(itemEls, { yPercent: 140, rotate: 10 });
        }
        const numberEls = Array.from(panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item'));
        if (numberEls.length) {
          gsap.set(numberEls, { '--sm-num-opacity': 0 });
        }
        const socialTitle = panel.querySelector('.sm-socials-title');
        const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });
        busy = false;
      }
    });
  }

  function animateIcon(opening) {
    if (!icon) return;
    if (spinTween) spinTween.kill();
    if (opening) {
      spinTween = gsap.to(icon, { rotate: 225, duration: 0.8, ease: 'power4.out', overwrite: 'auto' });
    } else {
      spinTween = gsap.to(icon, { rotate: 0, duration: 0.35, ease: 'power3.inOut', overwrite: 'auto' });
    }
  }

  function animateText(opening) {
    if (!textInner) return;
    if (textCycleAnim) textCycleAnim.kill();

    const currentLabel = opening ? 'Menu' : 'Close';
    const targetLabel = opening ? 'Close' : 'Menu';
    const lineH = 16;
    const seq = [currentLabel, targetLabel];

    textInner.innerHTML = seq.map(l => `<span class="sm-toggle-line">${l}</span>`).join('');
    gsap.set(textInner, { y: 0 });

    textCycleAnim = gsap.to(textInner, {
      y: -lineH,
      duration: 0.35,
      ease: 'power3.out',
      onComplete: () => {
        textInner.innerHTML = `<span class="sm-toggle-line">${targetLabel}</span>`;
        gsap.set(textInner, { y: 0 });
      }
    });
  }

  function openMenu() {
    if (open) return;
    open = true;
    wrapper.setAttribute('data-open', 'true');
    document.documentElement.setAttribute('data-staggered-menu-open', 'true');
    document.body.classList.add('staggered-menu-open');
    panel.setAttribute('aria-hidden', 'false');
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.setAttribute('aria-label', 'Close menu');

    playOpen();
    animateIcon(true);
    animateText(true);
  }

  function closeMenu() {
    if (!open) return;
    open = false;
    wrapper.removeAttribute('data-open');
    document.documentElement.removeAttribute('data-staggered-menu-open');
    document.body.classList.remove('staggered-menu-open');
    panel.setAttribute('aria-hidden', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-label', 'Open menu');

    playClose();
    animateIcon(false);
    animateText(false);
  }

  function toggleMenu() {
    if (open) closeMenu();
    else openMenu();
  }

  // Toggle button click
  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMenu();
  });

  // Click outside / backdrop to close
  if (options.closeOnClickAway) {
    document.addEventListener('mousedown', (event) => {
      if (!open) return;
      if (!panel.contains(event.target) && !toggleBtn.contains(event.target)) {
        closeMenu();
      }
    });

    if (backdrop) {
      backdrop.addEventListener('click', () => {
        if (open) closeMenu();
      });
    }
  }

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) {
      closeMenu();
    }
  });

  // Auto-close desktop menu if resized to mobile
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 980 && open) {
      closeMenu();
    }
  }, { passive: true });

  // Intercept navigation link clicks inside the panel
  panel.addEventListener('click', (e) => {
    // 1. External social links: stop propagation so document handlers never intercept
    const socialLink = e.target.closest('.sm-socials-link');
    if (socialLink) {
      e.stopPropagation();
      setTimeout(() => {
        closeMenu();
      }, 100);
      return;
    }

    // 2. Navigation items
    const item = e.target.closest('.sm-panel-item');
    if (!item) return;

    const page = item.getAttribute('data-page');
    const href = item.getAttribute('href');

    if (page) {
      e.preventDefault();
      closeMenu();
      if (window.showPage) {
        window.showPage(page);
      }
    } else if (href && href.startsWith('#')) {
      e.preventDefault();
      closeMenu();

      const targetId = href.replace(/^#/, '');
      const targetSelector = targetId === 'agenda' ? '#program' : href;
      const curPage = document.documentElement.getAttribute('data-page') || 'home';

      if (curPage !== 'home') {
        if (window.showPage) {
          window.showPage('home', true, true, targetSelector);
        }
      } else {
        const el = document.querySelector(targetSelector);
        if (el) {
          const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
          const targetY = Math.max(0, el.getBoundingClientRect().top + window.scrollY - navH + 10);
          if (window.__lenis && typeof window.__lenis.scrollTo === 'function') {
            window.__lenis.scrollTo(targetY, {
              duration: 1.1,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
          } else {
            window.scrollTo({ top: targetY, behavior: 'smooth' });
          }
          history.pushState({ page: 'home', section: targetId }, '', href);
        }
      }
    }
  });

  // Update active state in panel when route changes
  function updateActiveItem() {
    const curPage = document.documentElement.getAttribute('data-page') || 'home';
    panel.querySelectorAll('.sm-panel-item').forEach(el => {
      const p = el.getAttribute('data-page');
      if (p === curPage) {
        el.classList.add('active');
        el.setAttribute('aria-current', 'page');
      } else {
        el.classList.remove('active');
        el.removeAttribute('aria-current');
      }
    });
  }

  window.addEventListener('popstate', updateActiveItem);
  const origShowPage = window.showPage;
  if (origShowPage) {
    window.showPage = function(name, record, animate) {
      const res = origShowPage.apply(this, arguments);
      updateActiveItem();
      return res;
    };
  }
  updateActiveItem();

  // Expose global methods if needed
  window.openStaggeredMenu = openMenu;
  window.closeStaggeredMenu = closeMenu;
  window.toggleStaggeredMenu = toggleMenu;

  function setupFallback() {
    toggleBtn.addEventListener('click', () => {
      open = !open;
      wrapper.toggleAttribute('data-open', open);
      panel.setAttribute('aria-hidden', String(!open));
      toggleBtn.setAttribute('aria-expanded', String(open));
      panel.style.transform = open ? 'translateX(0)' : 'translateX(100%)';
      panel.style.opacity = open ? '1' : '0';
    });
  }
}
