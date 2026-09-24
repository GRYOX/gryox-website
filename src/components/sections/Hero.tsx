"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, SplitText, useGSAP } from "@/lib/animation/gsap";
import { prefersReducedMotion, useFinePointer } from "@/lib/device/media";
import { onIntroComplete } from "@/lib/intro";
import { frame } from "@/lib/scroll/frame";
import { SceneTrigger } from "@/components/three/SceneTrigger";
import { SmartAnchor } from "@/components/layout/SmartAnchor";

/**
 * First WOW: the headline carries the idea→technology story in its colours
 * (green = idea, purple = technology) while the materialised symbol floats beside it.
 */
export function Hero() {
  const t = useTranslations("hero");
  const fine = useFinePointer();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();
      // Resolve targets now: enter() may run later, outside this scope.
      const q = gsap.utils.selector(root);
      const fades = q(".js-hero-fade");
      const split = SplitText.create(q(".js-hero-title"), {
        type: "lines",
        mask: "lines",
        linesClass: "split-line",
        aria: "auto",
      });
      gsap.set([split.lines, fades], { autoAlpha: 0 });

      const enter = () => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        if (reduced) {
          tl.to([split.lines, fades], { autoAlpha: 1, duration: 0.6 });
          return;
        }
        tl.fromTo(
          split.lines,
          { yPercent: 110, autoAlpha: 1 },
          { yPercent: 0, duration: 1.3, stagger: 0.1 },
          0.1,
        ).fromTo(fades, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.08 }, 0.5);
      };
      const off = onIntroComplete(enter);

      if (!reduced) {
        // Leaving the hero: the headline drifts up slower than the page; the symbol turns.
        gsap.fromTo(
          q(".js-hero-copy"),
          { yPercent: 0, opacity: 1 },
          {
            yPercent: -18,
            opacity: 0.15,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          },
        );
        const turn = { v: 0 };
        gsap.to(turn, {
          v: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
          onUpdate: () => {
            frame.matter.rotY = turn.v * 0.55;
          },
        });
      }

      return () => {
        off();
        split.revert();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" className="relative flex min-h-svh flex-col" aria-labelledby="hero-title">
      <SceneTrigger preset="hero" end="bottom 40%" />

      <div className="relative flex flex-1 flex-col gutter pt-24 pb-8 sm:pt-28 lg:pb-10">
        <div className="js-hero-fade flex items-center justify-between" data-reveal-after-opening>
          <p className="flex items-center gap-3 hud text-muted">
            <span aria-hidden="true" className="size-1.5 bg-green" />
            {t("eyebrow")}
            <span aria-hidden="true" className="text-faint">
              / 001
            </span>
          </p>
          <p className="hidden hud text-faint sm:block">{t("hudForming")}</p>
        </div>

        <div className="js-hero-copy mt-auto">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end" data-reveal-after-opening>
            <h1
              id="hero-title"
              className="js-hero-title display-wide text-[clamp(2.6rem,7vw,8.4rem)] text-fg lg:col-span-9"
            >
              {t.rich("title", {
                idea: (chunks) => <span className="text-idea">{chunks}</span>,
                tech: (chunks) => <span className="text-tech">{chunks}</span>,
              })}
            </h1>

            <div className="flex flex-col gap-6 lg:col-span-3 lg:pb-3">
              <p className="js-hero-fade max-w-[34ch] text-[0.95rem] leading-relaxed text-muted">{t("lede")}</p>
              <SmartAnchor
                hash="contact"
                cursor="open"
                className="js-hero-fade group flex w-fit items-center gap-3 border-b border-line-strong pb-2 text-sm text-fg transition-colors hover-fine:hover:border-green"
              >
                {t("cta")}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1"
                >
                  →
                </span>
              </SmartAnchor>
            </div>
          </div>
        </div>

        <div
          className="js-hero-fade mt-10 flex items-center justify-between border-t border-line pt-4 text-faint"
          data-reveal-after-opening
        >
          <p className="hud">{fine ? t("interactPointer") : t("interactTouch")}</p>
          <p className="flex items-center gap-3 hud">
            {t("scroll")}
            <span aria-hidden="true" className="relative block h-6 w-px overflow-hidden bg-line">
              <span className="absolute inset-x-0 top-0 h-2 animate-[gx-scroll_1.8s_var(--ease-in-out-quart)_infinite] bg-fg" />
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
