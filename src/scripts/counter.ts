/**
 * Deli / coffee / bakery showcase (desktop): the block nearest the middle of the viewport
 * becomes active and its picture is revealed in the sticky frame. Visitors can also pick a
 * block with its title button (mouse, touch or keyboard). Mobile uses stacked inline images,
 * so nothing here runs below the desktop breakpoint.
 */
import { listen, mqDesktop, type Cleanup } from './env';

export function initCounter(): Cleanup {
  const root = document.querySelector<HTMLElement>('[data-counter]');
  if (!root) return () => {};

  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-counter-item]'));
  const media = Array.from(root.querySelectorAll<HTMLElement>('[data-counter-media]'));
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-counter-select]'));
  let current = '';
  // A picture chosen by the visitor wins over scroll-driven changes caused by that same action
  // (e.g. focus scrolling the button into view) until they actually scroll on.
  let manualAt = -Infinity;
  let manualScrollY = 0;
  const MANUAL_HOLD_PX = 160;

  const activate = (id: string) => {
    if (id === current) return;
    current = id;
    for (const el of items) el.classList.toggle('is-active', el.dataset.counterItem === id);
    for (const el of media) el.toggleAttribute('data-active', el.dataset.counterMedia === id);
    for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.counterSelect === id));
  };

  let io: IntersectionObserver | null = null;
  const sync = () => {
    io?.disconnect();
    io = null;
    if (!mqDesktop.matches) {
      for (const el of items) el.classList.remove('is-active');
      current = '';
      return;
    }
    activate(current || items[0]?.dataset.counterItem || '');
    io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const held = performance.now() - manualAt < 900 || Math.abs(window.scrollY - manualScrollY) < MANUAL_HOLD_PX;
          if (held && manualAt > 0) continue;
          activate((entry.target as HTMLElement).dataset.counterItem ?? '');
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    );
    items.forEach((el) => io!.observe(el));
  };

  const cleanups: Cleanup[] = [
    ...buttons.map((b) =>
      listen(b, 'click', () => {
        manualAt = performance.now();
        manualScrollY = window.scrollY;
        activate(b.dataset.counterSelect ?? '');
      }),
    ),
    listen(mqDesktop, 'change', sync),
  ];
  sync();

  return () => {
    io?.disconnect();
    cleanups.forEach((fn) => fn());
  };
}
