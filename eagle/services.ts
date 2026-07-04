// ─── EAGLE LANDSCAPING · SERVICES ────────────────────────────────────────────
// What Eagle sells. Drives the site's services grid and the quote form.

export interface EagleService {
  readonly id: string;
  readonly name: string;
  readonly blurb: string;
  readonly icon: string; // emoji mark
  readonly from: string; // starting price, display
  readonly popular?: boolean;
}

export const EAGLE_SERVICES: EagleService[] = [
  {
    id: 'lawn-care',
    name: 'Lawn Care & Maintenance',
    blurb: 'Weekly mowing, edging, trimming and cleanup on a schedule you never have to think about.',
    icon: '🌱',
    from: '$45 / visit',
    popular: true,
  },
  {
    id: 'landscape-design',
    name: 'Landscape Design & Install',
    blurb: 'Custom beds, native plantings, sod and full yard transformations — designed and installed.',
    icon: '🎨',
    from: 'Free design',
  },
  {
    id: 'hardscaping',
    name: 'Hardscaping & Patios',
    blurb: 'Paver patios, retaining walls, walkways and fire pits built to last decades.',
    icon: '🧱',
    from: 'Quote',
    popular: true,
  },
  {
    id: 'irrigation',
    name: 'Irrigation & Sprinklers',
    blurb: 'Smart sprinkler install, tune-ups and repairs that cut your water bill.',
    icon: '💧',
    from: '$89 / tune-up',
  },
  {
    id: 'cleanup',
    name: 'Seasonal Cleanups',
    blurb: 'Spring and fall cleanups, leaf removal, mulching and bed refreshes.',
    icon: '🍂',
    from: '$199',
  },
  {
    id: 'snow',
    name: 'Snow & Ice Removal',
    blurb: 'Commercial and residential plowing, salting and sidewalk clearing, on call all winter.',
    icon: '❄️',
    from: 'Seasonal',
  },
];

export function getEagleService(id: string): EagleService | undefined {
  return EAGLE_SERVICES.find((s) => s.id === id);
}
