"use client";

import { LazyMotion } from "motion/react";

// Motion's feature bundle loads after hydration — it only powers UI micro-interactions.
const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
