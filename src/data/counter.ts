import type { ContentStatus } from './site';
import type { ImageKey } from './images';

/**
 * The deli / coffee / bakery showcase.
 *
 * Sources: Maxol lists deli, coffee and bakery facilities; dated Facebook posts reference
 * bakery/desserts and breakfast. These are research leads — the copy below deliberately
 * avoids menus, prices, times and freshness claims. There is no verified menu, so the
 * call to action is "Call the shop", not a menu download.
 *
 * image: a key from src/data/images.ts, or null for a typography-led panel
 * (used where no suitable photograph exists yet — see docs/APPROVALS-CHECKLIST.md).
 */
export interface CounterItem {
  id: string;
  kicker: string;
  title: string;
  body: string;
  image: ImageKey | null;
  /** Big word used by the typography-led panel when there is no photograph. */
  panelWord: string;
  panelNote: string;
  status: ContentStatus;
}

export const counter: CounterItem[] = [
  {
    id: 'deli',
    kicker: 'The deli counter',
    title: 'Deli food to go',
    body: "Food to go from the deli counter. What's on changes through the day — call ahead if you're after something in particular.",
    image: 'deliSandwich',
    panelWord: 'Deli',
    panelNote: 'Fresh photo coming soon',
    status: 'approved',
  },
  {
    id: 'coffee',
    kicker: 'Coffee',
    title: 'A coffee for the road',
    body: 'Grab a coffee on your way through Cloghan, or take a seat and have it here.',
    image: 'latte',
    panelWord: 'Coffee',
    panelNote: 'Fresh photo coming soon',
    status: 'approved',
  },
  {
    id: 'bakery',
    kicker: 'Bakery',
    title: 'Something sweet',
    body: 'Bakery treats at the counter. Planning an occasion? Ask the team what they can do for you.',
    image: null,
    panelWord: 'Bakery',
    panelNote: 'Shop photo to follow',
    status: 'approved',
  },
];
