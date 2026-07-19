"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/**
 * "Open ways" - a quiet 3D motif of diverging roads.
 * Flat ribbon strips sweep from a shared origin and split apart like roads,
 * each carrying a dashed golden centerline. Gentle rotation plus a subtle
 * tilt toward the pointer.
 */

const GOLD = "#e9c349";
const GOLD_LIGHT = "#ffe088";

/** Flat strip geometry that follows a curve (a "road"). */
function makeStrip(curve: THREE.Curve<THREE.Vector3>, width: number, segments = 64) {
  const positions: number[] = [];
  const indices: number[] = [];
  const up = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    const side = new THREE.Vector3().crossVectors(tangent, up).normalize();
    const half = width / 2;
    positions.push(
      point.x + side.x * half, point.y + side.y * half, point.z + side.z * half,
      point.x - side.x * half, point.y - side.y * half, point.z - side.z * half,
    );
    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Dashed centerline: short thin strips sampled along the curve. */
function makeDashes(curve: THREE.Curve<THREE.Vector3>, width: number, count = 12) {
  const dashes: THREE.BufferGeometry[] = [];
  for (let i = 0; i < count; i++) {
    const t0 = i / count;
    const t1 = t0 + 0.55 / count;
    const sub = new THREE.CurvePath<THREE.Vector3>();
    const pts = [curve.getPoint(t0), curve.getPoint((t0 + t1) / 2), curve.getPoint(t1)];
    sub.add(new THREE.CatmullRomCurve3(pts));
    dashes.push(makeStrip(sub, width, 4));
  }
  return dashes;
}

/** A road curve rising from bottom-center and sweeping outward. */
function makeWay(direction: number, spread: number) {
  return new THREE.CubicBezierCurve3(
    new THREE.Vector3(direction * 0.15, -2.6, 0),
    new THREE.Vector3(direction * 0.2, -1, 0.2),
    new THREE.Vector3(direction * spread * 0.6, 0.6, -0.15),
    new THREE.Vector3(direction * spread, 2.3, 0.1),
  );
}

function Ways({ detail }: { detail: "full" | "reduced" }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const roads = useMemo(() => {
    const defs = [
      { curve: makeWay(-1, 2.2), opacity: 0.5 },
      { curve: makeWay(1, 2.2), opacity: 0.5 },
      { curve: makeWay(-1, 0.9), opacity: 0.35 },
      { curve: makeWay(1, 0.9), opacity: 0.35 },
    ].slice(0, detail === "full" ? 4 : 2);
    return defs.map((d) => ({
      ...d,
      strip: makeStrip(d.curve, 0.42),
      dashes: makeDashes(d.curve, 0.045),
    }));
  }, [detail]);

  useFrame((state, delta) => {
    if (!group.current) return;
    pointer.current.x = THREE.MathUtils.lerp(pointer.current.x, state.pointer.x, 0.05);
    pointer.current.y = THREE.MathUtils.lerp(pointer.current.y, state.pointer.y, 0.05);
    group.current.rotation.y += delta * 0.05;
    group.current.rotation.x = pointer.current.y * 0.14;
    group.current.rotation.z = pointer.current.x * -0.08;
  });

  return (
    <group ref={group} rotation={[0.25, 0, 0]}>
      {roads.map((road, i) => (
        <group key={i}>
          {/* Road surface - translucent glass strip */}
          <mesh geometry={road.strip}>
            <meshStandardMaterial
              color="#8fa3c8"
              metalness={0.6}
              roughness={0.35}
              transparent
              opacity={road.opacity * 0.45}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Gold edge glow */}
          <mesh geometry={road.strip} scale={[1.04, 1.0, 1.04]} position={[0, 0, -0.01]}>
            <meshBasicMaterial
              color={GOLD}
              transparent
              opacity={road.opacity * 0.18}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Dashed golden centerline */}
          {road.dashes.map((dash, j) => (
            <mesh key={j} geometry={dash} position={[0, 0, 0.012]}>
              <meshStandardMaterial
                color={j % 2 ? GOLD : GOLD_LIGHT}
                metalness={0.7}
                roughness={0.3}
                emissive={GOLD}
                emissiveIntensity={0.35}
                transparent
                opacity={road.opacity + 0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
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
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} color="#fff7ea" />
      <pointLight position={[-6, -3, -4]} intensity={0.5} color={GOLD} />
      <Float speed={detail === "full" ? 0.9 : 0} rotationIntensity={0.08} floatIntensity={0.25}>
        <Ways detail={detail} />
      </Float>
    </Canvas>
  );
}
