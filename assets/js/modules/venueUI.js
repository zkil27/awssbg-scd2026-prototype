/**
 * venueUI.js — SCD South Summit 2026
 * Handles interactive enhancements for the Venue section (clipboard copy, tooltips).
 */

export function initVenueUI() {
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
