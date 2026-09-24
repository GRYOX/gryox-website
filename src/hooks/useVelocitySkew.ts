"use client";

import { type RefObject, useEffect } from "react";
import { gsap } from "@/lib/animation/gsap";
import { prefersReducedMotion } from "@/lib/device/media";
import { frame } from "@/lib/scroll/frame";

/**
 * Subtle skew driven by scroll velocity. Eased every tick so it settles to 0
 * the moment scrolling stops. Max ±`max` degrees.
 */
export function useVelocitySkew(ref: RefObject<HTMLElement | null>, max = 4, strength = 0.12) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const set = gsap.quickSetter(el, "skewY", "deg");
    let current = 0;
    const tick = () => {
      const target = gsap.utils.clamp(-max, max, -frame.scroll.velocity * strength);
      current += (target - current) * 0.12;
      if (Math.abs(current) < 0.001) current = 0;
      set(current);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      gsap.set(el, { skewY: 0 });
    };
  }, [ref, max, strength]);
}
