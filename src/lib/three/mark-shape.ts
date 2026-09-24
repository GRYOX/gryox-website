import { Shape, Vector2 } from "three";
import markData from "../../../public/brand/generated/mark-shape.json";

/**
 * GRYOX symbol geometry for the 3D layer.
 *
 * Source: an automatic contour trace of the official raster logo
 * (scripts/prepare-brand.mjs → public/brand/generated/mark-shape.json).
 * It is an approximation used for extrusion and particle sampling — not an official vector.
 * When the official SVG exists, load it with three's SVGLoader and return the same
 * `{ shape, tone }[]` structure here; nothing else needs to change.
 *
 * Coordinates: x spans [-1, 1], y is up, origin at the symbol's centre.
 */
type Pt = [number, number];
interface TracedShape {
  outer: Pt[];
  holes: Pt[][];
}

export interface MarkPart {
  shape: Shape;
  /** 0 = green (G and inner diagonal), 1 = purple (R) — as in the official colour logo. */
  tone: 0 | 1;
  points: Pt[];
}

export const MARK_ASPECT: number = markData.aspect;

let cache: MarkPart[] | null = null;

export function getMarkParts(): MarkPart[] {
  if (cache) return cache;
  const shapes = markData.shapes as unknown as TracedShape[];
  const rightmost = shapes.reduce(
    (best, s, i) => {
      const maxX = Math.max(...s.outer.map((p) => p[0]));
      return maxX > best.x ? { x: maxX, i } : best;
    },
    { x: -Infinity, i: 0 },
  ).i;

  cache = shapes.map((s, i) => {
    const shape = new Shape(s.outer.map(([x, y]) => new Vector2(x, y)));
    for (const hole of s.holes) {
      shape.holes.push(new Shape(hole.map(([x, y]) => new Vector2(x, y))));
    }
    return { shape, tone: i === rightmost ? 1 : 0, points: s.outer } as MarkPart;
  });
  return cache;
}

/**
 * Rasterise the mark on a small offscreen canvas and return filled + edge pixel pools,
 * in mark coordinates, with tone per pixel.
 */
export function rasteriseMark(resolution = 420) {
  const parts = getMarkParts();
  const w = resolution;
  const h = Math.round(resolution * MARK_ASPECT);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { fill: new Float32Array(0), edge: new Float32Array(0), pixel: 2 / w };

  const toPx = ([x, y]: Pt): Pt => [((x + 1) / 2) * w, ((MARK_ASPECT - y) / (2 * MARK_ASPECT)) * h];
  for (const part of parts) {
    ctx.fillStyle = part.tone === 1 ? "#0000ff" : "#ff0000";
    ctx.beginPath();
    part.points.forEach((p, i) => {
      const [px, py] = toPx(p);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
  }

  const data = ctx.getImageData(0, 0, w, h).data;
  const filled = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && data[(y * w + x) * 4 + 3] > 127;
  const fill: number[] = [];
  const edge: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!filled(x, y)) continue;
      const i = (y * w + x) * 4;
      const tone = data[i + 2] > data[i] ? 1 : 0;
      const mx = (x / w) * 2 - 1;
      const my = MARK_ASPECT - (y / h) * 2 * MARK_ASPECT;
      fill.push(mx, my, tone);
      if (!filled(x - 1, y) || !filled(x + 1, y) || !filled(x, y - 1) || !filled(x, y + 1)) {
        edge.push(mx, my, tone);
      }
    }
  }
  return { fill: new Float32Array(fill), edge: new Float32Array(edge), pixel: 2 / w };
}
