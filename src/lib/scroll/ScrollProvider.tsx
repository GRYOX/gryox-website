"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "@/i18n/navigation";
import { gsap, ScrollTrigger } from "@/lib/animation/gsap";
import { prefersReducedMotion } from "@/lib/device/media";
import { frame } from "./frame";
import { getLenis, setLenis } from "./lenis";

/**
 * Owns the one animation loop of the site:
 *   gsap.ticker → Lenis.raf → (scroll event) ScrollTrigger.update
 *   gsap.ticker → R3F advance (added by the WebGL stage)
 * Also tracks pointer + scroll velocity into the frame store.
 */
export function ScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduced = prefersReducedMotion();
    let lenis: Lenis | null = null;

    if (!reduced) {
      lenis = new Lenis({
        autoRaf: false,
        lerp: 0.085,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.95,
      });
      lenis.on("scroll", (l: Lenis) => {
        frame.scroll.y = l.scroll;
        frame.scroll.velocity = l.velocity;
        frame.scroll.progress = l.progress;
        frame.scroll.direction = l.direction >= 0 ? 1 : -1;
        ScrollTrigger.update();
      });
      setLenis(lenis);
    }

    // Native fallback (reduced motion) still feeds scroll position; velocity stays calm.
    let lastY = window.scrollY;
    const onNativeScroll = () => {
      if (lenis) return;
      const y = window.scrollY;
      frame.scroll.direction = y >= lastY ? 1 : -1;
      frame.scroll.y = y;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      frame.scroll.progress = max > 0 ? y / max : 0;
      lastY = y;
    };

    const tick = (time: number) => {
      lenis?.raf(time * 1000);
      if (!lenis) frame.scroll.velocity *= 0.9;
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const controller = new AbortController();
    const { signal } = controller;
    window.addEventListener("scroll", onNativeScroll, { passive: true, signal });

    const setPointer = (x: number, y: number) => {
      frame.pointer.nx = (x / window.innerWidth) * 2 - 1;
      frame.pointer.ny = -((y / window.innerHeight) * 2 - 1);
      frame.pointer.active = true;
    };
    window.addEventListener("pointermove", (e) => setPointer(e.clientX, e.clientY), { passive: true, signal });
    window.addEventListener(
      "touchmove",
      (e) => {
        const t = e.touches[0];
        if (t) setPointer(t.clientX, t.clientY);
      },
      { passive: true, signal },
    );
    const release = () => {
      frame.pointer.active = false;
    };
    window.addEventListener("touchend", release, { passive: true, signal });
    document.documentElement.addEventListener("pointerleave", release, { signal });

    // Layout can shift after web fonts arrive.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      controller.abort();
      gsap.ticker.remove(tick);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  useRouteScrollReset();

  return <>{children}</>;
}

function useRouteScrollReset() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.location.hash) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);
}
