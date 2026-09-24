import { MATTER_TARGETS, type MatterTarget } from "@/types/content";
import { TEXTURE_WIDTH } from "@/lib/device/tier";
import { rasteriseMark } from "./mark-shape";

/**
 * Morph targets for Digital Matter.
 * Each target is `count` points of (x, y, z, tone); tone 0 = green (idea), 0.5 = white, 1 = purple (technology).
 * Everything is procedural — no downloaded geometry.
 */

type Rand = () => number;
type V3 = [number, number, number];
type Sample = [number, number, number, number];
type Sampler = (r: Rand) => Sample;
interface Primitive {
  w: number;
  s: Sampler;
}

export function mulberry32(seed: number): Rand {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Primitive samplers
// ---------------------------------------------------------------------------
const J = 0.0035;
const jitter = (r: Rand, a = J) => (r() - 0.5) * 2 * a;

const seg =
  (a: V3, b: V3, tone: number, j = J): Sampler =>
  (r) => {
    const t = r();
    return [
      a[0] + (b[0] - a[0]) * t + jitter(r, j),
      a[1] + (b[1] - a[1]) * t + jitter(r, j),
      a[2] + (b[2] - a[2]) * t + jitter(r, j),
      tone,
    ];
  };

const rectEdge =
  (cx: number, cy: number, w: number, h: number, z: number, tone: number): Sampler =>
  (r) => {
    let t = r() * 2 * (w + h);
    let x: number;
    let y: number;
    if (t < w) {
      x = cx - w / 2 + t;
      y = cy + h / 2;
    } else if ((t -= w) < h) {
      x = cx + w / 2;
      y = cy + h / 2 - t;
    } else if ((t -= h) < w) {
      x = cx + w / 2 - t;
      y = cy - h / 2;
    } else {
      t -= w;
      x = cx - w / 2;
      y = cy - h / 2 + t;
    }
    return [x + jitter(r), y + jitter(r), z + jitter(r), tone];
  };

const rectArea =
  (cx: number, cy: number, w: number, h: number, z: number, tone: number): Sampler =>
  (r) => [cx + (r() - 0.5) * w, cy + (r() - 0.5) * h, z + jitter(r), tone];

const roundRectEdge = (cx: number, cy: number, w: number, h: number, rad: number, z: number, tone: number): Sampler => {
  const straightW = w - 2 * rad;
  const straightH = h - 2 * rad;
  const arc = (Math.PI / 2) * rad;
  const total = 2 * straightW + 2 * straightH + 4 * arc;
  // Clockwise from the top edge; each corner arc follows its side, sweeping -90°.
  const corners: [number, number, number][] = [
    [cx + w / 2 - rad, cy + h / 2 - rad, Math.PI / 2],
    [cx + w / 2 - rad, cy - h / 2 + rad, 0],
    [cx - w / 2 + rad, cy - h / 2 + rad, -Math.PI / 2],
    [cx - w / 2 + rad, cy + h / 2 - rad, Math.PI],
  ];
  return (r) => {
    let t = r() * total;
    const sides: [V3, V3][] = [
      [
        [cx - w / 2 + rad, cy + h / 2, z],
        [cx + w / 2 - rad, cy + h / 2, z],
      ],
      [
        [cx + w / 2, cy + h / 2 - rad, z],
        [cx + w / 2, cy - h / 2 + rad, z],
      ],
      [
        [cx + w / 2 - rad, cy - h / 2, z],
        [cx - w / 2 + rad, cy - h / 2, z],
      ],
      [
        [cx - w / 2, cy - h / 2 + rad, z],
        [cx - w / 2, cy + h / 2 - rad, z],
      ],
    ];
    for (let i = 0; i < 4; i++) {
      const len = i % 2 === 0 ? straightW : straightH;
      if (t < len) {
        const [a, b] = sides[i];
        const k = t / len;
        return [a[0] + (b[0] - a[0]) * k + jitter(r), a[1] + (b[1] - a[1]) * k + jitter(r), z + jitter(r), tone];
      }
      t -= len;
      if (t < arc) {
        const [ax, ay, start] = corners[i];
        const angle = start - (Math.PI / 2) * (t / arc);
        return [ax + Math.cos(angle) * rad + jitter(r), ay + Math.sin(angle) * rad + jitter(r), z + jitter(r), tone];
      }
      t -= arc;
    }
    return [cx, cy, z, tone];
  };
};

const ring =
  (c: V3, radius: number, u: V3, v: V3, tone: number, spread = J): Sampler =>
  (r) => {
    const a = r() * Math.PI * 2;
    const ca = Math.cos(a) * radius;
    const sa = Math.sin(a) * radius;
    return [
      c[0] + u[0] * ca + v[0] * sa + jitter(r, spread),
      c[1] + u[1] * ca + v[1] * sa + jitter(r, spread),
      c[2] + u[2] * ca + v[2] * sa + jitter(r, spread),
      tone,
    ];
  };

const blob =
  (c: V3, sigma: number, tone: number): Sampler =>
  (r) => {
    // Box–Muller
    const g = () => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
    return [c[0] + g() * sigma, c[1] + g() * sigma, c[2] + g() * sigma, tone];
  };

function fromPrimitives(out: Float32Array, offset: number, count: number, prims: Primitive[], r: Rand) {
  const total = prims.reduce((s, p) => s + p.w, 0);
  const cumulative: number[] = [];
  let acc = 0;
  for (const p of prims) cumulative.push((acc += p.w / total));
  for (let i = 0; i < count; i++) {
    const x = r();
    let k = 0;
    while (k < cumulative.length - 1 && x > cumulative[k]) k++;
    const s = prims[k].s(r);
    out.set(s, offset + i * 4);
  }
}

const rotateY = (out: Float32Array, offset: number, count: number, ay: number, ax = 0) => {
  const cy = Math.cos(ay);
  const sy = Math.sin(ay);
  const cx = Math.cos(ax);
  const sx = Math.sin(ax);
  for (let i = 0; i < count; i++) {
    const o = offset + i * 4;
    const x = out[o];
    const y = out[o + 1];
    const z = out[o + 2];
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    out[o] = x1;
    out[o + 1] = y * cx - z1 * sx;
    out[o + 2] = y * sx + z1 * cx;
  }
};

// ---------------------------------------------------------------------------
// Targets
// ---------------------------------------------------------------------------
function chaos(out: Float32Array, o: number, n: number, r: Rand) {
  for (let i = 0; i < n; i++) {
    const u = r() * 2 - 1;
    const th = r() * Math.PI * 2;
    const rad = 1.6 + Math.pow(r(), 0.7) * 3.2;
    const s = Math.sqrt(1 - u * u);
    const tone = r() < 0.7 ? 0.5 : r() < 0.5 ? 0.1 : 0.9;
    out.set([Math.cos(th) * s * rad * 1.3, u * rad * 0.62, Math.sin(th) * s * rad * 0.8 - 0.6, tone], o + i * 4);
  }
}

function mark(out: Float32Array, o: number, n: number, r: Rand) {
  const { fill, edge, pixel } = rasteriseMark();
  if (!fill.length) return chaos(out, o, n, r);
  const fillCount = fill.length / 3;
  const edgeCount = edge.length / 3;
  for (let i = 0; i < n; i++) {
    const useEdge = r() < 0.3 && edgeCount > 0;
    const pool = useEdge ? edge : fill;
    const k = Math.floor(r() * (useEdge ? edgeCount : fillCount)) * 3;
    const x = pool[k] + (r() - 0.5) * pixel;
    const y = pool[k + 1] + (r() - 0.5) * pixel;
    // Area particles float just outside both faces of the extruded mark ("digital skin");
    // edge particles fill the depth so the silhouette reads in 3D.
    const z = useEdge ? (r() - 0.5) * 0.19 : (r() < 0.7 ? 1 : -1) * (0.1 + Math.pow(r(), 1.6) * 0.22);
    out.set([x, y, z, pool[k + 2]], o + i * 4);
  }
}

function ui(out: Float32Array, o: number, n: number, r: Rand) {
  const W = 2.1;
  const H = 1.36;
  const top = H / 2;
  const prims: Primitive[] = [
    { w: 14, s: rectEdge(0, 0, W, H, 0, 0.5) },
    { w: 3, s: seg([-W / 2, top - 0.12, 0], [W / 2, top - 0.12, 0], 0.5) },
    { w: 0.8, s: blob([-0.96, top - 0.06, 0], 0.012, 0) },
    { w: 0.8, s: blob([-0.9, top - 0.06, 0], 0.012, 0.5) },
    { w: 0.8, s: blob([-0.84, top - 0.06, 0], 0.012, 1) },
    { w: 3, s: seg([-0.55, top - 0.12, 0], [-0.55, -top, 0], 0.5) },
    { w: 8, s: rectArea(0.2, 0.4, 1.32, 0.15, 0.05, 1) },
    ...[0, 1, 2].map((i) => ({ w: 5, s: rectEdge(-0.3 + i * 0.44 + 0.02, 0.13, 0.38, 0.22, 0.03, i === 1 ? 0 : 0.5) })),
    ...Array.from({ length: 7 }, (_, i) => {
      const h = [0.18, 0.3, 0.22, 0.42, 0.34, 0.5, 0.4][i];
      return { w: 2 + h * 4, s: rectArea(-0.4 + i * 0.12, -0.6 + h / 2, 0.065, h, 0.06, 0) };
    }),
    ...Array.from({ length: 5 }, (_, i) => ({
      w: 1.6,
      s: seg([0.48, -0.14 - i * 0.1, 0.02], [0.98 - (i % 3) * 0.12, -0.14 - i * 0.1, 0.02], 0.5, 0.002),
    })),
    ...Array.from({ length: 6 }, (_, i) => ({
      w: 1.2,
      s: seg(
        [-0.96, top - 0.26 - i * 0.12, 0.01],
        [-0.7 - (i % 2) * 0.06, top - 0.26 - i * 0.12, 0.01],
        i === 1 ? 0 : 0.5,
        0.002,
      ),
    })),
  ];
  fromPrimitives(out, o, n, prims, r);
}

function panel(cx: number, cy: number, cz: number, w: number, h: number, tone: number, weight: number): Primitive[] {
  return [
    { w: weight * 0.45, s: rectEdge(cx, cy, w, h, cz, tone) },
    { w: weight * 0.1, s: seg([cx - w / 2, cy + h / 2 - 0.08, cz], [cx + w / 2, cy + h / 2 - 0.08, cz], tone) },
    { w: weight * 0.25, s: rectArea(cx - w * 0.18, cy + 0.02, w * 0.5, h * 0.4, cz + 0.02, tone === 0.5 ? 1 : tone) },
    ...[0, 1, 2].map((i) => ({
      w: weight * 0.066,
      s: seg([cx + w * 0.12, cy + 0.12 - i * 0.1, cz], [cx + w * 0.42, cy + 0.12 - i * 0.1, cz], 0.5, 0.002),
    })),
  ];
}

function environment(out: Float32Array, o: number, n: number, r: Rand) {
  const floorY = -0.95;
  const grid: Primitive[] = [];
  for (let z = -4; z <= 1.01; z += 0.5) grid.push({ w: 1, s: seg([-2.6, floorY, z], [2.6, floorY, z], 0.5, 0.002) });
  for (let x = -2.5; x <= 2.51; x += 0.5) grid.push({ w: 0.8, s: seg([x, floorY, -4], [x, floorY, 1], 0.5, 0.002) });
  const prims: Primitive[] = [
    ...grid,
    ...panel(-1.05, 0.28, -1.9, 1.05, 0.7, 1, 9),
    ...panel(0, 0.12, 0, 1.55, 0.98, 0.5, 13),
    ...panel(1.25, 0.26, -2.3, 0.95, 0.64, 0, 8),
    { w: 1.2, s: seg([-1.05, -0.07, -1.9], [-1.05, floorY, -1.9], 1) },
    { w: 1.2, s: seg([0, -0.37, 0], [0, floorY, 0], 0.5) },
    { w: 1.2, s: seg([1.25, -0.06, -2.3], [1.25, floorY, -2.3], 0) },
    { w: 2, s: rectArea(0, 0.4, 6, 2, -4.5, 0.5) },
  ];
  fromPrimitives(out, o, n, prims, r);
  // The environment reads as a space, but must stay inside the frame.
  for (let i = 0; i < n; i++) {
    const k = o + i * 4;
    out[k] *= 0.56;
    out[k + 1] *= 0.56;
    out[k + 2] = out[k + 2] * 0.56 + 0.4;
  }
  rotateY(out, o, n, -0.22, 0.36);
}

function device(out: Float32Array, o: number, n: number, r: Rand) {
  const W = 0.92;
  const H = 1.86;
  const prims: Primitive[] = [
    { w: 16, s: roundRectEdge(0, 0, W, H, 0.15, 0, 0.5) },
    { w: 7, s: roundRectEdge(0, 0, W, H, 0.15, -0.09, 0.5) },
    { w: 5, s: roundRectEdge(0, 0, W - 0.1, H - 0.1, 0.1, 0.004, 0.5) },
    { w: 1.5, s: seg([-0.1, H / 2 - 0.09, 0.01], [0.1, H / 2 - 0.09, 0.01], 0.5, 0.006) },
    { w: 1, s: seg([-0.14, -H / 2 + 0.07, 0.01], [0.14, -H / 2 + 0.07, 0.01], 0.5, 0.002) },
    { w: 5, s: rectArea(0, -H / 2 + 0.22, W - 0.24, 0.13, 0.02, 1) },
    ...Array.from({ length: 16 }, (_, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const tone = (col + row) % 3 === 0 ? 0 : (col + row) % 3 === 1 ? 1 : 0.5;
      return { w: 1.6, s: roundRectEdge(-0.3 + col * 0.2, 0.6 - row * 0.24, 0.13, 0.13, 0.035, 0.02, tone) };
    }),
    { w: 3, s: seg([-0.34, -0.42, 0.02], [0.34, -0.3, 0.02], 0, 0.006) },
    { w: 7, s: ring([0, 0, -0.05], 1.25, [1, 0, 0], [0, 0.82, 0.2], 0, 0.01) },
  ];
  fromPrimitives(out, o, n, prims, r);
  rotateY(out, o, n, -0.42, 0.08);
}

function networkGraph(r: Rand) {
  const nodes: V3[] = [];
  const N = 56;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = golden * i;
    const k = 0.92 + r() * 0.2;
    nodes.push([Math.cos(th) * rad * 1.3 * k, y * 0.92 * k, Math.sin(th) * rad * 0.9 * k]);
  }
  const edges: [number, number][] = [];
  const key = new Set<string>();
  nodes.forEach((a, i) => {
    const near = nodes
      .map((b, j) => ({ j, d: (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2 }))
      .filter((e) => e.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 3);
    for (const { j } of near) {
      const id = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!key.has(id)) {
        key.add(id);
        edges.push([i, j]);
      }
    }
  });
  return { nodes, edges };
}

function network(out: Float32Array, o: number, n: number, r: Rand, graph: ReturnType<typeof networkGraph>) {
  const prims: Primitive[] = [
    ...graph.nodes.map((c, i) => ({ w: 0.75, s: blob(c, 0.028, i % 5 === 0 ? 0 : 1) })),
    ...graph.edges.map(([a, b]) => ({ w: 0.5, s: seg(graph.nodes[a], graph.nodes[b], 0.72, 0.004) })),
  ];
  fromPrimitives(out, o, n, prims, r);
}

const SYSTEM_RINGS: { c: V3; r: number; u: V3; v: V3; tone: number }[] = [
  { c: [-1.15, 0.36, 0], r: 0.36, u: [1, 0, 0], v: [0, 1, 0], tone: 0 },
  { c: [0, -0.3, 0.3], r: 0.44, u: [1, 0, 0], v: [0, 0.82, 0.57], tone: 0.5 },
  { c: [1.15, 0.38, -0.2], r: 0.34, u: [0.9, 0, 0.43], v: [0, 1, 0], tone: 1 },
  { c: [0.08, 0.66, -0.6], r: 0.22, u: [1, 0, 0], v: [0, 0.7, -0.7], tone: 0 },
];
const SYSTEM_LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [0, 3],
  [3, 2],
  [1, 3],
];

function systems(out: Float32Array, o: number, n: number, r: Rand) {
  const prims: Primitive[] = [
    ...SYSTEM_RINGS.map((g) => ({ w: 9, s: ring(g.c, g.r, g.u, g.v, g.tone) })),
    ...SYSTEM_RINGS.map((g) => ({ w: 3, s: ring(g.c, g.r * 1.28, g.u, g.v, g.tone, 0.012) })),
    ...SYSTEM_RINGS.map((g) => ({ w: 1.5, s: blob(g.c, 0.035, g.tone) })),
    ...SYSTEM_LINKS.map(([a, b]) => ({ w: 6, s: seg(SYSTEM_RINGS[a].c, SYSTEM_RINGS[b].c, 0.5, 0.004) })),
    ...SYSTEM_LINKS.map(([a, b]) => {
      const A = SYSTEM_RINGS[a].c;
      const B = SYSTEM_RINGS[b].c;
      return { w: 2.6, s: rectEdge((A[0] + B[0]) / 2, (A[1] + B[1]) / 2, 0.12, 0.12, (A[2] + B[2]) / 2, 1) };
    }),
  ];
  fromPrimitives(out, o, n, prims, r);
}

// ---------------------------------------------------------------------------
// Connection lines
// ---------------------------------------------------------------------------
function markLines(r: Rand): Float32Array {
  const { edge } = rasteriseMark(260);
  const count = edge.length / 3;
  if (!count) return new Float32Array(0);
  const pts: V3[] = [];
  for (let i = 0; i < 260; i++) {
    const k = Math.floor(r() * count) * 3;
    pts.push([edge[k], edge[k + 1], (r() - 0.5) * 0.12]);
  }
  const out: number[] = [];
  pts.forEach((a, i) => {
    const near = pts
      .map((b, j) => ({ j, d: (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 }))
      .filter((e) => e.j !== i && e.d < 0.035)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2);
    for (const { j } of near) out.push(...a, ...pts[j]);
  });
  return new Float32Array(out);
}

const segmentsFrom = (pairs: [V3, V3][]) => new Float32Array(pairs.flatMap(([a, b]) => [...a, ...b]));

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------
export interface MatterData {
  count: number;
  rows: number;
  /** RGBA float texture data: TEXTURE_WIDTH × (rows × targets). */
  targets: Float32Array;
  /** Per-particle random attributes. */
  random: Float32Array;
  index: Float32Array;
  lines: Partial<Record<MatterTarget, Float32Array>>;
}

export function buildMatter(rows: number, withLines: boolean): MatterData {
  const count = rows * TEXTURE_WIDTH;
  const r = mulberry32(20260920);
  const targets = new Float32Array(count * 4 * MATTER_TARGETS.length);
  const graph = networkGraph(r);

  MATTER_TARGETS.forEach((name, t) => {
    const o = t * count * 4;
    switch (name) {
      case "chaos":
        return chaos(targets, o, count, r);
      case "mark":
        return mark(targets, o, count, r);
      case "interface":
        return ui(targets, o, count, r);
      case "environment":
        return environment(targets, o, count, r);
      case "device":
        return device(targets, o, count, r);
      case "network":
        return network(targets, o, count, r, graph);
      case "systems":
        return systems(targets, o, count, r);
    }
  });

  const random = new Float32Array(count * 4);
  const index = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    random.set([r(), r(), r(), r()], i * 4);
    index[i] = i;
  }

  const lines: MatterData["lines"] = {};
  if (withLines) {
    lines.mark = markLines(r);
    lines.network = segmentsFrom(graph.edges.map(([a, b]) => [graph.nodes[a], graph.nodes[b]]));
    lines.systems = segmentsFrom(SYSTEM_LINKS.map(([a, b]) => [SYSTEM_RINGS[a].c, SYSTEM_RINGS[b].c]));
  }

  return { count, rows, targets, random, index, lines };
}
