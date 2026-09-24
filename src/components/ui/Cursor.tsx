"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useTranslations } from "next-intl";
import { gsap } from "@/lib/animation/gsap";
import { useFinePointer, useReducedMotion } from "@/lib/device/media";

type Label = "view" | "open" | "play" | "select" | "send";
const LABELS = new Set<string>(["view", "open", "play", "select", "send"]);

/**
 * Desktop-only cursor: a precise dot and a lagging ring. The ring grows over
 * interactive elements and can carry a short contextual label (data-cursor="view").
 * Touch devices and reduced-motion visitors keep the native cursor.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  if (!fine || reduced) return null;
  return <CursorInner />;
}

function CursorInner() {
  const t = useTranslations("cursor");
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<Label | null>(null);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("has-cursor");
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.08, ease: "power3.out" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.08, ease: "power3.out" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3.out" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3.out" });

    const controller = new AbortController();
    const { signal } = controller;

    window.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse") return;
        dx(e.clientX);
        dy(e.clientY);
        rx(e.clientX);
        ry(e.clientY);
        setVisible(true);
      },
      { passive: true, signal },
    );

    document.addEventListener(
      "pointerover",
      (e) => {
        const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
          "[data-cursor], a, button, [role='button'], label, input, textarea",
        );
        if (!target || target.matches("input, textarea")) {
          setHovering(false);
          setLabel(null);
          return;
        }
        setHovering(true);
        const value = target.dataset.cursor;
        setLabel(value && LABELS.has(value) ? (value as Label) : null);
      },
      { signal },
    );
    document.addEventListener("pointerdown", () => setPressed(true), { signal });
    document.addEventListener("pointerup", () => setPressed(false), { signal });
    document.documentElement.addEventListener("pointerleave", () => setVisible(false), { signal });

    return () => {
      controller.abort();
      root.classList.remove("has-cursor");
    };
  }, []);

  const size = label ? 84 : hovering ? 44 : 26;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[95]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 300ms" }}
    >
      <div ref={ring} className="absolute top-0 left-0">
        <div
          className={`-translate-x-1/2 -translate-y-1/2 rounded-full border transition-[width,height,background-color,border-color,scale] duration-500 ease-out-expo ${
            label ? "border-transparent bg-fg" : hovering ? "border-green bg-green/10" : "border-line-strong"
          }`}
          style={{ width: size, height: size, scale: pressed ? 0.85 : 1 }}
        >
          <AnimatePresence>
            {label && (
              <m.span
                key={label}
                className="absolute inset-0 grid place-items-center hud text-[0.6rem] text-bg"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {t(label)}
              </m.span>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div ref={dot} className="absolute top-0 left-0">
        <div
          className={`size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg transition-opacity duration-300 ${label ? "opacity-0" : "opacity-100"}`}
        />
      </div>
    </div>
  );
}
