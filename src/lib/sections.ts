/**
 * Which optional sections render in this build, so navigation and calls to action never point
 * at a section that was left out (e.g. a launch build before the deli copy is approved).
 */
import { counter } from '../data/counter';
import { local } from '../data/local';
import { catering } from '../data/catering';
import { isShown } from '../data/site';

export const sections = {
  counter: counter.some((c) => isShown(c.status)),
  local:
    isShown(local.headingStatus) ||
    isShown(local.bodyStatus) ||
    local.facts.some((f) => isShown(f.status)) ||
    isShown(local.award.status),
  catering: isShown(catering.status),
};

/** Where "Explore the store" leads: the food showcase if it is published, otherwise services. */
export const exploreHref = '#menu';

export const navLinks = [
  { href: '#menu', label: 'Food menu' },
  { href: '#special-offers', label: 'Offers' },
  { href: '#services', label: 'Services' },
  sections.local && { href: '#local', label: 'Our shop' },
].filter(Boolean) as Array<{ href: string; label: string }>;
