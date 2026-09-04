export function initMouseTrail() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

    const trailContainer = document.createElement('div');
    trailContainer.id = 'trail-container';
    trailContainer.style.position = 'fixed';
    trailContainer.style.top = '0';
    trailContainer.style.left = '0';
    trailContainer.style.width = '100vw';
    trailContainer.style.height = '100vh';
    trailContainer.style.pointerEvents = 'none';
    trailContainer.style.zIndex = '9999';
    document.body.appendChild(trailContainer);

    const colors = ['#44b3fe', '#07e383', '#fe57ea', '#fc9907', '#a759ff'];
    let lastX = 0;
    let lastY = 0;
    let colorIndex = 0;
    let lastTime = 0;

    function createTrail(x, y) {
        const now = Date.now();
        if (now - lastTime < 30) return; // limit emission rate
        
        // Calculate distance
        const dx = x - lastX;
        const dy = y - lastY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 10 && lastTime !== 0) return; // avoid too close particles
        
        lastX = x;
        lastY = y;
        lastTime = now;

        const particle = document.createElement('div');
        const size = Math.random() * 12 + 6;
        
        particle.style.position = 'absolute';
        particle.style.left = `${x - size/2}px`;
        particle.style.top = `${y - size/2}px`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.borderRadius = '0';
        particle.style.backgroundColor = colors[colorIndex % colors.length];
        particle.style.opacity = '0.7';
        particle.style.transform = 'scale(1)';
        particle.style.transition = 'transform 2s cubic-bezier(0.1, 0.9, 0.2, 1), opacity 2s ease-out';
        particle.style.boxShadow = `0 0 ${size * 2}px ${colors[colorIndex % colors.length]}`;

        trailContainer.appendChild(particle);
        colorIndex++;

        // Trigger animation
        requestAnimationFrame(() => {
            particle.style.transform = 'scale(0) translateY(-20px)';
            particle.style.opacity = '0';
        });

        // Cleanup after 2 seconds
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 2000);
    }

    window.addEventListener('mousemove', (e) => {
        createTrail(e.clientX, e.clientY);
    }, { passive: true });

    if (isMobile) {
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                createTrail(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });
    }
}
