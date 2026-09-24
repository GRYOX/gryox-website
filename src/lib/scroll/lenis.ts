import type Lenis from "lenis";

/** The single Lenis instance (null when reduced motion disables smooth scrolling). */
let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};

export const getLenis = () => instance;

/** Scroll to an element or position using Lenis when present, native otherwise. */
export function scrollToTarget(
  target: string | HTMLElement | number,
  opts: { immediate?: boolean; offset?: number } = {},
) {
  const lenis = instance;
  if (lenis) {
    lenis.scrollTo(target, {
      offset: opts.offset ?? 0,
      immediate: opts.immediate,
      duration: 1.6,
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    });
    return;
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (typeof el === "number") {
    window.scrollTo({ top: el, behavior: opts.immediate ? "auto" : "smooth" });
  } else if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY + (opts.offset ?? 0);
    window.scrollTo({ top, behavior: opts.immediate ? "auto" : "smooth" });
  }
}
