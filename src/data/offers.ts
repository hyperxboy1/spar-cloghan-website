import type { ImageKey } from './images';

/**
 * Latest offers.
 *
 * Only offers with `approved: true` are ever rendered. Dates are calendar dates in
 * Europe/Dublin: an offer is live from 00:00 on `start` until 23:59:59 on `end`
 * (Irish time, summer time handled automatically).
 *
 * Expired offers are dropped at build time AND re-checked in the browser on page load and
 * whenever a background tab becomes visible again, so a stale deployment cannot keep showing
 * an expired offer to visitors with JavaScript. Without JavaScript, offers that were live
 * at build time are shown with their printed end date; offers that had not started are not shown.
 *
 * Never add sample prices. Leave the list empty when there are no approved offers — the page
 * then shows an honest "no offers listed" message linking to the shop's Facebook page.
 *
 * Example (copy, fill in and set approved: true):
 *
 *   {
 *     id: 'meal-deal-oct-2026',
 *     title: 'Lunch meal deal',
 *     description: 'Any deli roll, a drink and a snack.',
 *     price: '€6.50',               // exactly as approved by the manager
 *     image: null,                  // or a key from src/data/images.ts
 *     start: '2026-10-12',
 *     end: '2026-10-25',
 *     terms: 'While stocks last. Selected lines only.',
 *     approved: true,
 *   },
 */
export interface Offer {
  id: string;
  title: string;
  description?: string;
  price?: string;
  image?: ImageKey | null;
  start: string; // YYYY-MM-DD, Europe/Dublin
  end: string; // YYYY-MM-DD inclusive, Europe/Dublin
  terms: string;
  approved: boolean;
}

export const offers: Offer[] = [];
