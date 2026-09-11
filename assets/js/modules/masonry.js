/**
 * AWS Student Community Day: South Summit 2026
 * Masonry Component Module (React Bits)
 * High-performance GSAP-driven responsive masonry layout with dynamic columns,
 * image preloading, directional entrance animations, and hover interactions.
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
    console.warn('[Masonry] Failed to load GSAP from CDN:', err);
    return null;
  }
}

/**
 * Preload images before animation to prevent layout thrashing
 */
async function preloadImages(urls) {
  if (!urls || urls.length === 0) return;
  await Promise.all(
    urls.map(
      src =>
        new Promise(resolve => {
          if (!src) return resolve();
          const img = new Image();
          img.src = src;
          img.onload = img.onerror = () => resolve();
        })
    )
  );
}

/**
 * Responsive column count matching React Bits breakpoints
 */
function getColumnCount() {
  if (typeof window === 'undefined') return 1;
  const queries = [
    '(min-width: 1500px)',
    '(min-width: 1000px)',
    '(min-width: 600px)',
    '(min-width: 400px)'
  ];
  const values = [5, 4, 3, 2];
  const idx = queries.findIndex(q => window.matchMedia(q).matches);
  return idx !== -1 ? values[idx] : 1;
}

/**
 * Calculate initial off-screen coordinates based on animateFrom
 */
function getInitialPosition(item, animateFrom, containerRect) {
  if (!containerRect) return { x: item.x, y: item.y };

  let direction = animateFrom;
  if (animateFrom === 'random') {
    const directions = ['top', 'bottom', 'left', 'right'];
    direction = directions[Math.floor(Math.random() * directions.length)];
  }

  const offset = 140;

  switch (direction) {
    case 'top':
      return { x: item.x, y: item.y - offset };
    case 'bottom':
      return { x: item.x, y: item.y + offset };
    case 'left':
      return { x: item.x - offset, y: item.y };
    case 'right':
      return { x: item.x + offset, y: item.y };
    case 'center':
      return {
        x: (containerRect.width || 800) / 2 - item.w / 2,
        y: item.y + 60
      };
    default:
      return { x: item.x, y: item.y + offset };
  }
}

export class Masonry {
  /**
   * @param {HTMLElement|string} container
   * @param {Object} options
   */
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) {
      throw new Error('[Masonry] Container element not found');
    }

    this.options = {
      items: [],
      ease: 'power3.out',
      duration: 0.6,
      stagger: 0.05,
      animateFrom: 'bottom',
      scaleOnHover: true,
      hoverScale: 0.95,
      blurToFocus: true,
      colorShiftOnHover: false,
      renderItem: null, // custom HTML string or DOM node generator
      onItemClick: null,
      ...options
    };

    this.items = [...this.options.items];
    this.hasMounted = false;
    this.imagesReady = false;
    this.width = 0;
    this.height = 0;
    this.resizeObserver = null;
    this.mediaListeners = [];
    this.grid = [];
    this.isDestroyed = false;

    this.init();
  }

  async init() {
    await ensureGSAP();

    this.container.classList.add('list');

    // Preload item images
    const imageUrls = this.items.map(i => i.img).filter(Boolean);
    preloadImages(imageUrls).then(() => {
      this.imagesReady = true;
      this.layout(false);
    });

    // Setup ResizeObserver to track container width
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(([entry]) => {
        if (!entry) return;
        const newWidth = entry.contentRect.width;
        if (newWidth > 0 && Math.abs(newWidth - this.width) > 1) {
          this.width = newWidth;
          if (this.imagesReady) {
            this.layout(true);
          }
        }
      });
      this.resizeObserver.observe(this.container);
    }

    // Media query listeners for responsive column transitions
    const queries = [
      '(min-width: 1500px)',
      '(min-width: 1000px)',
      '(min-width: 600px)',
      '(min-width: 400px)'
    ];
    queries.forEach(q => {
      const mql = window.matchMedia(q);
      const handler = () => {
        if (this.imagesReady) {
          this.layout(true);
        }
      };
      mql.addEventListener('change', handler);
      this.mediaListeners.push({ mql, handler });
    });

    // Initial width capture
    this.width = this.container.getBoundingClientRect().width || this.container.offsetWidth;
  }

  /**
   * Computes grid positions for all items using shortest-column greedy packing
   */
  computeGrid() {
    if (!this.width || this.items.length === 0) return [];

    const columns = getColumnCount();
    const colHeights = new Array(columns).fill(0);
    const columnWidth = this.width / columns;

    return this.items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col;
      const height = (child.height || 400) / 2;
      const y = colHeights[col];

      colHeights[col] += height;

      return {
        ...child,
        x,
        y,
        w: columnWidth,
        h: height,
        col
      };
    });
  }

  /**
   * Renders DOM elements and triggers GSAP positioning
   */
  layout(isUpdate = false) {
    if (this.isDestroyed || !this.container) return;

    // Refresh width if currently 0
    if (!this.width || this.width === 0) {
      this.width = this.container.getBoundingClientRect().width || this.container.offsetWidth;
      if (!this.width) {
        const wrap = this.container.closest('.wrap');
        this.width = wrap?.getBoundingClientRect().width || (typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.94, 1720) : 1200);
      }
    }
    if (!this.width) return;

    this.grid = this.computeGrid();

    // Calculate total height needed and set container height so parents (e.g. accordion)
    // can measure scrollHeight correctly without collapsing.
    const columns = getColumnCount();
    const colHeights = new Array(columns).fill(0);
    this.grid.forEach(item => {
      if (item.col !== undefined) {
        colHeights[item.col] = Math.max(colHeights[item.col], item.y + item.h);
      }
    });
    const maxH = Math.max(...colHeights, 0);
    this.container.style.height = `${maxH}px`;

    // Ensure DOM wrappers exist for all items
    this.renderElements();

    // Animate item positions with GSAP
    this.animateGrid(isUpdate);
  }

  renderElements() {
    const existingKeys = new Set();
    const currentElements = Array.from(this.container.querySelectorAll('.item-wrapper'));

    currentElements.forEach(el => {
      const key = el.getAttribute('data-key');
      if (key) existingKeys.add(key);
    });

    const activeKeys = new Set(this.grid.map(item => String(item.id)));

    // Remove obsolete items
    currentElements.forEach(el => {
      const key = el.getAttribute('data-key');
      if (key && !activeKeys.has(key)) {
        if (gsap) {
          gsap.to(el, {
            opacity: 0,
            scale: 0.8,
            duration: 0.25,
            ease: 'power2.in',
            onComplete: () => el.remove()
          });
        } else {
          el.remove();
        }
      }
    });

    // Create or update items
    this.grid.forEach(item => {
      const key = String(item.id);
      let wrapper = this.container.querySelector(`.item-wrapper[data-key="${key}"]`);

      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'item-wrapper';
        wrapper.setAttribute('data-key', key);
        wrapper.setAttribute('role', 'listitem');
        wrapper.setAttribute('tabindex', '0');

        if (item.extraClasses) {
          wrapper.className += ` ${item.extraClasses}`;
        }
        if (item.tileTheme) {
          wrapper.className += ` ${item.tileTheme}`;
        }
        if (item.originalIndex !== undefined) {
          wrapper.setAttribute('data-speaker-index', String(item.originalIndex));
        }
        if (item.color) {
          wrapper.style.setProperty('--tile-accent', `var(--${item.color})`);
        }

        // Custom renderer or default React Bits inner structure
        if (typeof this.options.renderItem === 'function') {
          wrapper.innerHTML = this.options.renderItem(item);
        } else {
          wrapper.innerHTML = `
            <div class="item-img" style="background-image: url('${item.img}');">
              ${
                this.options.colorShiftOnHover
                  ? `<div class="color-overlay"></div>`
                  : ''
              }
            </div>
          `;
        }

        // Bind interactions
        this.bindItemEvents(wrapper, item);
        this.container.appendChild(wrapper);
      }
    });
  }

  bindItemEvents(wrapper, item) {
    const key = String(item.id);
    const selector = `[data-key="${key}"]`;

    // Click handler
    wrapper.addEventListener('click', e => {
      if (typeof this.options.onItemClick === 'function') {
        this.options.onItemClick(e, item);
        return;
      }
      if (item.onClick) {
        item.onClick(e, item);
        return;
      }
      if (item.url) {
        window.open(item.url, '_blank', 'noopener');
      }
    });

    // Keydown accessibility (Enter / Space opens)
    wrapper.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        wrapper.click();
      }
    });

    // Hover scale & color shift
    wrapper.addEventListener('mouseenter', () => {
      if (!gsap) return;

      if (this.options.scaleOnHover) {
        gsap.to(wrapper, {
          scale: this.options.hoverScale,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }

      if (this.options.colorShiftOnHover) {
        const overlay = wrapper.querySelector('.color-overlay');
        if (overlay) {
          gsap.to(overlay, {
            opacity: 0.3,
            duration: 0.3,
            overwrite: 'auto'
          });
        }
      }
    });

    wrapper.addEventListener('mouseleave', () => {
      if (!gsap) return;

      if (this.options.scaleOnHover) {
        gsap.to(wrapper, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }

      if (this.options.colorShiftOnHover) {
        const overlay = wrapper.querySelector('.color-overlay');
        if (overlay) {
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.3,
            overwrite: 'auto'
          });
        }
      }
    });
  }

  animateGrid(isUpdate = false) {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const containerRect = this.container.getBoundingClientRect();

    this.grid.forEach((item, index) => {
      const selector = `.item-wrapper[data-key="${item.id}"]`;
      const el = this.container.querySelector(selector);
      if (!el) return;

      const animationProps = {
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h
      };

      if (prefersReduced || !gsap) {
        // Instant positioning for reduced motion or without GSAP
        el.style.transform = `translate(${item.x}px, ${item.y}px)`;
        el.style.width = `${item.w}px`;
        el.style.height = `${item.h}px`;
        el.style.opacity = '1';
        el.style.filter = 'none';
        return;
      }

      if (!this.hasMounted && !isUpdate) {
        // Initial entrance choreography
        this.playEntranceAnimation(0);
        return;
      } else {
        // Fluid repositioning on resize or data update
        gsap.to(el, {
          opacity: 1,
          ...animationProps,
          duration: this.options.duration,
          ease: this.options.ease,
          overwrite: 'auto'
        });
      }
    });

    this.hasMounted = true;
  }

  /**
   * Replays the signature React Bits appearing entrance animation
   * (directional sweep + stagger + blur-to-focus)
   * @param {number} delay - Optional initial delay in seconds
   */
  playEntranceAnimation(delay = 0) {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Refresh width if currently 0
    if (!this.width || this.width === 0) {
      this.width = this.container.getBoundingClientRect().width || this.container.offsetWidth;
      if (!this.width) {
        const wrap = this.container.closest('.wrap');
        this.width = wrap?.getBoundingClientRect().width || (typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.94, 1720) : 1200);
      }
    }
    if (!this.width) return;

    this.grid = this.computeGrid();

    // Set container height for parent accordion
    const columns = getColumnCount();
    const colHeights = new Array(columns).fill(0);
    this.grid.forEach(item => {
      if (item.col !== undefined) {
        colHeights[item.col] = Math.max(colHeights[item.col], item.y + item.h);
      }
    });
    const maxH = Math.max(...colHeights, 0);
    this.container.style.height = `${maxH}px`;

    this.renderElements();

    const containerRect = this.container.getBoundingClientRect();

    this.grid.forEach((item, index) => {
      const el = this.container.querySelector(`.item-wrapper[data-key="${item.id}"]`);
      if (!el) return;

      const animationProps = {
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h,
        scale: 1
      };

      if (prefersReduced || !gsap) {
        el.style.transform = `translate(${item.x}px, ${item.y}px)`;
        el.style.width = `${item.w}px`;
        el.style.height = `${item.h}px`;
        el.style.opacity = '1';
        el.style.filter = 'none';
        return;
      }

      gsap.killTweensOf(el);

      const initialPos = getInitialPosition(
        item,
        this.options.animateFrom,
        containerRect
      );

      const initialState = {
        opacity: 0,
        x: initialPos.x,
        y: initialPos.y,
        width: item.w,
        height: item.h,
        scale: 0.95,
        ...(this.options.blurToFocus && { filter: 'blur(10px)' })
      };

      gsap.fromTo(el, initialState, {
        opacity: 1,
        ...animationProps,
        ...(this.options.blurToFocus && { filter: 'blur(0px)' }),
        duration: 0.75,
        ease: this.options.ease || 'power3.out',
        delay: delay + index * this.options.stagger,
        overwrite: 'auto'
      });
    });

    this.hasMounted = true;
  }

  /**
   * Update items dynamically (e.g. category filter changes)
   */
  setItems(newItems) {
    this.items = [...newItems];
    const imageUrls = this.items.map(i => i.img).filter(Boolean);
    preloadImages(imageUrls).then(() => {
      this.layout(true);
    });
  }

  /**
   * Refresh layout calculation (useful when parent accordion expands)
   */
  relayout() {
    this.width = this.container.getBoundingClientRect().width || this.container.offsetWidth;
    this.layout(true);
  }

  destroy() {
    this.isDestroyed = true;
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.mediaListeners.forEach(({ mql, handler }) => {
      mql.removeEventListener('change', handler);
    });
    this.mediaListeners = [];
  }
}

export default Masonry;
