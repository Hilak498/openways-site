"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/**
 * Abstract "network of open ways" — nodes connected by lines, echoing the
 * logo's path motif. Gold metallic material, soft lighting, gentle rotation
 * plus a subtle tilt toward the pointer. Intentionally quiet so it doesn't
 * compete with the animated logo.
 */

const GOLD = "#b9995f";
const GOLD_LIGHT = "#d9c294";

function buildNetwork(count: number, radius: number) {
  const positions: THREE.Vector3[] = [];
  // Fibonacci sphere for an even, deterministic distribution
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const jitter = 0.82 + 0.36 * Math.abs(Math.sin(i * 12.9898));
    positions.push(
      new THREE.Vector3(
        Math.cos(theta) * r * radius * jitter,
        y * radius * jitter,
        Math.sin(theta) * r * radius * jitter,
      ),
    );
  }

  const edges: [THREE.Vector3, THREE.Vector3][] = [];
  const maxDist = radius * 0.72;
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      if (positions[i].distanceTo(positions[j]) < maxDist) {
        edges.push([positions[i], positions[j]]);
      }
    }
  }
  return { positions, edges };
}

function Network({ detail }: { detail: "full" | "reduced" }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const { positions, edges } = useMemo(
    () => buildNetwork(detail === "full" ? 42 : 24, 2.1),
    [detail],
  );

  const lineGeometry = useMemo(() => {
    const points: number[] = [];
    for (const [a, b] of edges) points.push(a.x, a.y, a.z, b.x, b.y, b.z);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    return geometry;
  }, [edges]);

  useFrame((state, delta) => {
    if (!group.current) return;
    pointer.current.x = THREE.MathUtils.lerp(
      pointer.current.x,
      state.pointer.x,
      0.05,
    );
    pointer.current.y = THREE.MathUtils.lerp(
      pointer.current.y,
      state.pointer.y,
      0.05,
    );
    group.current.rotation.y += delta * 0.08;
    group.current.rotation.x = pointer.current.y * 0.18;
    group.current.rotation.z = pointer.current.x * -0.12;
  });

  return (
    <group ref={group}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color={GOLD} transparent opacity={0.28} />
      </lineSegments>
      {positions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[i % 5 === 0 ? 0.075 : 0.042, 16, 16]} />
          <meshStandardMaterial
            color={i % 5 === 0 ? GOLD_LIGHT : GOLD}
            metalness={0.85}
            roughness={0.25}
            emissive={GOLD}
            emissiveIntensity={i % 5 === 0 ? 0.25 : 0.08}
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
      camera={{ position: [0, 0, 6.4], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      aria-hidden="true"
      className="!pointer-events-none"
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      eventPrefix="client"
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} color="#fff7ea" />
      <pointLight position={[-6, -3, -4]} intensity={0.5} color={GOLD} />
      <Float
        speed={detail === "full" ? 1.1 : 0}
        rotationIntensity={0.15}
        floatIntensity={0.35}
      >
        <Network detail={detail} />
      </Float>
    </Canvas>
  );
}
