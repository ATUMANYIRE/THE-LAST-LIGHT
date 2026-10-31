'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

// ─── Shared geometry instances ───────────────────────────────────────────────

const Tree: React.FC<{ pos: [number, number, number]; scale?: number; style?: 'pine' | 'round' | 'tall' }> = ({ pos, scale = 1, style = 'pine' }) => (
  <group position={pos} scale={scale}>
    <mesh position={[0, 0.3, 0]} castShadow>
      <cylinderGeometry args={[0.07, 0.11, 0.6, 6]} />
      <meshStandardMaterial color="#7A5A3A" roughness={0.9} />
    </mesh>
    {style === 'round' && (
      <>
        <mesh position={[0, 0.9, 0]} castShadow>
          <sphereGeometry args={[0.44, 8, 6]} />
          <meshStandardMaterial color="#4A6741" roughness={0.88} />
        </mesh>
        <mesh position={[0.2, 0.68, 0.14]} castShadow>
          <sphereGeometry args={[0.28, 7, 5]} />
          <meshStandardMaterial color="#6B8A60" roughness={0.88} />
        </mesh>
      </>
    )}
    {style === 'pine' && (
      <>
        <mesh position={[0, 0.78, 0]} castShadow>
          <coneGeometry args={[0.46, 0.88, 7]} />
          <meshStandardMaterial color="#4A6741" roughness={0.88} />
        </mesh>
        <mesh position={[0, 1.25, 0]} castShadow>
          <coneGeometry args={[0.3, 0.65, 6]} />
          <meshStandardMaterial color="#5A7850" roughness={0.88} />
        </mesh>
        <mesh position={[0, 1.62, 0]} castShadow>
          <coneGeometry args={[0.18, 0.45, 5]} />
          <meshStandardMaterial color="#6B8A60" roughness={0.88} />
        </mesh>
      </>
    )}
    {style === 'tall' && (
      <>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.09, 1.0, 6]} />
          <meshStandardMaterial color="#7A5A3A" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.3, 0]} castShadow>
          <sphereGeometry args={[0.38, 8, 6]} />
          <meshStandardMaterial color="#3D5A38" roughness={0.88} />
        </mesh>
        <mesh position={[-0.18, 1.5, 0.1]} castShadow>
          <sphereGeometry args={[0.22, 7, 5]} />
          <meshStandardMaterial color="#5A7850" roughness={0.88} />
        </mesh>
        <mesh position={[0.15, 1.45, -0.12]} castShadow>
          <sphereGeometry args={[0.2, 7, 5]} />
          <meshStandardMaterial color="#4A6741" roughness={0.88} />
        </mesh>
      </>
    )}
  </group>
);

const Hedge: React.FC<{ pos: [number, number, number]; size: [number, number, number] }> = ({ pos, size }) => (
  <group position={pos}>
    <mesh position={[0, size[1] / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#5A7850" roughness={0.92} />
    </mesh>
    <mesh position={[0, size[1] + 0.05, 0]}>
      <boxGeometry args={[size[0] + 0.06, 0.1, size[2] + 0.06]} />
      <meshStandardMaterial color="#6B8A60" roughness={0.88} />
    </mesh>
  </group>
);

// Street lamp
const StreetLamp: React.FC<{ pos: [number, number, number]; isNight?: boolean }> = ({ pos, isNight = false }) => (
  <group position={pos}>
    <mesh position={[0, 0.1, 0]} castShadow>
      <cylinderGeometry args={[0.06, 0.09, 0.2, 7]} />
      <meshStandardMaterial color="#6A6058" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.7, 0]} castShadow>
      <cylinderGeometry args={[0.022, 0.03, 1.0, 7]} />
      <meshStandardMaterial color="#5A5248" metalness={0.6} roughness={0.4} />
    </mesh>
    <mesh position={[0.22, 1.12, 0]}>
      <boxGeometry args={[0.38, 0.04, 0.04]} />
      <meshStandardMaterial color="#5A5248" metalness={0.5} roughness={0.5} />
    </mesh>
    <mesh position={[0.22, 1.1, 0]}>
      <sphereGeometry args={[0.09, 9, 7]} />
      <meshStandardMaterial
        color="#D4B080"
        emissive="#D4B080"
        emissiveIntensity={isNight ? 2.5 : 0.4}
        roughness={0.3}
      />
    </mesh>
    {isNight && (
      <pointLight position={[0.22, 1.18, 0]} color="#D4B080" intensity={1.2} distance={4.5} decay={2} />
    )}
  </group>
);

// Park bench
const Bench: React.FC<{ pos: [number, number, number]; rot?: number }> = ({ pos, rot = 0 }) => (
  <group position={pos} rotation={[0, rot, 0]}>
    <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.6, 0.06, 0.22]} />
      <meshStandardMaterial color="#8A6A40" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.38, -0.08]} castShadow>
      <boxGeometry args={[0.6, 0.28, 0.05]} />
      <meshStandardMaterial color="#8A6A40" roughness={0.8} />
    </mesh>
    {[-0.24, 0.24].map((x, i) => (
      <mesh key={i} position={[x, 0.11, 0]} castShadow>
        <boxGeometry args={[0.05, 0.22, 0.22]} />
        <meshStandardMaterial color="#6A5030" roughness={0.85} />
      </mesh>
    ))}
  </group>
);

// Planter / flower box
const Planter: React.FC<{ pos: [number, number, number] }> = ({ pos }) => (
  <group position={pos}>
    <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.38, 0.24, 0.24]} />
      <meshStandardMaterial color="#8A6A50" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.28, 0]}>
      <boxGeometry args={[0.32, 0.12, 0.18]} />
      <meshStandardMaterial color="#4A6741" roughness={0.9} />
    </mesh>
    {[-0.1, 0.0, 0.1].map((x, i) => (
      <mesh key={i} position={[x, 0.36, 0]}>
        <sphereGeometry args={[0.07, 6, 5]} />
        <meshStandardMaterial color={['#C05A48', '#E8B830', '#8D9B87'][i]} roughness={0.7} />
      </mesh>
    ))}
  </group>
);

// Parked car (simple but readable silhouette)
const ParkedCar: React.FC<{ pos: [number, number, number]; rot?: number; color?: string }> = ({
  pos, rot = 0, color = '#8A9080',
}) => (
  <group position={pos} rotation={[0, rot, 0]}>
    {/* Body */}
    <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.9, 0.28, 0.46]} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
    </mesh>
    {/* Cabin */}
    <mesh position={[0, 0.46, 0.02]} castShadow>
      <boxGeometry args={[0.58, 0.22, 0.38]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.25} />
    </mesh>
    {/* Windshield */}
    <mesh position={[0, 0.47, 0.2]}>
      <boxGeometry args={[0.5, 0.18, 0.02]} />
      <meshStandardMaterial color="#88AABB" transparent opacity={0.6} roughness={0.1} metalness={0.1} />
    </mesh>
    {/* Wheels */}
    {[[-0.36, -0.18], [-0.36, 0.18], [0.36, -0.18], [0.36, 0.18]].map(([x, z], i) => (
      <mesh key={i} position={[x as number, 0.1, z as number]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.1, 10]} />
        <meshStandardMaterial color="#282020" roughness={0.9} />
      </mesh>
    ))}
  </group>
);

// Background building — varied facades
const BackgroundBuilding: React.FC<{
  pos: [number, number, number];
  w?: number; h?: number; d?: number;
  wallColor?: string;
  roofColor?: string;
  windows?: boolean;
  isNight?: boolean;
}> = ({ pos, w = 1.2, h = 1.6, d = 0.9, wallColor = '#DDD7CB', roofColor = '#8A7A6A', windows = true, isNight = false }) => (
  <group position={pos}>
    <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={wallColor} roughness={0.75} />
    </mesh>
    {/* Flat parapet */}
    <mesh position={[0, h + 0.05, 0]} castShadow>
      <boxGeometry args={[w + 0.06, 0.1, d + 0.06]} />
      <meshStandardMaterial color={roofColor} roughness={0.7} />
    </mesh>
    {/* Simple window grid */}
    {windows && [0.3, 0.65].map((yf, row) =>
      [-0.28, 0.0, 0.28].filter(() => w > 0.9).map((xo, col) => (
        <mesh key={`w-${row}-${col}`} position={[xo, h * yf, d / 2 + 0.01]}>
          <boxGeometry args={[0.14, 0.18, 0.01]} />
          <meshStandardMaterial
            color={isNight ? '#F0D070' : '#C8DDED'}
            emissive={isNight ? '#F0D070' : '#C8DDED'}
            emissiveIntensity={isNight ? 1.8 : 0.12}
            roughness={0.1}
          />
        </mesh>
      ))
    )}
  </group>
);

// Pedestrian (ambient, non-interactive)
const AmbientPedestrian: React.FC<{ startPos: [number, number, number]; color?: string }> = ({ startPos, color = '#8A7060' }) => {
  const ref = useRef<THREE.Group>(null);
  const { currentChapterId } = useGameStore();
  const phase = useRef(Math.random() * Math.PI * 2);
  const radius = 0.8 + Math.random() * 0.6;
  const speed = 0.3 + Math.random() * 0.2;
  // Stationary in night chapter — people stay indoors during blackout
  if (currentChapterId === 3) return null;
  return (
    <group ref={ref} position={startPos}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <sphereGeometry args={[0.11, 8, 7]} />
        <meshStandardMaterial color="#D4AA80" roughness={0.8} />
      </mesh>
    </group>
  );
};

// Walking pedestrian with frame animation
const WalkingPedestrian: React.FC<{ centerPos: [number, number, number]; radius?: number; speed?: number; color?: string }> = ({
  centerPos, radius = 1.2, speed = 0.25, color = '#7A8090',
}) => {
  const ref = useRef<THREE.Group>(null);
  const t0 = useRef(Math.random() * Math.PI * 2);
  const { currentChapterId } = useGameStore();
  useFrame(({ clock }) => {
    if (!ref.current || currentChapterId === 3) return;
    const t = clock.getElapsedTime() * speed + t0.current;
    ref.current.position.x = centerPos[0] + Math.cos(t) * radius;
    ref.current.position.z = centerPos[2] + Math.sin(t) * radius * 0.5;
    ref.current.rotation.y = -t + Math.PI / 2;
    // Subtle bob
    ref.current.position.y = centerPos[1] + Math.abs(Math.sin(t * 3.5)) * 0.03;
  });
  if (currentChapterId === 3) return null;
  return (
    <group ref={ref} position={centerPos}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.38, 4, 7]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.94, 0]} castShadow>
        <sphereGeometry args={[0.1, 7, 6]} />
        <meshStandardMaterial color="#C8A878" roughness={0.8} />
      </mesh>
    </group>
  );
};

// Road marking strip
const RoadStripe: React.FC<{ pos: [number, number, number]; w: number; d: number }> = ({ pos, w, d }) => (
  <mesh position={pos}>
    <boxGeometry args={[w, 0.005, d]} />
    <meshStandardMaterial color="#F0E8D0" roughness={0.5} />
  </mesh>
);

// ─── Main Environment ────────────────────────────────────────────────────────

interface EnvironmentProps {
  gridW: number;
  gridH: number;
}

export const Environment3D: React.FC<EnvironmentProps> = ({ gridW, gridH }) => {
  const { currentChapterId } = useGameStore();
  const hw = gridW / 2;
  const hh = gridH / 2;
  const isNight = currentChapterId === 3;
  const isDusk = currentChapterId === 2;

  return (
    <group>
      {/* ── Deep outer terrain ── */}
      <mesh position={[0, -0.18, 0]} receiveShadow>
        <boxGeometry args={[gridW + 24, 0.36, gridH + 24]} />
        <meshStandardMaterial color={isNight ? '#2A3428' : '#8A9E78'} roughness={0.95} />
      </mesh>

      {/* ── Mid grass/pavement ── */}
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[gridW + 10, 0.18, gridH + 10]} />
        <meshStandardMaterial color={isNight ? '#323A30' : '#9EB08C'} roughness={0.92} />
      </mesh>

      {/* ── Stone plaza surround ── */}
      <mesh position={[0, -0.015, 0]} receiveShadow>
        <boxGeometry args={[gridW + 2.4, 0.05, gridH + 2.4]} />
        <meshStandardMaterial color="#C4B49A" roughness={0.85} metalness={0.03} />
      </mesh>

      {/* ── NORTH road ── */}
      <mesh position={[0, -0.025, -(hh + 5)]} receiveShadow>
        <boxGeometry args={[3.2, 0.06, 10]} />
        <meshStandardMaterial color="#8A8480" roughness={0.88} />
      </mesh>
      <RoadStripe pos={[-0.7, -0.01, -(hh + 5)]} w={0.07} d={8} />
      <RoadStripe pos={[0.7, -0.01, -(hh + 5)]} w={0.07} d={8} />

      {/* ── EAST road ── */}
      <mesh position={[(hw + 5), -0.025, 0]} receiveShadow>
        <boxGeometry args={[10, 0.06, 3.2]} />
        <meshStandardMaterial color="#8A8480" roughness={0.88} />
      </mesh>
      <RoadStripe pos={[(hw + 5), -0.01, -0.7]} w={8} d={0.07} />
      <RoadStripe pos={[(hw + 5), -0.01, 0.7]} w={8} d={0.07} />

      {/* ── SOUTH road ── */}
      <mesh position={[0, -0.025, (hh + 5)]} receiveShadow>
        <boxGeometry args={[3.2, 0.06, 10]} />
        <meshStandardMaterial color="#8A8480" roughness={0.88} />
      </mesh>

      {/* ── WEST road ── */}
      <mesh position={[-(hw + 5), -0.025, 0]} receiveShadow>
        <boxGeometry args={[10, 0.06, 3.2]} />
        <meshStandardMaterial color="#8A8480" roughness={0.88} />
      </mesh>

      {/* ── Perimeter hedges ── */}
      <Hedge pos={[0, 0, -(hh + 1.0)]} size={[gridW + 2.4, 0.52, 0.5]} />
      <Hedge pos={[0, 0, hh + 1.0]} size={[gridW + 2.4, 0.52, 0.5]} />
      <Hedge pos={[-(hw + 1.0), 0, 0]} size={[0.5, 0.52, gridH + 2.4]} />
      <Hedge pos={[hw + 1.0, 0, 0]} size={[0.5, 0.52, gridH + 2.4]} />

      {/* ── Street lamps (corner + mid) ── */}
      {([
        [-(hw + 1.0), 0, -(hh + 1.0)],
        [hw + 1.0, 0, -(hh + 1.0)],
        [-(hw + 1.0), 0, hh + 1.0],
        [hw + 1.0, 0, hh + 1.0],
        [0, 0, -(hh + 3.5)],
        [(hw + 3.5), 0, 0],
        [0, 0, (hh + 3.5)],
        [-(hw + 3.5), 0, 0],
      ] as Array<[number, number, number]>).map((p, i) => (
        <StreetLamp key={i} pos={p} isNight={isNight} />
      ))}

      {/* ── NORTH block — cluster of background buildings ── */}
      <BackgroundBuilding pos={[-3.5, 0, -(hh + 4.5)]} w={1.8} h={2.4} d={1.0} wallColor="#DDD7CB" roofColor="#7A6858" isNight={isNight} />
      <BackgroundBuilding pos={[-1.6, 0, -(hh + 4.8)]} w={1.2} h={1.8} d={0.9} wallColor="#C4B8A8" roofColor="#B56A50" isNight={isNight} />
      <BackgroundBuilding pos={[0.4, 0, -(hh + 4.6)]} w={1.5} h={2.8} d={1.0} wallColor="#E8DED0" roofColor="#6A5848" isNight={isNight} />
      <BackgroundBuilding pos={[2.2, 0, -(hh + 4.4)]} w={1.3} h={1.6} d={0.85} wallColor="#A9C7D8" roofColor="#5A6A70" isNight={isNight} />
      <BackgroundBuilding pos={[3.8, 0, -(hh + 4.9)]} w={2.0} h={3.2} d={1.1} wallColor="#D8D0C4" roofColor="#8A7A6A" isNight={isNight} />

      {/* ── SOUTH block ── */}
      <BackgroundBuilding pos={[-2.8, 0, (hh + 4.5)]} w={1.6} h={2.0} d={1.0} wallColor="#E2D8C8" roofColor="#B56A50" isNight={isNight} />
      <BackgroundBuilding pos={[-0.8, 0, (hh + 4.8)]} w={1.4} h={1.4} d={0.85} wallColor="#C8B8A8" roofColor="#7A6858" isNight={isNight} />
      <BackgroundBuilding pos={[1.2, 0, (hh + 4.4)]} w={1.8} h={2.6} d={1.0} wallColor="#DED4C4" roofColor="#6A5848" isNight={isNight} />
      <BackgroundBuilding pos={[3.2, 0, (hh + 4.7)]} w={1.2} h={1.8} d={0.9} wallColor="#A8B8C0" roofColor="#5A6A70" isNight={isNight} />

      {/* ── EAST block ── */}
      <BackgroundBuilding pos={[(hw + 4.5), 0, -2.5]} w={1.0} h={2.2} d={1.4} wallColor="#DDD7CB" roofColor="#7A6858" isNight={isNight} />
      <BackgroundBuilding pos={[(hw + 4.8), 0, -0.5]} w={0.9} h={1.6} d={1.2} wallColor="#C4BAA8" roofColor="#B56A50" isNight={isNight} />
      <BackgroundBuilding pos={[(hw + 4.5), 0, 1.5]} w={1.1} h={2.8} d={1.3} wallColor="#E8DED0" roofColor="#6A7050" isNight={isNight} />
      <BackgroundBuilding pos={[(hw + 4.8), 0, 3.5]} w={1.0} h={1.5} d={1.1} wallColor="#A9C7D8" roofColor="#5A6878" isNight={isNight} />

      {/* ── WEST block ── */}
      <BackgroundBuilding pos={[-(hw + 4.5), 0, -2.0]} w={1.0} h={2.0} d={1.3} wallColor="#DDD7CB" roofColor="#8A7A6A" isNight={isNight} />
      <BackgroundBuilding pos={[-(hw + 4.8), 0, 0.2]} w={0.9} h={2.6} d={1.2} wallColor="#D0C8B8" roofColor="#6A5848" isNight={isNight} />
      <BackgroundBuilding pos={[-(hw + 4.5), 0, 2.4]} w={1.1} h={1.6} d={1.0} wallColor="#E2D8C8" roofColor="#B56A50" isNight={isNight} />

      {/* ── Benches along perimeter paths ── */}
      <Bench pos={[-(hw - 0.5), 0.0, -(hh + 0.6)]} rot={0} />
      <Bench pos={[hw - 0.5, 0.0, hh + 0.6]} rot={Math.PI} />
      <Bench pos={[-(hw + 0.6), 0.0, 0.5]} rot={Math.PI / 2} />

      {/* ── Planters ── */}
      <Planter pos={[-(hw - 0.2), 0, -(hh + 0.6)]} />
      <Planter pos={[hw - 0.2, 0, hh + 0.6]} />
      <Planter pos={[-(hw + 0.6), 0, -0.6]} />
      <Planter pos={[hw + 0.6, 0, 1.0]} />

      {/* ── Parked cars on north & south roads ── */}
      <ParkedCar pos={[-1.6, 0, -(hh + 3.2)]} rot={0} color="#8A9080" />
      <ParkedCar pos={[1.0, 0, -(hh + 3.2)]} rot={Math.PI} color="#A09080" />
      <ParkedCar pos={[-0.8, 0, (hh + 3.4)]} rot={Math.PI} color="#7A8898" />
      <ParkedCar pos={[1.4, 0, (hh + 3.2)]} rot={0} color="#C0A880" />

      {/* ── Parked cars on east road ── */}
      <ParkedCar pos={[(hw + 3.2), 0, -0.8]} rot={Math.PI / 2} color="#9A8878" />
      <ParkedCar pos={[(hw + 3.8), 0, 1.0]} rot={-Math.PI / 2} color="#88A090" />

      {/* ── Corner trees ── */}
      <Tree pos={[-(hw + 2.2), 0, -(hh + 2.0)]} scale={1.1} style="pine" />
      <Tree pos={[hw + 2.2, 0, -(hh + 2.0)]} scale={0.95} style="round" />
      <Tree pos={[-(hw + 2.0), 0, hh + 2.2]} scale={1.05} style="tall" />
      <Tree pos={[hw + 2.2, 0, hh + 2.0]} scale={0.9} style="pine" />

      {/* ── Street trees alongside roads ── */}
      <Tree pos={[-(hw + 2.5), 0, 0]} scale={0.85} style="round" />
      <Tree pos={[hw + 2.5, 0, 0.5]} scale={0.95} style="tall" />
      <Tree pos={[-1.0, 0, -(hh + 2.2)]} scale={0.82} style="pine" />
      <Tree pos={[1.5, 0, hh + 2.3]} scale={0.9} style="round" />
      <Tree pos={[3.0, 0, -(hh + 2.8)]} scale={0.78} style="tall" />
      <Tree pos={[-2.5, 0, hh + 2.6]} scale={0.88} style="pine" />

      {/* ── Background depth trees ── */}
      <Tree pos={[-(hw + 4.0), 0, -(hh + 2.0)]} scale={0.75} style="pine" />
      <Tree pos={[hw + 3.8, 0, hh + 1.2]} scale={0.7} style="round" />
      <Tree pos={[hw + 2.0, 0, -(hh + 3.5)]} scale={0.88} style="tall" />
      <Tree pos={[-(hw + 2.5), 0, hh + 3.2]} scale={0.78} style="round" />
      <Tree pos={[0, 0, -(hh + 4.8)]} scale={0.7} style="pine" />
      <Tree pos={[-(hw + 1.5), 0, -(hh + 4.5)]} scale={0.65} style="tall" />
      <Tree pos={[-(hw + 5.5), 0, 1.5]} scale={0.72} style="round" />
      <Tree pos={[hw + 5.5, 0, -1.0]} scale={0.68} style="pine" />
      <Tree pos={[2.5, 0, hh + 5.0]} scale={0.62} style="tall" />
      <Tree pos={[-3.0, 0, -(hh + 5.5)]} scale={0.6} style="round" />

      {/* ── Ambient pedestrians (Ch1 + Ch2 only) ── */}
      {!isNight && (
        <>
          <WalkingPedestrian centerPos={[-(hw + 2.8), 0, -0.5]} radius={0.8} speed={0.18} color="#7A8898" />
          <WalkingPedestrian centerPos={[1.0, 0, -(hh + 3.0)]} radius={0.6} speed={0.22} color="#A09878" />
          {isDusk && (
            <>
              <WalkingPedestrian centerPos={[hw + 3.0, 0, 0.8]} radius={0.7} speed={0.15} color="#8A9080" />
              <AmbientPedestrian startPos={[-0.5, 0, -(hh + 3.8)]} color="#C0A080" />
            </>
          )}
        </>
      )}
    </group>
  );
};
