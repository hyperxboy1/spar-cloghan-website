/**
 * Hero pointer choreography — one coordinated controller for every layer.
 *
 *  - Each layer follows the pointer through its own damped spring, so background, mid-ground
 *    and foreground arrive with slightly different weight (a soft follow-through, no bounce).
 *  - Pointer events only update targets; a single rAF loop integrates and writes transforms.
 *  - The loop sleeps once everything settles, and stops when the hero is offscreen, the tab is
 *    hidden, the pointer is coarse/touch, or reduced motion is requested (live changes included).
 *  - Geometry is cached and refreshed on resize, never measured during pointer moves.
 */
import { clamp, listen, mqFinePointer, mqReducedMotion, pointerMotionAllowed, type Cleanup } from './env';

type Tuning = { freq: number; damping: number };

// freq in Hz, damping ratio < 1 gives a slight weighted overshoot on the heavier layers.
const TUNING: Record<string, Tuning> = {
  bg: { freq: 2.6, damping: 0.95 },
  mid: { freq: 2.1, damping: 0.82 },
  fg: { freq: 1.7, damping: 0.7 },
  sheen: { freq: 2.4, damping: 0.95 },
  spot: { freq: 3.6, damping: 0.95 },
  accent: { freq: 9, damping: 0.9 },
};

const MAX_DT = 1 / 30; // clamp after tab switches or long frames
const SUBSTEP = 1 / 120;
const EPS = 0.02;

class Spring {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  tx = 0;
  ty = 0;
  private k: number;
  private c: number;

  constructor({ freq, damping }: Tuning) {
    const w = 2 * Math.PI * freq;
    this.k = w * w;
    this.c = 2 * damping * w;
  }

  step(dt: number) {
    this.vx += (this.k * (this.tx - this.x) - this.c * this.vx) * dt;
    this.vy += (this.k * (this.ty - this.y) - this.c * this.vy) * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  snap(x = this.tx, y = this.ty) {
    this.x = this.tx = x;
    this.y = this.ty = y;
    this.vx = this.vy = 0;
  }

  get settled() {
    return (
      Math.abs(this.tx - this.x) < EPS &&
      Math.abs(this.ty - this.y) < EPS &&
      Math.abs(this.vx) < EPS &&
      Math.abs(this.vy) < EPS
    );
  }
}

interface Layer {
  el: HTMLElement;
  depth: number; // px at full pointer travel (negative = opposite direction)
  rot: number; // degrees at full horizontal travel
  spring: Spring;
}

export function initHeroStage(hero: HTMLElement): Cleanup {
  const layers: Layer[] = Array.from(hero.querySelectorAll<HTMLElement>('[data-layer]')).map((el) => ({
    el,
    depth: Number(el.dataset.depth ?? 0),
    rot: Number(el.dataset.rot ?? 0),
    spring: new Spring(TUNING[el.dataset.spring ?? 'mid'] ?? TUNING.mid),
  }));
  const sheenEl = hero.querySelector<HTMLElement>('[data-sheen]');
  const spotEl = hero.querySelector<HTMLElement>('[data-spot]');
  const accentEl = hero.querySelector<HTMLElement>('[data-accent]');
  const sheen = new Spring(TUNING.sheen);
  const spot = new Spring(TUNING.spot);
  const accent = new Spring(TUNING.accent);
  const springs = [...layers.map((l) => l.spring), sheen, spot, accent];

  let enabled = pointerMotionAllowed();
  let inView = true;
  let raf = 0;
  let last = 0;
  let lit = false;
  let animating = false;

  // Cached geometry (document coordinates).
  let geo = { left: 0, top: 0, width: 1, height: 1 };
  let geoDirty = true;
  const measure = () => {
    const r = hero.getBoundingClientRect();
    geo = { left: r.left + window.scrollX, top: r.top + window.scrollY, width: r.width || 1, height: r.height || 1 };
    geoDirty = false;
  };

  const write = () => {
    for (const l of layers) {
      const { x, y } = l.spring;
      const r = l.depth ? (x / l.depth) * l.rot : 0;
      l.el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${r.toFixed(3)}deg)`;
    }
    if (sheenEl) sheenEl.style.transform = `translate3d(${(-22 + sheen.x).toFixed(2)}%, 0, 0)`;
    if (spotEl) spotEl.style.transform = `translate3d(${spot.x.toFixed(1)}px, ${spot.y.toFixed(1)}px, 0)`;
    if (accentEl) accentEl.style.transform = `translate3d(${accent.x.toFixed(1)}px, ${accent.y.toFixed(1)}px, 0)`;
  };

  const setAnimating = (on: boolean) => {
    if (on === animating) return;
    animating = on;
    // will-change only while moving, then released.
    const value = on ? 'transform' : '';
    for (const l of layers) l.el.style.willChange = value;
    if (sheenEl) sheenEl.style.willChange = value;
    if (spotEl) spotEl.style.willChange = value;
    if (accentEl) accentEl.style.willChange = value;
  };

  const frame = (now: number) => {
    raf = 0;
    const dt = last ? Math.min((now - last) / 1000, MAX_DT) : 1 / 60;
    last = now;
    const steps = Math.max(1, Math.ceil(dt / SUBSTEP));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) for (const s of springs) s.step(h);
    write();
    if (springs.every((s) => s.settled)) {
      for (const s of springs) s.snap();
      write();
      last = 0;
      setAnimating(false);
      return; // sleep until the next pointer event
    }
    raf = requestAnimationFrame(frame);
  };

  const wake = () => {
    if (!enabled || !inView || document.hidden) return;
    setAnimating(true);
    if (!raf) raf = requestAnimationFrame(frame);
  };

  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
  };

  const setLit = (on: boolean) => {
    if (on === lit) return;
    lit = on;
    hero.classList.toggle('is-lit', on);
  };

  /** Return everything to rest immediately (used when nobody can see the motion). */
  const restNow = () => {
    stop();
    if (!enabled) return; // static composition: leave CSS in charge, write nothing
    for (const s of springs) s.snap(0, 0);
    setLit(false);
    hero.classList.remove('is-over-control');
    write();
    setAnimating(false);
  };

  /** Remove every inline transform: the static CSS composition takes over. */
  const clearAll = () => {
    stop();
    for (const s of springs) s.snap(0, 0);
    for (const l of layers) l.el.style.transform = '';
    if (sheenEl) sheenEl.style.transform = '';
    if (spotEl) spotEl.style.transform = '';
    if (accentEl) accentEl.style.transform = '';
    setLit(false);
    hero.classList.remove('is-over-control');
    setAnimating(false);
  };

  const onMove = (e: PointerEvent) => {
    if (!enabled || e.pointerType === 'touch') return;
    if (geoDirty) measure();
    const lx = e.clientX - (geo.left - window.scrollX);
    const ly = e.clientY - (geo.top - window.scrollY);
    const nx = clamp((lx / geo.width) * 2 - 1, -1, 1);
    const ny = clamp((ly / geo.height) * 2 - 1, -1, 1);
    for (const l of layers) {
      l.spring.tx = nx * l.depth;
      l.spring.ty = ny * l.depth;
    }
    sheen.tx = nx * 26;
    if (!lit) {
      // Start the light where the pointer entered rather than sweeping in from a corner.
      spot.snap(lx, ly);
      accent.snap(lx, ly);
      write();
    }
    spot.tx = lx;
    spot.ty = ly;
    accent.tx = lx;
    accent.ty = ly;
    setLit(true);
    wake();
  };

  const onLeave = (e: PointerEvent) => {
    if (!enabled || e.pointerType === 'touch') return;
    for (const l of layers) {
      l.spring.tx = 0;
      l.spring.ty = 0;
    }
    sheen.tx = 0;
    setLit(false);
    hero.classList.remove('is-over-control');
    wake();
  };

  const onOver = (e: PointerEvent) => {
    if (!enabled) return;
    const overControl = !!(e.target as Element).closest('a, button');
    hero.classList.toggle('is-over-control', overControl);
  };

  const refreshEnabled = () => {
    const next = pointerMotionAllowed();
    if (next === enabled) return;
    enabled = next;
    if (!enabled) clearAll();
  };

  const onVisibility = () => {
    if (document.hidden) restNow();
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) restNow();
    },
    { threshold: 0 },
  );
  io.observe(hero);

  const ro = new ResizeObserver(() => {
    geoDirty = true;
  });
  ro.observe(hero);

  const cleanups: Cleanup[] = [
    listen(hero, 'pointermove', onMove, { passive: true }),
    listen(hero, 'pointerleave', onLeave, { passive: true }),
    listen(hero, 'pointerover', onOver, { passive: true }),
    listen(window, 'resize', () => (geoDirty = true), { passive: true }),
    listen(document, 'visibilitychange', onVisibility),
    listen(window, 'blur', () => enabled && onLeave(new PointerEvent('pointerleave', { pointerType: 'mouse' }))),
    listen(mqReducedMotion, 'change', refreshEnabled),
    listen(mqFinePointer, 'change', refreshEnabled),
  ];

  if (!enabled) clearAll();

  return () => {
    cleanups.forEach((fn) => fn());
    io.disconnect();
    ro.disconnect();
    clearAll();
  };
}
