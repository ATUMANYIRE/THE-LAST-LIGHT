'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Billboard } from '@react-three/drei';
import { InteractiveGrid3D } from './InteractiveGrid3D';
import { Environment3D } from './Environment3D';
import { PlayerController } from './PlayerController';
import { FollowCamera } from './FollowCamera';
import { useGameStore } from '../../store/gameStore';
import { leadCharPos, isAnimating } from '../../engine/animState';

// Ch3 rain during power outage
const StormRainParticles: React.FC<{ count?: number }> = ({ count = 60 }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = Math.random() * 7 + 0.2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return [pos];
  }, [count]);
  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const a = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      let y = a.getY(i);
      let x = a.getX(i);
      y -= delta * 3.2;
      x += delta * 0.3;
      if (y < 0) { y = 7; x = (Math.random() - 0.5) * 18; }
      a.setY(i, y); a.setX(i, x);
    }
    a.needsUpdate = true;
  });
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#9ab0c0" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
    </points>
  );
};

// Ch2 golden hour dust motes
const DustMotes: React.FC<{ count?: number }> = ({ count = 35 }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = Math.random() * 4 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return [pos];
  }, [count]);
  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const a = pointsRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      let y = a.getY(i);
      y += Math.sin(t * 0.5 + i * 0.7) * 0.003;
      if (y > 5) y = 0.5;
      a.setY(i, y);
    }
    a.needsUpdate = true;
  });
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#F0C870" transparent opacity={0.45} blending={THREE.AdditiveBlending} />
    </points>
  );
};

export const CityScene3D: React.FC<{ onTileClick?: (x: number, y: number) => void }> = ({
  onTileClick,
}) => {
  const { currentChapterId, currentChapter, gameMode } = useGameStore();
  const { camera } = useThree();
  const isDusk = currentChapterId === 2;
  const isBlackout = currentChapterId === 3;
  const gw = currentChapter.gridWidth;
  const gh = currentChapter.gridHeight;

  // Shared refs — PlayerController writes, FollowCamera reads
  const sharedMayaRef  = useRef<THREE.Group>(null);
  const cameraYawRef   = useRef<number>(Math.PI); // start facing Maya from behind

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' ||
        new URLSearchParams(window.location.search).get('tllDiagnostics') !== '1') return;
    const diagnostic = window.__TLL_TEST_PLAYER__;
    if (diagnostic) {
      diagnostic.mode = gameMode;
      diagnostic.blocked = gameMode !== 'explore';
      if (gameMode !== 'explore') diagnostic.vx = diagnostic.vz = 0;
    }
  }, [gameMode]);

  // Camera initial position (used for design mode)
  const camPos: [number, number, number] = isBlackout
    ? [0, 5.5, 9.5]
    : isDusk
    ? [0, 5.0, 9.0]
    : [0, 4.5, 8.0];
  const fov = isBlackout ? 56 : isDusk ? 54 : 52;
  const target: [number, number, number] = [0, 0.5, 0];

  // Design-mode orbit tracking
  const orbitRef = useRef<any>(null);
  const trackTarget = useRef(new THREE.Vector3(0, 0.5, 0));
  const trackGoal = useRef(new THREE.Vector3(0, 0.5, 0));
  const libraryLabel = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#25343B';
    ctx.fillRect(0, 0, 256, 80);
    ctx.strokeStyle = '#C87D70';
    ctx.lineWidth = 5;
    ctx.strokeRect(3, 3, 250, 74);
    ctx.fillStyle = '#F6F3EB';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LIBRARY', 128, 42);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useEffect(() => () => libraryLabel?.dispose(), [libraryLabel]);

  useEffect(() => {
    const resetCamera = () => {
      cameraYawRef.current = Math.PI;
      if (useGameStore.getState().gameMode === 'design') {
        camera.position.set(...camPos);
        trackTarget.current.set(...target);
        trackGoal.current.set(...target);
        if (orbitRef.current) {
          orbitRef.current.target.set(...target);
          orbitRef.current.update();
        }
      }
    };
    window.addEventListener('tll-reset-camera', resetCamera);
    if (gameMode === 'design') resetCamera();
    return () => window.removeEventListener('tll-reset-camera', resetCamera);
  }, [camera, currentChapterId, gameMode]);

  useFrame(() => {
    const { isSimulating, gameMode: gm } = useGameStore.getState();
    if (gm !== 'design') return; // orbit tracking only in design mode
    if (isSimulating && isAnimating.current) {
      trackGoal.current.set(leadCharPos.x * 0.45, 0.5, leadCharPos.z * 0.45);
    } else {
      trackGoal.current.set(0, 0.5, 0);
    }
    trackTarget.current.lerp(trackGoal.current, isSimulating ? 0.04 : 0.06);
    if (orbitRef.current) {
      orbitRef.current.target.copy(trackTarget.current);
      orbitRef.current.update();
    }
  });

  // Library world position — tile (6,2) in Chapter 1
  const libX = 6 - (currentChapter.gridWidth  - 1) / 2;
  const libZ = 2 - (currentChapter.gridHeight - 1) / 2;

  // Ch1: warm sunny morning — dusty blue sky
  // Ch2: golden hour — warm amber haze
  // Ch3: night power outage — dark navy (readable, not pure black)
  const skyColor = isBlackout ? '#0E1820' : isDusk ? '#7A5030' : '#B8CDD6';
  const fogNear = isBlackout ? 9 : isDusk ? 12 : 14;
  const fogFar = isBlackout ? 22 : isDusk ? 32 : 36;

  return (
    <>
      <PerspectiveCamera makeDefault position={camPos} fov={fov} near={0.1} far={80} />

      {/* ── Design Mode: free-orbit construction camera ── */}
      {gameMode === 'design' && (
        <OrbitControls
          ref={orbitRef}
          enableDamping
          dampingFactor={0.07}
          minDistance={4}
          maxDistance={18}
          minPolarAngle={Math.PI / 10}
          maxPolarAngle={Math.PI / 2.2}
          target={target}
          enablePan
        />
      )}

      {/* ── Explore Mode: third-person follow camera + player controller ── */}
      {gameMode === 'explore' && (
        <>
          <FollowCamera  mayaRef={sharedMayaRef} cameraYawRef={cameraYawRef} />
          <PlayerController mayaRef={sharedMayaRef} cameraYawRef={cameraYawRef} />
        </>
      )}

      {/* Library destination marker (Chapter 1). */}
      {currentChapterId === 1 && (
        <group position={[libX, 0, libZ]} visible={gameMode === 'explore'}>
          {/* Floating pin cone */}
          <mesh position={[0, 3.4, 0]} castShadow>
            <coneGeometry args={[0.06, 0.2, 8]} />
            <meshStandardMaterial color="#C87D70" emissive="#C87D70" emissiveIntensity={1.0} />
          </mesh>
          <mesh position={[0, 3.7, 0]}>
            <sphereGeometry args={[0.14, 10, 10]} />
            <meshStandardMaterial color="#C87D70" emissive="#C87D70" emissiveIntensity={1.2} />
          </mesh>
          {/* Vertical line */}
          <mesh position={[0, 2.4, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 2.0, 6]} />
            <meshStandardMaterial color="#B59A67" roughness={0.4} />
          </mesh>
          {libraryLabel && (
            <Billboard position={[0, 4.2, 0]}>
              <mesh>
                <planeGeometry args={[1.4, 0.44]} />
                <meshBasicMaterial map={libraryLabel} toneMapped={false} />
              </mesh>
            </Billboard>
          )}
        </group>
      )}

      {/* Sky and fog */}
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[skyColor, fogNear, fogFar]} />

      {/* ── Ch1: Warm sunny morning ── */}
      {!isDusk && !isBlackout && (
        <>
          {/* High warm ambient — fills shadow areas with sky bounce */}
          <ambientLight color="#D8E8F0" intensity={0.75} />
          {/* Main sun — warm white from upper right */}
          <directionalLight
            position={[12, 18, 8]}
            color="#FFF8E8"
            intensity={2.4}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-left={-12}
            shadow-camera-right={12}
            shadow-camera-top={12}
            shadow-camera-bottom={-12}
            shadow-bias={-0.0005}
          />
          {/* Cool sky fill from left — prevents pitch-black shadows */}
          <directionalLight position={[-10, 8, 4]} color="#C0D8EC" intensity={0.6} />
          {/* Warm ground bounce — subtle uplighting */}
          <directionalLight position={[0, -3, 6]} color="#D4B888" intensity={0.25} />
        </>
      )}

      {/* ── Ch2: Late afternoon golden hour ── */}
      {isDusk && (
        <>
          <ambientLight color="#A07040" intensity={0.7} />
          {/* Low sun from west — golden and warm */}
          <directionalLight
            position={[14, 5, 10]}
            color="#FFB858"
            intensity={2.6}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-left={-14}
            shadow-camera-right={14}
            shadow-camera-top={14}
            shadow-camera-bottom={-14}
            shadow-bias={-0.0005}
          />
          {/* Cool blue-purple shadow fill from east */}
          <directionalLight position={[-8, 6, -4]} color="#7080C0" intensity={0.5} />
          {/* Warm street-level bounce */}
          <pointLight position={[0, 0.5, 0]} color="#FF8030" intensity={0.6} distance={12} />
        </>
      )}

      {/* ── Ch3: Night / power outage — genuine darkness, player lights matter ── */}
      {isBlackout && (
        <>
          {/* Near-zero fill: only enough to prevent solid black silhouettes */}
          <ambientLight color="#08101A" intensity={0.06} />
          {/* Moonlight: a single dim cool directional — creates one lit face per building */}
          <directionalLight
            position={[6, 16, 8]}
            color="#2A4878"
            intensity={0.14}
            castShadow
            shadow-mapSize={[512, 512]}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
            shadow-bias={-0.001}
          />
          {/* Two surviving emergency fixtures — warm orange, short range */}
          <pointLight position={[-2.5, 1.8, -1.2]} color="#E06010" intensity={0.7} distance={4.5} decay={2} />
          <pointLight position={[3.2, 1.8, 2.0]} color="#E06010" intensity={0.55} distance={3.8} decay={2} />
          {/* Cold moonlit rear-rim: just enough to separate buildings from sky */}
          <directionalLight position={[-6, 5, -10]} color="#101828" intensity={0.1} />
        </>
      )}

      {/* ── Particles ── */}
      {isBlackout && <StormRainParticles count={65} />}
      {isDusk && <DustMotes count={30} />}

      {/* ── World ── */}
      <Environment3D gridW={gw} gridH={gh} />
      <InteractiveGrid3D onTileClick={onTileClick} mayaGroupRef={sharedMayaRef} />
    </>
  );
};
