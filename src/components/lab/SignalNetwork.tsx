"use client";

import { useId, useMemo, useState } from "react";
import { m } from "motion/react";

interface Node {
  ch: string;
  x: number;
  y: number;
}

/** Deterministic placement: each character's code and position decide where it lives. */
function layout(text: string): { nodes: Node[]; edges: [number, number][] } {
  const chars = [...text.slice(0, 28)];
  const nodes = chars.map((ch, i) => {
    const code = ch.toLowerCase().charCodeAt(0);
    const angle = i * 2.399963 + (code % 7) * 0.12; // golden angle spiral
    const radius = 10 + Math.sqrt(i + 1) * 12;
    return { ch, x: 80 + Math.cos(angle) * radius * 1.35, y: 50 + Math.sin(angle) * radius * 0.78 };
  });
  const edges: [number, number][] = [];
  nodes.forEach((n, i) => {
    if (i > 0) edges.push([i - 1, i]);
    // Same letter elsewhere → a long-range link (a crude "attention").
    const j = nodes.findIndex((m, k) => k < i - 1 && m.ch.toLowerCase() === n.ch.toLowerCase() && n.ch.trim());
    if (j >= 0) edges.push([j, i]);
  });
  return { nodes, edges };
}

export default function SignalNetwork({ label, initial }: { label: string; initial: string }) {
  const [text, setText] = useState(initial);
  const id = useId();
  const { nodes, edges } = useMemo(() => layout(text), [text]);

  return (
    <div className="relative flex h-full w-full flex-col bg-bg-elev">
      <svg viewBox="0 0 160 100" className="min-h-0 flex-1" aria-hidden="true">
        {edges.map(([a, b]) => (
          <m.line
            key={`${a}-${b}-${nodes[a].ch}${nodes[b].ch}`}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke={b - a > 1 ? "var(--purple)" : "var(--line-strong)"}
            strokeWidth={b - a > 1 ? 0.5 : 0.35}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6 }}
          />
        ))}
        {nodes.map((n, i) => (
          <m.g
            key={`${i}-${n.ch}`}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            style={{ transformOrigin: `${n.x}px ${n.y}px` }}
          >
            <circle
              cx={n.x}
              cy={n.y}
              r="3.4"
              fill="var(--bg)"
              stroke={i === nodes.length - 1 ? "var(--green)" : "var(--line-strong)"}
              strokeWidth="0.5"
            />
            <text
              x={n.x}
              y={n.y + 1.3}
              textAnchor="middle"
              fontSize="3.6"
              fill="var(--fg)"
              fontFamily="var(--font-mono)"
            >
              {n.ch === " " ? "·" : n.ch}
            </text>
          </m.g>
        ))}
      </svg>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        value={text}
        maxLength={28}
        onChange={(e) => setText(e.target.value)}
        placeholder={label}
        autoComplete="off"
        spellCheck={false}
        className="m-3 border-b border-line-strong bg-transparent py-2 font-mono text-sm text-fg outline-none placeholder:text-faint focus:border-green"
      />
    </div>
  );
}
