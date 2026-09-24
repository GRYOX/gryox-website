import type { MatterTarget } from "@/types/content";

/**
 * Static, code-drawn previews in the Digital Matter language (dots + hairlines).
 * Used where a real project image does not exist yet — never pretends to be a screenshot.
 */
const G = "var(--green)";
const P = "var(--purple)";
const F = "var(--fg)";

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function Dots({
  seed,
  count,
  color,
  box,
}: {
  seed: number;
  count: number;
  color: string;
  box: [number, number, number, number];
}) {
  const r = rand(seed);
  const [x, y, w, h] = box;
  return (
    <g fill={color}>
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} cx={x + r() * w} cy={y + r() * h} r={0.2 + r() * 0.35} opacity={0.2 + r() * 0.5} />
      ))}
    </g>
  );
}

const art: Record<MatterTarget, React.ReactNode> = {
  chaos: <Dots seed={3} count={260} color={F} box={[0, 0, 160, 100]} />,
  mark: (
    <g>
      <Dots seed={11} count={120} color={F} box={[0, 0, 160, 100]} />
      <path
        d="M52 30 L66 30 L60 36 L50 36 L44 42 L44 58 L50 64 L63 64 L63 57 L67 62 L62 70 L48 70 L38 60 L38 40 Z"
        fill="none"
        stroke={G}
        strokeWidth="0.8"
      />
      <path
        d="M69 30 L104 30 Q116 30 116 44 Q116 52 108 56 L120 70 L112 70 L94 47 L106 47 Q110 47 110 42 Q110 36 104 36 L76 36 Z"
        fill="none"
        stroke={P}
        strokeWidth="0.8"
      />
      <path d="M55 47 L85 47 L103 70 L94 70 L80 52 L60 52 Z" fill="none" stroke={G} strokeWidth="0.8" />
    </g>
  ),
  interface: (
    <g fill="none" strokeWidth="0.6">
      <rect x="22" y="16" width="116" height="70" stroke={F} opacity="0.6" />
      <line x1="22" y1="24" x2="138" y2="24" stroke={F} opacity="0.4" />
      <line x1="46" y1="24" x2="46" y2="86" stroke={F} opacity="0.3" />
      <rect x="54" y="30" width="76" height="9" fill={P} opacity="0.55" stroke="none" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect
          key={i}
          x={54 + i * 6}
          y={80 - [10, 16, 12, 22, 18, 26, 20][i]}
          width="3.5"
          height={[10, 16, 12, 22, 18, 26, 20][i]}
          fill={G}
          stroke="none"
          opacity="0.8"
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="102" y1={50 + i * 7} x2={128 - (i % 2) * 8} y2={50 + i * 7} stroke={F} opacity="0.35" />
      ))}
      <Dots seed={5} count={60} color={F} box={[0, 0, 160, 100]} />
    </g>
  ),
  environment: (
    <g fill="none" strokeWidth="0.5">
      {Array.from({ length: 9 }, (_, i) => (
        <line
          key={`h${i}`}
          x1="0"
          y1={70 + i * i * 0.45}
          x2="160"
          y2={70 + i * i * 0.45}
          stroke={F}
          opacity={0.12 + i * 0.03}
        />
      ))}
      {Array.from({ length: 13 }, (_, i) => (
        <line key={`v${i}`} x1={80 + (i - 6) * 4} y1="70" x2={80 + (i - 6) * 26} y2="100" stroke={F} opacity="0.18" />
      ))}
      <rect x="24" y="30" width="34" height="22" stroke={P} opacity="0.7" />
      <rect x="62" y="24" width="44" height="30" stroke={F} opacity="0.7" />
      <rect x="112" y="34" width="28" height="18" stroke={G} opacity="0.7" />
    </g>
  ),
  device: (
    <g fill="none" strokeWidth="0.6">
      <rect x="64" y="10" width="32" height="80" rx="6" stroke={F} opacity="0.7" />
      <rect x="67" y="13" width="26" height="74" rx="4" stroke={F} opacity="0.3" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect
          key={i}
          x={70 + (i % 3) * 7.5}
          y={22 + Math.floor(i / 3) * 8}
          width="5"
          height="5"
          rx="1.2"
          stroke={[G, P, F][i % 3]}
          opacity="0.8"
        />
      ))}
      <rect x="70" y="74" width="20" height="5" fill={P} stroke="none" opacity="0.6" />
      <ellipse cx="80" cy="50" rx="48" ry="36" stroke={G} opacity="0.25" />
    </g>
  ),
  network: (
    <g>
      {(() => {
        const r = rand(21);
        const nodes = Array.from({ length: 22 }, () => [20 + r() * 120, 12 + r() * 76] as const);
        return (
          <>
            {nodes.map((a, i) =>
              nodes
                .slice(i + 1, i + 3)
                .map((b, j) => (
                  <line
                    key={`${i}-${j}`}
                    x1={a[0]}
                    y1={a[1]}
                    x2={b[0]}
                    y2={b[1]}
                    stroke={P}
                    strokeWidth="0.4"
                    opacity="0.5"
                  />
                )),
            )}
            {nodes.map((n, i) => (
              <circle key={i} cx={n[0]} cy={n[1]} r={i % 5 === 0 ? 1.8 : 1.1} fill={i % 5 === 0 ? G : P} />
            ))}
          </>
        );
      })()}
    </g>
  ),
  systems: (
    <g fill="none" strokeWidth="0.6">
      <circle cx="40" cy="38" r="14" stroke={G} />
      <circle cx="80" cy="62" r="17" stroke={F} opacity="0.7" />
      <circle cx="122" cy="38" r="13" stroke={P} />
      <path d="M40 38 L80 62 L122 38 M40 38 L82 22 L122 38" stroke={F} opacity="0.35" />
      <rect x="57" y="47" width="5" height="5" stroke={P} />
      <rect x="99" y="47" width="5" height="5" stroke={P} />
    </g>
  ),
};

export function MatterPreview({ target, className = "" }: { target: MatterTarget; className?: string }) {
  return (
    <svg
      viewBox="0 0 160 100"
      className={className}
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="160" height="100" fill="var(--bg-elev)" />
      {art[target]}
    </svg>
  );
}
