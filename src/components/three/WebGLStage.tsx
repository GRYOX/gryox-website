"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import { detectTier, supportsWebGL2, TIERS, type TierConfig } from "@/lib/device/tier";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

const noop = () => () => {};
let webglSupport: boolean | undefined;
const getSupport = () => (webglSupport ??= supportsWebGL2());

/**
 * The persistent WebGL layer. Fixed behind the DOM, decorative (aria-hidden), and
 * mounted after first paint so the headline — not the canvas — is the LCP.
 * Without WebGL2 the page simply keeps its typographic layout.
 */
export function WebGLStage() {
  const supported = useSyncExternalStore(noop, getSupport, () => false);
  const [tier, setTier] = useState<TierConfig | null>(null);
  const [lost, setLost] = useState(false);

  useEffect(() => {
    if (!supported) return;
    const start = () => setTier(TIERS[detectTier()]);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 400 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(start, 120);
    return () => window.clearTimeout(id);
  }, [supported]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      {tier && !lost && <Scene tier={tier} onContextLost={() => setLost(true)} />}
    </div>
  );
}
