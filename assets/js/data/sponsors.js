/**
 * AWS Student Community Day: South Summit 2026
 * Pure Data Layer — Sponsors & Corporate Partners Catalog
 *
 * @typedef {Object} Sponsor
 * @property {string} id - Unique identifier (e.g., 'sponsor-1')
 * @property {string} name - Official partner / corporate sponsor name
 * @property {'core' | 'cluster' | 'quantum' | 'platinum' | 'gold' | 'community'} tier - Tier placement dictating logo scaling & grid placement
 * @property {string|null} [imgUrl] - Relative path to transparent logo, or null for a text/placeholder slot
 * @property {string} [role] - Short role label shown under the name for confirmed partners
 * @property {boolean} [open] - When true, renders as an available "prospective" slot instead of a confirmed partner
 * @property {boolean} [featured] - Highlights the slot as the tier's headline/active partner
 * @property {string} [cta] - Optional call-to-action label shown on an open slot (e.g., '+ Become a Sponsor')
 */

/** @type {Sponsor[]} */
export const sponsors = [
  // ---- Quantum (Highest Tier) ----
  {
    id: 'sponsor-quantum-1',
    name: 'AWS Cloud Clubs Philippines',
    tier: 'quantum',
    role: 'Official Organizing Partner',
    imgUrl: 'assets/images/sbg-calabarzon-logo.png',
    featured: true
  },
  {
    id: 'sponsor-quantum-open',
    name: 'Quantum Partner Slot Available',
    tier: 'quantum',
    open: true,
    cta: '+ Become a Sponsor'
  },

  // ---- Cluster (Middle Tier) ----
  { id: 'sponsor-cluster-1', name: 'Cluster Partner Slot', tier: 'cluster', open: true },
  { id: 'sponsor-cluster-2', name: 'Cluster Partner Slot', tier: 'cluster', open: true },
  { id: 'sponsor-cluster-3', name: 'Cluster Partner Slot', tier: 'cluster', open: true },

  // ---- Core & Chapter Partners (Foundational) ----
  { id: 'sponsor-core-1', name: 'DEVCON Laguna', tier: 'core', open: true },
  { id: 'sponsor-core-2', name: 'AWSCC Haribon', tier: 'core', open: true },
  { id: 'sponsor-core-3', name: 'AWSCC Adamson', tier: 'core', open: true },
  { id: 'sponsor-core-4', name: 'AWSCC PUP Manila', tier: 'core', open: true },
  { id: 'sponsor-core-5', name: 'AWSCC UCabuyao', tier: 'core', open: true }
];
