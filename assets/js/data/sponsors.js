/**
 * AWS Student Community Day: South Summit 2026
 * Pure Data Layer — Sponsors & Corporate Partners Catalog
 * 
 * @typedef {Object} Sponsor
 * @property {string} id - Unique identifier (e.g., 'sponsor-1')
 * @property {string} name - Official partner / corporate sponsor name
 * @property {'platinum' | 'gold' | 'community'} tier - Tier placement dictating logo scaling & grid placement
 * @property {string} imgUrl - Relative path to transparent logo (e.g., 'assets/images/sponsors/partner.png')
 */

/** @type {Sponsor[]} */
export const sponsors = [
  {
    id: 'sponsor-1',
    name: 'AWS Student Builder Groups',
    tier: 'platinum',
    imgUrl: 'assets/sbg-calabarzon-logo.png'
  },
  {
    id: 'sponsor-2',
    name: 'Gold Sponsor Partner',
    tier: 'gold',
    imgUrl: 'assets/images/sponsors/sponsor-2.png'
  },
  {
    id: 'sponsor-3',
    name: 'Community Tech Partner',
    tier: 'community',
    imgUrl: 'assets/images/sponsors/sponsor-3.png'
  }
];