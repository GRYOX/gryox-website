import { Vector3 } from "three";
import type { Theme } from "@/lib/theme/theme";

/** Shader palettes as raw sRGB vectors (custom shaders skip colour management on purpose). */
const hex = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

export const PALETTES: Record<Theme, { green: Vector3; purple: Vector3; white: Vector3; additive: boolean }> = {
  // Dark: slightly lifted brand hues so additive glow stays controlled, never neon-blown.
  dark: { green: hex("#19e07e"), purple: hex("#8c45ff"), white: hex("#e9e9e4"), additive: true },
  // Light: ink on paper — darker hues, normal blending.
  light: { green: hex("#00a055"), purple: hex("#6a1bd9"), white: hex("#1a1a1d"), additive: false },
};
