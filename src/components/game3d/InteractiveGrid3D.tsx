'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import { GridTile, Coordinate, SimulationResult } from '../../types/game';
import {
  CobblestoneTile,
  SunkenStoneStairs,
  MayasHouse,
  SamsApartment,
  ClocktowerLibrary,
  TownBakery,
  TownHall,
  ConstructionBarrier,
  NeighborhoodBuilding,
  Streetlamp3D,
  StreetTree,
  CrosswalkRoadTile,
  AcousticBeaconPost3D,
  PharmacyBuilding,
  TransitHubBuilding,
  CommunityClinc,
  ShelterHubBuilding,
  CommunityKitchenBuilding,
  FallenBranchObstacle,
  PALETTE,
} from './CityAssets';
import { Maya3D, Sam3D, Kai3D, Elena3D, Henderson3D } from './Character3D';
import { PathTrail3D } from './PathTrail3D';
import { ANIM_TILES_PER_SEC } from '../../engine/animConfig';
import { leadCharPos, isAnimating } from '../../engine/animState';

interface InteractiveGrid3DProps {
  onTileClick?: (x: number, y: number) => void;
  mayaGroupRef?: React.RefObject<THREE.Group | null>;
}

export const InteractiveGrid3D: React.FC<InteractiveGrid3DProps> = ({ onTileClick, mayaGroupRef: externalMayaRef }) => {
  const {
    currentChapter,
    tiles,
    cursor,
    selectedTool,
    activeResidentIds,
    phase,
    isSimulating,
    simulationResult,
    applyToolToTile,
    setCursor,
    budget,
    showFailureModal,
  } = useGameStore();

  const [hoverTile, setHoverTile] = React.useState<Coordinate | null>(null);

  // Animation state — ref-based so no React re-renders per frame
  const simStepRef = useRef(0);
  const prevSimResultRef = useRef<SimulationResult | null>(null);

  // Per-character Three.js group refs driven by useFrame
  // Share the active chapter lead with the third-person controller.
  const internalMayaRef = useRef<THREE.Group>(null);
  const hasMaya = currentChapter.residents.some(resident => resident.id === 'maya');
  const mayaGroupRef = (hasMaya ? externalMayaRef : null) ?? internalMayaRef;
  const samGroupRef = useRef<THREE.Group>(null);
  const internalKaiRef = useRef<THREE.Group>(null);
  const kaiGroupRef = (!hasMaya ? externalMayaRef : null) ?? internalKaiRef;
  const elenaGroupRef = useRef<THREE.Group>(null);
  const hendersonGroupRef = useRef<THREE.Group>(null);

  // Center coordinate offsets so grid is centered at (0, 0, 0)
  const originX = (currentChapter.gridWidth - 1) / 2;
  const originZ = (currentChapter.gridHeight - 1) / 2;

  useFrame((_, delta) => {
    const { simulationResult: result, settings } = useGameStore.getState();

    // Detect new simulation (or cleared result) → reset step counter
    if (result !== prevSimResultRef.current) {
      if (result) simStepRef.current = 0;
      prevSimResultRef.current = result;
    }

    // Advance animation step
    if (result) {
      const maxStep = Math.max(
        ...result.residentResults.map((r) => Math.max(r.path.length - 1, 0)),
        0
      );
      if (settings.reducedMotion) {
        simStepRef.current = maxStep;
      } else if (simStepRef.current < maxStep) {
        simStepRef.current = Math.min(simStepRef.current + delta * ANIM_TILES_PER_SEC, maxStep);
      }
    }

    const step = simStepRef.current;

    // Move one character along its computed path with lerp
    function moveChar(
      groupRef: React.RefObject<THREE.Group | null>,
      resId: string,
      startPos: Coordinate | undefined
    ) {
      const g = groupRef.current;
      if (!g || !startPos) return;

      if (result) {
        const rr = result.residentResults.find((r) => r.residentId === resId);
        if (rr && rr.path.length > 0) {
          const idxA = Math.min(Math.floor(step), rr.path.length - 1);
          const idxB = Math.min(idxA + 1, rr.path.length - 1);
          const frac = step - Math.floor(step);
          const pA = rr.path[idxA];
          const pB = rr.path[idxB];

          g.position.x = THREE.MathUtils.lerp(pA.x - originX, pB.x - originX, frac);
          g.position.z = THREE.MathUtils.lerp(pA.y - originZ, pB.y - originZ, frac);

          // Smoothly face the direction of travel
          if (pA.x !== pB.x || pA.y !== pB.y) {
            const targetAngle = Math.atan2(pB.x - pA.x, pB.y - pA.y);
            g.rotation.y = THREE.MathUtils.lerp(
              g.rotation.y,
              targetAngle,
              Math.min(delta * 12, 1)
            );
          }
          return;
        }
      }

      // No result or no path: place at start position
      g.position.x = startPos.x - originX;
      g.position.z = startPos.y - originZ;
    }

    // In explore mode, PlayerController owns Maya's X/Z — only let InteractiveGrid3D
    // drive her during simulation playback (it provides the path animation)
    const { gameMode } = useGameStore.getState();
    if (gameMode !== 'explore' || result) {
      moveChar(mayaGroupRef, 'maya', maya?.startPosition);
    }
    moveChar(samGroupRef, 'sam', sam?.startPosition);
    if (gameMode !== 'explore' || result || hasMaya) {
      moveChar(kaiGroupRef, 'kai', kai?.startPosition);
    }
    moveChar(elenaGroupRef, 'elena', elena?.startPosition);
    moveChar(hendersonGroupRef, 'henderson', henderson?.startPosition);

    // Write lead character world position for camera tracking
    let tracked = false;
    if (result) {
      for (const rr of result.residentResults) {
        const gRef =
          rr.residentId === 'maya' ? mayaGroupRef :
          rr.residentId === 'sam' ? samGroupRef :
          rr.residentId === 'kai' ? kaiGroupRef :
          rr.residentId === 'elena' ? elenaGroupRef :
          rr.residentId === 'henderson' ? hendersonGroupRef : null;
        if (gRef?.current && rr.path.length > 0) {
          leadCharPos.set(gRef.current.position.x, 0, gRef.current.position.z);
          tracked = true;
          break;
        }
      }
    }
    isAnimating.current = tracked;
  });

  // Calculate world coordinates from grid tile (x, y) — still used for tile rendering
  const toWorld = (x: number, y: number): [number, number, number] => {
    return [x - originX, 0, y - originZ];
  };

  // Validate if placement is allowed on hovered tile
  const getPlacementFeedback = (tile: GridTile) => {
    if (!selectedTool) return null;
    const toolCost = currentChapter.toolCosts[selectedTool] ?? 0;

    if (selectedTool === 'demolish') {
      return tile.type !== 'empty' && !tile.isInitialFixed ? 'valid' : 'invalid';
    }

    if (budget < toolCost) return 'unaffordable';

    if (selectedTool === 'ramp') {
      return tile.type === 'staircase' || tile.type === 'sidewalk' || tile.type === 'empty'
        ? 'valid'
        : 'blocked';
    }

    if (tile.type === 'building' || tile.type === 'obstacle') {
      return 'blocked';
    }

    return 'valid';
  };

  const handleTileInteraction = (tile: GridTile) => {
    if (useGameStore.getState().gameMode !== 'design') return;
    useGameStore.getState().setCursor({ x: tile.x, y: tile.y });
    useGameStore.getState().applyToolToTile(tile.x, tile.y);
    onTileClick?.(tile.x, tile.y);
  };

  // Resident profile lookups — stable within a chapter
  const maya = currentChapter.residents.find((r) => r.id === 'maya');
  const sam = currentChapter.residents.find((r) => r.id === 'sam');
  const kai = currentChapter.residents.find((r) => r.id === 'kai');
  const elena = currentChapter.residents.find((r) => r.id === 'elena');
  const henderson = currentChapter.residents.find((r) => r.id === 'henderson');

  const isSamActive = activeResidentIds.includes('sam') || phase === 'post_reveal';
  const isElenaActive = activeResidentIds.includes('elena') || phase === 'post_reveal';
  const isHendersonActive = activeResidentIds.includes('henderson') || phase === 'post_reveal';

  // isAtGoal: true when simulation completed successfully for this resident
  const getIsAtGoal = (resId: string) =>
    !!(simulationResult?.residentResults.find((r) => r.residentId === resId)?.success);

  return (
    <group position={[0, 0, 0]}>
      {/* Seamless ground plane for the playable area — no raised platform, no tile borders */}
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <boxGeometry
          args={[currentChapter.gridWidth + 0.15, 0.05, currentChapter.gridHeight + 0.15]}
        />
        <meshStandardMaterial color="#C0B09A" roughness={0.88} metalness={0.02} />
      </mesh>

      {/* Render all 48 tiles (8x6) of Chapter 1 */}
      {tiles.map((tile) => {
        const [wx, wy, wz] = toWorld(tile.x, tile.y);
        const isCursor = cursor.x === tile.x && cursor.y === tile.y;
        const isHovered = hoverTile?.x === tile.x && hoverTile?.y === tile.y;
        const feedback = isHovered ? getPlacementFeedback(tile) : null;

        const hasWalkway =
          tile.type === 'paved_walkway' ||
          tile.type === 'sidewalk';
        const hasRamp = tile.hasRamp;
        const hasStreetlamp = tile.type === 'streetlamp' || tile.lightSource;
        const hasTactile = tile.hasTactile;
        const hasBench = tile.hasBench;

        return (
          <group key={`tile-3d-${tile.x}-${tile.y}`} position={[wx, wy, wz]}>
            {/* Paved walkway: thin seamless stone strip, flush with ground */}
            {hasWalkway && (
              <mesh position={[0, 0.03, 0]} receiveShadow>
                <boxGeometry args={[0.98, 0.015, 0.98]} />
                <meshStandardMaterial color="#A89878" roughness={0.72} metalness={0.06} />
              </mesh>
            )}

            {/* Crosswalk: road base + white stripes, no raised platform */}
            {(tile.type === 'crosswalk_standard' || tile.type === 'crosswalk_accessible') && (
              <group position={[0, 0.03, 0]}>
                <mesh receiveShadow>
                  <boxGeometry args={[0.98, 0.015, 0.98]} />
                  <meshStandardMaterial color="#9A9490" roughness={0.82} />
                </mesh>
                {[-0.32, -0.11, 0.11, 0.32].map((x, i) => (
                  <mesh key={`cw-${i}`} position={[x, 0.006, 0]}>
                    <boxGeometry args={[0.1, 0.012, 0.88]} />
                    <meshStandardMaterial color="#f0ead8" roughness={0.5} />
                  </mesh>
                ))}
              </group>
            )}

            {/* Chapter 1 Feature Buildings & Barriers */}
            {currentChapter.id === 1 && tile.type === 'building' && (
              <>
                {tile.x === 0 && tile.y === 0 ? (
                  <TownHall />
                ) : tile.x === 3 && tile.y === 0 ? (
                  <TownBakery />
                ) : tile.x === 4 && tile.y === 0 ? (
                  <NeighborhoodBuilding height={1.4} roofColor={PALETTE.roofSlate} />
                ) : tile.x === 3 && tile.y === 1 ? (
                  <NeighborhoodBuilding height={1.6} roofColor={PALETTE.roofTerracotta} />
                ) : tile.x === 4 && tile.y === 1 ? (
                  <NeighborhoodBuilding height={1.8} roofColor={PALETTE.roofCopper} />
                ) : (
                  <NeighborhoodBuilding
                    height={1.3 + ((tile.x + tile.y) % 3) * 0.2}
                    roofColor={
                      (tile.x + tile.y) % 2 === 0
                        ? PALETTE.roofSlate
                        : PALETTE.roofTerracotta
                    }
                  />
                )}
              </>
            )}

            {/* Chapter 1: Maya's Home (1,1), Sam's Apartment (1,2), Library (6,2) */}
            {currentChapter.id === 1 && tile.x === 1 && tile.y === 1 && <MayasHouse />}
            {currentChapter.id === 1 && tile.x === 1 && tile.y === 2 && (
              <SamsApartment isRevealed={isSamActive} />
            )}
            {currentChapter.id === 1 && tile.x === 6 && tile.y === 2 && <ClocktowerLibrary />}

            {/* Chapter 2 Signature Buildings */}
            {currentChapter.id === 2 && tile.type === 'building' && (
              <>
                {tile.x === 7 && tile.y === 0 ? (
                  <PharmacyBuilding />
                ) : tile.x === 8 && tile.y === 0 ? (
                  <TransitHubBuilding />
                ) : tile.x === 8 && tile.y === 5 ? (
                  <CommunityClinc />
                ) : (
                  <NeighborhoodBuilding
                    height={1.4 + ((tile.x + tile.y) % 4) * 0.15}
                    roofColor={
                      (tile.x + tile.y) % 3 === 0
                        ? PALETTE.roofSlate
                        : (tile.x + tile.y) % 3 === 1
                        ? '#7e22ce'
                        : PALETTE.roofTerracotta
                    }
                  />
                )}
              </>
            )}

            {/* Chapter 3 Signature Buildings */}
            {currentChapter.id === 3 && tile.type === 'building' && (
              <>
                {tile.x === 0 && tile.y === 0 ? (
                  <ShelterHubBuilding />
                ) : tile.x === 9 && tile.y === 0 ? (
                  <CommunityKitchenBuilding />
                ) : (
                  <NeighborhoodBuilding
                    height={1.2 + ((tile.x + tile.y) % 3) * 0.18}
                    roofColor={(tile.x + tile.y) % 2 === 0 ? '#1e293b' : '#374151'}
                  />
                )}
              </>
            )}

            {/* Historic Sunken Stone Stairs Barrier */}
            {tile.type === 'staircase' && (
              <SunkenStoneStairs hasRamp={hasRamp} />
            )}

            {/* Obstacle: storm debris for Ch3, construction barrier otherwise */}
            {tile.type === 'obstacle' && (
              currentChapter.id === 3 ? <FallenBranchObstacle /> : <ConstructionBarrier />
            )}

            {/* Acoustic Beacon Post (placed by player in Ch2) */}
            {tile.hasAudioBeacon && tile.type !== 'crosswalk_standard' && tile.type !== 'crosswalk_accessible' && (
              <AcousticBeaconPost3D />
            )}

            {/* Streetlamp Infrastructure */}
            {hasStreetlamp && <Streetlamp3D isLit={tile.hasLight} />}

            {/* Tactile Paving Infrastructure */}
            {hasTactile && (
              <group position={[0, 0.12, 0]}>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.8, 0.02, 0.8]} />
                  <meshStandardMaterial color="#B59A67" roughness={0.4} />
                </mesh>
                {/* 3x3 array of tactile studs */}
                {[-0.2, 0, 0.2].map((sx, si) =>
                  [-0.2, 0, 0.2].map((sz, zi) => (
                    <mesh key={`stud-${si}-${zi}`} position={[sx, 0.02, sz]}>
                      <cylinderGeometry args={[0.03, 0.03, 0.03, 8]} />
                      <meshStandardMaterial color="#C8A840" roughness={0.3} />
                    </mesh>
                  ))
                )}
              </group>
            )}

            {/* Resting Bench Infrastructure */}
            {hasBench && (
              <group position={[0, 0.12, 0]}>
                {/* Slats */}
                <mesh position={[0, 0.14, 0]}>
                  <boxGeometry args={[0.6, 0.04, 0.24]} />
                  <meshStandardMaterial color="#78350f" roughness={0.7} />
                </mesh>
                {/* Backrest */}
                <mesh position={[0, 0.24, -0.1]}>
                  <boxGeometry args={[0.6, 0.16, 0.03]} />
                  <meshStandardMaterial color="#78350f" roughness={0.7} />
                </mesh>
                {/* Iron legs */}
                {[-0.24, 0.24].map((lx, li) => (
                  <mesh key={`leg-${li}`} position={[lx, 0.07, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.14, 6]} />
                    <meshStandardMaterial color="#1e293b" metalness={0.7} />
                  </mesh>
                ))}
              </group>
            )}

            {/* Barrier highlight — shown alongside failure modal for impassable tiles */}
            {showFailureModal && simulationResult?.residentResults.some(
              (r) => !r.success && r.failureTile?.x === tile.x && r.failureTile?.y === tile.y
            ) && (
              <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.96, 0.96]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.4} side={THREE.DoubleSide} />
              </mesh>
            )}

            {/* Active Cursor — amber square outline + glow plane, sits flush with surface */}
            {isCursor && (
              <group position={[0, 0.06, 0]}>
                {/* Amber glow fill */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.94, 0.94]} />
                  <meshBasicMaterial color="#C87D70" transparent opacity={0.22} side={THREE.DoubleSide} />
                </mesh>
                {/* Outer ring */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.44, 0.50, 28]} />
                  <meshBasicMaterial color="#B59A67" side={THREE.DoubleSide} transparent opacity={0.95} />
                </mesh>
              </group>
            )}

            {/* Hover Feedback — flush plane with tool color */}
            {isHovered && feedback && (
              <mesh position={[0, 0.058, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.95, 0.95]} />
                <meshBasicMaterial
                  color={feedback === 'valid' ? '#10b981' : feedback === 'unaffordable' ? '#f59e0b' : '#ef4444'}
                  transparent
                  opacity={0.28}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* Transparent Interactive Pointer Raycast Target */}
            <mesh
              position={[0, 0.15, 0]}
              visible={false}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoverTile({ x: tile.x, y: tile.y });
              }}
              onPointerOut={() => {
                setHoverTile(null);
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleTileInteraction(tile);
              }}
            >
              <boxGeometry args={[0.98, 0.3, 0.98]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </group>
        );
      })}

      {/* Scattered Decorative Foliage around Town Border */}
      {[
        [-originX - 0.7, -originZ + 0.5],
        [-originX - 0.7, -originZ + 3.5],
        [originX + 0.7, -originZ + 1.2],
        [originX + 0.7, -originZ + 4.2],
        [0, -originZ - 0.7],
        [2.5, -originZ - 0.7],
      ].map(([tx, tz], i) => (
        <group key={`tree-${i}`} position={[tx, 0, tz]}>
          <StreetTree />
        </group>
      ))}

      {/* Render 3D Animated Path Trails */}
      {simulationResult &&
        simulationResult.residentResults.map((res) => (
          <PathTrail3D
            key={`trail-${res.residentId}`}
            path={res.path}
            isSuccess={res.success}
            gridOriginX={originX}
            gridOriginZ={originZ}
          />
        ))}

      {/* Characters — positions driven by useFrame via forwarded refs, not React props */}
      {maya && (
        <Maya3D ref={mayaGroupRef} isSimulating={isSimulating} isAtGoal={getIsAtGoal('maya')} />
      )}
      {sam && isSamActive && (
        <Sam3D ref={samGroupRef} isSimulating={isSimulating} isAtGoal={getIsAtGoal('sam')} />
      )}
      {kai && (
        <Kai3D ref={kaiGroupRef} isSimulating={isSimulating} isAtGoal={getIsAtGoal('kai')} />
      )}
      {elena && isElenaActive && (
        <Elena3D ref={elenaGroupRef} isSimulating={isSimulating} isAtGoal={getIsAtGoal('elena')} />
      )}
      {henderson && isHendersonActive && (
        <Henderson3D ref={hendersonGroupRef} isSimulating={isSimulating} isAtGoal={getIsAtGoal('henderson')} />
      )}
    </group>
  );
};
