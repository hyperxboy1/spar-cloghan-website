/**
 * Three deliberate scroll moments (desktop, motion allowed — loaded on demand by main.ts):
 *   1. Typographic band: two rows of display type slide in opposite directions with scroll.
 *   2. Counter heading: each word rises out of its mask as the red section arrives.
 *   3. Landscape: the "Our local shop" countryside is revealed by an image mask.
 *
 * Native scrolling is untouched (no pinning, no scroll-jacking).
 *
 * Why not ScrollTrigger? It keeps a requestAnimationFrame heartbeat running for as long as it
 * is enabled, even on an idle page. Instead, one passive scroll listener schedules at most one
 * frame per scroll event, only for scenes near the viewport, and GSAP core provides the easing.
 * GSAP's own ticker is put to sleep whenever nothing is tweening.
 */
import { gsap } from 'gsap';
import { listen, type Cleanup } from './env';

const IDLE_MS = 700;

interface Scrubber {
  el: HTMLElement;
  /** Fraction of the viewport height at which progress reaches 1 (element bottom edge). */
  endAt: number;
  near: boolean;
  update: (progress: number) => void;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function initScrollScenes(): Cleanup {
  const scrubbers: Scrubber[] = [];
  const animated: HTMLElement[] = [];

  // 1. Typographic band — progress runs from "top enters at the bottom" to "bottom leaves at the top".
  document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((band) => {
    const rows = Array.from(band.querySelectorAll<HTMLElement>('[data-marquee-row]')).map((row) => {
      animated.push(row);
      return {
        dir: Number(row.dataset.marqueeRow) || 1,
        to: gsap.quickTo(row, 'xPercent', { duration: 0.6, ease: 'power3.out' }),
      };
    });
    scrubbers.push({
      el: band,
      endAt: 0,
      near: false,
      update: (p) => rows.forEach((r) => r.to(r.dir > 0 ? -4 - 22 * p : -26 + 22 * p)),
    });
  });

  // 3. Landscape mask — fully revealed once its bottom edge reaches 75% of the viewport height.
  document.querySelectorAll<HTMLElement>('[data-reveal-land]').forEach((land) => {
    scrubbers.push({
      el: land,
      endAt: 0.75,
      near: false,
      update: (p) => {
        land.style.clipPath = `inset(0% ${(100 - p * 100).toFixed(2)}% 0% 0%)`;
      },
    });
  });

  let frame = 0;
  const run = () => {
    frame = 0;
    const vh = window.innerHeight;
    for (const s of scrubbers) {
      if (!s.near) continue;
      const r = s.el.getBoundingClientRect();
      const start = vh; // element top at the bottom of the viewport
      const end = vh * s.endAt - r.height; // element bottom at endAt × viewport height
      s.update(clamp01((start - r.top) / (start - end)));
    }
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(run);
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const s = scrubbers.find((x) => x.el === e.target);
        if (s) s.near = e.isIntersecting;
      }
      schedule();
    },
    { rootMargin: '15% 0px 15% 0px' },
  );
  scrubbers.forEach((s) => io.observe(s.el));

  // Let GSAP's ticker sleep whenever nothing is animating (new tweens wake it automatically).
  const anyActive = () => gsap.globalTimeline.getChildren(true, true, false).some((a) => a.isActive());
  let idleTimer = 0;
  const scheduleSleep = () => {
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => (anyActive() ? scheduleSleep() : gsap.ticker.sleep()), IDLE_MS);
  };

  // 2. Counter heading — plays once. Words are hidden only while the section is still below the fold.
  const counter = document.querySelector<HTMLElement>('[data-counter]');
  const words = Array.from(document.querySelectorAll<HTMLElement>('.counter__word > span'));
  let wordsIo: IntersectionObserver | null = null;
  if (counter && words.length && counter.getBoundingClientRect().top > window.innerHeight * 0.85) {
    animated.push(...words);
    gsap.set(words, { yPercent: 110, rotate: 4 });
    wordsIo = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        wordsIo?.disconnect();
        wordsIo = null;
        gsap.to(words, { yPercent: 0, rotate: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09 });
        scheduleSleep();
      },
      { rootMargin: '0px 0px -22% 0px' },
    );
    wordsIo.observe(counter);
  }

  const onScroll = () => {
    schedule();
    scheduleSleep();
  };
  const offs = [listen(window, 'scroll', onScroll, { passive: true }), listen(window, 'resize', onScroll, { passive: true })];
  schedule();
  scheduleSleep();

  return () => {
    offs.forEach((fn) => fn());
    io.disconnect();
    wordsIo?.disconnect();
    if (frame) cancelAnimationFrame(frame);
    window.clearTimeout(idleTimer);
    gsap.killTweensOf(animated);
    gsap.set(animated, { clearProps: 'transform' });
    scrubbers.forEach((s) => s.el.style.removeProperty('clip-path'));
    gsap.ticker.sleep();
  };
}
