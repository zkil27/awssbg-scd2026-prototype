/**
 * AWS Student Community Day: South Summit 2026
 * Pure Data Layer — Merchandise Catalog
 * 
 * @typedef {Object} MerchItem
 * @property {string} id - Unique identifier (e.g., 'merch-hoodie')
 * @property {string} name - Display title of the merchandise item
 * @property {string} blurb - Short description / drop details for attendees
 * @property {string} icon - SVG vector path geometry for fallback vector rendering
 * @property {string | null} imgUrl - Relative path to high-resolution item photo (optional)
 */

/** @type {MerchItem[]} */
export const merchItems = [
  {
    id: 'merch-hoodie',
    name: 'SCD Summit Hoodie',
    blurb: 'Heavyweight fleece with official summit mark. Soft drop closer to event day.',
    icon: '<path d="M8 4l4 2 4-2 3 4-3 2v10H5V10L2 8z"/>',
    imgUrl: null
  },
  {
    id: 'merch-tee',
    name: 'Build.Power.Lead. Tee',
    blurb: 'Everyday crewneck tee featuring the official three-motion summit lockup.',
    icon: '<path d="M7 4h10l2 4-3 2v10H8V10L5 8z"/>',
    imgUrl: null
  },
  {
    id: 'merch-pins',
    name: 'Enamel Pin Collection',
    blurb: 'Collectible metallic chip and cyber-grid pins for bags and lanyards.',
    icon: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.4"/>',
    imgUrl: null
  },
  {
    id: 'merch-tote',
    name: 'Canvas Builder Tote Bag',
    blurb: 'Durable heavy-duty tote bag designed for community hub days and booths.',
    icon: '<rect x="4" y="8" width="16" height="12" rx="1.5"/><path d="M8 8V6a4 4 0 018 0v2"/>',
    imgUrl: null
  },
  {
    id: 'merch-stickers',
    name: 'Summit Sticker Pack',
    blurb: 'Weatherproof vinyl laptop stickers inspired by the South Summit primer.',
    icon: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h6M9 11h6M9 15h3"/>',
    imgUrl: null
  },
  {
    id: 'merch-lanyard',
    name: 'Attendee VIP Lanyard',
    blurb: 'High-contrast summit lanyard for twin-venue check-in access.',
    icon: '<path d="M12 3v6M9 9h6l2 12H7L9 9z"/>',
    imgUrl: null
  }
];