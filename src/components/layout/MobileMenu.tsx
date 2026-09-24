"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, m } from "motion/react";
import { useTranslations } from "next-intl";
import { getLenis } from "@/lib/scroll/lenis";
import { SmartAnchor } from "./SmartAnchor";
import { LocaleSwitch } from "./LocaleSwitch";
import { NAV_ITEMS } from "./nav-items";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Full-screen menu for touch/small screens: large targets, focus trap, Esc to close. */
export function MobileMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations();
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const focusables = () =>
      Array.from(panel.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    requestAnimationFrame(() => focusables()[0]?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
        button.current?.focus();
      }
      if (e.key === "Tab") {
        const list = [button.current!, ...focusables()];
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [open, onOpenChange]);

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={open ? t("a11y.closeMenu") : t("a11y.openMenu")}
        onClick={() => onOpenChange(!open)}
        className="relative z-[60] -mr-3 flex h-11 items-center gap-3 px-3 hud text-fg"
      >
        <span className="w-10 text-right">{open ? t("nav.close") : t("nav.menu")}</span>
        <span aria-hidden="true" className="relative block h-3 w-5">
          <span
            className={`absolute left-0 h-px w-full bg-current transition-transform duration-500 ease-out-expo ${open ? "top-1.5 rotate-[35deg]" : "top-0.5"}`}
          />
          <span
            className={`absolute left-0 h-px bg-current transition-all duration-500 ease-out-expo ${open ? "top-1.5 w-full -rotate-[35deg]" : "top-2.5 w-3/5"}`}
          />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            ref={panel}
            id={id}
            role="dialog"
            aria-modal="true"
            aria-label={t("a11y.mainNav")}
            className="fixed inset-0 z-50 flex flex-col bg-bg pt-24"
            initial={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
            animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
            exit={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <nav className="flex-1 gutter">
              <ul className="border-t border-line">
                {NAV_ITEMS.map((item, i) => (
                  <m.li
                    key={item.key}
                    className="border-b border-line"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.15 + i * 0.06 }}
                  >
                    <SmartAnchor
                      hash={item.hash}
                      onNavigate={() => onOpenChange(false)}
                      className="flex items-baseline justify-between py-5 display-tight text-[clamp(2.4rem,11vw,4.5rem)] text-fg"
                    >
                      {t(`nav.${item.key}`)}
                      <span className="hud text-faint">0{i + 1}</span>
                    </SmartAnchor>
                  </m.li>
                ))}
              </ul>
            </nav>
            <m.div
              className="flex items-center justify-between border-t border-line gutter py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
            >
              <LocaleSwitch />
              <span className="hud text-faint">GRYOX</span>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
