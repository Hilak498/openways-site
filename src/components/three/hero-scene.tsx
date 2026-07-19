"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * "Open ways" - three roads fanning out from a shared origin, like the logo.
 * Each road is drawn with the visual grammar of a real road: two tapering
 * edge lines converging toward the distance plus a dashed centerline.
 * Every few seconds a different road lights up while a golden "headlight"
 * travels along it.
 */

const GOLD = new THREE.Color("#e9c349");
const GOLD_LIGHT = new THREE.Color("#ffe088");
const BASE = new THREE.Color("#7d8db0");

const CYCLE_SECONDS = 3.5;
const UP = new THREE.Vector3(0, 0, 1);

interface Road {
  center: THREE.CatmullRomCurve3;
  edges: THREE.TubeGeometry[];
  dashes: THREE.TubeGeometry[];
}

/** Build a road: tapered edge lines + dashed centerline along a curve. */
function makeRoad(points: [number, number, number][]): Road {
  const center = new THREE.CatmullRomCurve3(
    points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  );

  const SAMPLES = 60;
  const widthAt = (t: number) => THREE.MathUtils.lerp(0.42, 0.1, t); // near → far

  const left: THREE.Vector3[] = [];
  const right: THREE.Vector3[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const p = center.getPoint(t);
    const side = new THREE.Vector3()
      .crossVectors(center.getTangent(t).normalize(), UP)
      .normalize()
      .multiplyScalar(widthAt(t) / 2);
    left.push(p.clone().add(side));
    right.push(p.clone().sub(side));
  }

  const edges = [left, right].map(
    (pts) =>
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.014, 8, false),
  );

  // Dashed centerline: short segments with gaps, thinner toward the distance
  const dashes: THREE.TubeGeometry[] = [];
  const DASHES = 11;
  for (let i = 0; i < DASHES; i++) {
    const t0 = i / DASHES + 0.012;
    const t1 = t0 + 0.5 / DASHES;
    const seg = [
      center.getPoint(t0),
      center.getPoint((t0 + t1) / 2),
      center.getPoint(Math.min(t1, 1)),
    ];
    dashes.push(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(seg),
        6,
        THREE.MathUtils.lerp(0.03, 0.012, t0),
        8,
        false,
      ),
    );
  }

  return { center, edges, dashes };
}

function Ways({ detail }: { detail: "full" | "reduced" }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const roadMaterials = useRef<THREE.MeshBasicMaterial[][]>([]);
  const pulse = useRef<THREE.Mesh>(null);
  const pulseGlow = useRef<THREE.Mesh>(null);

  // Three ways diverging from one origin at the bottom - the logo motif
  const roads = useMemo(() => {
    const defs = (
      [
        [[0, -2.4, 0], [-0.5, -0.9, 0.1], [-1.6, 0.7, 0.2], [-3.1, 2.2, 0.3]],
        [[0, -2.4, 0], [0.1, -0.8, 0.15], [0.35, 0.9, 0.3], [0.7, 2.5, 0.45]],
        [[0, -2.4, 0], [0.6, -0.9, 0.1], [1.8, 0.7, 0.2], [3.3, 2.2, 0.3]],
      ] as [number, number, number][][]
    ).slice(0, detail === "full" ? 3 : 2);
    return defs.map(makeRoad);
  }, [detail]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const active = Math.floor(t / CYCLE_SECONDS) % roads.length;
    const progress = (t % CYCLE_SECONDS) / CYCLE_SECONDS;

    const eased = progress * progress * (3 - 2 * progress);
    const point = roads[active].center.getPoint(eased);
    if (pulse.current) {
      pulse.current.position.copy(point);
      // Headlight shrinks as it recedes toward the horizon
      const s = THREE.MathUtils.lerp(1, 0.45, eased);
      pulse.current.scale.setScalar(s);
      pulseGlow.current?.position.copy(point);
      pulseGlow.current?.scale.setScalar(s);
    }

    roadMaterials.current.forEach((mats, i) => {
      const wave = i === active ? Math.sin(Math.min(progress, 1) * Math.PI) : 0;
      mats?.forEach((mat) => {
        if (!mat) return;
        mat.color.lerpColors(BASE, GOLD, wave);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.3 + wave * 0.6, 0.12);
      });
    });

    if (!group.current) return;
    pointer.current.x = THREE.MathUtils.lerp(pointer.current.x, state.pointer.x, 0.04);
    pointer.current.y = THREE.MathUtils.lerp(pointer.current.y, state.pointer.y, 0.04);
    group.current.rotation.x = -0.55 + pointer.current.y * 0.06;
    group.current.rotation.y = pointer.current.x * 0.08;
  });

  return (
    <group ref={group} rotation={[-0.55, 0, 0]} position={[0, -0.3, 0]}>
      {roads.map((road, i) => (
        <group key={i}>
          {[...road.edges, ...road.dashes].map((geometry, j) => (
            <mesh key={j} geometry={geometry}>
              <meshBasicMaterial
                ref={(m) => {
                  if (!m) return;
                  (roadMaterials.current[i] ??= [])[j] = m;
                }}
                color={BASE}
                transparent
                opacity={0.3}
              />
            </mesh>
          ))}
        </group>
      ))}
      {/* Traveling golden "headlight" */}
      <mesh ref={pulse}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color={GOLD_LIGHT} />
      </mesh>
      <mesh ref={pulseGlow}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.3} />
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
