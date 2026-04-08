"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Torus } from "@react-three/drei";
import { useRef } from "react";
import type { Group } from "three";

function Scene() {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (!group.current) {
      return;
    }

    group.current.rotation.y = state.clock.elapsedTime * 0.12;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
  });

  return (
    <group ref={group}>
      <Float speed={1.3} rotationIntensity={0.45} floatIntensity={1.1}>
        <Sphere args={[1.15, 64, 64]} position={[-0.4, 0.2, 0]}>
          <MeshDistortMaterial
            color="#a78bfa"
            roughness={0.15}
            metalness={0.35}
            distort={0.32}
            speed={1.35}
            transparent
            opacity={0.72}
          />
        </Sphere>
      </Float>
      <Float speed={1.1} rotationIntensity={0.6} floatIntensity={1.8}>
        <Torus args={[1.8, 0.14, 24, 120]} position={[0.8, -0.1, -0.6]}>
          <meshStandardMaterial
            color="#d6ffee"
            emissive="#6ee7b7"
            emissiveIntensity={0.35}
            roughness={0.28}
            metalness={0.55}
            transparent
            opacity={0.75}
          />
        </Torus>
      </Float>
      <Float speed={1.5} rotationIntensity={0.75} floatIntensity={2}>
        <Sphere args={[0.4, 32, 32]} position={[1.95, 1.25, 0.45]}>
          <meshStandardMaterial
            color="#7dd3fc"
            emissive="#60a5fa"
            emissiveIntensity={0.55}
            roughness={0.18}
            metalness={0.5}
          />
        </Sphere>
      </Float>
      <ambientLight intensity={1.1} />
      <directionalLight position={[2, 3, 4]} intensity={1.7} color="#ffffff" />
      <pointLight position={[-2, -2, 2]} intensity={2.4} color="#a78bfa" />
    </group>
  );
}

export default function Floating3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
      <Scene />
    </Canvas>
  );
}
