import type { ContentStatus } from './site';

/**
 * Catering enquiry feature.
 *
 * Indexed store posts reference catering / finger food ("taking catering orders — just PM us or
 * give us a call"). That is a dated lead, not confirmation of a current service, so this feature
 * is built but HIDDEN until the manager confirms it.
 *
 * To preview it locally: set status to 'review' and run `npm run dev`.
 * To publish it: set status to 'approved'.
 *
 * Contact routes only — no ordering system, no prices, no delivery promises.
 */
export const catering = {
  status: 'hidden' as ContentStatus,
  kicker: 'Catering',
  title: 'Feeding a crowd?',
  body: 'Talk to the team about food for a get-together, a meeting or a family occasion. Call the shop or send us a message and we’ll let you know what we can do.',
};
