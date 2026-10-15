/**
 * Food menu: click-to-open categories driven by the URL hash, so tiles, browser Back/Forward,
 * direct links (#menu-breakfast) and "Back to All Categories" all use the same path.
 *   #menu-<id>  → that category is shown in place of the 2×2 grid
 *   anything else → the grid is shown
 * Closed categories are display:none, so their links and buttons can't receive focus.
 */
import { listen, mqReducedMotion, type Cleanup } from './env';

export function initFoodMenu(): Cleanup {
  const root = document.querySelector<HTMLElement>('[data-food-menu]');
  if (!root) return () => {};
  const cats = Array.from(root.querySelectorAll<HTMLElement>('[data-food-cat]'));
  let first = true;

  const sync = () => {
    const id = location.hash.startsWith('#menu-') ? location.hash.slice(6) : '';
    const target = cats.find((c) => c.dataset.foodCat === id) ?? null;
    for (const c of cats) c.classList.toggle('is-open', c === target);
    root.classList.toggle('is-open', !!target);

    const wasMenuLink = location.hash === '#menu' || !!target;
    if (wasMenuLink && !(first && !location.hash)) {
      // Land at the top of the food section, never mid-way down a now-collapsed list.
      root.scrollIntoView({ behavior: mqReducedMotion.matches || first ? 'auto' : 'smooth', block: 'start' });
      if (target) target.querySelector<HTMLElement>('h3')?.focus({ preventScroll: true });
    }
    first = false;
  };

  cats.forEach((c) => c.querySelector('h3')?.setAttribute('tabindex', '-1'));
  sync();
  return listen(window, 'hashchange', sync);
}
