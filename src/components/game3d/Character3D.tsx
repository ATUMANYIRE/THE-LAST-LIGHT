'use client';

import React, { useRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface CharacterProps {
  isSimulating?: boolean;
  isAtGoal?: boolean;
}

export const Maya3D = React.memo(React.forwardRef<THREE.Group, CharacterProps>(({
  isSimulating = false,
  isAtGoal = false,
}, forwardedRef) => {
  const groupRef = useRef<THREE.Group>(null);
  const lanternLightRef = useRef<THREE.PointLight>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const previousPosition = useRef(new THREE.Vector2());
  const hasPreviousPosition = useRef(false);

  useImperativeHandle(forwardedRef, () => groupRef.current!);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const current = groupRef.current.position;
    const moved = hasPreviousPosition.current &&
      Math.hypot(current.x - previousPosition.current.x, current.z - previousPosition.current.y) > 0.001;
    previousPosition.current.set(current.x, current.z);
    hasPreviousPosition.current = true;
    const walking = isSimulating || moved;
    const bounceFreq = walking ? 8 : 2.5;
    const bounceAmp = walking ? 0.04 : 0.015;
    // Only control Y (bob) — parent controls X/Z (position) and rotation.y (facing)
    groupRef.current.position.y = Math.abs(Math.sin(t * bounceFreq)) * bounceAmp;
    const stride = walking ? Math.sin(t * 9) * 0.45 : 0;
    if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, stride, 0.3);
    if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -stride, 0.3);
    if (lanternLightRef.current) {
      lanternLightRef.current.intensity = 1.2 + Math.sin(t * 5) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.4} />
      </mesh>
      <group ref={leftLegRef} position={[-0.06, 0.2, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <boxGeometry args={[0.08, 0.12, 0.14]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.02, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 0.16, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.06, 0.2, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <boxGeometry args={[0.08, 0.12, 0.14]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.02, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 0.16, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
      </group>
      <mesh position={[0, 0.38, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.14, 0.26, 8]} />
        <meshStandardMaterial color="#4d7c0f" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.4, -0.1]} castShadow>
        <boxGeometry args={[0.16, 0.2, 0.08]} />
        <meshStandardMaterial color="#78350f" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.52, 0]} castShadow>
        <torusGeometry args={[0.1, 0.035, 8, 16]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color="#fed7aa" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.71, -0.01]} castShadow>
        <sphereGeometry args={[0.095, 12, 12]} />
        <meshStandardMaterial color="#451a03" roughness={0.8} />
      </mesh>
      <group position={[0.18, 0.35, 0.1]}>
        <mesh castShadow>
          <boxGeometry args={[0.06, 0.09, 0.06]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={3.0} roughness={0.2} />
        </mesh>
        <pointLight ref={lanternLightRef} position={[0, 0, 0]} color="#fef08a" intensity={1.2} distance={1.8} decay={2} />
      </group>
      {isAtGoal && (
        <mesh position={[0, 0.85, 0]}>
          <ringGeometry args={[0.08, 0.12, 16]} />
          <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}));
Maya3D.displayName = 'Maya3D';

export const Sam3D = React.memo(React.forwardRef<THREE.Group, CharacterProps>(({
  isSimulating = false,
  isAtGoal = false,
}, forwardedRef) => {
  const groupRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group>(null);

  useImperativeHandle(forwardedRef, () => groupRef.current!);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    // Subtle idle breathing — parent controls X/Z and rotation.y
    groupRef.current.position.y = Math.sin(t * 2) * 0.008;
    if (wheelsRef.current && isSimulating) {
      wheelsRef.current.rotation.x = t * 6;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1.15, 1]}>
        <circleGeometry args={[0.26, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.45} />
      </mesh>
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.26, 0.06, 0.28]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.38, -0.12]} castShadow>
        <boxGeometry args={[0.26, 0.28, 0.04]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>
      <group ref={wheelsRef} position={[0, 0.24, 0]}>
        {[-0.17, 0.17].map((xOffset, i) => (
          <group key={`wheel-${i}`} position={[xOffset, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <torusGeometry args={[0.22, 0.022, 8, 24]} />
              <meshStandardMaterial color="#0f172a" roughness={0.8} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.18, 0.012, 6, 20]} />
              <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, 0.03, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        ))}
      </group>
      {[-0.11, 0.11].map((xOffset, i) => (
        <mesh key={`caster-${i}`} position={[xOffset, 0.06, 0.16]}>
          <cylinderGeometry args={[0.035, 0.035, 0.02, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.28, 0.12]} castShadow>
        <boxGeometry args={[0.2, 0.12, 0.18]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.1, 0.2]}>
        <boxGeometry args={[0.22, 0.02, 0.08]} />
        <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.44, 0.02]} castShadow>
        <cylinderGeometry args={[0.11, 0.13, 0.24, 8]} />
        <meshStandardMaterial color="#c2410c" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.64, 0.02]} castShadow>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color="#fbcfe8" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.71, 0.01]} castShadow>
        <cylinderGeometry args={[0.1, 0.09, 0.04, 12]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.69, 0.09]}>
        <boxGeometry args={[0.12, 0.015, 0.08]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.65, 0.11]}>
        <boxGeometry args={[0.13, 0.03, 0.01]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
      </mesh>
      {isAtGoal && (
        <mesh position={[0, 0.86, 0]}>
          <octahedronGeometry args={[0.07, 0]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2.5} />
        </mesh>
      )}
    </group>
  );
}));
Sam3D.displayName = 'Sam3D';

export const Kai3D = React.memo(React.forwardRef<THREE.Group, CharacterProps>(({
  isSimulating = false,
  isAtGoal = false,
}, forwardedRef) => {
  const groupRef = useRef<THREE.Group>(null);

  useImperativeHandle(forwardedRef, () => groupRef.current!);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const bounceFreq = isSimulating ? 8 : 2.5;
    const bounceAmp = isSimulating ? 0.04 : 0.015;
    groupRef.current.position.y = Math.abs(Math.sin(t * bounceFreq)) * bounceAmp;
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.4} />
      </mesh>
      {[-0.06, 0.06].map((x, i) => (
        <mesh key={`shoe-${i}`} position={[x, 0.07, 0.02]} castShadow>
          <boxGeometry args={[0.08, 0.1, 0.16]} />
          <meshStandardMaterial color="#a78bfa" roughness={0.7} />
        </mesh>
      ))}
      {[-0.06, 0.06].map((x, i) => (
        <mesh key={`leg-${i}`} position={[x, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 0.16, 8]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 0.38, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.28, 8]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color="#d4a574" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.71, 0]} castShadow>
        <sphereGeometry args={[0.094, 12, 12]} />
        <meshStandardMaterial color="#1c1917" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.73, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.1, 0.013, 6, 16, Math.PI]} />
        <meshStandardMaterial color="#a855f7" metalness={0.6} roughness={0.3} />
      </mesh>
      {[-0.108, 0.108].map((x, i) => (
        <mesh key={`cup-${i}`} position={[x, 0.65, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.044, 0.04, 0.04, 12]} />
          <meshStandardMaterial color="#6d28d9" roughness={0.4} />
        </mesh>
      ))}
      {isAtGoal && (
        <mesh position={[0, 0.85, 0]}>
          <ringGeometry args={[0.08, 0.12, 16]} />
          <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}));
Kai3D.displayName = 'Kai3D';

export const Elena3D = React.memo(React.forwardRef<THREE.Group, CharacterProps>(({
  isSimulating = false,
  isAtGoal = false,
}, forwardedRef) => {
  const groupRef = useRef<THREE.Group>(null);

  useImperativeHandle(forwardedRef, () => groupRef.current!);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 2.5) * 0.01;
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>
      {[-0.05, 0.05].map((x, i) => (
        <mesh key={`shoe-${i}`} position={[x, 0.07, 0]} castShadow>
          <boxGeometry args={[0.09, 0.1, 0.14]} />
          <meshStandardMaterial color="#713f12" roughness={0.8} />
        </mesh>
      ))}
      {[-0.05, 0.05].map((x, i) => (
        <mesh key={`leg-${i}`} position={[x, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.038, 0.042, 0.2, 8]} />
          <meshStandardMaterial color="#374151" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 0.44, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.3, 8]} />
        <meshStandardMaterial color="#065f46" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.67, 0]} castShadow>
        <sphereGeometry args={[0.088, 12, 12]} />
        <meshStandardMaterial color="#fde8d8" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.73, 0]} castShadow>
        <sphereGeometry args={[0.092, 12, 12]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.7} />
      </mesh>
      <mesh position={[0.14, 0.35, 0.16]} rotation={[Math.PI * 0.15, 0, -Math.PI * 0.08]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.72, 6]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>
      <mesh position={[0.21, 0.04, 0.3]}>
        <sphereGeometry args={[0.016, 6, 6]} />
        <meshStandardMaterial color="#ef4444" roughness={0.5} />
      </mesh>
      {isAtGoal && (
        <mesh position={[0, 0.85, 0]}>
          <octahedronGeometry args={[0.07, 0]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={2.5} />
        </mesh>
      )}
    </group>
  );
}));
Elena3D.displayName = 'Elena3D';

export const Henderson3D = React.memo(React.forwardRef<THREE.Group, CharacterProps>(({
  isSimulating = false,
  isAtGoal = false,
}, forwardedRef) => {
  const groupRef = useRef<THREE.Group>(null);

  useImperativeHandle(forwardedRef, () => groupRef.current!);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    if (isSimulating) {
      groupRef.current.position.y = Math.sin(t * 1.8) * 0.014;
    } else {
      groupRef.current.position.y = Math.sin(t * 1.1) * 0.007;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>
      {([-0.05, 0.05] as number[]).map((x, i) => (
        <mesh key={`shoe-${i}`} position={[x, 0.065, 0]} castShadow>
          <boxGeometry args={[0.09, 0.09, 0.16]} />
          <meshStandardMaterial color="#5c2b16" roughness={0.85} />
        </mesh>
      ))}
      {([-0.05, 0.05] as number[]).map((x, i) => (
        <mesh key={`leg-${i}`} position={[x, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.044, 0.22, 8]} />
          <meshStandardMaterial color="#1e3a5f" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 0.46, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.155, 0.32, 8]} />
        <meshStandardMaterial color="#a16207" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.66, 0]} castShadow>
        <sphereGeometry args={[0.083, 12, 12]} />
        <meshStandardMaterial color="#c8946a" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.715, 0]} castShadow>
        <sphereGeometry args={[0.088, 12, 12]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.7} />
      </mesh>
      <mesh position={[-0.18, 0.31, 0.06]} rotation={[Math.PI * 0.06, 0, Math.PI * 0.07]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.54, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>
      <mesh position={[-0.18, 0.59, 0.06]}>
        <torusGeometry args={[0.022, 0.008, 6, 8, Math.PI * 0.85]} />
        <meshStandardMaterial color="#5c2b16" roughness={0.75} />
      </mesh>
      {isAtGoal && (
        <mesh position={[0, 0.84, 0]}>
          <octahedronGeometry args={[0.07, 0]} />
          <meshStandardMaterial color="#eab308" emissive="#eab308" emissiveIntensity={2.5} />
        </mesh>
      )}
    </group>
  );
}));
Henderson3D.displayName = 'Henderson3D';
