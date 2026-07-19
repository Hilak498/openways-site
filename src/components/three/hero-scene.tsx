"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/**
 * "Open ways" - flowing golden ribbons echoing the logo's arcs.
 * Smooth metallic tubes sweep upward like diverging roads, with a gentle
 * rotation and a subtle tilt toward the pointer. Quieter and more branded
 * than the previous node-network.
 */

const GOLD = "#e9c349";
const GOLD_LIGHT = "#ffe088";
const WHITE = "#f5f3f5";

function makeArc(offset: number, spread: number, height: number) {
  // Bezier-like arc: rises from bottom center and sweeps outward, like the mark
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(offset * 0.4, -height, 0),
    new THREE.Vector3(offset * 0.5, -height * 0.2, spread * 0.3),
    new THREE.Vector3(offset + spread * 0.4, height * 0.35, -spread * 0.2),
    new THREE.Vector3(offset + spread, height, spread * 0.1),
  );
  return new THREE.TubeGeometry(curve, 48, 0.085, 16, false);
}

function Ribbons({ detail }: { detail: "full" | "reduced" }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const arcs = useMemo(() => {
    const defs: { geometry: THREE.TubeGeometry; color: string; opacity: number }[] = [
      { geometry: makeArc(-0.5, -2.2, 2.4), color: GOLD, opacity: 1 },
      { geometry: makeArc(-0.15, -1.7, 2.1), color: GOLD_LIGHT, opacity: 0.9 },
      { geometry: makeArc(0.15, 1.7, 2.1), color: WHITE, opacity: 0.85 },
      { geometry: makeArc(0.5, 2.2, 2.4), color: GOLD, opacity: 0.75 },
    ];
    return detail === "full" ? defs : defs.slice(0, 3);
  }, [detail]);

  useFrame((state, delta) => {
    if (!group.current) return;
    pointer.current.x = THREE.MathUtils.lerp(pointer.current.x, state.pointer.x, 0.05);
    pointer.current.y = THREE.MathUtils.lerp(pointer.current.y, state.pointer.y, 0.05);
    group.current.rotation.y += delta * 0.06;
    group.current.rotation.x = pointer.current.y * 0.15;
    group.current.rotation.z = pointer.current.x * -0.1;
  });

  return (
    <group ref={group} rotation={[0.15, 0, 0]}>
      {arcs.map((arc, i) => (
        <mesh key={i} geometry={arc.geometry}>
          <meshStandardMaterial
            color={arc.color}
            metalness={0.85}
            roughness={0.3}
            transparent
            opacity={arc.opacity}
            emissive={arc.color}
            emissiveIntensity={0.12}
          />
        </mesh>
      ))}
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
      camera={{ position: [0, 0, 6.5], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      aria-hidden="true"
      className="!pointer-events-none"
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={1.2} color="#fff7ea" />
      <pointLight position={[-6, -3, -4]} intensity={0.6} color={GOLD} />
      <Float speed={detail === "full" ? 1 : 0} rotationIntensity={0.1} floatIntensity={0.3}>
        <Ribbons detail={detail} />
      </Float>
    </Canvas>
  );
}
