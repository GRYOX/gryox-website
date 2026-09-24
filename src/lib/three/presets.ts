"use client";

import { gsap } from "@/lib/animation/gsap";
import { frame, type MatterState } from "@/lib/scroll/frame";
import { MATTER_TARGETS, type MatterTarget } from "@/types/content";

/**
 * Scene presets: the states Digital Matter moves through as the story progresses.
 * Sections request a preset by name (see <SceneTrigger />); values tween smoothly.
 * Positions are given as [mobile, desktop].
 */
type Responsive = number | [number, number];

export interface ScenePreset {
  target: MatterTarget;
  dissolve?: number;
  x?: Responsive;
  y?: Responsive;
  scale?: Responsive;
  rotY?: number;
  opacity?: Responsive;
  logo?: number;
  lines?: number;
  energy?: number;
  dim?: Responsive;
}

export const PRESETS = {
  hero: {
    target: "mark",
    rotY: 0,
    dissolve: 0,
    x: [0, 0.34],
    y: [0.3, 0.24],
    scale: [0.82, 0.74],
    logo: 1,
    lines: 0,
    opacity: 0.42,
    dim: 0,
  },
  manifesto: { target: "mark", rotY: 0, x: 0, y: 0, scale: [1.05, 1.15], logo: 0, lines: 0, opacity: 0.85, dim: 0.25 },
  capabilities: {
    target: "interface",
    rotY: 0,
    dissolve: 0,
    x: [0, 0.3],
    y: [0.3, 0],
    scale: [0.72, 0.92],
    logo: 0,
    lines: 0,
    opacity: [0.7, 0.9],
    dim: [0.35, 0],
  },
  work: { target: "chaos", rotY: 0, dissolve: 0.15, x: 0, y: 0, scale: 1, logo: 0, lines: 0, opacity: 0.45, dim: 0.55 },
  lab: {
    target: "network",
    rotY: 0,
    dissolve: 0,
    x: [0, 0.42],
    y: [0.15, 0.1],
    scale: [0.8, 0.9],
    logo: 0,
    lines: 0.6,
    opacity: 0.55,
    dim: 0.45,
  },
  founders: {
    target: "mark",
    rotY: 0,
    dissolve: 0.35,
    x: 0,
    y: 0,
    scale: [1.2, 1.6],
    logo: 0,
    lines: 0,
    opacity: 0.4,
    dim: 0.6,
  },
  contact: {
    target: "mark",
    rotY: 0,
    dissolve: 0,
    x: [0, 0.36],
    y: [0.3, 0.05],
    scale: [0.7, 0.8],
    logo: 0,
    lines: 0,
    opacity: [0.55, 0.75],
    dim: [0.55, 0.15],
  },
  footer: {
    target: "mark",
    rotY: 0,
    dissolve: 0,
    x: 0,
    y: [0.1, 0.12],
    scale: [0.7, 0.75],
    logo: 1,
    lines: 0,
    opacity: 0.55,
    dim: 0,
  },
  case: {
    target: "interface",
    rotY: 0,
    dissolve: 0.1,
    x: [0, 0.38],
    y: [0.2, 0.05],
    scale: [0.7, 0.8],
    logo: 0,
    lines: 0,
    opacity: 0.5,
    dim: 0.35,
  },
  notFound: {
    target: "chaos",
    rotY: 0,
    dissolve: 0.5,
    x: 0,
    y: 0,
    scale: 1,
    logo: 0,
    lines: 0,
    opacity: 0.6,
    dim: 0.2,
  },
} satisfies Record<string, ScenePreset>;

export type PresetName = keyof typeof PRESETS;

const resolve = (v: Responsive, desktop: boolean) => (Array.isArray(v) ? v[desktop ? 1 : 0] : v);

const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

/**
 * GSAP records tweens created while a gsap.context runs (useGSAP, including ScrollTrigger
 * callbacks created inside it) and reverts them on unmount. Matter state must persist across
 * sections and routes, so these tweens are created on a microtask — outside any context.
 */
const outsideContext = (fn: () => void) => queueMicrotask(fn);

/** Morph the matter towards a target shape. Handles interrupting an in-flight morph. */
export function morphTo(target: MatterTarget, duration = 1.8) {
  outsideContext(() => morphNow(target, duration));
}

function morphNow(target: MatterTarget, duration: number) {
  const m = frame.matter;
  const index = MATTER_TARGETS.indexOf(target);
  const settled = m.mix >= 0.5 ? m.to : m.from;
  if (m.to === index) {
    if (m.mix < 1) {
      gsap.killTweensOf(m, "mix");
      gsap.to(m, { mix: 1, duration: Math.max(0.4, duration * (1 - m.mix)), ease: "sine.inOut" });
    }
    return;
  }
  gsap.killTweensOf(m, "mix");
  m.from = settled;
  m.to = index;
  m.mix = 0;
  gsap.to(m, { mix: 1, duration, ease: "sine.inOut" });
}

// Locked from the start when the opening is about to play (class set pre-paint by lib/intro).
let locked = typeof document !== "undefined" && document.documentElement.classList.contains("is-opening");
let pending: PresetName | null = null;
let current: PresetName | null = null;
let presetTween: gsap.core.Tween | null = null;

/** While locked (the opening sequence), preset requests are remembered, not applied. */
export function lockPresets(value: boolean) {
  locked = value;
  if (!value && pending) {
    const next = pending;
    pending = null;
    applyPreset(next, true);
  }
}

export function applyPreset(name: PresetName, force = false) {
  if (locked) {
    pending = name;
    return;
  }
  if (current === name && !force) return;
  current = name;

  const p: ScenePreset = PRESETS[name];
  const desktop = isDesktop();
  const vars: Partial<MatterState> = {};
  if (p.dissolve !== undefined) vars.dissolve = p.dissolve;
  if (p.x !== undefined) vars.x = resolve(p.x, desktop);
  if (p.y !== undefined) vars.y = resolve(p.y, desktop);
  if (p.scale !== undefined) vars.scale = resolve(p.scale, desktop);
  if (p.rotY !== undefined) vars.rotY = p.rotY;
  if (p.opacity !== undefined) vars.opacity = resolve(p.opacity, desktop);
  if (p.logo !== undefined) vars.logo = p.logo;
  if (p.lines !== undefined) vars.lines = p.lines;
  if (p.energy !== undefined) vars.energy = p.energy;
  if (p.dim !== undefined) vars.dim = resolve(p.dim, desktop);

  // Kill only the previous preset tween — never `overwrite: "auto"`, which would also kill
  // channels that a scrubbed section timeline owns.
  outsideContext(() => {
    presetTween?.kill();
    presetTween = gsap.to(frame.matter, { ...vars, duration: 1.6, ease: "power3.inOut" });
    morphNow(p.target, 1.8);
  });
}

export const currentPreset = () => current;

/** Short excitement pulse, e.g. on form success. */
export function pulseEnergy(amount = 1) {
  outsideContext(() => {
    gsap.killTweensOf(frame.matter, "energy");
    gsap.fromTo(frame.matter, { energy: amount }, { energy: 0, duration: 2.4, ease: "expo.out" });
  });
}
