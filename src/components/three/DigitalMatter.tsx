"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  FloatType,
  Group,
  MathUtils,
  NearestFilter,
  NormalBlending,
  RGBAFormat,
  ShaderMaterial,
  Vector3,
} from "three";
import { TEXTURE_WIDTH, type TierConfig } from "@/lib/device/tier";
import { frame } from "@/lib/scroll/frame";
import { buildMatter } from "@/lib/three/targets";
import { matterFragment, matterVertex } from "@/lib/three/shaders/matter";
import { getTheme, subscribeTheme } from "@/lib/theme/theme";
import { MATTER_TARGETS } from "@/types/content";
import { PALETTES } from "./palette";
import { InteractiveLogo } from "./InteractiveLogo";
import { ConnectionLines } from "./ConnectionLines";

/**
 * Digital Matter — one Points object whose particles blend between procedural targets
 * stored in a float texture. All motion is computed on the GPU.
 */
export function DigitalMatter({ tier }: { tier: TierConfig }) {
  const group = useRef<Group>(null);
  const smooth = useRef({ velocity: 0, px: 0, py: 0, active: 0, rotX: 0, rotY: 0 });
  const camera = useThree((s) => s.camera);

  const data = useMemo(() => buildMatter(tier.rows, tier.lines), [tier.rows, tier.lines]);

  const texture = useMemo(() => {
    const t = new DataTexture(data.targets, TEXTURE_WIDTH, data.rows * MATTER_TARGETS.length, RGBAFormat, FloatType);
    t.minFilter = NearestFilter;
    t.magFilter = NearestFilter;
    t.needsUpdate = true;
    return t;
  }, [data]);

  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(data.count * 3), 3));
    g.setAttribute("aIndex", new BufferAttribute(data.index, 1));
    g.setAttribute("aRandom", new BufferAttribute(data.random, 4));
    return g;
  }, [data]);

  const material = useMemo(() => {
    const palette = PALETTES[getTheme()];
    return new ShaderMaterial({
      vertexShader: matterVertex,
      fragmentShader: matterFragment,
      transparent: true,
      depthWrite: false,
      blending: palette.additive ? AdditiveBlending : NormalBlending,
      uniforms: {
        uTargets: { value: texture },
        uRows: { value: data.rows },
        uFrom: { value: 0 },
        uTo: { value: 1 },
        uMix: { value: 1 },
        uDissolve: { value: 1 },
        uTime: { value: 0 },
        uVelocity: { value: 0 },
        uEnergy: { value: 0 },
        uReact: { value: tier.reactivity },
        uPointer: { value: new Vector3(10, 10, 0) },
        uPointerActive: { value: 0 },
        uWorldSize: { value: 0.01 },
        uPointScale: { value: 1 },
        uOpacity: { value: 0 },
        uGreen: { value: palette.green.clone() },
        uPurple: { value: palette.purple.clone() },
        uWhite: { value: palette.white.clone() },
      },
    });
  }, [texture, data.rows, tier.reactivity]);

  // Theme: swap palette + blending (additive glow on black, ink on paper).
  useEffect(() => {
    return subscribeTheme((theme) => {
      const p = PALETTES[theme];
      material.uniforms.uGreen.value.copy(p.green);
      material.uniforms.uPurple.value.copy(p.purple);
      material.uniforms.uWhite.value.copy(p.white);
      material.blending = p.additive ? AdditiveBlending : NormalBlending;
      material.needsUpdate = true;
    });
  }, [material]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    },
    [geometry, material, texture],
  );

  // Announce readiness once the first frame has rendered (the opening waits for it).
  const announced = useRef(false);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const m = frame.matter;
    const s = smooth.current;
    const u = material.uniforms;
    const dt = Math.min(delta, 1 / 20);

    const vp = state.viewport.getCurrentViewport(camera, [0, 0, 0]);
    const portrait = vp.aspect < 1;
    const fit = (Math.min(vp.width * (portrait ? 0.86 : 0.44), vp.height * 0.95) / 2) * m.scale;

    g.scale.setScalar(fit);
    g.position.x = m.x * (vp.width / 2);
    g.position.y = m.y * (vp.height / 2);

    // Pointer tilt, damped; idle breathing keeps the object alive.
    const react = tier.reactivity;
    const time = state.clock.elapsedTime;
    s.rotY = MathUtils.damp(s.rotY, frame.pointer.nx * 0.32 * react, 2.5, dt);
    s.rotX = MathUtils.damp(s.rotX, -frame.pointer.ny * 0.18 * react, 2.5, dt);
    g.rotation.y = m.rotY + s.rotY + Math.sin(time * 0.25) * 0.06 * (react > 0 ? 1 : 0);
    g.rotation.x = s.rotX + Math.cos(time * 0.2) * 0.03 * (react > 0 ? 1 : 0);

    // Scroll velocity, normalised and eased back to rest.
    const v = MathUtils.clamp(frame.scroll.velocity / 45, -1, 1);
    s.velocity = MathUtils.damp(s.velocity, v, 4, dt);

    // Pointer into the matter's local space.
    const wx = (frame.pointer.nx * vp.width) / 2;
    const wy = (frame.pointer.ny * vp.height) / 2;
    s.px = MathUtils.damp(s.px, (wx - g.position.x) / fit, 8, dt);
    s.py = MathUtils.damp(s.py, (wy - g.position.y) / fit, 8, dt);
    s.active = MathUtils.damp(s.active, frame.pointer.active ? 1 : 0, 3, dt);

    u.uTime.value = time;
    u.uFrom.value = m.from;
    u.uTo.value = m.to;
    u.uMix.value = m.mix;
    u.uDissolve.value = m.dissolve;
    u.uEnergy.value = m.energy;
    u.uVelocity.value = s.velocity;
    u.uPointer.value.set(s.px, s.py, 0);
    u.uPointerActive.value = s.active;
    u.uOpacity.value = m.opacity * (1 - m.dim * 0.65);
    u.uWorldSize.value = 0.0065 / Math.sqrt(tier.rows / 110);
    // Pixels per world unit at distance 1 — converts world size into point size.
    u.uPointScale.value =
      ((state.size.height * state.viewport.dpr) /
        (2 * Math.tan(MathUtils.degToRad((camera as { fov?: number }).fov ?? 35) / 2))) *
      fit;

    if (!announced.current) {
      announced.current = true;
      window.dispatchEvent(new Event("gryox:matter-ready"));
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} frustumCulled={false} />
      {tier.logoMesh && <InteractiveLogo />}
      {tier.lines && <ConnectionLines lines={data.lines} />}
    </group>
  );
}
