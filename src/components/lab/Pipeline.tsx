"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/animation/gsap";
import { prefersReducedMotion } from "@/lib/device/media";

/** A simulated automation run — clearly a demo: a signal travels step by step, each logs. */
export default function Pipeline({ steps, action }: { steps: string[]; action: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => () => void tl.current?.kill(), []);

  const xs = steps.map((_, i) => 16 + i * (128 / (steps.length - 1)));

  const run = () => {
    if (running || !svg.current) return;
    setRunning(true);
    setLog([]);
    const pulse = svg.current.querySelector(".js-pulse");
    const nodes = svg.current.querySelectorAll(".js-node");
    const start = performance.now();
    const stamp = () => `${((performance.now() - start) / 1000).toFixed(2)}s`;
    const speed = prefersReducedMotion() ? 0.01 : 0.45;

    tl.current?.kill();
    const t = gsap.timeline({ onComplete: () => setRunning(false) });
    gsap.set(nodes, { attr: { fill: "var(--bg)" } });
    gsap.set(pulse, { attr: { cx: xs[0] }, opacity: 1 });
    steps.forEach((step, i) => {
      if (i > 0) t.to(pulse, { attr: { cx: xs[i] }, duration: speed, ease: "power2.inOut" });
      t.to(nodes[i], { attr: { fill: i === steps.length - 1 ? "var(--purple)" : "var(--green)" }, duration: 0.15 }).add(
        () => setLog((l) => [...l, `${stamp()}  ${step}  ✓`]),
      );
    });
    t.to(pulse, { opacity: 0, duration: 0.3 });
    tl.current = t;
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-bg-elev">
      <svg ref={svg} viewBox="0 0 160 56" className="w-full" aria-hidden="true">
        <line
          x1={xs[0]}
          y1="24"
          x2={xs[xs.length - 1]}
          y2="24"
          stroke="var(--line-strong)"
          strokeWidth="0.4"
          strokeDasharray="1.5 1.5"
        />
        {steps.map((step, i) => (
          <g key={step}>
            <rect
              className="js-node"
              x={xs[i] - 4}
              y="20"
              width="8"
              height="8"
              fill="var(--bg)"
              stroke="var(--line-strong)"
              strokeWidth="0.5"
              transform={`rotate(45 ${xs[i]} 24)`}
            />
            <text
              x={xs[i]}
              y="40"
              textAnchor="middle"
              fontSize="3.4"
              fill="var(--fg-muted)"
              fontFamily="var(--font-mono)"
            >
              {step.toUpperCase()}
            </text>
          </g>
        ))}
        <circle className="js-pulse" cx={xs[0]} cy="24" r="2" fill="var(--green)" opacity="0" />
      </svg>
      <div
        className="mx-3 min-h-0 flex-1 overflow-hidden border-t border-line pt-2 font-mono text-[0.68rem] leading-5 text-muted"
        aria-live="polite"
      >
        {log.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
      <button
        type="button"
        onClick={run}
        disabled={running}
        data-cursor="play"
        className="chamfer-frame m-3 self-start px-3 py-2 hud text-[0.62rem] text-fg [--c:6px] [--frame:var(--line-strong)] disabled:opacity-50 hover-fine:hover:[--frame:var(--green)]"
      >
        {action} →
      </button>
    </div>
  );
}
