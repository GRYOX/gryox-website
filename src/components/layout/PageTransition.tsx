"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import { registerTransitionOverlay, reveal } from "@/lib/transition";

export function PageTransition() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    registerTransitionOverlay(ref.current);
    return () => registerTransitionOverlay(null);
  }, []);

  useEffect(() => {
    reveal();
  }, [pathname]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[80] bg-bg"
      style={{
        visibility: "hidden",
        clipPath:
          "polygon(calc(var(--a, 0) * 1% - 30%) 0, calc(var(--b, 0) * 1%) 0, calc(var(--b, 0) * 1% - 30%) 100%, calc(var(--a, 0) * 1% - 60%) 100%)",
      }}
    >
      <div
        className="absolute inset-y-0 w-[2px] bg-gradient-to-b from-green to-purple"
        style={{ left: "calc(var(--b, 0) * 1% - 15%)", transform: "skewX(-16deg)" }}
      />
    </div>
  );
}
