/**
 * venueUI.js — SCD South Summit 2026
 * Handles interactive enhancements for the Venue section:
 * - Multi-image interactive gallery & carousel (arrows, tabs, touch swipe, keyboard)
 * - Space switching linked with floor directory rows
 * - One-click address copy to clipboard
 */

export function initVenueUI() {
  initVenueCopy();
  initVenueGallery();
}

/**
 * Copy Venue Address to Clipboard
 */
function initVenueCopy() {
  const copyBtn = document.getElementById('btnCopyVenueAddr');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', () => {
    const address = "Biñan People's Center Auditorium, Biñan, Laguna, Philippines";
    const labelEl = document.getElementById('btnCopyText');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(address).then(() => {
        if (labelEl) {
          const original = labelEl.textContent;
          labelEl.textContent = 'Copied to Clipboard! ✓';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            labelEl.textContent = original;
            copyBtn.classList.remove('copied');
          }, 2400);
        }
      }).catch(() => {
        fallbackCopy(address, labelEl, copyBtn);
      });
    } else {
      fallbackCopy(address, labelEl, copyBtn);
    }
  });
}

function fallbackCopy(text, labelEl, btnEl) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    if (labelEl) {
      const original = labelEl.textContent;
      labelEl.textContent = 'Copied! ✓';
      btnEl.classList.add('copied');
      setTimeout(() => {
        labelEl.textContent = original;
        btnEl.classList.remove('copied');
      }, 2400);
    }
  } catch (err) {
    window.open("https://www.google.com/maps/place/Bi%C3%B1an+People's+Center+Auditorium", "_blank");
  }
}

/**
 * Multi-Image Venue Gallery & Carousel
 */
function initVenueGallery() {
  const gallery = document.getElementById('venueGallery');
  if (!gallery) return;

  const slides = Array.from(gallery.querySelectorAll('.venue-gallery-slide'));
  if (slides.length === 0) return;

  const prevBtn = document.getElementById('venuePrevBtn');
  const nextBtn = document.getElementById('venueNextBtn');
  const tabsContainer = document.getElementById('venueGalleryTabs');
  const counterEl = document.getElementById('venueGalleryCounter');
  const tagEl = document.getElementById('venueGalleryTag');
  const tagTextEl = document.getElementById('venueGalleryTagText');
  const capacityEl = document.getElementById('venueGalleryCapacity');
  const coordsEl = document.getElementById('venueGalleryCoords');
  const floorRows = Array.from(document.querySelectorAll('.venue-floor-clickable'));

  let currentIndex = 0;
  const total = slides.length;
  let autoTimer = null;
  const AUTO_INTERVAL_MS = 6000;

  // If only 1 image, hide navigation buttons and tabs
  if (total <= 1) {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (tabsContainer) tabsContainer.style.display = 'none';
    if (counterEl) counterEl.style.display = 'none';
    return;
  }

  // Populate or synchronize space tabs
  if (tabsContainer) {
    tabsContainer.innerHTML = '';
    slides.forEach((slide, idx) => {
      const label = slide.dataset.label || `Space ${idx + 1}`;
      const tabBtn = document.createElement('button');
      tabBtn.type = 'button';
      tabBtn.className = `venue-tab-btn ${idx === 0 ? 'active' : ''}`;
      tabBtn.setAttribute('data-index', idx);
      tabBtn.setAttribute('role', 'tab');
      tabBtn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      tabBtn.textContent = label;

      tabBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(idx);
        restartAutoTimer();
      });

      tabsContainer.appendChild(tabBtn);
    });
  }

  function goToSlide(newIndex) {
    if (newIndex < 0) {
      currentIndex = total - 1;
    } else if (newIndex >= total) {
      currentIndex = 0;
    } else {
      currentIndex = newIndex;
    }

    const activeSlide = slides[currentIndex];

    // 1. Update slides active state
    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add('active');
        slide.setAttribute('aria-hidden', 'false');
      } else {
        slide.classList.remove('active');
        slide.setAttribute('aria-hidden', 'true');
      }
    });

    // 2. Update tabs
    if (tabsContainer) {
      const tabBtns = tabsContainer.querySelectorAll('.venue-tab-btn');
      tabBtns.forEach((btn, idx) => {
        if (idx === currentIndex) {
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');
        } else {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        }
      });
    }

    // 3. Update HUD chips
    if (counterEl) {
      const curStr = String(currentIndex + 1).padStart(2, '0');
      const totStr = String(total).padStart(2, '0');
      counterEl.textContent = `${curStr} / ${totStr}`;
    }

    if (tagTextEl && activeSlide.dataset.tag) {
      tagTextEl.textContent = activeSlide.dataset.tag;
    }

    if (tagEl && activeSlide.dataset.tagClass) {
      tagEl.className = `venue-chip ${activeSlide.dataset.tagClass}`;
    }

    if (capacityEl && activeSlide.dataset.capacity) {
      capacityEl.textContent = activeSlide.dataset.capacity;
    }

    if (coordsEl && activeSlide.dataset.coords) {
      coordsEl.textContent = activeSlide.dataset.coords;
    }

    // 4. Update corresponding floor row highlight
    floorRows.forEach(row => {
      const targetIdx = parseInt(row.dataset.venueTarget, 10);
      if (targetIdx === currentIndex) {
        row.classList.add('active-floor');
      } else {
        row.classList.remove('active-floor');
      }
    });
  }

  // Prev / Next button clicks
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(currentIndex - 1);
      restartAutoTimer();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(currentIndex + 1);
      restartAutoTimer();
    });
  }

  // Interactive Floor Rows (Click to jump to that photo!)
  floorRows.forEach(row => {
    const handleActivate = () => {
      const targetIdx = parseInt(row.dataset.venueTarget, 10);
      if (!isNaN(targetIdx)) {
        goToSlide(targetIdx);
        restartAutoTimer();
      }
    };

    row.addEventListener('click', handleActivate);
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleActivate();
      }
    });
  });

  // Keyboard navigation on gallery
  gallery.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToSlide(currentIndex - 1);
      restartAutoTimer();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToSlide(currentIndex + 1);
      restartAutoTimer();
    }
  });

  // Touch Swipe Handling
  let touchStartX = 0;
  let touchStartY = 0;

  gallery.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      pauseAutoTimer();
    }
  }, { passive: true });

  gallery.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches.length > 0) {
      const diffX = e.changedTouches[0].clientX - touchStartX;
      const diffY = e.changedTouches[0].clientY - touchStartY;

      // Ensure horizontal swipe is dominant and exceeds threshold
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 35) {
        if (diffX < 0) {
          goToSlide(currentIndex + 1); // Swipe left = next
        } else {
          goToSlide(currentIndex - 1); // Swipe right = prev
        }
      }
      restartAutoTimer();
    }
  }, { passive: true });

  // Auto-advance Timer (pauses on hover or focus)
  function startAutoTimer() {
    stopAutoTimer();
    autoTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, AUTO_INTERVAL_MS);
  }

  function stopAutoTimer() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function pauseAutoTimer() {
    stopAutoTimer();
  }

  function restartAutoTimer() {
    stopAutoTimer();
    startAutoTimer();
  }

  gallery.addEventListener('mouseenter', pauseAutoTimer);
  gallery.addEventListener('mouseleave', startAutoTimer);
  gallery.addEventListener('focusin', pauseAutoTimer);
  gallery.addEventListener('focusout', startAutoTimer);

  // Check prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    startAutoTimer();
  }

  // Initialize first slide state
  goToSlide(0);
}
