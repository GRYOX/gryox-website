"use client";

import { useMemo, useState } from "react";
import { m } from "motion/react";

type Kind = "text" | "chart" | "media" | "stat" | "toggle";
interface Cell {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: Kind;
  key: string;
}

function rng(seed: number) {
  let s = seed * 9301 + 49297;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Binary-space partition of a frame into interface regions — rules, not templates. */
function compose(seed: number): Cell[] {
  const r = rng(seed);
  const cells: Cell[] = [];
  const kinds: Kind[] = ["text", "chart", "media", "stat", "toggle"];
  const split = (x: number, y: number, w: number, h: number, depth: number, path: string) => {
    const canSplit = depth < 4 && (w > 26 || h > 20) && (depth < 2 || r() > 0.3);
    if (!canSplit) {
      cells.push({ x, y, w, h, kind: kinds[Math.floor(r() * kinds.length)], key: path });
      return;
    }
    const vertical = w / 160 > h / 100 ? r() > 0.25 : r() > 0.75;
    const k = 0.35 + r() * 0.3;
    if (vertical) {
      split(x, y, w * k, h, depth + 1, path + "a");
      split(x + w * k, y, w * (1 - k), h, depth + 1, path + "b");
    } else {
      split(x, y, w, h * k, depth + 1, path + "a");
      split(x, y + h * k, w, h * (1 - k), depth + 1, path + "b");
    }
  };
  split(4, 4, 152, 92, 0, "r");
  return cells;
}

const spring = { type: "spring", stiffness: 140, damping: 20 } as const;

export default function GenerativeInterface({ action }: { action: string }) {
  const [seed, setSeed] = useState(3);
  const cells = useMemo(() => compose(seed), [seed]);

  return (
    <button
      type="button"
      onClick={() => setSeed((s) => s + 1)}
      className="group relative block h-full w-full text-left"
      data-cursor="play"
    >
      <svg viewBox="0 0 160 100" className="h-full w-full" aria-hidden="true">
        <rect width="160" height="100" fill="var(--bg-elev)" />
        {cells.map((c, i) => {
          const pad = 1.6;
          const x = c.x + pad;
          const y = c.y + pad;
          const w = Math.max(2, c.w - pad * 2);
          const h = Math.max(2, c.h - pad * 2);
          const accent = i % 3 === 0 ? "var(--green)" : i % 3 === 1 ? "var(--purple)" : "var(--fg)";
          return (
            <m.g
              key={`${seed}-${c.key}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <m.rect
                initial={{ x: 80, y: 50, width: 0, height: 0 }}
                animate={{ x, y, width: w, height: h }}
                transition={spring}
                fill="none"
                stroke="var(--line-strong)"
                strokeWidth="0.4"
              />
              {c.kind === "text" &&
                [0, 1, 2].map((k) =>
                  y + 5 + k * 4 < y + h - 2 ? (
                    <rect
                      key={k}
                      x={x + 3}
                      y={y + 4 + k * 4}
                      width={Math.max(2, (w - 6) * (1 - k * 0.22))}
                      height="1.1"
                      fill="var(--fg)"
                      opacity={0.35}
                    />
                  ) : null,
                )}
              {c.kind === "chart" &&
                Array.from({ length: Math.max(2, Math.floor(w / 5)) }, (_, k) => {
                  const bh = (h - 6) * (0.3 + ((k * 37 + seed * 13) % 60) / 100);
                  return (
                    <rect
                      key={k}
                      x={x + 3 + k * 5}
                      y={y + h - 3 - bh}
                      width="2.6"
                      height={bh}
                      fill={accent}
                      opacity={0.75}
                    />
                  );
                })}
              {c.kind === "media" && (
                <>
                  <line x1={x} y1={y} x2={x + w} y2={y + h} stroke="var(--line-strong)" strokeWidth="0.3" />
                  <line x1={x + w} y1={y} x2={x} y2={y + h} stroke="var(--line-strong)" strokeWidth="0.3" />
                </>
              )}
              {c.kind === "stat" && (
                <>
                  <rect x={x + 3} y={y + 3} width={Math.min(18, w - 6)} height="1.2" fill="var(--fg)" opacity={0.4} />
                  <rect
                    x={x + 3}
                    y={y + 7}
                    width={Math.min(10, w - 6)}
                    height={Math.min(6, h - 10)}
                    fill={accent}
                    opacity={0.85}
                  />
                </>
              )}
              {c.kind === "toggle" && (
                <>
                  <rect
                    x={x + 3}
                    y={y + 3}
                    width="9"
                    height="4.5"
                    rx="2.25"
                    fill="none"
                    stroke={accent}
                    strokeWidth="0.5"
                  />
                  <circle cx={x + 9.7} cy={y + 5.25} r="1.5" fill={accent} />
                </>
              )}
            </m.g>
          );
        })}
      </svg>
      <span className="absolute right-3 bottom-3 hud text-[0.6rem] text-muted transition-colors group-hover:text-fg">
        {action} ↻
      </span>
    </button>
  );
}
