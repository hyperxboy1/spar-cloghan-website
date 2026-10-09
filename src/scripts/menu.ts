/**
 * Mobile menu: toggle button with aria-expanded, Escape to close, focus returns to the
 * toggle, closes on link activation or when the viewport grows past the mobile breakpoint.
 */
import { listen, mqDesktop, type Cleanup } from './env';

export function initMenu(): Cleanup {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (!toggle || !menu) return () => {};

  const label = toggle.querySelector('.menu-toggle__label');
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  const setOpen = (open: boolean, { returnFocus = false } = {}) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    if (label) label.textContent = open ? 'Close' : 'Menu';
    document.documentElement.classList.toggle('menu-open', open);
    if (open) menu.querySelector<HTMLElement>('a')?.focus();
    else if (returnFocus) toggle.focus();
  };

  const cleanups: Cleanup[] = [
    listen(toggle, 'click', () => setOpen(!isOpen())),
    listen(document, 'keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen()) setOpen(false, { returnFocus: true });
    }),
    listen(menu, 'click', (e: MouseEvent) => {
      if ((e.target as Element).closest('a')) setOpen(false);
    }),
    listen(document, 'click', (e: MouseEvent) => {
      if (isOpen() && !menu.contains(e.target as Node) && !toggle.contains(e.target as Node)) setOpen(false);
    }),
    listen(mqDesktop, 'change', () => {
      if (mqDesktop.matches && isOpen()) setOpen(false);
    }),
  ];

  return () => {
    setOpen(false);
    cleanups.forEach((fn) => fn());
  };
}
