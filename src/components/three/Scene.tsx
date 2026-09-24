"use client";

import { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { gsap } from "@/lib/animation/gsap";
import type { TierConfig } from "@/lib/device/tier";
import { DigitalMatter } from "./DigitalMatter";
import { ParticleField } from "./ParticleField";
import { CameraRig } from "./CameraRig";
import { SceneLighting } from "./SceneLighting";

/**
 * R3F renders on the same GSAP ticker that drives Lenis and ScrollTrigger —
 * one requestAnimationFrame for the whole site, so scroll and 3D never drift apart.
 * The ticker pauses with the tab, so hidden tabs cost nothing.
 */
function FrameDriver() {
  const advance = useThree((s) => s.advance);
  useEffect(() => {
    const tick = () => advance(performance.now());
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [advance]);
  return null;
}

export default function Scene({ tier, onContextLost }: { tier: TierConfig; onContextLost: () => void }) {
  const [dpr, setDpr] = useState(tier.dpr[1]);

  return (
    <Canvas
      frameloop="never"
      dpr={[tier.dpr[0], dpr]}
      camera={{ position: [0, 0, 8], fov: 32, near: 0.1, far: 60 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", stencil: false }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onContextLost();
        });
      }}
    >
      <FrameDriver />
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(tier.dpr[0], d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(tier.dpr[1], d + 0.25))}
      />
      <CameraRig reactivity={tier.reactivity} />
      {tier.logoMesh && <SceneLighting />}
      <ParticleField count={tier.dust} />
      <DigitalMatter tier={tier} />
    </Canvas>
  );
}
