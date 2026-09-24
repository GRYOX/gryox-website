"use client";

import { useSyncExternalStore } from "react";

function useMedia(query: string, serverFallback: boolean) {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => serverFallback,
  );
}

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
export const DESKTOP_QUERY = "(min-width: 1024px)";

export const useReducedMotion = () => useMedia(REDUCED_MOTION_QUERY, false);
export const useFinePointer = () => useMedia(FINE_POINTER_QUERY, false);
export const useIsDesktop = () => useMedia(DESKTOP_QUERY, true);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
