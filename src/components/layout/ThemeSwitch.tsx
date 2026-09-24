"use client";

import { m } from "motion/react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/lib/theme/theme";

/** A square cut on the diagonal — the brand's G/R cut — that turns over between themes. */
export function ThemeSwitch({ className = "" }: { className?: string }) {
  const t = useTranslations("a11y");
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? t("toLight") : t("toDark")}
      className={`group relative grid size-11 place-items-center text-fg ${className}`}
    >
      <m.svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        aria-hidden="true"
        initial={false}
        animate={{ rotate: dark ? 0 : 180 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <path d="M4 1H17V14L14 17H1V4Z" fill="none" stroke="currentColor" strokeWidth="1.25" />
        <path d="M4 1H17L1 17V4Z" fill="currentColor" />
      </m.svg>
    </button>
  );
}
