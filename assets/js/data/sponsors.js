/**
 * AWS Student Community Day: South Summit 2026
 * Pure Data Layer — Sponsors & Partners Catalog
 * 
 * Tiers:
 * - Quantum (01): Keystone & Headline Partners
 * - Pro (02): Technology, Platform & Community Partners
 * - Lite (03): University Student Builder Chapters
 */

export const sponsors = [
  // ==========================================
  // 01 // QUANTUM TIER (Headline / Keystone)
  // ==========================================
  {
    id: 'sponsor-quantum-aws',
    name: 'Amazon Web Services',
    tier: 'quantum',
    role: 'Quantum Sponsor & Global Cloud Platform',
    description: 'The world\'s most comprehensive and broadly adopted cloud platform, offering over 200 fully featured services from data centers globally.',
    imgUrl: 'assets/images/sponsors and partners/aws-dark-logo.webp',
    featured: true,
    location: 'Global / Philippines',
    color: 'purple',
    url: 'https://aws.amazon.com/',
    meta: [
      { label: 'Role', value: 'Quantum Title Sponsor' },
      { label: 'Platform', value: 'Cloud & Generative AI Infrastructure' }
    ]
  },
  {
    id: 'sponsor-quantum-tutorialsdojo',
    name: 'Tutorials Dojo',
    tier: 'quantum',
    role: 'Quantum Sponsor & Official Cloud Learning Partner',
    description: 'Industry-leading cloud learning and certification platform empowering student builders with practical AWS architectural insights, practice exams, and career pathways.',
    imgUrl: 'assets/images/sponsors and partners/tutorialsdojo_transparent_background.png',
    featured: true,
    location: 'Philippines / Global',
    color: 'blue',
    url: 'https://tutorialsdojo.com/',
    meta: [
      { label: 'Role', value: 'Quantum Learning Partner' },
      { label: 'Network', value: 'Global EdTech & Certification Hub' }
    ]
  },

  // ==========================================
  // 02 // VENUE PARTNER (Official Venue Host)
  // ==========================================
  {
    id: 'partner-venue-binan-lgu',
    name: 'City Government of Biñan (Biñan LGU)',
    tier: 'venue',
    role: 'Official Venue Partner',
    description: 'The City Government of Biñan proudly hosts AWS Student Community Day: South Summit 2026 at the Biñan People\'s Center Auditorium, empowering students and the next generation of cloud builders across CALABARZON.',
    imgUrl: null,
    featured: true,
    location: 'Biñan City, Laguna',
    color: 'orange',
    url: 'https://binan.gov.ph',
    meta: [
      { label: 'Venue', value: 'Biñan People\'s Center Auditorium' },
      { label: 'Host LGU', value: 'City Government of Biñan, Laguna' }
    ]
  },

  // ==========================================
  // 03 // PRO PARTNERSHIP (Community & Tech Partners)
  // ==========================================
  {
    id: 'partner-pro-alpha',
    name: 'AWS Student Body Group - Alpha',
    tier: 'pro',
    role: 'Pro Partner',
    institution: 'AWS Student Community',
    location: 'Philippines',
    track: 'Student Builder Community',
    color: 'green',
    imgUrl: null,
    url: '#'
  },
  {
    id: 'partner-pro-colegio-de-abogados',
    name: 'AWS Student Body Group - Colegio de Abogados',
    tier: 'pro',
    role: 'Pro Partner',
    institution: 'AWS Student Community',
    location: 'Philippines',
    track: 'Student Builder Community',
    color: 'teal',
    imgUrl: null,
    url: '#'
  },
  {
    id: 'partner-pro-colegio-de-muntinlupa',
    name: 'AWS Student Body Group - Colegio de Muntinlupa',
    tier: 'pro',
    role: 'Pro Partner',
    institution: 'Colegio de Muntinlupa',
    location: 'Muntinlupa City',
    track: 'Academic & Builder Partner',
    color: 'blue',
    imgUrl: null,
    url: '#'
  },
  {
    id: 'partner-pro-tempest',
    name: 'AWS Student Body Group - Tempest',
    tier: 'pro',
    role: 'Pro Partner',
    institution: 'AWS Student Community',
    location: 'Philippines',
    track: 'Student Builder Community',
    color: 'purple',
    imgUrl: null,
    url: '#'
  },
  {
    id: 'partner-pro-nu-dasmarinas',
    name: 'AWS Student Learning Club - NU Dasmariñas',
    tier: 'pro',
    role: 'Pro Partner',
    institution: 'National University Dasmariñas',
    location: 'Dasmariñas, Cavite',
    track: 'Academic Cloud Chapter',
    color: 'green',
    imgUrl: null,
    url: '#'
  },
  {
    id: 'partner-pro-asug-ph',
    name: 'AWS Student User Group Philippines',
    tier: 'pro',
    role: 'Pro Partner',
    institution: 'National Student Community',
    location: 'Philippines',
    track: 'National Builder Network',
    color: 'teal',
    imgUrl: null,
    url: '#'
  },
  {
    id: 'partner-pro-enovators',
    name: 'AWS User Group e:Novators Philippines',
    tier: 'pro',
    role: 'Pro Partner',
    institution: 'Professional User Group',
    location: 'Philippines',
    track: 'Enterprise & Innovation Network',
    color: 'blue',
    imgUrl: null,
    url: '#'
  },
  {
    id: 'partner-pro-ccc-dci',
    name: 'CCC - Department of Computing and Informatics',
    tier: 'pro',
    role: 'Pro Partner',
    institution: 'City College of Calamba',
    location: 'Calamba, Laguna',
    track: 'Academic Partner',
    color: 'purple',
    imgUrl: null,
    url: '#'
  },
  {
    id: 'partner-pro-cvsu-elits',
    name: 'CvSU Elite Leage of Information Technology Students',
    tier: 'pro',
    role: 'Pro Partner',
    institution: 'Cavite State University',
    location: 'Indang, Cavite',
    track: 'IT Student Organization',
    color: 'green',
    imgUrl: null,
    url: '#'
  },

  // ==========================================
  // 04 // LITE PARTNERSHIP (Student Organizations)
  // ==========================================
  {
    id: 'partner-lite-accss-1',
    name: 'Association of Committed Computer Science Students',
    tier: 'lite',
    role: 'Lite Partner',
    institution: 'Student Organization',
    location: 'Philippines',
    color: 'blue',
    imgUrl: null
  },
  {
    id: 'partner-lite-acss-2',
    name: 'Association of Computer Science Students',
    tier: 'lite',
    role: 'Lite Partner',
    institution: 'Student Organization',
    location: 'Philippines',
    color: 'pink',
    imgUrl: null
  },
  {
    id: 'partner-lite-bulsu',
    name: 'AWS Student Body Group - BULSU',
    tier: 'lite',
    role: 'Lite Partner',
    institution: 'Bulacan State University',
    location: 'Bulacan',
    color: 'green',
    imgUrl: null
  },
  {
    id: 'partner-lite-beradove',
    name: 'AWS Student Body Group - Beradove',
    tier: 'lite',
    role: 'Lite Partner',
    institution: 'Student Builder Community',
    location: 'Philippines',
    color: 'purple',
    imgUrl: null
  },
  {
    id: 'partner-lite-feu-alabang-acm',
    name: 'FEU Alabang ACM Student Chapter',
    tier: 'lite',
    role: 'Lite Partner',
    institution: 'FEU Alabang',
    location: 'Alabang, Muntinlupa',
    color: 'blue',
    imgUrl: null
  },
  {
    id: 'partner-lite-slu-lc',
    name: 'SLU AWS Learning Club',
    tier: 'lite',
    role: 'Lite Partner',
    institution: 'Saint Louis University',
    location: 'Baguio City',
    color: 'pink',
    imgUrl: null
  }
];

export const tierMeta = {
  quantum: {
    index: '01',
    name: 'Quantum',
    title: 'Quantum Sponsors'
  },
  venue: {
    index: '02',
    name: 'Venue',
    title: 'Venue Partner'
  },
  pro: {
    index: '03',
    name: 'Pro',
    title: 'Pro Partners'
  },
  lite: {
    index: '04',
    name: 'Lite',
    title: 'Lite Partners'
  }
};
