"use client";

import { type RefObject, useEffect, useState } from "react";

/** Tracks visibility; `once` latches true (used for lazy mounting). */
export function useInView(ref: RefObject<Element | null>, { once = false, margin = "0px" } = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) io.disconnect();
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, once, margin]);
  return inView;
}

/** Reads the live theme colours from CSS custom properties. */
export function readPalette() {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string) => s.getPropertyValue(name).trim();
  return { green: v("--green"), purple: v("--purple"), fg: v("--fg"), bg: v("--bg-elev"), line: v("--line-strong") };
}
