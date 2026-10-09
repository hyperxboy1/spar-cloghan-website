/** Shared media-query state for every motion module. */
export const mqReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
export const mqFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
export const mqDesktop = window.matchMedia('(min-width: 861px)');

/** Pointer-follow effects run only for a precise hovering pointer and when motion is allowed. */
export function pointerMotionAllowed(): boolean {
  return mqFinePointer.matches && !mqReducedMotion.matches;
}

export type Cleanup = () => void;

export function listen<K extends keyof HTMLElementEventMap>(
  target: HTMLElement,
  type: K,
  handler: (ev: HTMLElementEventMap[K]) => void,
  options?: AddEventListenerOptions,
): Cleanup;
export function listen(
  target: EventTarget,
  type: string,
  handler: (ev: any) => void,
  options?: AddEventListenerOptions,
): Cleanup;
export function listen(target: EventTarget, type: string, handler: (ev: any) => void, options?: AddEventListenerOptions): Cleanup {
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
}

export const clamp = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v);
