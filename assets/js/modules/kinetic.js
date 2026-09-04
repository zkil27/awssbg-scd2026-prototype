/**
 * kinetic.js
 * Applies kinetic typography effects to text elements.
 * - Mouse Move: Rotates and skews based on cursor position relative to screen center.
 */

export function initKineticTypography() {
  const kineticElements = document.querySelectorAll('.kinetic-text');
  if (!kineticElements.length) return;

  let mouseX = 0;
  let mouseY = 0;
  let targetSkew = 0;
  let targetRotate = 0;
  let currentSkew = 0;
  let currentRotate = 0;

  // Track mouse position
  window.addEventListener('mousemove', (e) => {
    // Normalize mouse position from -1 to 1 based on screen center
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    
    mouseX = x;
    mouseY = y;
    
    // Calculate target transformations (aggressive but readable)
    targetSkew = mouseX * -15; // Max 15deg skew
    targetRotate = mouseX * mouseY * 5; // Max 5deg rotation
  });

  // Smooth animation loop
  function animate() {
    // Lerp for smoothness
    currentSkew += (targetSkew - currentSkew) * 0.1;
    currentRotate += (targetRotate - currentRotate) * 0.1;

    kineticElements.forEach(el => {
      el.style.transform = `skewX(${currentSkew}deg) rotate(${currentRotate}deg)`;
    });

    requestAnimationFrame(animate);
  }

  animate();
}
