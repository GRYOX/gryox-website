/**
 * Brand asset pipeline.
 *
 * The official GRYOX marks currently exist only as raster JPEGs (public/brand/logo-*.jpeg).
 * This script derives web-ready assets from them WITHOUT redrawing the brand:
 *
 *  1. Transparent PNGs — the flat-colour logos are un-premultiplied against their solid
 *     background (black or white) so they can sit on any surface.
 *  2. Traced contours — an automatic marching-squares trace of the symbol, used only as the
 *     extrusion outline for the 3D mark. It is an approximation of the raster, not an
 *     official vector. Replace with the real SVG when available (see src/lib/three/mark-shape.ts).
 *
 * Run: node scripts/prepare-brand.mjs
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SRC = "public/brand";
const OUT = "public/brand/generated";

// Bounding boxes measured on the 1254×1254 sources (logo-2/3/4 share geometry).
const MARK = { left: 196, top: 251, width: 866, height: 497 };
const WORDMARK = { left: 142, top: 790, width: 970, height: 150 };
const LOCKUP = { left: 142, top: 251, width: 970, height: 756 };

async function raw(file) {
  const { data, info } = await sharp(path.join(SRC, file)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** Un-premultiply a flat logo against a solid black or white background. */
function toAlpha({ data, width, height }, background) {
  const out = Buffer.alloc(width * height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    let a;
    let cr;
    let cg;
    let cb;
    if (background === "black") {
      a = Math.max(r, g, b) / 255;
      cr = a > 0 ? r / a : 0;
      cg = a > 0 ? g / a : 0;
      cb = a > 0 ? b / a : 0;
    } else {
      a = (255 - Math.min(r, g, b)) / 255;
      cr = a > 0 ? (r - 255 * (1 - a)) / a : 0;
      cg = a > 0 ? (g - 255 * (1 - a)) / a : 0;
      cb = a > 0 ? (b - 255 * (1 - a)) / a : 0;
    }
    // Clean compression noise near the background.
    if (a < 0.06) a = 0;
    out[j] = Math.max(0, Math.min(255, Math.round(cr)));
    out[j + 1] = Math.max(0, Math.min(255, Math.round(cg)));
    out[j + 2] = Math.max(0, Math.min(255, Math.round(cb)));
    out[j + 3] = Math.round(a * 255);
  }
  return sharp(out, { raw: { width, height, channels: 4 } });
}

async function exportCrop(img, region, name, width) {
  const buf = await img.png().toBuffer();
  await sharp(buf).extract(region).resize({ width }).png({ compressionLevel: 9 }).toFile(path.join(OUT, name));
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const colorDark = await raw("logo-4.jpeg"); // colour mark, white wordmark, black bg
  const colorLight = await raw("logo-3.jpeg"); // colour mark, black wordmark, white bg
  const mono = await raw("logo-2.jpeg"); // white on black — cleanest silhouette

  const dark = toAlpha(colorDark, "black");
  const light = toAlpha(colorLight, "white");

  await exportCrop(dark, MARK, "mark.png", 640);
  await exportCrop(dark, WORDMARK, "wordmark-on-dark.png", 640);
  await exportCrop(light, WORDMARK, "wordmark-on-light.png", 640);
  await exportCrop(dark, LOCKUP, "lockup-on-dark.png", 960);
  await exportCrop(light, LOCKUP, "lockup-on-light.png", 960);

  // App icons: official mark on black.
  const markBuf = await dark.png().toBuffer();
  const markOnly = await sharp(markBuf).extract(MARK).resize({ width: 420 }).png().toBuffer();
  for (const [size, file] of [
    [512, "src/app/icon.png"],
    [180, "src/app/apple-icon.png"],
  ]) {
    const inner = Math.round(size * 0.78);
    const resized = await sharp(markOnly).resize({ width: inner }).toBuffer();
    await sharp({
      create: { width: size, height: size, channels: 4, background: "#050506" },
    })
      .composite([{ input: resized, gravity: "center" }])
      .png()
      .toFile(file);
  }

  // ---- Mask of the symbol (from the mono logo) ----
  const W = MARK.width;
  const H = MARK.height;
  const mask = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const sx = x + MARK.left;
      const sy = y + MARK.top;
      const i = (sy * mono.width + sx) * 3;
      mask[y * W + x] = mono.data[i] > 128 ? 1 : 0;
    }
  }

  const scale = 2 / W; // width spans [-1, 1]

  // ---- Contour trace (marching squares on a 2× downsampled mask) ----
  const S = 2;
  const gw = Math.floor(W / S);
  const gh = Math.floor(H / S);
  const g = (x, y) => {
    if (x < 0 || y < 0 || x >= gw || y >= gh) return 0;
    let sum = 0;
    for (let dy = 0; dy < S; dy++) for (let dx = 0; dx < S; dx++) sum += mask[(y * S + dy) * W + x * S + dx];
    return sum >= (S * S) / 2 ? 1 : 0;
  };
  const segs = new Map();
  const add = (a, b) => {
    // directed edge a -> b (keeps orientation consistent)
    segs.set(a, b);
  };
  const key = (x, y) => `${x},${y}`;
  for (let y = -1; y < gh; y++) {
    for (let x = -1; x < gw; x++) {
      const tl = g(x, y);
      const tr = g(x + 1, y);
      const br = g(x + 1, y + 1);
      const bl = g(x, y + 1);
      const c = (tl << 3) | (tr << 2) | (br << 1) | bl;
      const T = key(x + 0.5, y);
      const R = key(x + 1, y + 0.5);
      const B = key(x + 0.5, y + 1);
      const L = key(x, y + 0.5);
      // Filled region kept on the left of each directed edge.
      switch (c) {
        case 1:
          add(L, B);
          break;
        case 2:
          add(B, R);
          break;
        case 3:
          add(L, R);
          break;
        case 4:
          add(R, T);
          break;
        case 5:
          add(L, T);
          add(R, B);
          break;
        case 6:
          add(B, T);
          break;
        case 7:
          add(L, T);
          break;
        case 8:
          add(T, L);
          break;
        case 9:
          add(T, B);
          break;
        case 10:
          add(T, R);
          add(B, L);
          break;
        case 11:
          add(T, R);
          break;
        case 12:
          add(R, L);
          break;
        case 13:
          add(R, B);
          break;
        case 14:
          add(B, L);
          break;
        default:
          break;
      }
    }
  }
  const loops = [];
  const seen = new Set();
  for (const start of segs.keys()) {
    if (seen.has(start)) continue;
    const loop = [];
    let cur = start;
    while (cur && !seen.has(cur)) {
      seen.add(cur);
      const [x, y] = cur.split(",").map(Number);
      loop.push([x, y]);
      cur = segs.get(cur);
    }
    if (loop.length > 12) loops.push(loop);
  }

  const simplify = (pts, eps) => {
    if (pts.length < 3) return pts;
    const dist = (p, a, b) => {
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const l = Math.hypot(dx, dy) || 1;
      return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / l;
    };
    let maxD = 0;
    let idx = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      const d = dist(pts[i], pts[0], pts[pts.length - 1]);
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (maxD > eps) {
      const a = simplify(pts.slice(0, idx + 1), eps);
      const b = simplify(pts.slice(idx), eps);
      return a.slice(0, -1).concat(b);
    }
    return [pts[0], pts[pts.length - 1]];
  };
  const closedSimplify = (loop) => {
    // split the closed loop at its farthest point to keep corners stable
    const half = Math.floor(loop.length / 2);
    const a = simplify(loop.slice(0, half + 1), 1.2);
    const b = simplify(loop.slice(half).concat([loop[0]]), 1.2);
    return a.slice(0, -1).concat(b.slice(0, -1));
  };
  const area = (p) => {
    let s = 0;
    for (let i = 0; i < p.length; i++) {
      const a = p[i];
      const b = p[(i + 1) % p.length];
      s += a[0] * b[1] - b[0] * a[1];
    }
    return s / 2;
  };
  const inPoly = (pt, poly) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i];
      const [xj, yj] = poly[j];
      if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };

  const norm = (p) => [+((p[0] * S - W / 2) * scale).toFixed(4), +(-(p[1] * S - H / 2) * scale).toFixed(4)];
  const polys = loops.map(closedSimplify).filter((p) => Math.abs(area(p)) > 20);
  polys.sort((a, b) => Math.abs(area(b)) - Math.abs(area(a)));
  const shapes = [];
  polys.forEach((poly, i) => {
    const parents = polys.filter((other, j) => j !== i && inPoly(poly[0], other));
    if (parents.length % 2 === 0) {
      shapes.push({ outer: poly, holes: [] });
    } else {
      const parent = parents.sort((a, b) => Math.abs(area(a)) - Math.abs(area(b)))[0];
      const owner = shapes.find((s) => s.outer === parent);
      owner?.holes.push(poly);
    }
  });
  const json = {
    note: "Auto-traced from public/brand/logo-2.jpeg (raster). Approximation for 3D only — not an official vector.",
    aspect: +(H / W).toFixed(5),
    shapes: shapes.map((s) => ({ outer: s.outer.map(norm), holes: s.holes.map((h) => h.map(norm)) })),
  };
  await writeFile(path.join(OUT, "mark-shape.json"), JSON.stringify(json));

  console.log(
    `shapes: ${json.shapes.length}, holes: ${json.shapes.reduce((n, s) => n + s.holes.length, 0)}, vertices: ${json.shapes.reduce((n, s) => n + s.outer.length + s.holes.reduce((m, h) => m + h.length, 0), 0)}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
