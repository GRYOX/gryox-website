"use client";

import { useRef, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/animation/gsap";
import { prefersReducedMotion } from "@/lib/device/media";

type Tag = "h1" | "h2" | "h3" | "p" | "span" | "div";

interface Props {
  as?: Tag;
  children: ReactNode;
  className?: string;
  id?: string;
  /** Split granularity: lines rise through masks; chars add a finer stagger. */
  by?: "lines" | "words" | "chars";
  delay?: number;
  start?: string;
}

/**
 * Masked text reveal on scroll. SplitText keeps an aria-label on the parent, so
 * assistive tech reads the sentence, not the fragments. Re-splits on resize.
 */
export function RevealText({ as = "div", children, className, id, by = "lines", delay = 0, start = "top 85%" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        gsap.from(el, { opacity: 0, duration: 0.6, scrollTrigger: { trigger: el, start, once: true } });
        return;
      }
      const type = by === "chars" ? "lines,words,chars" : by === "words" ? "lines,words" : "lines";
      const split = SplitText.create(el, {
        type,
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        aria: "auto",
        onSplit(self) {
          const targets = by === "chars" ? self.chars : by === "words" ? self.words : self.lines;
          return gsap.from(targets, {
            yPercent: 110,
            duration: by === "chars" ? 0.9 : 1.15,
            stagger: by === "chars" ? 0.018 : by === "words" ? 0.04 : 0.09,
            ease: "expo.out",
            delay,
            scrollTrigger: { trigger: el, start, once: true },
          });
        },
      });
      return () => split.revert();
    },
    { scope: ref },
  );

  // All supported tags share HTMLElement behaviour; typed as div for the ref.
  const Tag = as as "div";
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={className} id={id}>
      {children}
    </Tag>
  );
}
