"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, BufferGeometry, LineBasicMaterial, NormalBlending } from "three";
import { frame } from "@/lib/scroll/frame";
import { getTheme, subscribeTheme } from "@/lib/theme/theme";
import { MATTER_TARGETS, type MatterTarget } from "@/types/content";

const COLORS: Record<string, { dark: string; light: string }> = {
  mark: { dark: "#3cf09a", light: "#008a49" },
  network: { dark: "#a57bff", light: "#5b16c4" },
  systems: { dark: "#e9e9e4", light: "#1a1a1d" },
};

/**
 * Blueprint lines drawn between matter nodes. Each set fades with how much the
 * matter currently "is" its target shape, times the global `lines` channel.
 */
export function ConnectionLines({ lines }: { lines: Partial<Record<MatterTarget, Float32Array>> }) {
  const sets = useMemo(
    () =>
      (Object.entries(lines) as [MatterTarget, Float32Array][])
        .filter(([, arr]) => arr.length > 0)
        .map(([target, arr]) => {
          const geometry = new BufferGeometry();
          geometry.setAttribute("position", new BufferAttribute(arr, 3));
          const theme = getTheme();
          const material = new LineBasicMaterial({
            color: COLORS[target]?.[theme] ?? "#ffffff",
            transparent: true,
            opacity: 0,
            depthWrite: false,
            blending: theme === "dark" ? AdditiveBlending : NormalBlending,
          });
          return { target, index: MATTER_TARGETS.indexOf(target), geometry, material };
        }),
    [lines],
  );

  useEffect(() => {
    const unsubscribe = subscribeTheme((theme) => {
      for (const s of sets) {
        s.material.color.set(COLORS[s.target]?.[theme] ?? "#ffffff");
        s.material.blending = theme === "dark" ? AdditiveBlending : NormalBlending;
        s.material.needsUpdate = true;
      }
    });
    return () => {
      unsubscribe();
      sets.forEach((s) => {
        s.geometry.dispose();
        s.material.dispose();
      });
    };
  }, [sets]);

  useFrame(() => {
    const m = frame.matter;
    for (const s of sets) {
      const weight = (m.to === s.index ? m.mix : 0) + (m.from === s.index ? 1 - m.mix : 0);
      // Lines only read once the shape has settled, and fade as matter dissolves.
      const settled = Math.pow(weight, 3) * (1 - m.dissolve);
      s.material.opacity = settled * m.lines * 0.35 * (1 - m.dim * 0.6);
    }
  });

  return (
    <>
      {sets.map((s) => (
        <lineSegments key={s.target} geometry={s.geometry} material={s.material} frustumCulled={false} />
      ))}
    </>
  );
}
