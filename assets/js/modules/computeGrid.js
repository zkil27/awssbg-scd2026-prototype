/**
 * Compute Grid Module
 * --------------------------------------------------------------------------
 * A reactive, grid-aligned canvas background that turns the static 52px line
 * grid painted on <body> (see theme.css) into a live "compute fabric".
 *
 * Two composed behaviors, both driven by ONE requestAnimationFrame loop and
 * sharing ONE lit-cell map + color palette:
 *
 *   1. Reactive Compute Grid (primary) — cells near the cursor light up in
 *      brand colors and fade out behind it.
 *   2. Boot-up Sweep (first load) — a one-shot wavefront lights cells across
 *      the grid on entry, then settles.
 *
 * The canvas sits at z-index 0, position:fixed, pointer-events:none — above
 * the body's painted grid but behind all page content (.page/footer are
 * z-index:1). It reads the exact grid size + brand colors from the live CSS
 * custom properties, so it stays perfectly grid-aligned and theme-driven.
 *
 * Accessibility & performance: honors prefers-reduced-motion, disables hover
 * effects on coarse pointers, pauses when the tab is hidden, caps DPR, and
 * degrades to a no-op (leaving the static CSS grid intact) if the
 * canvas/context is unavailable. The reactive glow follows the cursor at any
 * scroll position, across the full length of every page.
 */

/* ============================ Tuning constants ============================ */
const CFG = {
  fallbackGridSize: 52,       // matches --grid-size in theme.css
  dprCap: 2,                  // cap devicePixelRatio for perf on hi-dpi/mobile

  // Lit cells
  cellInset: 1,               // px inset so lit squares sit inside grid lines
  cellDecayPerSec: 0.6,       // brightness units lost per second (higher = faster fade)
  cursorRadius: 0,            // Chebyshev radius (in cells) lit around the cursor (0 = single 1x1 cell)
  cursorCoreBrightness: 0.9,  // brightness at the hovered cell
  maxLitCells: 900,           // safety cap on the lit-cell map
  pointerMoveThrottleMs: 16,  // ~60fps pointer sampling

  // Boot-up sweep
  bootSweepMs: 1300,          // duration of the one-shot power-on sweep
  bootSweepBrightness: 0.8,   // brightness of freshly-swept cells
  bootSweepBandCells: 4,      // thickness (in cells) of the moving wavefront
  bootSweepDensity: 0.34,     // fraction of cells in the band that light up (higher = more boxes)

  // Ambient Blocks (Animated background boxes)
  blockOpacity: 1.0,          // High opacity for persistent boxes on desktop gutters
  mobileBlockOpacity: 0.32,   // Calibrated subtle opacity for mobile edge accents (guarantees text readability)
  blockRepeatY: 54,           // Vertical repeat interval (in rows)
  blockAnimIntervalMs: 4500,  // How often blocks decide to shift/recolor

  // Per-theme alpha multipliers (kept subtle so content stays dominant)
  alpha: {
    light: { cell: 0.30 },
    dark: { cell: 0.42 },
  },
};

const COLOR_VARS = ['--blue', '--purple', '--orange', '--green', '--pink'];

/* ================================ State ================================== */
let canvas = null;
let ctx = null;
let dpr = 1;
let viewW = 0;
let viewH = 0;
let gridSize = CFG.fallbackGridSize;

let colors = ['#44b3fe', '#a759ff', '#fc9907', '#07e383', '#fe57ea'];
let themeAlpha = CFG.alpha.light;

/** Lit cells: key "col,row" -> { b: brightness 0..1, c: colorIndex } */
const litCells = new Map();

let running = false;
let rafId = 0;
let lastTs = 0;
let startTs = 0;

let hasHover = true;         // false on coarse-pointer devices
let reducedMotion = false;
let pageVisible = true;

let pointerCell = null;      // { col, row } of last pointer position, or null
let lastPointerSampleTs = 0;

/* ============================== Utilities =============================== */
function readCssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function refreshColors() {
  colors = COLOR_VARS.map((v, i) => readCssVar(v, colors[i]));
  const theme = document.documentElement.getAttribute('data-theme');
  themeAlpha = theme === 'dark' ? CFG.alpha.dark : CFG.alpha.light;
}

function refreshGridSize() {
  const raw = readCssVar('--grid-size', `${CFG.fallbackGridSize}px`);
  const n = parseFloat(raw);
  gridSize = Number.isFinite(n) && n > 0 ? n : CFG.fallbackGridSize;
}

function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  if (!Number.isFinite(n)) return { r: 68, g: 179, b: 254 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgba(hex, a) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

function cellKey(col, row) {
  return col + ',' + row;
}

/** Boost (or set) a lit cell's brightness, keeping the strongest value. */
function lightCell(col, row, brightness, colorIndex) {
  if (litCells.size >= CFG.maxLitCells && !litCells.has(cellKey(col, row))) return;
  const key = cellKey(col, row);
  const existing = litCells.get(key);
  if (existing) {
    existing.b = Math.min(1, Math.max(existing.b, brightness));
  } else {
    litCells.set(key, {
      b: Math.min(1, brightness),
      c: colorIndex != null ? colorIndex : (Math.random() * colors.length) | 0,
    });
  }
}

/* ============================== Sizing ================================== */
function resize() {
  if (!canvas || !ctx) return;
  viewW = window.innerWidth;
  viewH = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, CFG.dprCap);
  canvas.width = Math.round(viewW * dpr);
  canvas.height = Math.round(viewH * dpr);
  canvas.style.width = viewW + 'px';
  canvas.style.height = viewH + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  refreshGridSize();
}

/* ============================ Lit cells ================================= */
function updateLitCells(dt) {
  const decay = CFG.cellDecayPerSec * dt;
  for (const [key, cell] of litCells) {
    cell.b -= decay;
    if (cell.b <= 0) litCells.delete(key);
  }
}

function drawLitCells() {
  const size = gridSize - CFG.cellInset * 2;
  // Cells are stored in DOCUMENT space; subtract scroll to place them on the
  // fixed canvas so they stay locked to the CSS grid painted on <body>.
  const scrollX = window.scrollX || window.pageXOffset || 0;
  const scrollY = window.scrollY || window.pageYOffset || 0;
  for (const [key, cell] of litCells) {
    const comma = key.indexOf(',');
    const col = +key.slice(0, comma);
    const row = +key.slice(comma + 1);
    const x = col * gridSize - scrollX + CFG.cellInset;
    const y = row * gridSize - scrollY + CFG.cellInset;
    if (x > viewW || y > viewH || x < -gridSize || y < -gridSize) continue;
    const a = themeAlpha.cell * cell.b;
    ctx.fillStyle = rgba(colors[cell.c % colors.length], a);
    ctx.fillRect(x, y, size, size);
  }
}

/* ============================ Boot sweep ================================ */
function runBootSweep(elapsed) {
  if (reducedMotion) return;
  const t = elapsed / CFG.bootSweepMs; // 0..1
  if (t >= 1) return;
  const currentW = viewW || window.innerWidth;
  const isMobile = currentW < 1024;
  const cols = Math.ceil(viewW / gridSize);
  const rows = Math.ceil(viewH / gridSize);
  const maxDiag = cols + rows;
  // Diagonal wavefront position (in col+row units).
  const front = t * maxDiag;
  const band = CFG.bootSweepBandCells;

  // On mobile, use softer density and brightness so initial entry is a smooth cyber accent
  const density = isMobile ? 0.16 : CFG.bootSweepDensity;
  const brightness = isMobile ? 0.40 : CFG.bootSweepBrightness;

  for (let col = 0; col <= cols; col++) {
    for (let row = 0; row <= rows; row++) {
      const d = col + row;
      if (d <= front && d > front - band) {
        // Only light a subset so it reads as cells, not a solid fill.
        if (Math.random() < density) {
          lightCell(col, row, brightness, (col + row) % colors.length);
        }
      }
    }
  }
}

/* ========================== Ambient Blocks ============================== */
/* Desktop ambient blocks (wide side gutters) */
const ambientBlocks = [
  // Left side
  { c: 1, r: 3, color: 4 }, { c: 2, r: 6, color: 0 }, { c: 1, r: 9, color: 3 }, { c: 2, r: 9, color: 2 },
  { c: 3, r: 13, color: 1 }, { c: 1, r: 17, color: 0 }, { c: 1, r: 21, color: 4 }, { c: 2, r: 21, color: 3 },
  { c: 1, r: 22, color: 2 }, { c: 3, r: 26, color: 1 }, { c: 1, r: 31, color: 0 }, { c: 2, r: 36, color: 4 },
  { c: 3, r: 36, color: 3 }, { c: 1, r: 41, color: 2 }, { c: 2, r: 47, color: 1 }, { c: 1, r: 53, color: 0 },
  // Left side extra
  { c: 2, r: 1, color: 2 }, { c: 4, r: 4, color: 1 }, { c: 1, r: 12, color: 0 }, { c: 4, r: 18, color: 3 },
  { c: 2, r: 24, color: 4 }, { c: 5, r: 29, color: 2 }, { c: 1, r: 34, color: 1 }, { c: 3, r: 39, color: 0 },
  { c: 2, r: 44, color: 4 }, { c: 4, r: 49, color: 3 }, { c: 1, r: 7, color: 2 }, { c: 3, r: 19, color: 1 },
  // Right side (negative col = from right edge)
  { c: -1, r: 2, color: 0 }, { c: -2, r: 5, color: 3 }, { c: -1, r: 8, color: 4 }, { c: -2, r: 8, color: 1 },
  { c: -3, r: 12, color: 2 }, { c: -1, r: 15, color: 0 }, { c: -2, r: 19, color: 3 }, { c: -1, r: 19, color: 4 },
  { c: -2, r: 20, color: 2 }, { c: -3, r: 24, color: 1 }, { c: -1, r: 29, color: 0 }, { c: -2, r: 34, color: 3 },
  { c: -1, r: 34, color: 4 }, { c: -3, r: 39, color: 2 }, { c: -1, r: 45, color: 1 }, { c: -2, r: 51, color: 3 },
  // Right side extra
  { c: -2, r: 1, color: 1 }, { c: -4, r: 4, color: 2 }, { c: -1, r: 12, color: 4 }, { c: -4, r: 18, color: 0 },
  { c: -2, r: 24, color: 3 }, { c: -5, r: 29, color: 1 }, { c: -1, r: 34, color: 2 }, { c: -4, r: 39, color: 4 },
  { c: -2, r: 44, color: 0 }, { c: -4, r: 49, color: 1 }, { c: -1, r: 7, color: 3 }, { c: -3, r: 19, color: 2 }
].map(b => ({
  ...b,
  currentC: b.c, currentR: b.r,
  targetC: b.c, targetR: b.r,
  lastAnimTs: Math.random() * 2000
}));

/* Mobile ambient blocks: strictly edge-anchored to col 0 (left edge) and col -1 (right edge).
   Spaced comfortably apart vertically so they frame the mobile screen without ever touching text. */
const mobileAmbientBlocks = [
  // Left edge (col 0)
  { c: 0, r: 4, color: 4 },
  { c: 0, r: 14, color: 0 },
  { c: 0, r: 25, color: 3 },
  { c: 0, r: 36, color: 1 },
  { c: 0, r: 47, color: 2 },
  // Right edge (col -1)
  { c: -1, r: 9, color: 1 },
  { c: -1, r: 19, color: 2 },
  { c: -1, r: 30, color: 4 },
  { c: -1, r: 41, color: 0 },
  { c: -1, r: 52, color: 3 },
].map(b => ({
  ...b,
  currentC: b.c, currentR: b.r,
  targetC: b.c, targetR: b.r,
  lastAnimTs: Math.random() * 2000
}));

function updateAmbientBlocks(ts, dt) {
  if (reducedMotion) return;
  const currentW = viewW || window.innerWidth;
  const totalCols = Math.floor(document.body.clientWidth / gridSize);
  const isMobile = currentW < 1024 || totalCols < 20;
  const blocks = isMobile ? mobileAmbientBlocks : ambientBlocks;

  for (const b of blocks) {
    if (ts - b.lastAnimTs > CFG.blockAnimIntervalMs) {
      b.lastAnimTs = ts + Math.random() * 500;
      // 50% chance to move, 50% chance to recolor
      if (Math.random() < 0.5) {
        if (isMobile) {
          // On mobile, keep column locked strictly to the edge (0 or -1);
          // only step vertically by ±1 tile so it NEVER drifts into body text.
          if (b.targetR === b.r) {
            b.targetR = b.r + (Math.random() < 0.5 ? -1 : 1);
          } else {
            b.targetR = b.r;
          }
        } else {
          // Desktop gutter behavior
          let tc, tr;
          if (b.targetC === b.c && b.targetR === b.r) {
            tc = b.c;
            tr = b.r;
            const rand = Math.random();
            if (rand < 0.25) tc = b.c - 1;
            else if (rand < 0.5) tc = b.c + 1;
            else if (rand < 0.75) tr = b.r - 1;
            else tr = b.r + 1;
          } else {
            tc = b.c;
            tr = b.r;
          }

          let collision = false;
          for (const other of blocks) {
            if (other !== b && other.targetC === tc && other.targetR === tr) {
              collision = true;
              break;
            }
          }
          if (!collision) {
            b.targetC = tc;
            b.targetR = tr;
          }
        }
      } else {
        b.color = (b.color + 1 + Math.floor(Math.random() * (colors.length - 1))) % colors.length;
      }
    }

    // Smoothly interpolate current to target position
    b.currentC += (b.targetC - b.currentC) * 14 * dt;
    b.currentR += (b.targetR - b.currentR) * 14 * dt;
  }
}

function drawAmbientBlocks() {
  const currentW = viewW || window.innerWidth;
  const totalCols = Math.floor(document.body.clientWidth / gridSize);
  const isMobile = currentW < 1024 || totalCols < 20;

  const blocks = isMobile ? mobileAmbientBlocks : ambientBlocks;
  const opacity = isMobile ? CFG.mobileBlockOpacity : CFG.blockOpacity;

  const size = gridSize;
  const scrollX = window.scrollX || window.pageXOffset || 0;
  const scrollY = window.scrollY || window.pageYOffset || 0;
  
  const visRows = Math.ceil(viewH / gridSize) + 2;
  const startVisRow = Math.floor(scrollY / gridSize) - 1;

  for (const b of blocks) {
    ctx.fillStyle = rgba(colors[b.color % colors.length], opacity);
    
    // Resolve right-aligned columns
    const actualCol = b.currentC < 0 ? totalCols + b.currentC : b.currentC;
    
    // Repeat vertically so the pattern covers the whole page
    for (let rep = -1; rep <= Math.ceil((startVisRow + visRows) / CFG.blockRepeatY) + 1; rep++) {
      const actualRow = b.currentR + rep * CFG.blockRepeatY;
      
      // Culling
      if (actualRow < startVisRow || actualRow > startVisRow + visRows) continue;

      // Snap to full integers to eliminate sub-pixel jitter/blur during movement
      const x = Math.round(actualCol * gridSize - scrollX);
      const y = Math.round(actualRow * gridSize - scrollY);

      // Wrap-around bounds guard for rendering
      if (x > viewW || x < -gridSize) continue;

      ctx.fillRect(x, y, size, size);
    }
  }
}

/* ============================== Pointer ================================= */
function onPointerMove(e) {
  if (!hasHover) return;
  const now = performance.now();
  
  if (now - lastPointerSampleTs < CFG.pointerMoveThrottleMs) return;
  lastPointerSampleTs = now;

  const docX = e.clientX + (window.scrollX || window.pageXOffset || 0);
  const docY = e.clientY + (window.scrollY || window.pageYOffset || 0);
  const col = Math.floor(docX / gridSize);
  const row = Math.floor(docY / gridSize);
  pointerCell = { col, row };

  const r = CFG.cursorRadius;
  for (let dc = -r; dc <= r; dc++) {
    for (let dr = -r; dr <= r; dr++) {
      const dist = Math.max(Math.abs(dc), Math.abs(dr));
      const brightness = CFG.cursorCoreBrightness * (1 - dist / (r + 1));
      if (brightness > 0.02) lightCell(col + dc, row + dr, brightness);
    }
  }
}

function onPointerLeave() {
  pointerCell = null;
}

/* =============================== Loop =================================== */
function frame(ts) {
  if (!running) return;
  const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0;
  lastTs = ts;
  const elapsed = ts - startTs;

  ctx.clearRect(0, 0, viewW, viewH);

  runBootSweep(elapsed);
  updateAmbientBlocks(ts, dt);
  updateLitCells(dt);

  // Z-index ordering from back to front:
  // 1. Lit Grid Cells (cursor glow)
  drawLitCells();
  // 2. Ambient Blocks (on top of everything so the cursor glow goes behind them)
  drawAmbientBlocks();

  rafId = requestAnimationFrame(frame);
}

function shouldRun() {
  // Runs across the whole page (any scroll position); only pause when the tab
  // is hidden. Lit cells are tracked in document space, so the cursor glow
  // stays grid-aligned no matter how far the page is scrolled.
  return pageVisible;
}

function start() {
  if (running || !ctx) return;
  if (reducedMotion) {
    // Minimal static state: one clear, no loop. (Cursor glow still works via
    // the pointermove handler painting a single frame; see maybePaintStatic.)
    return;
  }
  running = true;
  lastTs = 0;
  if (!startTs) startTs = performance.now();
  rafId = requestAnimationFrame(frame);
}

function stop() {
  running = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
}

function syncRunState() {
  if (shouldRun()) start();
  else stop();
}

/* For reduced-motion: paint a single static frame of just the lit cells
   (driven by the cursor) without any animation loop. */
function maybePaintStatic() {
  if (!reducedMotion || !ctx) return;
  ctx.clearRect(0, 0, viewW, viewH);
  drawLitCells();
}

/* ============================== Setup =================================== */
function createCanvas() {
  const c = document.createElement('canvas');
  c.id = 'computeGrid';
  c.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(c, document.body.firstChild);
  const context = c.getContext('2d');
  if (!context) {
    c.remove();
    return false;
  }
  canvas = c;
  ctx = context;
  return true;
}

function watchTheme() {
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.attributeName === 'data-theme') {
        refreshColors();
        break;
      }
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
}

export function initComputeGrid() {
  // Reduced-motion + coarse-pointer detection.
  const rmq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hoverq = window.matchMedia('(hover: none)');
  reducedMotion = rmq.matches;
  hasHover = !hoverq.matches;

  if (!createCanvas()) {
    // Graceful no-op: the static CSS grid remains fully intact.
    return;
  }

  refreshColors();
  resize();
  watchTheme();

  window.addEventListener('resize', () => {
    resize();
    maybePaintStatic();
  }, { passive: true });

  // Pointer reactivity (skipped on coarse pointers via the guard inside).
  window.addEventListener('pointermove', (e) => {
    onPointerMove(e);
    maybePaintStatic();
  }, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });

  // Pause when the tab is hidden.
  document.addEventListener('visibilitychange', () => {
    pageVisible = document.visibilityState === 'visible';
    syncRunState();
  });

  // React to OS-level reduced-motion changes at runtime.
  rmq.addEventListener('change', (e) => {
    reducedMotion = e.matches;
    if (reducedMotion) {
      stop();
      maybePaintStatic();
    } else {
      startTs = 0; // allow a fresh boot sweep
      syncRunState();
    }
  });

  syncRunState();
}
