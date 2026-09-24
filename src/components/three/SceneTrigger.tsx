"use client";

import { useRef } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/animation/gsap";
import { applyPreset, type PresetName } from "@/lib/three/presets";

/**
 * Drop inside any `relative` section: while the section occupies the middle of the
 * viewport, Digital Matter moves to the named preset. Refreshes after pins
 * (refreshPriority -1) so positions account for pin spacing.
 */
export function SceneTrigger({
  preset,
  start = "top 55%",
  end = "bottom 45%",
}: {
  preset: PresetName;
  start?: string;
  end?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const apply = (self: ScrollTrigger) => {
      if (self.isActive) applyPreset(preset);
    };
    const st = ScrollTrigger.create({
      trigger: ref.current,
      start,
      end,
      refreshPriority: -1,
      onToggle: apply,
      // Toggle callbacks don't fire for a trigger that is already active when created
      // (e.g. the hero on load, or a section restored after navigation).
      onRefresh: apply,
    });
    apply(st);
  });

  return <span ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0" />;
}
