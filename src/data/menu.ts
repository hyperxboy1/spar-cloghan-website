import type { ImageMetadata } from 'astro';
import type { ContentStatus } from './site';
import breakfast from '../assets/menu/breakfast.jpg';
import dinner from '../assets/menu/dinner.jpg';
import desserts from '../assets/menu/desserts.jpg';
import catering from '../assets/menu/catering.jpg';

/**
 * Food menu: the 2×2 category grid and the four menu sections it links to.
 *
 * Add, remove or reorder items freely. `price` is optional — leave it out and the item shows
 * "Ask in store". Items marked status 'review' show a "To confirm" marker in review builds
 * and are left out of a launch build until confirmed.
 */
export interface MenuItem {
  name: string;
  note?: string;
  price?: string;
  status: ContentStatus;
}

export interface MenuCategory {
  id: string; // anchor: #menu-<id>
  label: string; // exact category label
  line: string; // short supporting line on the grid tile
  image: ImageMetadata;
  imageAlt: string;
  focal: string; // CSS object-position for the tile crop
  intro: string;
  callLabel: string;
  items: MenuItem[];
}

/** Dinner pricing block — exact figures supplied by the shop. */
export const dinnerDeals = [
  { label: 'Dinners', was: '€15', now: '€11' },
  { label: 'Kids Dinners', was: '€10', now: '€8' },
];

export const menu: MenuCategory[] = [
  {
    id: 'breakfast',
    label: 'Breakfast',
    line: 'Rolls, sausages, rashers and more',
    image: breakfast,
    imageAlt: 'Trays of sausages, rashers and hash browns in the hot counter',
    focal: '50% 55%',
    intro: 'Made up at the hot counter — build your roll or grab a breakfast to go.',
    callLabel: 'Call for today’s breakfast',
    items: [
      { name: 'Breakfast rolls', note: 'Built your way', status: 'approved' },
      { name: 'Sausages', status: 'approved' },
      { name: 'Rashers', status: 'approved' },
      { name: 'Hash browns', status: 'approved' },
      { name: 'Other breakfast items', note: 'Ask what’s on the counter today', status: 'approved' },
    ],
  },
  {
    id: 'dinner',
    label: 'Dinner',
    line: 'Hot dinners, great value, served daily',
    image: dinner,
    imageAlt: 'Roast turkey and ham with roast potatoes at the hot counter',
    focal: '50% 50%',
    intro: 'Hot dinners from the counter, with all the trimmings.',
    callLabel: 'Phone to order',
    items: [
      { name: 'Roast turkey & ham', note: 'With roast potatoes, mash and gravy', status: 'review' },
      { name: 'Roast of the day', note: 'Ask what’s carving today', status: 'review' },
      { name: 'Kids dinner', note: 'Smaller portion of the day’s dinner', status: 'review' },
    ],
  },
  {
    id: 'desserts',
    label: 'Desserts & In-Store Bakery',
    line: 'Fresh sweet treats and bakery favourites',
    image: desserts,
    imageAlt: 'Fruit-topped pavlovas with cream, strawberries and grapes',
    focal: '50% 45%',
    intro: 'Something sweet from our in-store bakery — to treat yourself or to bring to the table.',
    callLabel: 'Call to order a dessert',
    items: [
      { name: 'Pavlova', note: 'Cream, strawberries and grapes', status: 'approved' },
      { name: 'Cakes', status: 'approved' },
      { name: 'Traybakes', status: 'approved' },
      { name: 'Bakery treats', status: 'approved' },
      { name: 'Desserts', note: 'Ask about ordering for an occasion', status: 'approved' },
    ],
  },
  {
    id: 'catering',
    label: 'Catering Order',
    line: 'Sandwich platters and catering options',
    image: catering,
    imageAlt: 'Platters of sandwiches on white and brown bread',
    focal: '50% 50%',
    intro: 'Feeding a crowd? Order sandwich platters and finger food for meetings, parties and family occasions.',
    callLabel: 'Call to place a catering order',
    items: [
      { name: 'Sandwich platters', note: 'White and brown bread, mixed fillings', status: 'approved' },
      { name: 'Finger food', status: 'approved' },
      { name: 'Other catering options', note: 'Tell us what you need', status: 'approved' },
    ],
  },
];
