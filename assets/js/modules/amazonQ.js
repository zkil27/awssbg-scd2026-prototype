/**
 * Amazon Q Assistant Widget & Concierge Engine
 * Handles modal dialog interaction, quick action chips, and intelligent FAQ matching.
 */

const FAQ_KNOWLEDGE_BASE = [
    {
        keywords: ['what is', 'about scd', 'summit overview', 'theme', 'about the summit'],
        response: `<b>AWS Student Community Day: South Summit 2026</b> is a student-led conference centered on <b>"Cloud × AI: Build. Power. Lead."</b> bringing together ~200 student builders, cloud leaders, and tech advocates across CALABARZON!`
    },
    {
        keywords: ['when', 'date', 'where', 'location', 'venue', 'place', 'venues'],
        response: `📅 <b>Date:</b> October 7, 2026 (08:00 AM – 05:00 PM PHT)<br>📍 <b>Location:</b> Twin venues across Laguna & Batangas!`
    },
    {
        keywords: ['register', 'registration', 'ticket', 'cost', 'fee', 'free', 'join', 'luma', 'tickets'],
        response: `🎟️ <b>Registration is 100% FREE!</b> You can reserve your spot right now on our official Luma event page: <a href="https://lu.ma/aws-scd-south-summit-2026" target="_blank" rel="noopener">Register on Luma</a>.`
    },
    {
        keywords: ['speaker', 'speakers', 'talk', 'session', 'sponsor', 'sponsors', 'call'],
        response: `🎤 <b>Call for Speakers & Sponsors:</b> We welcome cloud architects, student leaders, and industry partners! Email us or reach out on social media to submit a session or become a partner.`
    },
    {
        keywords: ['merch', 'merchandise', 'swag', 'shirt', 'hoodie', 'bag', 'tote', 'lanyard', 'stickers'],
        response: `👕 <b>Summit Merchandise:</b> Attendees receive exclusive summit badges, stickers, and swag! Check out our <a href="#" onclick="showPage('merch'); return false;">Merch Catalog</a> for previews.`
    }
];

export function initAmazonQ() {
    const aqBubble = document.getElementById('amazonQBubble');
    const aqBot = document.getElementById('amazonQBot');
    const aqBubbleCta = document.getElementById('amazonQBubbleCta');
    const aqBackdrop = document.getElementById('aqModalBackdrop');
    const aqClose = document.getElementById('aqModalClose');
    const aqBody = document.getElementById('aqModalBody');
    const aqForm = document.getElementById('aqForm');
    const aqInput = document.getElementById('aqInput');
    const aqChips = document.querySelectorAll('.aq-chip');

    if (!aqBot || !aqBackdrop) return;

    // Show initial bubble prompt
    if (aqBubble) aqBubble.hidden = false;

    function toggleModal() {
        if (aqBubble) aqBubble.hidden = true;
        const isHidden = aqBackdrop.hidden;
        aqBackdrop.hidden = !isHidden;
        if (aqBackdrop.hidden === false && aqInput) {
            aqInput.focus();
        }
    }

    function closeModal() {
        aqBackdrop.hidden = true;
    }

    // Open/Toggle handlers
    aqBot.addEventListener('click', toggleModal);
    if (aqBubbleCta) aqBubbleCta.addEventListener('click', toggleModal);
    if (aqClose) aqClose.addEventListener('click', closeModal);

    // Close on ESC key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !aqBackdrop.hidden) closeModal();
    });

    function appendMessage(text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `aq-msg ${isUser ? 'aq-msg--user' : 'aq-msg--system'}`;
        msgDiv.innerHTML = `<div class="aq-msg-bubble">${text}</div>`;
        aqBody.appendChild(msgDiv);
        aqBody.scrollTop = aqBody.scrollHeight;
    }

    function processQuestion(userQuery) {
        const queryLower = userQuery.toLowerCase().trim();
        appendMessage(userQuery, true);

        // Find matching FAQ entry
        let match = FAQ_KNOWLEDGE_BASE.find(faq =>
            faq.keywords.some(kw => queryLower.includes(kw))
        );

        setTimeout(() => {
            if (match) {
                appendMessage(match.response, false);
            } else {
                appendMessage(
                    `I'm still learning about that! 🚀 For custom inquiries, please visit our <a href="https://lu.ma/aws-scd-south-summit-2026" target="_blank" rel="noopener">Luma Page</a> or connect with our team on social media!`,
                    false
                );
            }
        }, 300);
    }

    // Quick chip action triggers
    aqChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const question = chip.getAttribute('data-question');
            if (question) processQuestion(question);
        });
    });

    // Custom input form submission
    if (aqForm && aqInput) {
        aqForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = aqInput.value.trim();
            if (!val) return;
            aqInput.value = '';
            processQuestion(val);
        });
    }
}
