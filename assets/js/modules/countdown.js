/***
 * Countodwn Timer Module
 * Calculates and renders the time remaining til the summit start.
 */

// Event date is October 7, 2026 at 08:00 AM (Philippine Time) — per official summit schedule
// CHANGE THIS IN CASE OF TIME CHANGE VVVVV
const target = new Date('2026-10-07T08:00:00+08:00').getTime();

export function initCountdown() {
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-mins');
    const secsEl = document.getElementById('cd-secs');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;


    function tick() {
        const diff = Math.max(target - Date.now(), 0);

        daysEl.textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
        hoursEl.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
        minsEl.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        secsEl.textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    }

    tick();
    setInterval(tick, 1000);
}