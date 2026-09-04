/**
 * AWS Student Community Day: South Summit 2026
 * Pure Data Layer — Sponsors & Corporate Partners Catalog
 *
 * @typedef {Object} Sponsor
 * @property {string} id - Unique identifier (e.g., 'sponsor-1')
 * @property {string} name - Official partner / corporate sponsor name
 * @property {'platinum' | 'gold' | 'community'} tier - Tier placement dictating logo scaling & grid placement
 * @property {string|null} [imgUrl] - Relative path to transparent logo, or null for a text/placeholder slot
 * @property {string} [role] - Short role label shown under the name for confirmed partners
 * @property {boolean} [open] - When true, renders as an available "prospective" slot instead of a confirmed partner
 * @property {boolean} [featured] - Highlights the slot as the tier's headline/active partner
 * @property {string} [cta] - Optional call-to-action label shown on an open slot (e.g., '+ Become a Sponsor')
 */

/** @type {Sponsor[]} */
export const sponsors = [
  // ---- Platinum ----
  {
    id: 'sponsor-platinum-1',
    name: 'AWS Cloud Clubs Philippines',
    tier: 'platinum',
    role: 'Official Organizing Partner',
    imgUrl: 'assets/images/sbg-calabarzon-logo.png',
    featured: true
  },
  {
    id: 'sponsor-platinum-open',
    name: 'Platinum Partner Slot Available',
    tier: 'platinum',
    open: true,
    cta: '+ Become a Sponsor'
  },

  // ---- Gold ----
  { id: 'sponsor-gold-1', name: 'Gold Partner Slot', tier: 'gold', open: true },
  { id: 'sponsor-gold-2', name: 'Gold Partner Slot', tier: 'gold', open: true },
  { id: 'sponsor-gold-3', name: 'Gold Partner Slot', tier: 'gold', open: true },

  // ---- Community & Chapter Partners ----
  { id: 'sponsor-comm-1', name: 'DEVCON Laguna', tier: 'community', open: true },
  { id: 'sponsor-comm-2', name: 'AWSCC Haribon', tier: 'community', open: true },
  { id: 'sponsor-comm-3', name: 'AWSCC Adamson', tier: 'community', open: true },
  { id: 'sponsor-comm-4', name: 'AWSCC PUP Manila', tier: 'community', open: true },
  { id: 'sponsor-comm-5', name: 'AWSCC UCabuyao', tier: 'community', open: true }
];
