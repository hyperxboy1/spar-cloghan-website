/**
 * Card tilt + local sheen for [data-tilt] boxes. Only the card under the pointer does any
 * work; geometry is measured once on enter. The CSS "pop-up" lift lives on .pop__body, the
 * tilt on [data-tilt-target], so the two transforms never overwrite each other.
 */
import { clamp, listen, pointerMotionAllowed, type Cleanup } from './env';

export function initTilt(maxDeg = 3.5): Cleanup {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-tilt]'));
  const cleanups: Cleanup[] = [];

  for (const card of cards) {
    const target = card.querySelector<HTMLElement>('[data-tilt-target]') ?? card;
    const sheen = card.querySelector<HTMLElement>('[data-tilt-sheen]');
    let rect: DOMRect | null = null;
    let raf = 0;
    let nx = 0;
    let ny = 0;

    const flush = () => {
      raf = 0;
      target.style.transform = `rotateX(${(-ny * maxDeg).toFixed(2)}deg) rotateY(${(nx * maxDeg).toFixed(2)}deg)`;
      if (sheen) {
        sheen.style.opacity = '1';
        sheen.style.transform = `translate3d(${((nx + 1) * 50).toFixed(1)}%, ${((ny + 1) * 50).toFixed(1)}%, 0)`;
      }
    };

    const reset = () => {
      rect = null;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      target.style.transform = '';
      if (sheen) {
        sheen.style.opacity = '';
        sheen.style.transform = '';
      }
    };

    cleanups.push(
      listen(card, 'pointerenter', (e: PointerEvent) => {
        if (e.pointerType === 'touch' || !pointerMotionAllowed()) return;
        rect = card.getBoundingClientRect();
      }),
      listen(card, 'pointermove', (e: PointerEvent) => {
        if (!rect || e.pointerType === 'touch' || !pointerMotionAllowed()) return;
        nx = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
        ny = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
        if (!raf) raf = requestAnimationFrame(flush);
      }),
      listen(card, 'pointerleave', reset),
      reset,
    );
  }

  return () => cleanups.forEach((fn) => fn());
}
