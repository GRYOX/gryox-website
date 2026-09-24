"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Color,
  ExtrudeGeometry,
  type Group,
  MeshPhysicalMaterial,
  type WebGLProgramParametersWithUniforms,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { frame } from "@/lib/scroll/frame";
import { getMarkParts } from "@/lib/three/mark-shape";
import { valueNoise } from "@/lib/three/shaders/noise";
import { site } from "@/data/site";

const DEPTH = 0.13;

/**
 * The GRYOX symbol as a physical object: extruded from the traced mark, lit by the
 * scene environment, and materialised by a noise-threshold reveal that sweeps from
 * the G (idea, green) to the R (technology, purple).
 */
export function InteractiveLogo() {
  const group = useRef<Group>(null);
  const geometries = useMemo(() => {
    const byTone: ExtrudeGeometry[][] = [[], []];
    for (const part of getMarkParts()) {
      const g = new ExtrudeGeometry(part.shape, {
        depth: DEPTH,
        bevelEnabled: true,
        bevelThickness: 0.014,
        bevelSize: 0.009,
        bevelSegments: 3,
        curveSegments: 4,
      });
      g.translate(0, 0, -DEPTH / 2);
      byTone[part.tone].push(g);
    }
    return byTone.map((list) => {
      const merged = mergeGeometries(list);
      list.forEach((g) => g.dispose());
      return merged;
    });
  }, []);

  const uniforms = useMemo(() => ({ uReveal: { value: 0 }, uTime: { value: 0 } }), []);

  const materials = useMemo(
    () =>
      [site.brand.green, site.brand.purple].map((hex, tone) => {
        const color = new Color(hex);
        const mat = new MeshPhysicalMaterial({
          color,
          metalness: 0.55,
          roughness: 0.26,
          clearcoat: 1,
          clearcoatRoughness: 0.12,
          emissive: color,
          emissiveIntensity: tone === 1 ? 0.22 : 0.14,
          envMapIntensity: 1.1,
        });
        const edge = new Color(tone === 0 ? "#6dffb4" : "#c29bff");
        mat.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
          shader.uniforms.uReveal = uniforms.uReveal;
          shader.uniforms.uTime = uniforms.uTime;
          shader.uniforms.uEdge = { value: edge };
          shader.vertexShader = shader.vertexShader
            .replace("#include <common>", "#include <common>\nvarying vec3 vObj;")
            .replace("#include <begin_vertex>", "#include <begin_vertex>\nvObj = position;");
          shader.fragmentShader = shader.fragmentShader
            .replace(
              "#include <common>",
              `#include <common>\nvarying vec3 vObj;\nuniform float uReveal;\nuniform float uTime;\nuniform vec3 uEdge;\n${valueNoise}`,
            )
            .replace(
              "#include <clipping_planes_fragment>",
              `#include <clipping_planes_fragment>
              float gxN = gxNoise(vObj * 9.0 + uTime * 0.05) * 0.55 + gxNoise(vObj * 23.0) * 0.2;
              float gxT = (vObj.x * 0.5 + 0.5) * 0.62 + gxN * 0.42;
              float gxR = uReveal * 1.12 - 0.02;
              if (gxT > gxR) discard;
              float gxEdge = 1.0 - smoothstep(0.0, 0.045, gxR - gxT);`,
            )
            .replace(
              "#include <emissivemap_fragment>",
              "#include <emissivemap_fragment>\ntotalEmissiveRadiance += uEdge * gxEdge * 2.4 * step(uReveal, 0.999);",
            );
        };
        mat.customProgramCacheKey = () => `gryox-reveal-${tone}`;
        return mat;
      }),
    [uniforms],
  );

  useEffect(
    () => () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
    [geometries, materials],
  );

  useFrame((state) => {
    if (group.current) group.current.visible = frame.matter.logo > 0.001;
    uniforms.uReveal.value = frame.matter.logo;
    uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group ref={group}>
      {geometries.map((g, i) => (
        <mesh key={i} geometry={g} material={materials[i]} />
      ))}
    </group>
  );
}
