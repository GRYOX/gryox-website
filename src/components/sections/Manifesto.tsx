"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, SplitText, useGSAP } from "@/lib/animation/gsap";
import { frame } from "@/lib/scroll/frame";
import { useVelocitySkew } from "@/hooks/useVelocitySkew";
import { SceneTrigger } from "@/components/three/SceneTrigger";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * A pinned typographic sequence. Each line owns one beat: characters rise through
 * a mask while tracking tightens, then the line recedes as the next arrives.
 * Behind it, the matter condenses from a cloud into the symbol, landing on "GRYOX."
 */
export function Manifesto() {
  const t = useTranslations("manifesto");
  const lines = t.raw("lines") as string[];
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useVelocitySkew(stage, 3, 0.08);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        const lineEls = q<HTMLElement>(".js-line");
        const splits = lineEls.map((el) => SplitText.create(el, { type: "words,chars", mask: "words", aria: "auto" }));
        const ticks = q<HTMLElement>(".js-tick");
        const last = lineEls.length - 1;

        gsap.set(lineEls, { autoAlpha: 0 });
        gsap.set(q(".js-coda"), { autoAlpha: 0, y: 24 });

        // The matter's dissolve is owned by this section while it is active.
        const matter = { dissolve: 0 };
        let active = false;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: pin.current,
            pin: true,
            start: "top top",
            end: () => `+=${window.innerHeight * 4.2}`,
            scrub: 0.8,
            onToggle: (self) => {
              active = self.isActive;
            },
            onUpdate: () => {
              if (active) frame.matter.dissolve = matter.dissolve;
            },
          },
        });

        // Formed → scattered as the first line lands → condensing back into the symbol on "GRYOX."
        tl.to(matter, { dissolve: 0.9, duration: 1, ease: "power2.out" }, 0).to(
          matter,
          { dissolve: 0, duration: lineEls.length * 2 - 1.2, ease: "power1.in" },
          1,
        );

        lineEls.forEach((el, i) => {
          const chars = splits[i].chars;
          const at = i * 2;
          const isLast = i === last;
          tl.set(el, { autoAlpha: 1 }, at)
            .fromTo(
              chars,
              { yPercent: 115, rotate: 4 },
              { yPercent: 0, rotate: 0, duration: 0.8, stagger: 0.025, ease: "expo.out" },
              at,
            )
            .fromTo(
              el,
              { letterSpacing: isLast ? "0.45em" : "0.22em", scale: 1.06 },
              { letterSpacing: isLast ? "-0.04em" : "-0.02em", scale: 1, duration: 1.1, ease: "power3.out" },
              at,
            )
            .to(ticks[i], { scaleX: 1, backgroundColor: "var(--green)", duration: 0.4 }, at);

          if (!isLast) {
            tl.to(el, { yPercent: -40, scale: 0.92, autoAlpha: 0, duration: 0.7, ease: "power2.in" }, at + 1.3);
          } else {
            tl.to(q(".js-coda"), { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }, at + 0.9).to(
              {},
              { duration: 0.6 },
            );
          }
        });

        return () => splits.forEach((s) => s.revert());
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="manifesto" className="relative" aria-labelledby="manifesto-label">
      <SceneTrigger preset="manifesto" start="top 70%" end="bottom 30%" />
      <div ref={pin} className="relative flex min-h-svh flex-col overflow-hidden gutter py-24">
        <SectionLabel index="02" className="relative z-10">
          <span id="manifesto-label">{t("label")}</span>
        </SectionLabel>

        <div ref={stage} className="relative flex flex-1 items-center justify-center py-16 motion-reduce:py-8">
          <div className="grid w-full place-items-center motion-reduce:gap-4 [&>*]:col-start-1 [&>*]:row-start-1 motion-reduce:[&>*]:col-auto motion-reduce:[&>*]:row-auto">
            {lines.map((line, i) => {
              const isLast = i === lines.length - 1;
              return (
                <p
                  key={line}
                  className={`js-line text-center display-wide will-change-transform ${
                    isLast ? "text-[clamp(3.6rem,15vw,15rem)] text-fg" : "text-[clamp(2rem,7.4vw,7.5rem)] text-fg"
                  }`}
                >
                  {isLast ? (
                    <>
                      {line.slice(0, -1)}
                      <span className="text-idea">{line.slice(-1)}</span>
                    </>
                  ) : (
                    line
                  )}
                </p>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex items-end justify-between gap-8">
          <p className="js-coda max-w-[42ch] text-base leading-relaxed text-muted sm:text-lg">{t("coda")}</p>
          <div aria-hidden="true" className="hidden gap-1.5 sm:flex">
            {lines.map((line) => (
              <span key={line} className="js-tick block h-px w-8 origin-left scale-x-50 bg-line-strong" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
