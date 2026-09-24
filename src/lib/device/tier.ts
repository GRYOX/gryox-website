/**
 * Device tiers drive every cost knob of the WebGL layer.
 * Detection is capability-based (pointer, memory, cores, motion preference), not width-based.
 */
export type Tier = "high" | "mid" | "low" | "minimal";

export interface TierConfig {
  /** Particle rows in the target texture; particle count = rows × TEXTURE_WIDTH. */
  rows: number;
  dpr: [number, number];
  /** Extruded, physically-shaded GRYOX mark. */
  logoMesh: boolean;
  /** Background depth dust. */
  dust: number;
  /** Connection lines between matter nodes. */
  lines: boolean;
  /** Pointer / velocity reactivity strength. */
  reactivity: number;
}

export const TEXTURE_WIDTH = 256;

export const TIERS: Record<Tier, TierConfig> = {
  high: { rows: 200, dpr: [1, 1.75], logoMesh: true, dust: 1400, lines: true, reactivity: 1 },
  mid: { rows: 110, dpr: [1, 1.5], logoMesh: true, dust: 900, lines: true, reactivity: 1 },
  low: { rows: 44, dpr: [1, 1.5], logoMesh: true, dust: 420, lines: false, reactivity: 0.8 },
  minimal: { rows: 24, dpr: [1, 1], logoMesh: true, dust: 200, lines: false, reactivity: 0 },
};

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

export function detectTier(): Tier {
  if (typeof window === "undefined") return "mid";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "minimal";

  const nav = navigator as NavigatorWithMemory;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  const small = Math.min(window.innerWidth, window.innerHeight) < 600;

  if (coarse || small) return "low";
  if (cores <= 4 || memory <= 4) return "mid";
  return "high";
}

export function supportsWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!canvas.getContext("webgl2");
  } catch {
    return false;
  }
}
