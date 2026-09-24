"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "./theme-script";

export type Theme = "dark" | "light";

const listeners = new Set<() => void>();

function read(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getTheme(): Theme {
  return typeof document === "undefined" ? "dark" : read();
}

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  if (read() === theme) return;
  root.classList.add("theme-transition");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage may be unavailable (private mode); the choice still applies for this visit.
  }
  listeners.forEach((l) => l());
  window.setTimeout(() => root.classList.remove("theme-transition"), 420);
}

/** Re-apply the stored choice (the root layout re-renders <html> on locale changes). */
export function restoreTheme() {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return;
  }
  if (stored !== "light" && stored !== "dark") return;
  const root = document.documentElement;
  if (root.dataset.theme === stored) return;
  root.dataset.theme = stored;
  root.style.colorScheme = stored;
  listeners.forEach((l) => l());
}

export function subscribeTheme(listener: (theme: Theme) => void) {
  return subscribe(() => listener(read()));
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => "dark" as Theme);
  return {
    theme,
    setTheme,
    toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
  };
}
