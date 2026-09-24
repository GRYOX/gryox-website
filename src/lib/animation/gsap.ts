"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

ScrollTrigger.config({ ignoreMobileResize: true });

gsap.defaults({ ease: "expo.out", duration: 1 });

/** Named motion tokens — the whole site shares one motion language. */
export const EASE = {
  out: "expo.out",
  inOut: "power3.inOut",
  soft: "power2.out",
  morph: "sine.inOut",
} as const;

export const DURATION = {
  micro: 0.35,
  ui: 0.6,
  reveal: 1.1,
  scene: 1.6,
} as const;

export { gsap, ScrollTrigger, SplitText, useGSAP };
