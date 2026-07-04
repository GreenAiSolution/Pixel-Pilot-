// ─── EAGLE LANDSCAPING · BRAND ───────────────────────────────────────────────
// Brand constants for the Eagle Landscaping client instance. Professional,
// natural, trustworthy — forest greens + warm earth, not the Pixel Pilot neon.
// One source of truth for the site chrome and the ops dashboard.

export const EAGLE = {
  name: 'Eagle Landscaping',
  tagline: 'Landscapes worth landing on.',
  promise:
    'Full-service landscaping, run by a team that shows up, does it right, and never leaves you chasing an invoice.',
  phone: '(000) 000-0000',
  email: 'hello@eaglelandscaping.com',
  serviceArea: 'Serving the greater metro area',
  hours: 'Mon–Sat · 7am–6pm',
  // Palette
  forest: '#1E7A46', // primary deep green
  leaf: '#3FA34D', // bright green
  moss: '#6BA368',
  earth: '#8B5E34', // warm brown
  gold: '#D8A93B', // accent / awards
  sky: '#EAF4EC', // pale green wash
  ink: '#14261A', // near-black green for text
} as const;
