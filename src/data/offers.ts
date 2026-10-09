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

/**
 * Featured “Special Offers” — the poster section at the top of the homepage.
 *
 * Prices supplied by the shop (Oct 2026). No end dates were given, so these have no expiry and
 * stay up until edited. Before publishing, confirm with the store: current dates, eligible
 * varieties, the Ishka deposit amount and every price.
 *
 * `images` lists the ORIGINAL product photographs, by file name, expected in
 * src/assets/offers/. Missing files show a labelled "photo needed" tile in review builds and
 * stop a launch build. Never substitute another product or a crop of the reference poster.
 * `layout` controls how several packs are grouped: 'single' | 'pair' | 'trio'.
 */
export interface FeaturedOffer {
  id: string;
  badgeTop: string; // "ONLY" / "2 FOR"
  badgePrice: string; // "€2.50"
  badgeNote?: string; // "+€1.50 deposit"
  name: string;
  detail: string;
  regular: string; // "€6.29" or "€5.01 each"
  images: Array<{ file: string; alt: string }>;
  layout: 'single' | 'pair' | 'trio';
  approved: boolean;
}

export const featuredOffers: FeaturedOffer[] = [
  {
    id: 'ishka',
    badgeTop: 'Only',
    badgePrice: '€2.50',
    badgeNote: '+€1.50 deposit',
    name: 'Ishka Kids / Ishka Irish Spring Water',
    detail: '10 x 250ml',
    regular: '€6.29',
    images: [{ file: 'ishka-kids-10x250ml', alt: 'Ishka Kids Irish Spring Water, 10 x 250ml multipack' }],
    layout: 'single',
    approved: true,
  },
  {
    id: 'goodfellas',
    badgeTop: '2 for',
    badgePrice: '€6',
    name: 'Goodfella’s Stonebaked Thin Pizzas',
    detail: 'Selected Varieties',
    regular: '€5.01 each',
    images: [
      { file: 'goodfellas-margherita', alt: 'Goodfella’s Stonebaked Thin Margherita pizza box' },
      { file: 'goodfellas-pepperoni', alt: 'Goodfella’s Stonebaked Thin Pepperoni pizza box' },
    ],
    layout: 'pair',
    approved: true,
  },
  {
    id: 'fresh-choice',
    badgeTop: '2 for',
    badgePrice: '€11',
    name: 'Fresh Choice Kitchen Dinners',
    detail: 'Selected Varieties',
    regular: '€5.99 each',
    images: [
      // first = rear/central focal pack
      { file: 'fresh-choice-roast-beef', alt: 'Fresh Choice Kitchen Roast Beef Dinner' },
      { file: 'fresh-choice-bacon-cabbage', alt: 'Fresh Choice Kitchen Bacon and Cabbage Dinner' },
      { file: 'fresh-choice-roast-chicken', alt: 'Fresh Choice Kitchen Roast Chicken Dinner' },
    ],
    layout: 'trio',
    approved: true,
  },
  {
    id: 'willowwarm',
    badgeTop: '3 for',
    badgePrice: '€21',
    name: 'WillowWarm Wood Briquettes',
    detail: '10 pack',
    regular: '€7.99 each',
    images: [{ file: 'willowwarm-briquettes-10pack', alt: 'WillowWarm Wood Briquettes, 10 pack' }],
    layout: 'single',
    approved: true,
  },
];
