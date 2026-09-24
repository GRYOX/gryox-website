"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { gsap } from "@/lib/animation/gsap";
import { frame } from "@/lib/scroll/frame";
import { TransitionLink } from "./TransitionLink";
import { SmartAnchor } from "./SmartAnchor";
import { Logo } from "./Logo";
import { LocaleSwitch } from "./LocaleSwitch";
import { ThemeSwitch } from "./ThemeSwitch";
import { MobileMenu } from "./MobileMenu";
import { NAV_ITEMS } from "./nav-items";

/**
 * Transparent over the hero → compact bar once scrolled → tucks away on fast
 * downward scrolling, returns the moment you scroll up.
 */
export function Navigation() {
  const t = useTranslations();
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const state = useRef({ compact: false, hidden: false });

  useEffect(() => {
    const tick = () => {
      const { y, velocity, direction } = frame.scroll;
      const nextCompact = y > 80;
      let nextHidden = state.current.hidden;
      if (direction > 0 && velocity > 6 && y > 480) nextHidden = true;
      else if (direction < 0 || y < 80) nextHidden = false;
      if (nextCompact !== state.current.compact) {
        state.current.compact = nextCompact;
        setCompact(nextCompact);
      }
      if (nextHidden !== state.current.hidden) {
        state.current.hidden = nextHidden;
        setHidden(nextHidden);
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const tucked = hidden && !menuOpen;

  return (
    <header
      data-reveal-after-opening
      className={`fixed inset-x-0 top-0 z-50 transition-transform duration-700 ease-out-expo ${tucked ? "-translate-y-full" : ""}`}
    >
      <div
        className={`relative flex items-center justify-between gutter transition-[height,background-color,border-color] duration-500 ease-out-expo ${
          compact && !menuOpen
            ? "h-14 border-b border-line bg-bg/85 backdrop-blur-md"
            : "h-18 border-b border-transparent sm:h-20"
        }`}
      >
        <TransitionLink href="/" aria-label={t("a11y.home")} className="relative z-10 -m-2 p-2" data-cursor="open">
          <Logo priority />
        </TransitionLink>

        <nav aria-label={t("a11y.mainNav")} className="hidden items-center lg:flex">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item, i) => (
              <li key={item.key}>
                <SmartAnchor
                  hash={item.hash}
                  className="group flex items-baseline gap-1.5 px-3 py-3 text-sm text-muted transition-colors duration-300 hover-fine:hover:text-fg"
                >
                  <span className="hud text-[0.6rem] text-faint transition-colors group-hover:text-green-ink">
                    0{i + 1}
                  </span>
                  {t(`nav.${item.key}`)}
                </SmartAnchor>
              </li>
            ))}
          </ul>
          <span aria-hidden="true" className="mx-4 h-4 w-px bg-line-strong" />
          <LocaleSwitch />
          <ThemeSwitch className="-mr-2 ml-1" />
        </nav>

        <div className="relative z-10 flex items-center lg:hidden">
          <ThemeSwitch />
          <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
        </div>
      </div>
    </header>
  );
}
