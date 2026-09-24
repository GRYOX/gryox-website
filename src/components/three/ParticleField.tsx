"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, BufferGeometry, MathUtils, NormalBlending, ShaderMaterial } from "three";
import { frame } from "@/lib/scroll/frame";
import { mulberry32 } from "@/lib/three/targets";
import { dustFragment, dustVertex } from "@/lib/three/shaders/matter";
import { getTheme, subscribeTheme } from "@/lib/theme/theme";
import { PALETTES } from "./palette";

/** Deep background dust — the farthest parallax layer of the universe. */
export function ParticleField({ count }: { count: number }) {
  const geometry = useMemo(() => {
    const r = mulberry32(7);
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      pos.set([(r() - 0.5) * 22, (r() - 0.5) * 14, -14 + r() * 15], i * 3);
      rnd.set([r(), r(), r(), r()], i * 4);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(pos, 3));
    g.setAttribute("aRandom", new BufferAttribute(rnd, 4));
    return g;
  }, [count]);

  const material = useMemo(() => {
    const p = PALETTES[getTheme()];
    return new ShaderMaterial({
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      transparent: true,
      depthWrite: false,
      blending: p.additive ? AdditiveBlending : NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uPointScale: { value: 1 },
        uOpacity: { value: 0 },
        uGreen: { value: p.green.clone() },
        uPurple: { value: p.purple.clone() },
        uWhite: { value: p.white.clone() },
      },
    });
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeTheme((theme) => {
      const p = PALETTES[theme];
      material.uniforms.uGreen.value.copy(p.green);
      material.uniforms.uPurple.value.copy(p.purple);
      material.uniforms.uWhite.value.copy(p.white);
      material.blending = p.additive ? AdditiveBlending : NormalBlending;
      material.needsUpdate = true;
    });
    return () => {
      unsubscribe();
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state, delta) => {
    const u = material.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uScroll.value = frame.scroll.y * 0.0012;
    u.uPointScale.value = (state.size.height * state.viewport.dpr) / (2 * Math.tan(MathUtils.degToRad(17.5)));
    u.uOpacity.value = MathUtils.damp(u.uOpacity.value, 0.55 + frame.matter.opacity * 0.45, 1.5, Math.min(delta, 0.05));
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
