"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { site } from "@/data/site";

/**
 * Controlled studio lighting: a baked environment of soft light panels (no HDR download)
 * gives the mark crisp reflections; two coloured rims echo the brand across its bevels.
 */
export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.18} />
      <directionalLight position={[2.5, 4, 6]} intensity={1.1} />
      <pointLight position={[-4, 1.5, 3]} intensity={14} distance={14} color={site.brand.green} />
      <pointLight position={[4, -1.2, 3]} intensity={14} distance={14} color={site.brand.purple} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 4, 3]} scale={[8, 1.2, 1]} rotation-x={Math.PI / 2.4} />
        <Lightformer
          form="rect"
          intensity={1.6}
          position={[-5, 0.5, 1]}
          scale={[1, 5, 1]}
          rotation-y={Math.PI / 2}
          color={site.brand.green}
        />
        <Lightformer
          form="rect"
          intensity={1.6}
          position={[5, -0.5, 1]}
          scale={[1, 5, 1]}
          rotation-y={-Math.PI / 2}
          color={site.brand.purple}
        />
        <Lightformer form="ring" intensity={0.8} position={[0, 0, -6]} scale={4} />
      </Environment>
    </>
  );
}
