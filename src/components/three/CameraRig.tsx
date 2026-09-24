"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, type PerspectiveCamera } from "three";
import { frame } from "@/lib/scroll/frame";

/** Damped pointer parallax + viewport-aware lens. Portrait screens get a wider lens. */
export function CameraRig({ reactivity }: { reactivity: number }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const portrait = state.size.width < state.size.height;
    const fov = portrait ? 42 : 32;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = MathUtils.damp(camera.fov, fov, 6, dt);
      camera.updateProjectionMatrix();
    }
    const tx = frame.pointer.nx * 0.28 * reactivity;
    const ty = frame.pointer.ny * 0.18 * reactivity;
    camera.position.x = MathUtils.damp(camera.position.x, tx, 1.8, dt);
    camera.position.y = MathUtils.damp(camera.position.y, ty, 1.8, dt);
    camera.lookAt(0, 0, 0);
  });

  return null;
}
