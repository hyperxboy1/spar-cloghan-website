/**
 * Magnetic buttons: the link/button itself never moves (stable hit target); only its
 * `.btn__inner` visual layer leans a few pixels toward the pointer. Writes are batched into
 * a single rAF per frame and reset on exit. Fine pointers only, never with reduced motion.
 */
import { clamp, listen, pointerMotionAllowed, type Cleanup } from './env';

export function initMagnetic(strength = 5): Cleanup {
  const buttons = Array.from(document.querySelectorAll<HTMLElement>('[data-magnetic]'));
  const cleanups: Cleanup[] = [];

  for (const btn of buttons) {
    const inner = btn.querySelector<HTMLElement>('.btn__inner');
    if (!inner) continue;
    let rect: DOMRect | null = null;
    let raf = 0;
    let dx = 0;
    let dy = 0;

    const flush = () => {
      raf = 0;
      inner.style.transform = `translate3d(${(dx * strength).toFixed(2)}px, ${(dy * strength * 0.7).toFixed(2)}px, 0)`;
    };

    cleanups.push(
      listen(btn, 'pointerenter', (e: PointerEvent) => {
        if (e.pointerType === 'touch' || !pointerMotionAllowed()) return;
        rect = btn.getBoundingClientRect();
      }),
      listen(btn, 'pointermove', (e: PointerEvent) => {
        if (!rect || e.pointerType === 'touch' || !pointerMotionAllowed()) return;
        dx = clamp((e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2), -1, 1);
        dy = clamp((e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2), -1, 1);
        if (!raf) raf = requestAnimationFrame(flush);
      }),
      listen(btn, 'pointerleave', () => {
        rect = null;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        inner.style.transform = '';
      }),
      () => {
        if (raf) cancelAnimationFrame(raf);
        inner.style.transform = '';
      },
    );
  }

  return () => cleanups.forEach((fn) => fn());
}
