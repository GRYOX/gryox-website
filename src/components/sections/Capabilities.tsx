"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/animation/gsap";
import { frame } from "@/lib/scroll/frame";
import { morphTo } from "@/lib/three/presets";
import { capabilities } from "@/data/capabilities";
import { MATTER_TARGETS } from "@/types/content";
import { SceneTrigger } from "@/components/three/SceneTrigger";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { RevealText } from "@/components/ui/RevealText";

const TARGET_INDEX = capabilities.map((c) => MATTER_TARGETS.indexOf(c.target));
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Capabilities as one continuous transformation:
 * interface → environment → device → network → systems.
 * Desktop: vertical scroll drives a horizontal track while the matter morphs in sync.
 * Touch / small screens / reduced motion: vertical chapters, each morphs on arrival.
 */
export function Capabilities() {
  const t = useTranslations("capabilities");
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const panels = q<HTMLElement>(".js-panel");
        const distance = () => (track.current?.scrollWidth ?? 0) - window.innerWidth;
        let active = false;
        const labels = q<HTMLElement>(".js-chapter");

        const horizontal = gsap.to(track.current, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pin.current,
            pin: true,
            start: "top top",
            end: () => `+=${distance() * 1.15}`,
            scrub: 1,
            invalidateOnRefresh: true,
            onToggle: (self) => {
              active = self.isActive;
            },
            onUpdate: (self) => {
              if (!active) return;
              // The morph is owned by this section while pinned.
              gsap.killTweensOf(frame.matter, "mix");
              const seg = self.progress * (panels.length - 1);
              const i = Math.min(Math.floor(seg), panels.length - 2);
              const m = frame.matter;
              m.from = TARGET_INDEX[i];
              m.to = TARGET_INDEX[i + 1];
              m.mix = smoothstep(0.28, 0.78, seg - i);
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
              const current = Math.round(seg);
              labels.forEach((el, k) => el.classList.toggle("is-active", k === current));
            },
          },
        });

        // Depth inside the track: titles drift against the panels.
        panels.forEach((panel) => {
          gsap.fromTo(
            panel.querySelector(".js-panel-title"),
            { xPercent: 8 },
            {
              xPercent: -6,
              ease: "none",
              scrollTrigger: {
                trigger: panel,
                containerAnimation: horizontal,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
          gsap.from(panel.querySelectorAll(".js-panel-item"), {
            y: 30,
            autoAlpha: 0,
            stagger: 0.06,
            duration: 0.9,
            ease: "expo.out",
            scrollTrigger: { trigger: panel, containerAnimation: horizontal, start: "left 70%" },
          });
        });
      });

      mm.add("(max-width: 1023.98px), (prefers-reduced-motion: reduce)", () => {
        q<HTMLElement>(".js-panel").forEach((panel, i) => {
          ScrollTrigger.create({
            trigger: panel,
            start: "top 60%",
            end: "bottom 40%",
            onToggle: (self) => {
              if (self.isActive) morphTo(capabilities[i].target, 1.4);
            },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="capabilities" className="relative" aria-labelledby="capabilities-title">
      <SceneTrigger preset="capabilities" start="top 60%" end="bottom 40%" />

      <header className="relative grid gap-10 gutter pt-[18vh] pb-[12vh] lg:grid-cols-12">
        <SectionLabel index="03" className="lg:col-span-12">
          {t("label")}
        </SectionLabel>
        <RevealText
          as="h2"
          id="capabilities-title"
          className="display-wide text-[clamp(2.6rem,7vw,7.5rem)] text-fg lg:col-span-8"
        >
          {t("title")}
        </RevealText>
        <p className="max-w-[36ch] self-end text-lg leading-relaxed text-muted lg:col-span-4">{t("intro")}</p>
      </header>

      <div ref={pin} className="relative lg:h-svh lg:overflow-hidden">
        <div ref={track} className="flex flex-col lg:h-full lg:w-max lg:flex-row">
          {capabilities.map((cap) => {
            const list = t.raw(`items.${cap.id}.list`) as string[];
            return (
              <article
                key={cap.id}
                className="js-panel relative flex min-h-svh flex-col justify-end gutter pt-[45svh] pb-16 lg:h-full lg:min-h-0 lg:w-screen lg:justify-center lg:pt-0 lg:pb-0"
                aria-labelledby={`cap-${cap.id}`}
              >
                <div className="relative max-w-xl lg:max-w-[40vw]">
                  <p className="js-panel-item mb-6 flex items-center gap-4 hud text-muted">
                    <span className="text-green-ink">{cap.index}</span>
                    <span aria-hidden="true" className="h-px w-10 bg-line-strong" />
                    <span>{t("chapter")}</span>
                  </p>
                  <h3
                    id={`cap-${cap.id}`}
                    className="js-panel-title display-wide text-[clamp(3rem,12vw,5.5rem)] text-fg lg:text-[clamp(4rem,7.4vw,8.5rem)]"
                  >
                    {t(`items.${cap.id}.title`)}
                  </h3>
                  <p className="js-panel-item mt-8 hud text-tech">{t(`items.${cap.id}.transform`)}</p>
                  <p className="js-panel-item mt-4 max-w-[38ch] text-lg leading-relaxed text-fg/85 sm:text-xl">
                    {t(`items.${cap.id}.statement`)}
                  </p>
                  <ul className="mt-8 border-t border-line">
                    {list.map((item) => (
                      <li
                        key={item}
                        className="js-panel-item flex items-center gap-4 border-b border-line py-3.5 text-sm text-muted"
                      >
                        <span aria-hidden="true" className="h-2.5 w-px rotate-[35deg] bg-green" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        {/* Chapter rail (desktop) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 hidden gutter pb-8 lg:block">
          <div className="flex items-center justify-between gap-6">
            {capabilities.map((cap) => (
              <span
                key={cap.id}
                className="js-chapter hud text-faint transition-colors duration-500 [&.is-active]:text-fg"
              >
                {cap.index} {t(`items.${cap.id}.title`)}
              </span>
            ))}
          </div>
          <div className="relative mt-3 h-px bg-line">
            <span ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-green to-purple" />
          </div>
        </div>
      </div>
    </section>
  );
}
