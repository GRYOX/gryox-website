"use client";

import { useLayoutEffect } from "react";
import { useLocale } from "next-intl";
import { restoreTheme } from "@/lib/theme/theme";

/** Keeps the visitor's theme when the root layout re-renders (e.g. switching PT ↔ EN). */
export function ThemeSync() {
  const locale = useLocale();
  useLayoutEffect(() => {
    restoreTheme();
  }, [locale]);
  return null;
}
