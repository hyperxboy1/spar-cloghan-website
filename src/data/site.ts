/**
 * Site-wide settings and the publication rules shared by every data file.
 *
 * Every piece of business content carries a `status`:
 *   'approved' – confirmed by the shop manager. Rendered in every build.
 *   'review'   – sourced from a public listing or drafted for the site, NOT yet
 *                confirmed. Rendered only in review builds, with a "To confirm" marker.
 *   'hidden'   – built and ready but never rendered (e.g. a service that needs fresh
 *                verification, or the catering feature until the manager confirms it).
 *
 * Change a status in the relevant file under src/data/ and rebuild.
 */
export type ContentStatus = 'approved' | 'review' | 'hidden';

export type SiteMode = 'review' | 'launch';

export const SITE_MODE: SiteMode = process.env.SITE_MODE === 'launch' ? 'launch' : 'review';

/** Indexing is only possible in a launch build, and only when explicitly enabled. */
export const ALLOW_INDEXING = SITE_MODE === 'launch' && process.env.ALLOW_INDEXING === 'true';

/** Set SITE_URL (e.g. https://your-project.pages.dev) once the deployment address is final. */
export const SITE_URL = process.env.SITE_URL ?? '';

export const IS_REVIEW = SITE_MODE === 'review';

/** Should content with this status appear in the current build? */
export function isShown(status: ContentStatus): boolean {
  if (status === 'approved') return true;
  if (status === 'review') return IS_REVIEW;
  return false;
}

/** Should a "To confirm" marker be shown next to this item? */
export function needsMarker(status: ContentStatus): boolean {
  return IS_REVIEW && status !== 'approved';
}

export const meta = {
  title: "SPAR Express Cloghan · Healy's SPAR, Hill Street, Cloghan, Co. Offaly",
  description:
    "Healy's SPAR Express on Hill Street, Cloghan, Co. Offaly. Find the shop, call 090 645 7455, and see the deli, coffee and services.",
  locale: 'en_IE',
  themeColor: '#c8102e',
};

/** Shared motion tuning. Pixel values are starting points, tuned in the browser. */
export const motion = {
  heroDepth: {
    background: -8, // opposite the pointer
    ghostType: -4,
    midground: 16,
    midgroundAlt: 13,
    note: 10,
    foreground: 28,
  },
  foregroundRotation: 3, // degrees at full pointer travel
  magneticPx: 5,
  cardTiltDeg: 3.5,
};
