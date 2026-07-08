"use client";

/* eslint-disable react-hooks/purity --
 * Three.js scene. Mutation IS the model here:
 *   - useMemo builds one-shot geometry / layouts
 *   - useFrame mutates transforms per frame (not React render)
 */

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export type ChartMotif = "radial" | "helix" | "grid";

export interface AgentSceneProps {
  accent: string;
  motif: ChartMotif;
  /** Drives the orbiting node count (one per KPI). */
  kpiCount: number;
  /** Stable per-agent seed so each chart is deterministic + distinct. */
  seedKey: string;
}

// Deterministic per-agent seed → varied layouts without randomness between renders.
function seedFrom(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── CORE ─────────────────────────────────────────────────────────────────────
// A pulsing icosahedron with a wireframe shell — the agent's "brain".
function Core({ accent }: { accent: string }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!g.current) return;
    g.current.rotation.y = t * 0.3;
    g.current.rotation.x = t * 0.14;
    g.current.scale.setScalar(1 + Math.sin(t * 2) * 0.06);
  });
  return (
    <group ref={g}>
      <mesh>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.55} metalness={0.4} roughness={0.3} transparent opacity={0.85} />
      </mesh>
      <mesh scale={1.28}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={accent} wireframe transparent opacity={0.22} />
      </mesh>
    </group>
  );
}

// ─── KINETIC BARS ─────────────────────────────────────────────────────────────
// The chart itself. Bars are laid out by motif and animate their height every
// frame, so each domain reads as a different living shape.
interface BarMeta {
  x: number;
  y: number;
  z: number;
  rot: number;
  phase: number;
  base: number;
}
function Bars({ accent, motif, seed }: { accent: string; motif: ChartMotif; seed: number }) {
  const refs = useRef<THREE.Mesh[]>([]);
  const count = motif === "grid" ? 36 : 30;
  const meta = useMemo<BarMeta[]>(() => {
    const rnd = mulberry32(seed);
    const arr: BarMeta[] = [];
    if (motif === "radial") {
      const r = 2.7;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        arr.push({ x: Math.cos(a) * r, y: 0, z: Math.sin(a) * r, rot: -a, phase: rnd() * Math.PI * 2, base: 0.4 + rnd() * 0.5 });
      }
    } else if (motif === "helix") {
      const turns = 3;
      const r = 1.9;
      for (let i = 0; i < count; i++) {
        const t = i / count;
        const a = t * Math.PI * 2 * turns;
        arr.push({ x: Math.cos(a) * r, y: (t - 0.5) * 4.2, z: Math.sin(a) * r, rot: -a, phase: rnd() * Math.PI * 2, base: 0.3 + rnd() * 0.4 });
      }
    } else {
      const side = Math.round(Math.sqrt(count));
      for (let i = 0; i < side; i++) {
        for (let j = 0; j < side; j++) {
          arr.push({ x: (i - (side - 1) / 2) * 0.72, y: 0, z: (j - (side - 1) / 2) * 0.72, rot: 0, phase: (i + j) * 0.55, base: 0.4 });
        }
      }
    }
    return arr;
  }, [motif, seed, count]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    for (let i = 0; i < refs.current.length; i++) {
      const m = refs.current[i];
      const d = meta[i];
      if (!m || !d) continue;
      const wave = Math.abs(Math.sin(t * 1.4 + d.phase));
      const h = motif === "grid" ? 0.35 + wave * 1.7 : d.base + wave * 1.4;
      m.scale.y = h;
      m.position.y = d.y + h / 2;
    }
  });

  return (
    <group>
      {meta.map((d, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
          position={[d.x, d.y, d.z]}
          rotation={[0, d.rot, 0]}
        >
          <boxGeometry args={[0.16, 1, 0.16]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} metalness={0.3} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// ─── ORBITING KPI NODES ───────────────────────────────────────────────────────
function OrbitNodes({ accent, count }: { accent: string; count: number }) {
  const g = useRef<THREE.Group>(null);
  const nodes = useMemo(
    () => Array.from({ length: Math.max(3, count) }, (_, i) => {
      const total = Math.max(3, count);
      return { a: (i / total) * Math.PI * 2, r: 3.5, y: i % 2 ? 0.6 : -0.6 };
    }),
    [count]
  );
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = -clock.getElapsedTime() * 0.25;
  });
  return (
    <group ref={g} rotation={[0.5, 0, 0]}>
      {nodes.map((n, i) => (
        <mesh key={i} position={[Math.cos(n.a) * n.r, n.y, Math.sin(n.a) * n.r]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} />
        </mesh>
      ))}
    </group>
  );
}

// ─── PARTICLE FIELD ───────────────────────────────────────────────────────────
function Particles({ accent }: { accent: string }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const n = 420;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 6 + Math.random() * 8;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = (Math.random() - 0.5) * 11;
      pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.03;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.05} color={accent} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

// ─── CAMERA RIG ───────────────────────────────────────────────────────────────
// Slow auto-orbit with a touch of mouse parallax — kinetic without being busy.
function Rig() {
  const { camera, pointer } = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.15;
    const r = 7.2;
    v.set(Math.sin(t) * r + pointer.x * 1.4, 1.7 + pointer.y * 0.9, Math.cos(t) * r);
    camera.position.lerp(v, 0.05);
    camera.lookAt(0, 0.35, 0);
  });
  return null;
}

export function AgentScene({ accent, motif, kpiCount, seedKey }: AgentSceneProps) {
  const seed = seedFrom(seedKey);
  return (
    <Canvas dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 1.7, 7.2], fov: 55, near: 0.1, far: 100 }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 7, 5]} intensity={80} color={accent} distance={40} decay={1.5} />
      <pointLight position={[-6, -4, -5]} intensity={40} color="#6C63FF" distance={40} decay={1.5} />
      <Particles accent={accent} />
      <group rotation={[0.16, 0, 0]}>
        <Core accent={accent} />
        <Bars accent={accent} motif={motif} seed={seed} />
        <OrbitNodes accent={accent} count={kpiCount} />
      </group>
      <Rig />
    </Canvas>
  );
}
