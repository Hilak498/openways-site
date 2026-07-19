"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * "Open ways" - a quiet network of sweeping road-like paths, inspired by the
 * brand's interchange imagery. Thin luminous lines; every few seconds a
 * different path lights up while a golden pulse travels along it.
 */

const GOLD = new THREE.Color("#e9c349");
const GOLD_LIGHT = new THREE.Color("#ffe088");
const BASE = new THREE.Color("#6b7ea3");

const CYCLE_SECONDS = 3.2;

function makePaths(count: number) {
  // Sweeping highway-like curves: mostly horizontal, gently layered in depth
  const defs = [
    [[-4.2, -1.6, -0.6], [-1.4, -0.2, 0.2], [1.2, 0.5, -0.3], [4.2, 1.8, 0.2]],
    [[-4.4, 0.9, 0.3], [-1.6, 0.4, -0.2], [1.4, -0.4, 0.3], [4.4, -1.4, -0.2]],
    [[-4.0, -0.4, 0.5], [-1.2, 0.6, 0.1], [1.6, 1.0, 0.4], [4.0, 0.2, -0.4]],
    [[-4.3, 1.9, -0.3], [-1.5, 1.1, 0.3], [1.3, 0.2, -0.2], [4.3, -0.6, 0.4]],
    [[-4.1, 0.2, -0.2], [-1.3, -0.6, 0.4], [1.5, -1.0, -0.1], [4.1, -2.0, 0.3]],
  ].slice(0, count);

  return defs.map((points) => {
    const curve = new THREE.CatmullRomCurve3(
      points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    );
    return {
      curve,
      tube: new THREE.TubeGeometry(curve, 72, 0.022, 10, false),
    };
  });
}

function Ways({ detail }: { detail: "full" | "reduced" }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const materials = useRef<THREE.MeshBasicMaterial[]>([]);
  const pulse = useRef<THREE.Mesh>(null);
  const pulseGlow = useRef<THREE.Mesh>(null);

  const paths = useMemo(() => makePaths(detail === "full" ? 5 : 3), [detail]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const active = Math.floor(t / CYCLE_SECONDS) % paths.length;
    const progress = (t % CYCLE_SECONDS) / CYCLE_SECONDS;

    // Ease the traveling pulse along the active path
    const eased = progress * progress * (3 - 2 * progress);
    const point = paths[active].curve.getPoint(eased);
    if (pulse.current) pulse.current.position.copy(point);
    if (pulseGlow.current) pulseGlow.current.position.copy(point);

    // Brighten the active path, dim the rest
    materials.current.forEach((mat, i) => {
      if (!mat) return;
      const isActive = i === active;
      // Fade the highlight in and out within the cycle
      const wave = isActive ? Math.sin(Math.min(progress, 1) * Math.PI) : 0;
      mat.color.lerpColors(BASE, GOLD, wave);
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.22 + wave * 0.7, 0.12);
    });

    if (!group.current) return;
    pointer.current.x = THREE.MathUtils.lerp(pointer.current.x, state.pointer.x, 0.04);
    pointer.current.y = THREE.MathUtils.lerp(pointer.current.y, state.pointer.y, 0.04);
    group.current.rotation.x = -0.35 + pointer.current.y * 0.08;
    group.current.rotation.y = Math.sin(t * 0.08) * 0.06 + pointer.current.x * 0.06;
  });

  return (
    <group ref={group} rotation={[-0.35, 0, 0.08]}>
      {paths.map((path, i) => (
        <mesh key={i} geometry={path.tube}>
          <meshBasicMaterial
            ref={(m) => {
              if (m) materials.current[i] = m;
            }}
            color={BASE}
            transparent
            opacity={0.22}
          />
        </mesh>
      ))}
      {/* Traveling golden pulse */}
      <mesh ref={pulse}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial color={GOLD_LIGHT} />
      </mesh>
      <mesh ref={pulseGlow}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

export default function HeroScene({
  detail = "full",
}: {
  detail?: "full" | "reduced";
}) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 6], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      aria-hidden="true"
      className="!pointer-events-none"
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
    >
      <Ways detail={detail} />
    </Canvas>
  );
}
