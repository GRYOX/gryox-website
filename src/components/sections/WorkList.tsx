"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { gsap, useGSAP } from "@/lib/animation/gsap";
import { useFinePointer } from "@/lib/device/media";
import { useVelocitySkew } from "@/hooks/useVelocitySkew";
import type { Project } from "@/types/content";
import { TransitionLink } from "@/components/layout/TransitionLink";
import { MatterPreview } from "@/components/ui/MatterPreview";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";

export interface WorkItem {
  slug: string;
  index: string;
  title: string;
  category: string;
  year: string;
  placeholder: boolean;
  preview: Project["preview"];
  live: boolean;
}

/**
 * Rows with a floating preview that trails the cursor on desktop.
 * Touch devices get the preview inline — no hover dependency.
 */
export function WorkList({
  items,
  labels,
}: {
  items: WorkItem[];
  labels: { view: string; placeholder: string; live: string };
}) {
  const fine = useFinePointer();
  const list = useRef<HTMLUListElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useVelocitySkew(list, 2, 0.05);

  // Entrance runs once. (Re-running a `from` tween mid-flight would capture the hidden state.)
  useGSAP(
    () => {
      gsap.from(".js-work-row", {
        y: 40,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: list.current, start: "top 80%", once: true },
      });
    },
    { scope: list },
  );

  // The floating preview follows the pointer — desktop only.
  useEffect(() => {
    if (!fine || !float.current) return;
    const x = gsap.quickTo(float.current, "x", { duration: 0.6, ease: "power3.out" });
    const y = gsap.quickTo(float.current, "y", { duration: 0.6, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      x(e.clientX);
      y(e.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [fine]);

  const active = hovered !== null ? items[hovered] : null;

  return (
    <>
      <ul ref={list} className="relative mt-[10vh] border-t border-line" onPointerLeave={() => setHovered(null)}>
        {items.map((item, i) => (
          <li key={item.slug} className="js-work-row border-b border-line">
            <TransitionLink
              href={{ pathname: "/work/[slug]", params: { slug: item.slug } }}
              data-cursor="view"
              onPointerEnter={() => setHovered(i)}
              onFocus={() => setHovered(i)}
              className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-5 gap-y-3 py-7 sm:gap-x-8 sm:py-9 lg:grid-cols-12"
            >
              <span className="hud text-faint transition-colors duration-500 group-hover:text-green-ink lg:col-span-1">
                {item.index}
              </span>
              <span className="display-tight text-[clamp(1.9rem,5.2vw,4.6rem)] text-fg transition-transform duration-700 ease-out-expo group-hover:translate-x-3 lg:col-span-6">
                {item.title}
              </span>
              <span
                aria-hidden="true"
                className="text-xl text-faint transition-all duration-500 ease-out-expo group-hover:translate-x-1 group-hover:text-fg lg:order-last lg:col-span-1 lg:text-right"
              >
                →
              </span>
              <span className="col-span-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted lg:col-span-4 lg:justify-end">
                <span>{item.category}</span>
                <span className="hud text-faint">{item.year}</span>
                {item.live && <span className="hud text-green-ink">● {labels.live}</span>}
                {item.placeholder && <PlaceholderBadge label={labels.placeholder} />}
              </span>
              {!fine && (
                <span className="col-span-3 mt-2 block aspect-[16/9] w-full overflow-hidden chamfer lg:hidden">
                  <PreviewVisual preview={item.preview} />
                </span>
              )}
            </TransitionLink>
          </li>
        ))}
      </ul>

      {fine && (
        <div ref={float} aria-hidden="true" className="pointer-events-none fixed top-0 left-0 z-30 hidden lg:block">
          <AnimatePresence mode="popLayout">
            {active && (
              <m.div
                key={active.slug}
                className="absolute -top-28 left-8 w-[300px]"
                initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0.6 }}
                animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
                exit={{ clipPath: "inset(0 0 0 100%)", opacity: 0.6 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="relative block overflow-hidden chamfer">
                  <PreviewVisual preview={active.preview} />
                  <span className="absolute bottom-2 left-3 hud text-[0.6rem] text-muted">
                    {active.index} — {labels.view}
                  </span>
                </span>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}

function PreviewVisual({ preview }: { preview: Project["preview"] }) {
  if (preview.kind === "image") {
    return (
      <span className="relative block aspect-[16/10] w-full">
        <Image src={preview.src} alt="" fill sizes="(min-width: 1024px) 300px, 100vw" className="object-cover" />
      </span>
    );
  }
  return <MatterPreview target={preview.target} className="aspect-[16/10] w-full" />;
}
