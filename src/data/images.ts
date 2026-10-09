import type { ImageMetadata } from 'astro';
import { SITE_MODE } from './site';
import baguette from '../assets/images/baguette-cutout.png';
import latte from '../assets/images/latte-croissant.jpg';
import deliSandwich from '../assets/images/deli-sandwich.jpg';

/**
 * Image registry. Every image used on the page is listed here and in
 * docs/asset-manifest.json (same `id`).
 *
 * All three current images are TEMPORARY placeholders cut from the client-supplied,
 * AI-generated design reference (docs/design-reference/reference-mockup.webp).
 * They are NOT photographs of this shop or its food. Replace them with approved
 * photographs from the shop, then set `placeholder: false, approved: true`.
 *
 * A launch build (`npm run build:launch`) refuses to use any image that is not approved.
 */
export interface SiteImage {
  id: string;
  src: ImageMetadata;
  alt: string;
  placeholder: boolean;
  approved: boolean;
  /** CSS object-position focal points for art direction. */
  focal: { desktop: string; mobile: string };
}

const registry = {
  baguette: {
    id: 'IMG-01',
    src: baguette,
    alt: 'A seeded baguette filled with sliced ham, cheese, tomato and lettuce',
    placeholder: true,
    approved: false,
    focal: { desktop: '50% 50%', mobile: '50% 50%' },
  },
  latte: {
    id: 'IMG-02',
    src: latte,
    alt: 'A cup of latte with leaf-pattern foam art, a croissant behind it',
    placeholder: true,
    approved: false,
    focal: { desktop: '50% 62%', mobile: '50% 58%' },
  },
  deliSandwich: {
    id: 'IMG-03',
    src: deliSandwich,
    alt: 'A tall sandwich on seeded bread layered with ham, tomato and lettuce',
    placeholder: true,
    approved: false,
    focal: { desktop: '50% 50%', mobile: '50% 45%' },
  },
} satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof registry;

/** Returns an image for rendering. In a launch build, unapproved images stop the build. */
export function useImage(key: ImageKey): SiteImage {
  const image = registry[key];
  if (SITE_MODE === 'launch' && !image.approved) {
    throw new Error(
      `[launch build] Image "${key}" (${image.id}) is not approved. ` +
        'Replace it with an approved shop photograph or mark it approved in src/data/images.ts.',
    );
  }
  return image;
}

export const allImages = registry;
