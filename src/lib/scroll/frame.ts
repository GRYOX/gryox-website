/**
 * The frame store: a plain mutable object shared by the DOM animation layer and the
 * WebGL layer. GSAP writes to it, `useFrame` reads from it. Nothing here triggers
 * React renders, so 60fps values never cause re-rendering.
 */
export interface MatterState {
  /** Indices into MATTER_TARGETS. The shader blends from → to by `mix`. */
  from: number;
  to: number;
  mix: number;
  /** 0 = formed, 1 = scattered into a cloud. */
  dissolve: number;
  /** Offset in half-viewport units (-1…1). */
  x: number;
  y: number;
  scale: number;
  rotY: number;
  /** Global particle opacity. */
  opacity: number;
  /** 0…1 reveal of the extruded GRYOX mark. */
  logo: number;
  /** 0…1 visibility of connection lines. */
  lines: number;
  /** Extra turbulence (bursts, excitement). */
  energy: number;
  /** 0…1 — fades matter back so text stays readable. */
  dim: number;
}

export const frame = {
  scroll: {
    y: 0,
    velocity: 0,
    progress: 0,
    direction: 1 as 1 | -1,
  },
  pointer: {
    /** Normalised device coords, -1…1, y up. */
    nx: 0,
    ny: 0,
    active: false,
  },
  matter: {
    from: 0,
    to: 1,
    mix: 1,
    dissolve: 1,
    x: 0,
    y: 0,
    scale: 1,
    rotY: 0,
    opacity: 0,
    logo: 0,
    lines: 0,
    energy: 0,
    dim: 0,
  } satisfies MatterState as MatterState,
};

// Development-only inspection handle (used by the visual QA harness).
if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  (window as unknown as { __gryox: typeof frame }).__gryox = frame;
}
