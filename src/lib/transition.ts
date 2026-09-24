"use client";

import { gsap } from "@/lib/animation/gsap";
import { prefersReducedMotion } from "@/lib/device/media";
import { pulseEnergy } from "@/lib/three/presets";

/**
 * Route transitions: a diagonal wipe (the cut between G and R) covers the page,
 * navigation happens underneath, then the wipe continues off-screen.
 * Fast (~0.4s each way) and never blocks prefetching.
 */
let overlay: HTMLElement | null = null;
let covered = false;

export const registerTransitionOverlay = (el: HTMLElement | null) => {
  overlay = el;
};

export function cover(): Promise<void> {
  if (!overlay || prefersReducedMotion()) return Promise.resolve();
  covered = true;
  pulseEnergy(0.6);
  return new Promise((resolve) => {
    gsap.killTweensOf(overlay);
    gsap.set(overlay, { "--a": 0, "--b": 0, visibility: "visible" });
    gsap.to(overlay, { "--b": 140, duration: 0.42, ease: "power3.in", onComplete: () => resolve() });
  });
}

export function reveal() {
  if (!overlay || !covered) return;
  covered = false;
  gsap.to(overlay, {
    "--a": 140,
    duration: 0.55,
    ease: "power3.out",
    delay: 0.05,
    onComplete: () => {
      if (overlay) gsap.set(overlay, { visibility: "hidden" });
    },
  });
}
