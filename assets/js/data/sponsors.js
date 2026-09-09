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
    id: 'sponsor-quantum-1',
    name: 'AWS Cloud Clubs Philippines',
    tier: 'quantum',
    role: 'Official Organizing Partner',
    description: 'A student-led community network supported by AWS, empowering Filipino students with cloud computing skills, foundational AWS certifications, hands-on architectural labs, and industry mentorship.',
    imgUrl: 'assets/images/sbg-calabarzon-logo.png',
    featured: true,
    location: 'Philippines',
    color: 'purple',
    url: 'https://www.facebook.com/AWSCloudClubsPH',
    meta: [
      { label: 'Role', value: 'Host & Co-Organizer' },
      { label: 'Network', value: 'Nationwide Student Builder Collective' }
    ]
  },

  // ==========================================
  // 02 // PRO TIER (Technology & Platform Partners)
  // ==========================================
  {
    id: 'sponsor-pro-1',
    name: 'DEVCON Laguna',
    tier: 'pro',
    role: 'Regional Tech Partner',
    description: 'Developer Connect Philippines — fostering developer growth, tech symposiums, and grassroots engineering communities across Laguna and Region IV-A.',
    institution: 'Developer Connect Philippines',
    location: 'Laguna Chapter',
    track: 'Developer Ecosystem & Community',
    color: 'green',
    url: 'https://devcon.ph'
  },
  {
    id: 'sponsor-pro-2',
    name: 'Tutorials Dojo',
    tier: 'pro',
    role: 'Cloud Learning Partner',
    description: 'Industry-leading cloud training and certification learning platform empowering student builders with practical AWS architectural insights and exam preparation resources.',
    institution: 'Tutorials Dojo',
    location: 'Philippines / Global',
    track: 'Cloud & AI Learning Pathways',
    color: 'blue',
    url: 'https://tutorialsdojo.com'
  },

  // ==========================================
  // 03 // LITE TIER (University Student Chapters)
  // ==========================================
  {
    id: 'partner-haribon',
    name: 'AWSCC Haribon',
    tier: 'lite',
    role: 'Student Chapter',
    institution: 'Pamantasan ng Lungsod ng Maynila',
    location: 'Intramuros, Manila',
    color: 'blue'
  },
  {
    id: 'partner-adamson',
    name: 'AWSCC Adamson',
    tier: 'lite',
    role: 'Student Chapter',
    institution: 'Adamson University',
    location: 'Ermita, Manila',
    color: 'purple'
  },
  {
    id: 'partner-pup',
    name: 'AWSCC PUP Manila',
    tier: 'lite',
    role: 'Student Chapter',
    institution: 'Polytechnic University of the Philippines',
    location: 'Santa Mesa, Manila',
    color: 'pink'
  },
  {
    id: 'partner-ucabuyao',
    name: 'AWSCC UCabuyao',
    tier: 'lite',
    role: 'Student Chapter',
    institution: 'University of Cabuyao',
    location: 'Cabuyao, Laguna',
    color: 'green'
  }
];

export const tierMeta = {
  quantum: {
    index: '01',
    name: 'Quantum',
    title: 'Quantum Sponsors'
  },
  pro: {
    index: '02',
    name: 'Pro',
    title: 'Pro Partners'
  },
  lite: {
    index: '03',
    name: 'Lite',
    title: 'Lite Partners'
  }
};
