"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/device/media";
import { subscribeTheme } from "@/lib/theme/theme";
import { readPalette, useInView } from "./useInView";

/** Value noise, 2D — small and fast enough for a few hundred particles per frame. */
function makeNoise(seed = 1) {
  const perm = new Uint8Array(512);
  let s = seed;
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
  const fade = (t: number) => t * t * (3 - 2 * t);
  const h = (x: number, y: number) => perm[(perm[x & 255] + y) & 511] / 255;
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = fade(x - xi);
    const yf = fade(y - yi);
    const a = h(xi, yi) + (h(xi + 1, yi) - h(xi, yi)) * xf;
    const b = h(xi, yi + 1) + (h(xi + 1, yi + 1) - h(xi, yi + 1)) * xf;
    return a + (b - a) * yf;
  };
}

/** Particles following a noise field; the pointer bends the field around it. */
export default function FlowField() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const visible = useInView(canvas);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const reduced = prefersReducedMotion();
    const noise = makeNoise(7);
    let palette = readPalette();
    const unsub = subscribeTheme(() => {
      palette = readPalette();
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, el.width, el.height);
    });

    const dpr = Math.min(window.devicePixelRatio, 2);
    const resize = () => {
      el.width = el.clientWidth * dpr;
      el.height = el.clientHeight * dpr;
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, el.width, el.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const count = window.matchMedia("(pointer: coarse)").matches ? 260 : 520;
    const ps = Array.from({ length: count }, () => ({
      x: Math.random() * el.width,
      y: Math.random() * el.height,
      life: Math.random() * 200,
    }));
    const pointer = { x: -9999, y: -9999 };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) * dpr;
      pointer.y = (e.clientY - r.top) * dpr;
    };
    const onLeave = () => {
      pointer.x = pointer.y = -9999;
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    let t = 0;
    const step = () => {
      t += 0.0025;
      ctx.fillStyle = palette.bg;
      ctx.globalAlpha = 0.06;
      ctx.fillRect(0, 0, el.width, el.height);
      ctx.globalAlpha = 0.9;
      for (const p of ps) {
        const scale = 0.0022 / dpr;
        let a = noise(p.x * scale, p.y * scale + t) * Math.PI * 4;
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        const R = 110 * dpr;
        if (d2 < R * R) a += (1 - Math.sqrt(d2) / R) * Math.PI * 1.2;
        const nx = p.x + Math.cos(a) * 1.3 * dpr;
        const ny = p.y + Math.sin(a) * 1.3 * dpr;
        ctx.strokeStyle = p.x / el.width < 0.5 + Math.sin(t * 3) * 0.1 ? palette.green : palette.purple;
        ctx.lineWidth = dpr * 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        p.x = nx;
        p.y = ny;
        p.life -= 1;
        if (p.life < 0 || nx < 0 || ny < 0 || nx > el.width || ny > el.height) {
          p.x = Math.random() * el.width;
          p.y = Math.random() * el.height;
          p.life = 100 + Math.random() * 200;
        }
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    if (reduced) {
      for (let i = 0; i < 90; i++) step();
    } else if (visible) {
      const loop = () => {
        step();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      unsub();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [visible]);

  return <canvas ref={canvas} className="h-full w-full touch-pan-y" aria-hidden="true" />;
}
