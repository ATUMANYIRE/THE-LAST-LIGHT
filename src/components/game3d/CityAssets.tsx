'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';

// Warm storybook city palette — daylight aesthetic
export const PALETTE = {
  // Ground & hardscape
  nightGround: '#1A2830',       // kept for Ch3 dark ground
  cobblestone: '#B8A88A',       // warm sandstone cobbles
  cobblestoneLight: '#D0BEA4',  // lighter stone highlight
  pavedWalkway: '#A89878',      // paved stone path
  pavedHighlight: '#C87D70',    // coral hover highlight
  // Building walls
  wallIvory: '#F2EDE4',
  wallLimestone: '#DDD7CB',
  wallWarm: '#E8D9C4',
  brickRed: '#C87060',          // warm terracotta brick
  brickDark: '#9A5040',
  wallOatmeal: '#E4DAC8',
  wallWarmCream: '#F0E4C4',
  wallMidnightBlue: '#2A3A4A',  // reserved for Ch3
  wallSage: '#8D9B87',
  // Roofs
  woodBrown: '#8A5A30',
  roofSlate: '#8A9BA8',         // cool slate grey
  roofTerracotta: '#B56A50',    // warm terracotta
  roofCopper: '#7A9A78',        // muted green copper
  roofDarkGreen: '#4A6741',
  // Windows
  windowGlow: '#F0D080',        // warm window glow (night)
  windowGlowHot: '#FFF0A0',
  windowDay: '#C8DDED',         // daytime sky reflection
  lanternGold: '#B59A67',       // brass lantern
  // Infrastructure
  rampMetal: '#A0A890',
  rampHandrail: '#B59A67',
  hazardYellow: '#C8A030',
  hazardBlack: '#3A3028',
  // Foliage
  foliageDeep: '#4A6741',
  foliageMid: '#6B8A60',
  foliageMint: '#8DAD82',
  foliageSage: '#8D9B87',
  barkBrown: '#7A5A3A',
};

// Reusable window material — sky-reflection blue during day, warm amber glow in Ch3
export const WindowMaterial = ({ intensity = 0.3 }: { intensity?: number }) => {
  const { currentChapterId } = useGameStore();
  const night = currentChapterId === 3;
  return (
    <meshStandardMaterial
      color={night ? PALETTE.windowGlow : PALETTE.windowDay}
      emissive={night ? PALETTE.windowGlow : PALETTE.windowDay}
      emissiveIntensity={night ? intensity * 1.4 : 0.15}
      roughness={0.1}
      metalness={0.15}
    />
  );
};

/**
 * Procedural Ground Cobblestone Block for an individual tile
 */
export const CobblestoneTile: React.FC<{
  isHighlighted?: boolean;
  isLit?: boolean;
  hasPaved?: boolean;
}> = ({ isHighlighted, isLit = true, hasPaved = false }) => {
  return (
    <group position={[0, 0, 0]}>
      {/* Base slab */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[0.96, 0.1, 0.96]} />
        <meshStandardMaterial
          color={
            hasPaved
              ? isHighlighted
                ? PALETTE.pavedHighlight
                : PALETTE.pavedWalkway
              : isLit
              ? PALETTE.cobblestone
              : PALETTE.nightGround
          }
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Decorative sidewalk curb border */}
      <mesh position={[0, 0.105, 0]} receiveShadow>
        <boxGeometry args={[0.92, 0.02, 0.92]} />
        <meshStandardMaterial
          color={isLit ? PALETTE.cobblestoneLight : PALETTE.nightGround}
          roughness={0.9}
        />
      </mesh>

      {/* Subtle stone paver insets */}
      {hasPaved && (
        <group position={[0, 0.12, 0]}>
          <mesh position={[-0.22, 0, -0.22]}>
            <boxGeometry args={[0.4, 0.015, 0.4]} />
            <meshStandardMaterial color="#B0A090" roughness={0.7} />
          </mesh>
          <mesh position={[0.22, 0, 0.22]}>
            <boxGeometry args={[0.4, 0.015, 0.4]} />
            <meshStandardMaterial color="#B0A090" roughness={0.7} />
          </mesh>
          <mesh position={[-0.22, 0, 0.22]}>
            <boxGeometry args={[0.38, 0.015, 0.38]} />
            <meshStandardMaterial color="#A09080" roughness={0.7} />
          </mesh>
          <mesh position={[0.22, 0, -0.22]}>
            <boxGeometry args={[0.38, 0.015, 0.38]} />
            <meshStandardMaterial color="#A09080" roughness={0.7} />
          </mesh>
        </group>
      )}
    </group>
  );
};

/**
 * Historic Sunken Stone Stairs (Tile 3, 2 in Chapter 1)
 * Without a ramp, Sam's wheelchair cannot traverse this 3-step vertical barrier.
 */
export const SunkenStoneStairs: React.FC<{ hasRamp?: boolean }> = ({ hasRamp = false }) => {
  return (
    <group position={[0, 0, 0]}>
      {/* Sunken cut-out trench */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[0.96, 0.2, 0.96]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>

      {/* 3 Stone steps descending across X axis from Maya's side (west) to library (east) */}
      <mesh position={[-0.28, 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.16, 0.88]} />
        <meshStandardMaterial color="#9A8870" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.12, 0.88]} />
        <meshStandardMaterial color="#A89878" roughness={0.8} />
      </mesh>
      <mesh position={[0.28, -0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.08, 0.88]} />
        <meshStandardMaterial color="#C0B09A" roughness={0.8} />
      </mesh>

      {/* If a Modular Ramp has been installed over the stairs */}
      {hasRamp && (
        <group position={[0, 0.08, 0]}>
          {/* Smooth sloped ramp plane */}
          <mesh rotation={[0, 0, -0.16]} position={[0, -0.01, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.94, 0.04, 0.65]} />
            <meshStandardMaterial
              color={PALETTE.rampMetal}
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>

          {/* Yellow high-contrast tactile edge strips */}
          <mesh rotation={[0, 0, -0.16]} position={[0, 0.015, -0.31]}>
            <boxGeometry args={[0.94, 0.02, 0.04]} />
            <meshStandardMaterial color={PALETTE.hazardYellow} roughness={0.4} />
          </mesh>
          <mesh rotation={[0, 0, -0.16]} position={[0, 0.015, 0.31]}>
            <boxGeometry args={[0.94, 0.02, 0.04]} />
            <meshStandardMaterial color={PALETTE.hazardYellow} roughness={0.4} />
          </mesh>

          {/* Safety Handrails on both sides */}
          {[-0.32, 0.32].map((zOffset, i) => (
            <group key={`handrail-${i}`} position={[0, 0.15, zOffset]}>
              {/* Rail bar */}
              <mesh rotation={[0, 0, -0.16]}>
                <cylinderGeometry args={[0.015, 0.015, 0.94, 8]} />
                <meshStandardMaterial color={PALETTE.rampHandrail} metalness={0.8} roughness={0.2} />
              </mesh>
              {/* Vertical stanchion posts */}
              <mesh position={[-0.35, -0.1, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.22, 8]} />
                <meshStandardMaterial color={PALETTE.rampMetal} metalness={0.7} roughness={0.3} />
              </mesh>
              <mesh position={[0, -0.1, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.22, 8]} />
                <meshStandardMaterial color={PALETTE.rampMetal} metalness={0.7} roughness={0.3} />
              </mesh>
              <mesh position={[0.35, -0.1, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 0.22, 8]} />
                <meshStandardMaterial color={PALETTE.rampMetal} metalness={0.7} roughness={0.3} />
              </mesh>
            </group>
          ))}

          {/* Tactile Warning Ground Studs at ramp foot */}
          <mesh position={[0.42, -0.05, 0]}>
            <boxGeometry args={[0.1, 0.01, 0.6]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
};

/**
 * Maya's Home & Stoop (Tile 1, 1)
 * Warm terracotta rowhouse with white window frames, proper hip roof, flower box, chimney cap.
 */
export const MayasHouse: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Stone foundation plinth */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.16, 0.85]} />
        <meshStandardMaterial color="#8b7355" roughness={0.85} />
      </mesh>

      {/* Main brick body — warm terracotta */}
      <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.82, 1.24, 0.82]} />
        <meshStandardMaterial color="#c05621" roughness={0.72} />
      </mesh>

      {/* Front Entrance Door with surround */}
      <mesh position={[0.22, 0.34, 0.42]}>
        <boxGeometry args={[0.26, 0.54, 0.015]} />
        <meshStandardMaterial color="#f8f4ec" roughness={0.6} />
      </mesh>
      <mesh position={[0.22, 0.34, 0.43]} castShadow>
        <boxGeometry args={[0.22, 0.5, 0.02]} />
        <meshStandardMaterial color={PALETTE.woodBrown} roughness={0.6} />
      </mesh>
      {/* Door Handle */}
      <mesh position={[0.31, 0.34, 0.45]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#fef08a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Ground-Floor Window with white frame + cross-bars */}
      <mesh position={[-0.2, 0.47, 0.42]}>
        <boxGeometry args={[0.32, 0.38, 0.014]} />
        <meshStandardMaterial color="#f8f4ec" roughness={0.5} />
      </mesh>
      <mesh position={[-0.2, 0.47, 0.424]}>
        <boxGeometry args={[0.28, 0.34, 0.01]} />
        <WindowMaterial intensity={2.4} />
      </mesh>
      <mesh position={[-0.2, 0.47, 0.426]}>
        <boxGeometry args={[0.28, 0.012, 0.012]} />
        <meshStandardMaterial color="#f8f4ec" roughness={0.4} />
      </mesh>
      <mesh position={[-0.2, 0.47, 0.426]}>
        <boxGeometry args={[0.012, 0.34, 0.012]} />
        <meshStandardMaterial color="#f8f4ec" roughness={0.4} />
      </mesh>

      {/* Flower box below ground-floor window */}
      <mesh position={[-0.2, 0.27, 0.44]}>
        <boxGeometry args={[0.3, 0.06, 0.08]} />
        <meshStandardMaterial color="#7c4a1e" roughness={0.7} />
      </mesh>
      {/* Flower blooms */}
      {[-0.1, -0.02, 0.06].map((x, i) => (
        <mesh key={`fl-${i}`} position={[-0.2 + x * 2, 0.32, 0.44]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial
            color={i === 1 ? '#fbbf24' : '#f43f5e'}
            emissive={i === 1 ? '#fbbf24' : '#f43f5e'}
            emissiveIntensity={0.5}
            roughness={0.6}
          />
        </mesh>
      ))}

      {/* Upper-Floor Windows with white frames */}
      {[-0.22, 0.22].map((x, i) => (
        <group key={`uw-${i}`}>
          <mesh position={[x, 0.96, 0.42]}>
            <boxGeometry args={[0.28, 0.32, 0.014]} />
            <meshStandardMaterial color="#f8f4ec" roughness={0.5} />
          </mesh>
          <mesh position={[x, 0.96, 0.424]}>
            <boxGeometry args={[0.24, 0.28, 0.01]} />
            <WindowMaterial intensity={1.9} />
          </mesh>
          <mesh position={[x, 0.96, 0.426]}>
            <boxGeometry args={[0.24, 0.012, 0.012]} />
            <meshStandardMaterial color="#f8f4ec" roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Hip Roof — corner-aligned */}
      <mesh position={[0, 1.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.67, 0.56, 4]} />
        <meshStandardMaterial color="#8A7A6A" roughness={0.6} />
      </mesh>

      {/* Chimney */}
      <mesh position={[-0.24, 1.65, -0.16]} castShadow>
        <boxGeometry args={[0.14, 0.44, 0.14]} />
        <meshStandardMaterial color="#9a3412" roughness={0.8} />
      </mesh>
      {/* Chimney cap */}
      <mesh position={[-0.24, 1.9, -0.16]}>
        <boxGeometry args={[0.19, 0.04, 0.19]} />
        <meshStandardMaterial color="#8A5A3A" roughness={0.9} />
      </mesh>
      {/* Chimney cap overhang */}
      <mesh position={[-0.24, 1.88, -0.16]}>
        <boxGeometry args={[0.22, 0.02, 0.22]} />
        <meshStandardMaterial color="#8A6A4A" roughness={0.9} />
      </mesh>

      {/* Front Stoop */}
      <mesh position={[0.22, 0.1, 0.5]} receiveShadow>
        <boxGeometry args={[0.3, 0.14, 0.2]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.8} />
      </mesh>
    </group>
  );
};

/**
 * Sam's Apartment (Tile 1, 2)
 * The home of the Invisible Resident. Features a bay window, accessible entrance, and studio illumination.
 */
export const SamsApartment: React.FC<{ isRevealed?: boolean }> = ({ isRevealed = false }) => {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (lightRef.current && isRevealed) {
      // Gentle breathing pulse when Sam is revealed
      lightRef.current.intensity = 1.8 + Math.sin(clock.getElapsedTime() * 3) * 0.4;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Apartment Main Building */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 1.5, 0.85]} />
        <meshStandardMaterial color="#A9C7D8" roughness={0.68} />
      </mesh>

      {/* Ground floor zero-step entry */}
      <mesh position={[0.2, 0.35, 0.44]}>
        <boxGeometry args={[0.26, 0.55, 0.02]} />
        <meshStandardMaterial color="#DDD7CB" roughness={0.5} />
      </mesh>

      {/* Bay Window Projection (Sam's Art Studio) */}
      <mesh position={[-0.18, 0.45, 0.46]} castShadow>
        <boxGeometry args={[0.38, 0.4, 0.12]} />
        <meshStandardMaterial color="#8D9B87" roughness={0.6} />
      </mesh>
      <mesh position={[-0.18, 0.45, 0.53]}>
        <boxGeometry args={[0.34, 0.34, 0.02]} />
        <WindowMaterial intensity={isRevealed ? 2.8 : 1.5} />
      </mesh>

      {/* Upper Floor Windows */}
      <mesh position={[-0.18, 1.15, 0.44]}>
        <boxGeometry args={[0.26, 0.32, 0.02]} />
        <WindowMaterial intensity={1.4} />
      </mesh>
      <mesh position={[0.2, 1.15, 0.44]}>
        <boxGeometry args={[0.26, 0.32, 0.02]} />
        <WindowMaterial intensity={1.4} />
      </mesh>

      {/* Mansard Slate Roof */}
      <mesh position={[0, 1.72, 0]} castShadow>
        <boxGeometry args={[0.88, 0.28, 0.88]} />
        <meshStandardMaterial color={PALETTE.roofTerracotta} roughness={0.6} />
      </mesh>

      {/* Porch Lantern */}
      <mesh position={[0.2, 0.72, 0.47]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial
          color={isRevealed ? '#fbbf24' : '#f59e0b'}
          emissive={isRevealed ? '#fbbf24' : '#f59e0b'}
          emissiveIntensity={isRevealed ? 3.0 : 1.5}
        />
      </mesh>
      {isRevealed && (
        <pointLight
          ref={lightRef}
          position={[0.2, 0.72, 0.55]}
          color="#fbbf24"
          intensity={2.2}
          distance={2.5}
          decay={2}
        />
      )}
    </group>
  );
};

/**
 * Old Clocktower Library (Goal Destination across Tiles (6, 2) and (7, 2))
 * Grand civic library with clock steeple, glowing stained glass, and beacon light.
 */
export const ClocktowerLibrary: React.FC = () => {
  const beaconRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (beaconRef.current) {
      // Gentle beacon pulse across nighttime town
      beaconRef.current.intensity = 3.0 + Math.sin(clock.getElapsedTime() * 2) * 0.8;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Grand Hall Body */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.92, 1.6, 0.92]} />
        <meshStandardMaterial color="#DDD7CB" roughness={0.65} />
      </mesh>

      {/* Stone Entrance Portico with columns */}
      <mesh position={[0, 0.45, 0.48]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.12]} />
        <meshStandardMaterial color="#C8BEAE" roughness={0.7} />
      </mesh>
      {/* Library double doors */}
      <mesh position={[0, 0.35, 0.55]}>
        <boxGeometry args={[0.3, 0.55, 0.02]} />
        <meshStandardMaterial color={PALETTE.woodBrown} roughness={0.5} />
      </mesh>

      {/* Arched Library Windows with warm bookish glow */}
      <mesh position={[-0.32, 1.1, 0.48]}>
        <boxGeometry args={[0.2, 0.45, 0.02]} />
        <WindowMaterial intensity={2.5} />
      </mesh>
      <mesh position={[0.32, 1.1, 0.48]}>
        <boxGeometry args={[0.2, 0.45, 0.02]} />
        <WindowMaterial intensity={2.5} />
      </mesh>

      {/* Clocktower Tower Section */}
      <mesh position={[0, 2.1, 0]} castShadow>
        <boxGeometry args={[0.5, 0.8, 0.5]} />
        <meshStandardMaterial color="#B8A88A" roughness={0.6} />
      </mesh>

      {/* Glowing Round Clock Faces on 4 sides */}
      {[
        [0, 2.15, 0.26],
        [0, 2.15, -0.26],
        [0.26, 2.15, 0],
        [-0.26, 2.15, 0],
      ].map((pos, idx) => (
        <mesh key={`clock-${idx}`} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.14, 0.14, 0.02, 16]} />
          <meshStandardMaterial
            color={PALETTE.windowGlowHot}
            emissive={PALETTE.windowGlowHot}
            emissiveIntensity={2.5}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Copper Pyramidal Spire Roof */}
      <mesh position={[0, 2.8, 0]} castShadow>
        <coneGeometry args={[0.38, 0.8, 4]} />
        <meshStandardMaterial color={PALETTE.roofCopper} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Clocktower Apex Beacon */}
      <mesh position={[0, 3.25, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial
          color="#fef08a"
          emissive="#fef08a"
          emissiveIntensity={4.0}
        />
      </mesh>
      <pointLight
        ref={beaconRef}
        position={[0, 3.3, 0]}
        color="#fbbf24"
        intensity={3.5}
        distance={6}
        decay={2}
      />
    </group>
  );
};

/**
 * Town Bakery with Awning (Tile 3, 0)
 * Warm honey-brown shopfront with green-cream striped canvas awning, display window, chimney.
 */
export const TownBakery: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Main body — warm coffee brown */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 1.3, 0.85]} />
        <meshStandardMaterial color="#7c4a1e" roughness={0.75} />
      </mesh>

      {/* Stone plinth at ground level */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.86, 0.2, 0.86]} />
        <meshStandardMaterial color="#5c3d1a" roughness={0.85} />
      </mesh>

      {/* Canvas awning — green stripe base */}
      <mesh position={[0, 0.64, 0.49]} rotation={[0.38, 0, 0]} castShadow>
        <boxGeometry args={[0.82, 0.04, 0.28]} />
        <meshStandardMaterial color="#2d5a27" roughness={0.6} />
      </mesh>
      {/* Cream accent stripes on awning */}
      {[-0.27, -0.09, 0.09, 0.27].map((x, i) => (
        <mesh key={`awn-${i}`} position={[x, 0.645, 0.49]} rotation={[0.38, 0, 0]}>
          <boxGeometry args={[0.08, 0.045, 0.285]} />
          <meshStandardMaterial color="#fef9e7" roughness={0.5} />
        </mesh>
      ))}

      {/* Storefront display window — warm amber glow */}
      <mesh position={[-0.12, 0.36, 0.43]}>
        <boxGeometry args={[0.48, 0.38, 0.02]} />
        <WindowMaterial intensity={2.6} />
      </mesh>
      {/* Window frame surround */}
      <mesh position={[-0.12, 0.36, 0.435]}>
        <boxGeometry args={[0.52, 0.42, 0.01]} />
        <meshStandardMaterial color="#4a2c0a" roughness={0.6} />
      </mesh>

      {/* Door with frame */}
      <mesh position={[0.3, 0.34, 0.435]}>
        <boxGeometry args={[0.2, 0.55, 0.01]} />
        <meshStandardMaterial color="#3d1f08" roughness={0.5} />
      </mesh>
      <mesh position={[0.3, 0.34, 0.44]}>
        <boxGeometry args={[0.22, 0.57, 0.01]} />
        <meshStandardMaterial color="#5c3d1a" roughness={0.7} />
      </mesh>

      {/* Upper floor window */}
      <mesh position={[0, 1.0, 0.43]}>
        <boxGeometry args={[0.28, 0.32, 0.02]} />
        <WindowMaterial intensity={1.8} />
      </mesh>

      {/* Pitched Roof */}
      <mesh position={[0, 1.52, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.66, 0.48, 4]} />
        <meshStandardMaterial color="#4a2c0a" roughness={0.6} />
      </mesh>

      {/* Chimney */}
      <mesh position={[0.28, 1.7, -0.15]} castShadow>
        <boxGeometry args={[0.12, 0.36, 0.12]} />
        <meshStandardMaterial color="#5c3012" roughness={0.8} />
      </mesh>
      {/* Chimney cap */}
      <mesh position={[0.28, 1.9, -0.15]}>
        <boxGeometry args={[0.17, 0.04, 0.17]} />
        <meshStandardMaterial color="#2d1a06" roughness={0.9} />
      </mesh>
    </group>
  );
};

/**
 * Town Hall (Tile 0, 0)
 * Civic limestone building with classical columns, pediment, and warm interior glow.
 */
export const TownHall: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Main body — warm limestone */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.88, 1.5, 0.84]} />
        <meshStandardMaterial color="#c8b896" roughness={0.6} metalness={0.0} />
      </mesh>

      {/* Portico base platform */}
      <mesh position={[0, 0.08, 0.44]} castShadow receiveShadow>
        <boxGeometry args={[0.88, 0.16, 0.12]} />
        <meshStandardMaterial color="#b8a880" roughness={0.7} />
      </mesh>

      {/* Front entablature (lintel over columns) */}
      <mesh position={[0, 1.3, 0.48]} castShadow>
        <boxGeometry args={[0.88, 0.1, 0.08]} />
        <meshStandardMaterial color="#b0a070" roughness={0.6} />
      </mesh>

      {/* Triangular pediment */}
      <mesh position={[0, 1.55, 0.46]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.44, 0.3, 3]} />
        <meshStandardMaterial color="#c0b080" roughness={0.6} />
      </mesh>

      {/* Four classical columns */}
      {[-0.32, -0.11, 0.11, 0.32].map((x, i) => (
        <mesh key={`col-${i}`} position={[x, 0.65, 0.48]} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 1.1, 12]} />
          <meshStandardMaterial color="#ddd3b0" roughness={0.5} />
        </mesh>
      ))}

      {/* Tall arched entrance windows */}
      <mesh position={[-0.26, 0.85, 0.44]}>
        <boxGeometry args={[0.18, 0.55, 0.02]} />
        <WindowMaterial intensity={2.2} />
      </mesh>
      <mesh position={[0.26, 0.85, 0.44]}>
        <boxGeometry args={[0.18, 0.55, 0.02]} />
        <WindowMaterial intensity={2.2} />
      </mesh>

      {/* Central double door */}
      <mesh position={[0, 0.42, 0.44]}>
        <boxGeometry args={[0.26, 0.7, 0.02]} />
        <meshStandardMaterial color="#4a3820" roughness={0.5} />
      </mesh>

      {/* Upper band windows */}
      <mesh position={[0, 1.15, 0.44]}>
        <boxGeometry args={[0.22, 0.3, 0.02]} />
        <WindowMaterial intensity={1.8} />
      </mesh>

      {/* Stepped flat roof with balustrade suggestion */}
      <mesh position={[0, 1.66, 0]} castShadow>
        <boxGeometry args={[0.92, 0.08, 0.88]} />
        <meshStandardMaterial color="#b0a070" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.78, 0]} castShadow>
        <boxGeometry args={[0.88, 0.16, 0.84]} />
        <meshStandardMaterial color="#c8b896" roughness={0.6} />
      </mesh>

      {/* Flag pole */}
      <mesh position={[0, 2.15, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.7, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Flag */}
      <mesh position={[0.1, 2.35, 0]}>
        <boxGeometry args={[0.2, 0.12, 0.02]} />
        <meshStandardMaterial color="#dc2626" roughness={0.5} />
      </mesh>
    </group>
  );
};

/**
 * Construction Barrier Obstacle (Tile 3, 4)
 */
export const ConstructionBarrier: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Ground barrier blocks */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[0.85, 0.28, 0.1]} />
        <meshStandardMaterial color={PALETTE.hazardYellow} roughness={0.5} />
      </mesh>
      {/* Warning stripes */}
      {[-0.25, 0, 0.25].map((x, i) => (
        <mesh key={`stripe-${i}`} position={[x, 0.18, 0.052]}>
          <boxGeometry args={[0.1, 0.26, 0.01]} />
          <meshStandardMaterial color={PALETTE.hazardBlack} roughness={0.8} />
        </mesh>
      ))}
      {/* Amber flashing safety lantern */}
      <mesh position={[0, 0.38, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={3.0}
        />
      </mesh>
      <pointLight position={[0, 0.4, 0]} color="#f59e0b" intensity={1.5} distance={2} />
    </group>
  );
};

/**
 * Generic Neighborhood House with varied roofline, window frames, and door.
 */
export const NeighborhoodBuilding: React.FC<{
  height?: number;
  roofColor?: string;
  wallColor?: string;
  trimColor?: string;
}> = ({
  height = 1.3,
  roofColor = PALETTE.roofSlate,
  wallColor = PALETTE.wallIvory,
  trimColor = '#A89878',
}) => {
  const windowY1 = height * 0.38;
  const windowY2 = height * 0.75;

  return (
    <group position={[0, 0, 0]}>
      {/* Main body */}
      <mesh position={[0, height / 2 + 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.84, height, 0.84]} />
        <meshStandardMaterial color={wallColor} roughness={0.75} />
      </mesh>

      {/* Ground-floor window frames + glass */}
      {[-0.22, 0.22].map((x, i) => (
        <group key={`wf-${i}`}>
          <mesh position={[x, windowY1, 0.432]}>
            <boxGeometry args={[0.26, 0.34, 0.01]} />
            <meshStandardMaterial color={trimColor} roughness={0.6} />
          </mesh>
          <mesh position={[x, windowY1, 0.438]}>
            <boxGeometry args={[0.22, 0.3, 0.01]} />
            <WindowMaterial intensity={1.7} />
          </mesh>
          {/* Window cross-bar */}
          <mesh position={[x, windowY1, 0.441]}>
            <boxGeometry args={[0.22, 0.015, 0.015]} />
            <meshStandardMaterial color={trimColor} roughness={0.5} />
          </mesh>
          <mesh position={[x, windowY1, 0.441]}>
            <boxGeometry args={[0.015, 0.3, 0.015]} />
            <meshStandardMaterial color={trimColor} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Upper floor center window */}
      <mesh position={[0, windowY2, 0.432]}>
        <boxGeometry args={[0.26, 0.32, 0.01]} />
        <meshStandardMaterial color={trimColor} roughness={0.6} />
      </mesh>
      <mesh position={[0, windowY2, 0.438]}>
        <boxGeometry args={[0.22, 0.28, 0.01]} />
        <WindowMaterial intensity={1.5} />
      </mesh>

      {/* Door */}
      <mesh position={[0, height * 0.2, 0.432]}>
        <boxGeometry args={[0.22, 0.42, 0.01]} />
        <meshStandardMaterial color={trimColor} roughness={0.6} />
      </mesh>
      <mesh position={[0, height * 0.2, 0.437]}>
        <boxGeometry args={[0.18, 0.38, 0.01]} />
        <meshStandardMaterial color={wallColor} roughness={0.5} />
      </mesh>

      {/* Pitched Roof aligned to corners */}
      <mesh position={[0, height + 0.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.63, 0.5, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.6} />
      </mesh>
    </group>
  );
};

/**
 * Ornate Victorian Streetlamp casting real light
 */
export const Streetlamp3D: React.FC<{ isLit?: boolean }> = ({ isLit = true }) => {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (lightRef.current && isLit) {
      // Subtle lantern flicker
      lightRef.current.intensity = 2.4 + Math.sin(clock.getElapsedTime() * 4) * 0.15;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Stone pedestal base */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.12, 8]} />
        <meshStandardMaterial color="#1f2937" roughness={0.8} />
      </mesh>

      {/* Cast iron lamp pole */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.8, 8]} />
        <meshStandardMaterial color="#111827" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Decorative cross-arm */}
      <mesh position={[0, 0.85, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.18, 8]} />
        <meshStandardMaterial color="#111827" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Glass lantern cage */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[0.16, 0.2, 0.16]} />
        <meshStandardMaterial
          color={isLit ? PALETTE.lanternGold : '#374151'}
          emissive={isLit ? PALETTE.lanternGold : '#000000'}
          emissiveIntensity={isLit ? 3.5 : 0}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Lamp Cap Roof */}
      <mesh position={[0, 1.14, 0]}>
        <coneGeometry args={[0.14, 0.08, 4]} />
        <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Actual Three.js PointLight casting soft illumination onto surrounding pavement */}
      {isLit && (
        <pointLight
          ref={lightRef}
          position={[0, 1.02, 0]}
          color="#f59e0b"
          intensity={2.5}
          distance={3.5}
          decay={2}
          castShadow
          shadow-bias={-0.001}
        />
      )}
    </group>
  );
};

/**
 * Crosswalk / Road Tile for Chapter 2 busy avenue
 */
export const CrosswalkRoadTile: React.FC<{
  hasBeacon?: boolean;
  isHighlighted?: boolean;
}> = ({ hasBeacon = false, isHighlighted = false }) => {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[0.96, 0.1, 0.96]} />
        <meshStandardMaterial
          color={isHighlighted ? '#2d1b69' : '#161d2b'}
          roughness={0.9}
        />
      </mesh>
      {[-0.3, -0.1, 0.1, 0.3].map((offset, i) => (
        <mesh key={`stripe-${i}`} position={[offset, 0.115, 0]}>
          <boxGeometry args={[0.07, 0.02, 0.88]} />
          <meshStandardMaterial
            color={hasBeacon ? '#10b981' : '#e2e8f0'}
            roughness={0.4}
            emissive={hasBeacon ? '#10b981' : '#ffffff'}
            emissiveIntensity={hasBeacon ? 0.6 : 0.05}
          />
        </mesh>
      ))}
      {hasBeacon && (
        <pointLight position={[0, 0.35, 0]} color="#10b981" intensity={1.8} distance={2.8} decay={2} />
      )}
    </group>
  );
};

/**
 * Acoustic Beacon Post — Accessible Pedestrian Signal for Chapter 2
 */
export const AcousticBeaconPost3D: React.FC = () => {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const t = clock.getElapsedTime();
      lightRef.current.intensity = 1.5 + Math.sin(t * 7) * 0.9;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.024, 0.03, 0.84, 8]} />
        <meshStandardMaterial color="#8A9090" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.09, 0.82, 0]} castShadow>
        <boxGeometry args={[0.15, 0.18, 0.1]} />
        <meshStandardMaterial color="#374151" roughness={0.5} />
      </mesh>
      <mesh position={[0.09, 0.84, 0.055]}>
        <boxGeometry args={[0.1, 0.06, 0.01]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={3.5}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0.09, 0.93, 0.055]}>
        <sphereGeometry args={[0.024, 8, 8]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={5.0}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        position={[0.09, 0.84, 0.12]}
        color="#10b981"
        intensity={1.5}
        distance={2.5}
        decay={2}
      />
    </group>
  );
};

/**
 * Pharmacy Building with illuminated green cross (Ch2 Tile 7, 0)
 */
export const PharmacyBuilding: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.88, 1.44, 0.88]} />
        <meshStandardMaterial color="#4b5563" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.68, 0.45]}>
        <boxGeometry args={[0.08, 0.3, 0.02]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={3.5} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.68, 0.45]}>
        <boxGeometry args={[0.3, 0.08, 0.02]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={3.5} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.38, 0.45]}>
        <boxGeometry args={[0.62, 0.32, 0.02]} />
        <WindowMaterial intensity={2.2} />
      </mesh>
      <mesh position={[0, 1.68, 0]} castShadow>
        <boxGeometry args={[0.9, 0.1, 0.9]} />
        <meshStandardMaterial color="#4A5248" roughness={0.7} />
      </mesh>
      <pointLight position={[0, 0.68, 0.5]} color="#10b981" intensity={2.2} distance={3.5} decay={2} />
    </group>
  );
};

/**
 * Transit Hub — Modern glass station (Ch2 Tile 8, 0)
 */
export const TransitHubBuilding: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 1.2, 0.9]} />
        <meshStandardMaterial color="#8A9BA8" roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.48, 0.46]}>
        <boxGeometry args={[0.78, 0.8, 0.02]} />
        <meshStandardMaterial
          color="#93c5fd"
          emissive="#93c5fd"
          emissiveIntensity={0.9}
          roughness={0.1}
          transparent
          opacity={0.72}
        />
      </mesh>
      <mesh position={[0, 1.32, 0.14]} rotation={[-0.28, 0, 0]} castShadow>
        <boxGeometry args={[0.92, 0.04, 0.48]} />
        <meshStandardMaterial color="#7A8A78" metalness={0.5} roughness={0.3} />
      </mesh>
      <pointLight position={[0, 0.48, 0.5]} color="#93c5fd" intensity={1.8} distance={3.0} decay={2} />
    </group>
  );
};

/**
 * Community Clinic — Medical building with green cross (Ch2 Tile 8, 5)
 */
export const CommunityClinc: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.88, 1.36, 0.88]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.55, 0.45]}>
        <boxGeometry args={[0.07, 0.26, 0.02]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={3.0} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.55, 0.45]}>
        <boxGeometry args={[0.26, 0.07, 0.02]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={3.0} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.38, 0.45]}>
        <boxGeometry args={[0.55, 0.28, 0.02]} />
        <WindowMaterial intensity={1.8} />
      </mesh>
      <mesh position={[0, 1.58, 0]} castShadow>
        <boxGeometry args={[0.9, 0.08, 0.9]} />
        <meshStandardMaterial color="#4A5248" roughness={0.7} />
      </mesh>
      <pointLight position={[0, 0.55, 0.5]} color="#34d399" intensity={1.8} distance={3.0} decay={2} />
    </group>
  );
};

/**
 * Stylized Miniature Street Tree
 */
export const StreetTree: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Tree trunk */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.4, 6]} />
        <meshStandardMaterial color="#5c2b16" roughness={0.9} />
      </mesh>
      {/* Foliage Canopy */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <dodecahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial color={PALETTE.foliageDeep} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <dodecahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial color={PALETTE.foliageMint} roughness={0.8} />
      </mesh>
    </group>
  );
};

/** Chapter 3: Emergency community shelter — red cross sign, warm amber windows */
export const ShelterHubBuilding: React.FC = () => (
  <group>
    <mesh position={[0, 0.68, 0]} castShadow>
      <boxGeometry args={[0.82, 1.16, 0.78]} />
      <meshStandardMaterial color="#7f1d1d" roughness={0.85} />
    </mesh>
    {/* Flat roof */}
    <mesh position={[0, 1.3, 0]} castShadow>
      <boxGeometry args={[0.88, 0.08, 0.84]} />
      <meshStandardMaterial color="#1c1917" roughness={0.8} />
    </mesh>
    {/* Warm windows */}
    {([-0.2, 0.2] as number[]).map((wx, i) => (
      <mesh key={`w${i}`} position={[wx, 0.72, 0.4]}>
        <boxGeometry args={[0.16, 0.18, 0.01]} />
        <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2.0} />
      </mesh>
    ))}
    {/* Red emergency cross */}
    <mesh position={[0, 1.08, 0.4]}>
      <boxGeometry args={[0.28, 0.06, 0.01]} />
      <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.2} />
    </mesh>
    <mesh position={[0, 1.08, 0.4]}>
      <boxGeometry args={[0.06, 0.28, 0.01]} />
      <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.2} />
    </mesh>
    <pointLight position={[0, 1.0, 0.6]} color="#fbbf24" intensity={1.4} distance={4.5} />
  </group>
);

/** Chapter 3: Community kitchen — warm orange glow, "hot meals" sign */
export const CommunityKitchenBuilding: React.FC = () => (
  <group>
    <mesh position={[0, 0.64, 0]} castShadow>
      <boxGeometry args={[0.82, 1.08, 0.78]} />
      <meshStandardMaterial color="#713f12" roughness={0.85} />
    </mesh>
    <mesh position={[0, 1.22, 0]} castShadow>
      <boxGeometry args={[0.9, 0.08, 0.86]} />
      <meshStandardMaterial color="#292524" roughness={0.8} />
    </mesh>
    {/* Large kitchen window — warm orange glow */}
    <mesh position={[0, 0.65, 0.4]}>
      <boxGeometry args={[0.36, 0.28, 0.01]} />
      <meshStandardMaterial color="#fed7aa" emissive="#fb923c" emissiveIntensity={1.8} />
    </mesh>
    {/* Door */}
    <mesh position={[0, 0.32, 0.4]}>
      <boxGeometry args={[0.18, 0.48, 0.01]} />
      <meshStandardMaterial color="#78350f" roughness={0.7} />
    </mesh>
    {/* Hot meals sign */}
    <mesh position={[0, 1.1, 0.41]}>
      <boxGeometry args={[0.5, 0.09, 0.01]} />
      <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={2.0} />
    </mesh>
    <pointLight position={[0, 0.8, 0.6]} color="#fb923c" intensity={1.2} distance={4} />
  </group>
);

/** Chapter 3: Storm debris obstacle — fallen tree branch */
export const FallenBranchObstacle: React.FC = () => (
  <group>
    {/* Main trunk segment */}
    <mesh position={[0, 0.1, 0]} rotation={[0, 0.4, 0]} castShadow>
      <cylinderGeometry args={[0.055, 0.04, 0.72, 6]} />
      <meshStandardMaterial color="#4a2511" roughness={0.95} />
    </mesh>
    {/* Side branch */}
    <mesh position={[0.16, 0.13, 0.08]} rotation={[0.3, 0.9, 0.4]} castShadow>
      <cylinderGeometry args={[0.028, 0.018, 0.42, 5]} />
      <meshStandardMaterial color="#4a2511" roughness={0.95} />
    </mesh>
    {/* Dead leaves scatter */}
    {([[-0.14, 0.07, 0.12], [0.1, 0.06, -0.14], [0.22, 0.06, 0.04], [-0.06, 0.06, -0.1]] as [number, number, number][]).map(
      ([lx, ly, lz], i) => (
        <mesh key={`lf${i}`} position={[lx, ly, lz]} rotation={[-Math.PI / 2, 0, i * 0.9]}>
          <circleGeometry args={[0.055, 5]} />
          <meshStandardMaterial color="#713f12" roughness={1.0} />
        </mesh>
      )
    )}
  </group>
);
