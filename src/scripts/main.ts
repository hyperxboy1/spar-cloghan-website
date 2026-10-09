/**
 * Client entry point. Every module returns a cleanup so listeners, observers and animation
 * frames are released on teardown (e.g. if client-side navigation is added later).
 * Content never depends on this file: with JavaScript disabled the page is complete.
 */
import type { Cleanup } from './env';
import { listen, mqDesktop, mqReducedMotion } from './env';
import { initMenu } from './menu';
import { initHeroStage } from './hero-stage';
import { initMagnetic } from './magnetic';
import { initTilt } from './tilt';
import { initCounter } from './counter';
import { initOffers } from './offers';

const cleanups: Cleanup[] = [];
let scenesCleanup: Cleanup | null = null;
let scenesLoading = false;

/** GSAP + ScrollTrigger are loaded only for desktop visitors who allow motion. */
async function syncScrollScenes() {
  const wanted = mqDesktop.matches && !mqReducedMotion.matches;
  if (wanted && !scenesCleanup && !scenesLoading) {
    scenesLoading = true;
    try {
      const { initScrollScenes } = await import('./scroll-scenes');
      // Re-check: preferences may have changed while the module loaded.
      if (mqDesktop.matches && !mqReducedMotion.matches) scenesCleanup = initScrollScenes();
    } finally {
      scenesLoading = false;
    }
  } else if (!wanted && scenesCleanup) {
    scenesCleanup();
    scenesCleanup = null;
  }
}

function whenIdle(fn: () => void) {
  if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout: 1500 });
  else setTimeout(fn, 200);
}

export function boot() {
  cleanups.push(initMenu());
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (hero) cleanups.push(initHeroStage(hero));
  // The Special Offers banner reuses the same controller for its restrained background depth.
  const offersHero = document.querySelector<HTMLElement>('[data-offers-hero]');
  if (offersHero) cleanups.push(initHeroStage(offersHero));
  cleanups.push(initMagnetic(), initTilt(), initCounter(), initOffers());

  whenIdle(() => void syncScrollScenes());
  cleanups.push(
    listen(mqDesktop, 'change', () => void syncScrollScenes()),
    listen(mqReducedMotion, 'change', () => void syncScrollScenes()),
  );

  document.addEventListener('astro:before-swap', teardown, { once: true });
}

export function teardown() {
  cleanups.splice(0).forEach((fn) => fn());
  scenesCleanup?.();
  scenesCleanup = null;
}
