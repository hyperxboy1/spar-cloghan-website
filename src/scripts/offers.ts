/**
 * Offer validity guard. The static build already removed offers that had ended, but a
 * deployment can outlive an offer — so the browser re-checks on load, whenever a background
 * tab becomes visible again, and at the next start/end boundary while the page stays open.
 * Boundaries are pre-computed UTC instants of Europe/Dublin midnights (see dublin-time.ts).
 */
import { listen, type Cleanup } from './env';

const MAX_TIMER = 6 * 60 * 60 * 1000; // re-check at least every 6 hours while open

export function initOffers(): Cleanup {
  const root = document.querySelector<HTMLElement>('[data-offers]');
  if (!root) return () => {};
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-offer]'));
  const empty = root.querySelector<HTMLElement>('[data-offers-empty]');
  const list = root.querySelector<HTMLElement>('[data-offers-list]');
  let timer = 0;

  const check = () => {
    const now = Date.now();
    let visible = 0;
    let nextBoundary = Infinity;
    for (const el of items) {
      const start = Number(el.dataset.start);
      const end = Number(el.dataset.end);
      const live = now >= start && now < end;
      el.hidden = !live;
      if (live) visible++;
      if (start > now) nextBoundary = Math.min(nextBoundary, start);
      if (end > now) nextBoundary = Math.min(nextBoundary, end);
    }
    if (list) list.hidden = visible === 0;
    if (empty) empty.hidden = visible > 0;

    window.clearTimeout(timer);
    if (items.length) timer = window.setTimeout(check, Math.min(Math.max(nextBoundary - now + 1000, 1000), MAX_TIMER));
  };

  check();
  const off = listen(document, 'visibilitychange', () => {
    if (!document.hidden) check();
  });

  return () => {
    window.clearTimeout(timer);
    off();
  };
}
