/**
 * AWS Student Community Day: South Summit 2026
 * Pure Data Layer — Organizing Committee Directorate & Leadership
 * 
 * @typedef {Object} Director
 * @property {string} id - Unique identifier
 * @property {string} name - Full name of the director / lead
 * @property {string} role - Official summit title / role
 * @property {string} department - Functional department (Executive, Technology, Creatives, Operations, Marketing, Relations, Finance)
 * @property {string} deptTag - Short department tag (EXEC, TECH, CREA, OPS, MKTG, RELS, FIN)
 * @property {string} focus - Brief description of scope and responsibilities
 * @property {string | null} avatar - Relative path to image if available, else null
 * @property {string} [accentColor] - Brand accent token name for visual styling
 */

/** @type {Director[]} */
export const directors = [
  {
    id: 'dir-exec-1',
    name: 'John Lexter Reyes',
    role: 'Event Director',
    department: 'Executive',
    deptTag: 'EXEC',
    focus: 'Overall summit direction, master timeline orchestration, institutional permits, and inter-departmental governance.',
    avatar: null,
    accentColor: '--orange'
  },
  {
    id: 'dir-exec-2',
    name: 'Helena Tantoco',
    role: 'Associate Director',
    department: 'Executive',
    deptTag: 'EXEC',
    focus: 'Cross-functional operations oversight, department KPI alignment, risk management, and ground execution management.',
    avatar: null,
    accentColor: '--orange'
  },
  {
    id: 'dir-exec-3',
    name: 'Althea Peria',
    role: 'Executive Secretary',
    department: 'Executive',
    deptTag: 'EXEC',
    focus: 'Executive correspondence, official summit documentation, inter-chapter minutes, and administrative compliance.',
    avatar: null,
    accentColor: '--orange'
  },
  {
    id: 'dir-exec-4',
    name: 'Renae Chloe Bautista',
    role: 'Executive Secretary',
    department: 'Executive',
    deptTag: 'EXEC',
    focus: 'Administrative management, records upkeep, volunteer roster collation, and communications tracking.',
    avatar: null,
    accentColor: '--orange'
  },
  {
    id: 'dir-tech-1',
    name: 'Elijah Tamayo',
    role: 'Technology Director',
    department: 'Technology',
    deptTag: 'TECH',
    focus: 'Summit digital infrastructure, official web platform engineering, interactive attendee tools, and technical delivery.',
    avatar: null,
    accentColor: '--blue'
  },
  {
    id: 'dir-tech-2',
    name: 'Anthony Navarro',
    role: 'Technology Assoc. Director',
    department: 'Technology',
    deptTag: 'TECH',
    focus: 'Front-end web implementations, modular architecture maintenance, digital asset optimization, and live technical ops.',
    avatar: null,
    accentColor: '--blue'
  },
  {
    id: 'dir-crea-1',
    name: 'Maja Samaniego',
    role: 'Creatives Director',
    department: 'Creatives',
    deptTag: 'CREA',
    focus: 'Visual identity direction, Cyber-Grid aesthetic design systems, multimedia assets, stage graphics, and branding.',
    avatar: null,
    accentColor: '--pink'
  },
  {
    id: 'dir-crea-2',
    name: 'Alyssa Marie T. Valera',
    role: 'Creatives Assoc. Director',
    department: 'Creatives',
    deptTag: 'CREA',
    focus: 'Design production workflow, summit digital collaterals, visual design review, and brand consistency.',
    avatar: null,
    accentColor: '--pink'
  },
  {
    id: 'dir-ops-1',
    name: 'Sebastian Rafael Belando',
    role: 'Operations Director',
    department: 'Operations',
    deptTag: 'OPS',
    focus: 'Physical event logistics, Biñan People Center venue staging, technical AV setups, safety, and attendee ingress.',
    avatar: null,
    accentColor: '--green'
  },
  {
    id: 'dir-ops-2',
    name: 'Rain Jade De Castro',
    role: 'Operations Assoc. Director',
    department: 'Operations',
    deptTag: 'OPS',
    focus: 'Floor flow management, registration check-in logistics, marshaling coordination, and technical AV backup.',
    avatar: null,
    accentColor: '--green'
  },
  {
    id: 'dir-mktg-1',
    name: 'Jana Lumbreras',
    role: 'Marketing Director',
    department: 'Marketing',
    deptTag: 'MKTG',
    focus: 'Audience growth across CALABARZON, public relations outreach, social media campaigns, and registration marketing.',
    avatar: null,
    accentColor: '--purple'
  },
  {
    id: 'dir-mktg-2',
    name: 'Beatrice Blando',
    role: 'Marketing Assoc. Director',
    department: 'Marketing',
    deptTag: 'MKTG',
    focus: 'Multi-platform content scheduling, student community engagement, attendee interaction, and promotional copy.',
    avatar: null,
    accentColor: '--purple'
  },
  {
    id: 'dir-rels-1',
    name: 'Queency Santos',
    role: 'Relations Director',
    department: 'Relations',
    deptTag: 'RELS',
    focus: 'Strategic industry partnerships, sponsor package management, VIP speaker hospitality, and institutional linkages.',
    avatar: null,
    accentColor: '--blue'
  },
  {
    id: 'dir-rels-2',
    name: 'Joseph Lontok',
    role: 'Relations Assoc. Director',
    department: 'Relations',
    deptTag: 'RELS',
    focus: 'Sponsor deliverable fulfillment, partner liaison communications, and university community relations.',
    avatar: null,
    accentColor: '--blue'
  },
  {
    id: 'dir-fin-1',
    name: 'John Cyphrey Madulid',
    role: 'Finance Director',
    department: 'Finance',
    deptTag: 'FIN',
    focus: 'Fiscal budgeting, sponsorship fund allocation, procurement audit trails, merchandise costing, and financial transparency.',
    avatar: null,
    accentColor: '--orange'
  },
  {
    id: 'dir-fin-2',
    name: 'Coleen Legaspi',
    role: 'Finance Assoc. Director',
    department: 'Finance',
    deptTag: 'FIN',
    focus: 'Purchase requests verification, expense reconciliation, receipts accounting, and post-summit liquidation.',
    avatar: null,
    accentColor: '--orange'
  }
];
