'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import { GridTile } from '../../types/game';
import { leadCharPos } from '../../engine/animState';
import { normalizedInput, resolveMovement, MovementObstacle } from '../../engine/movement';
import { clearTouchInput, getTouchDirection } from '../../engine/touchInput';

declare global {
  interface Window {
    __TLL_TEST_PLAYER__?: {
      x: number; z: number; vx: number; vz: number; yaw: number;
      inputX: number; inputZ: number;
      chapterId: number; mode: 'explore' | 'design'; blocked: boolean;
      collision: 'none' | 'x' | 'z' | 'both'; frame: number;
    };
  }
}

// Opt-in diagnostic output is compiled out of production builds. The game never reads it.
const diagnosticsEnabled = process.env.NODE_ENV !== 'production' &&
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tllDiagnostics') === '1';

// ─── Module-level key state — never triggers React re-renders ─────────────────
const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  shift: false,
};
const clearKeys = () => {
  keys.forward = keys.backward = keys.left = keys.right = keys.shift = false;
};

// ─── Movement tuning ──────────────────────────────────────────────────────────
const WALK_SPEED = 3.2;
const JOG_SPEED  = 5.8;
const ACCEL = 14;
const DECEL = 16;
const PLAYER_RADIUS = 0.20;

// ─── AABB cache ───────────────────────────────────────────────────────────────
function buildAABBs(tiles: GridTile[], oX: number, oZ: number, chapterId: number): MovementObstacle[] {
  return tiles
    .filter(t => t.type === 'building' || t.type === 'obstacle' ||
      (chapterId === 1 && ((t.x === 1 && t.y === 1) || (t.x === 1 && t.y === 2) || (t.x === 6 && t.y === 2))))
    .map(t => {
      const wx = t.x - oX;
      const wz = t.y - oZ;
      const r = 0.46;
      return { minX: wx - r, maxX: wx + r, minZ: wz - r, maxZ: wz + r };
    });
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface PlayerControllerProps {
  mayaRef: React.RefObject<THREE.Group | null>;
  cameraYawRef: React.MutableRefObject<number>;
}

export const PlayerController: React.FC<PlayerControllerProps> = ({ mayaRef, cameraYawRef }) => {
  const velRef   = useRef(new THREE.Vector3());
  const aabbsRef = useRef<MovementObstacle[]>([]);
  const lastChapterRef = useRef<number>(-1);
  const frameRef = useRef(0);
  const inputRef = useRef({ x: 0, z: 0 });

  const publishDiagnostics = (mode: 'explore' | 'design', chapterId: number, blocked: boolean,
    collision: 'none' | 'x' | 'z' | 'both' = 'none') => {
    if (!diagnosticsEnabled || !mayaRef.current) return;
    window.__TLL_TEST_PLAYER__ = {
      x: mayaRef.current.position.x, z: mayaRef.current.position.z,
      vx: velRef.current.x, vz: velRef.current.z, yaw: cameraYawRef.current,
      inputX: inputRef.current.x, inputZ: inputRef.current.z,
      chapterId, mode, blocked, collision, frame: ++frameRef.current,
    };
  };

  // ─── Keyboard listeners ──────────────────────────────────────────────────
  useEffect(() => {
    const resetPosition = () => {
      lastChapterRef.current = -1;
      velRef.current.set(0, 0, 0);
      clearKeys();
      clearTouchInput();
    };
    const onDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (useGameStore.getState().gameMode !== 'explore') return;
      if (document.querySelector('[aria-modal="true"], [data-testid="title-screen"], [data-testid="player-name-screen"], [data-testid="gameplay-loop-modal"], [aria-label="Tutorial"]')) return;
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    keys.forward  = true; break;
        case 'KeyS': case 'ArrowDown':  keys.backward = true; break;
        case 'KeyA': case 'ArrowLeft':  keys.left     = true; break;
        case 'KeyD': case 'ArrowRight': keys.right    = true; break;
        case 'ShiftLeft': case 'ShiftRight': keys.shift = true; break;
      }
    };
    const onUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    keys.forward  = false; break;
        case 'KeyS': case 'ArrowDown':  keys.backward = false; break;
        case 'KeyA': case 'ArrowLeft':  keys.left     = false; break;
        case 'KeyD': case 'ArrowRight': keys.right    = false; break;
        case 'ShiftLeft': case 'ShiftRight': keys.shift = false; break;
      }
    };
    const onBlur = () => {
      clearKeys();
      clearTouchInput();
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup',   onUp);
    window.addEventListener('blur',    onBlur);
    window.addEventListener('tll-reset-player', resetPosition);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup',   onUp);
      window.removeEventListener('blur',    onBlur);
      window.removeEventListener('tll-reset-player', resetPosition);
      onBlur();
    };
  }, []);

  // ─── Per-frame update ─────────────────────────────────────────────────────
  useFrame((_, delta) => {
    const {
      gameMode, tiles, currentChapter, currentChapterId,
      showIntroModal, showRevealModal, showVictoryModal, showFailureModal,
      showSettingsModal, showHelpModal, showChapterSelect, showFinaleModal,
      isSimulating,
    } = useGameStore.getState();

    if (gameMode !== 'explore') {
      velRef.current.set(0, 0, 0);
      inputRef.current.x = inputRef.current.z = 0;
      clearKeys();
      clearTouchInput();
      publishDiagnostics(gameMode, currentChapterId, true);
      return;
    }
    // Block movement during any modal or simulation
    if (showIntroModal || showRevealModal || showVictoryModal || showFailureModal ||
        showSettingsModal || showHelpModal || showChapterSelect || showFinaleModal ||
        document.querySelector('[data-testid="title-screen"], [data-testid="player-name-screen"], [data-testid="gameplay-loop-modal"], [aria-label="Tutorial"]') ||
        ['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) {
      velRef.current.set(0, 0, 0);
      inputRef.current.x = inputRef.current.z = 0;
      clearKeys();
      clearTouchInput();
      publishDiagnostics(gameMode, currentChapterId, true);
      return;
    }

    const maya = mayaRef.current;
    if (!maya) return;

    const oX = (currentChapter.gridWidth  - 1) / 2;
    const oZ = (currentChapter.gridHeight - 1) / 2;

    // Rebuild AABB cache when chapter changes or on first run
    if (currentChapterId !== lastChapterRef.current) {
      lastChapterRef.current = currentChapterId;
      aabbsRef.current = buildAABBs(tiles, oX, oZ, currentChapterId);
      // Initialize the active chapter lead at the starting tile.
      const leadProfile = currentChapter.residents.find(r => currentChapter.initialActiveResidentIds.includes(r.id));
      if (leadProfile) {
        maya.position.set(
          leadProfile.startPosition.x - oX + (currentChapterId === 1 ? 0.68 : 0),
          0,
          leadProfile.startPosition.y - oZ,
        );
      }
      velRef.current.set(0, 0, 0);
    }

    // If simulation is running, let InteractiveGrid3D drive position
    if (isSimulating) {
      publishDiagnostics(gameMode, currentChapterId, true);
      return;
    }

    const speed = keys.shift ? JOG_SPEED : WALK_SPEED;
    const yaw   = cameraYawRef.current;

    // Raw input (camera-relative)
    const touch = getTouchDirection();
    const { x: ix, z: iz, moving: isMoving } = normalizedInput({
      forward: keys.forward || touch.forward,
      backward: keys.backward || touch.backward,
      left: keys.left || touch.left,
      right: keys.right || touch.right,
    });
    inputRef.current.x = ix;
    inputRef.current.z = iz;

    // Rotate input by camera yaw → world-space direction
    const cos = Math.cos(yaw), sin = Math.sin(yaw);
    const wx = ix * cos + iz * sin;
    const wz = -ix * sin + iz * cos;

    // Smooth velocity
    const dt = Math.min(delta, 0.05); // clamp large deltas (tab switch etc.)
    if (isMoving) {
      velRef.current.x = THREE.MathUtils.lerp(velRef.current.x, wx * speed, Math.min(dt * ACCEL, 1));
      velRef.current.z = THREE.MathUtils.lerp(velRef.current.z, wz * speed, Math.min(dt * ACCEL, 1));
    } else {
      velRef.current.x = THREE.MathUtils.lerp(velRef.current.x, 0, Math.min(dt * DECEL, 1));
      velRef.current.z = THREE.MathUtils.lerp(velRef.current.z, 0, Math.min(dt * DECEL, 1));
    }

    const dx = velRef.current.x * dt;
    const dz = velRef.current.z * dt;

    // World bounds (grid edge + small margin)
    const bX = oX + 0.6;
    const bZ = oZ + 0.6;

    const aabbs  = aabbsRef.current;
    const r      = PLAYER_RADIUS;
    const curX   = maya.position.x;
    const curZ   = maya.position.z;

    const resolved = resolveMovement(curX, curZ, dx, dz, bX, bZ, aabbs, r);
    maya.position.x = resolved.x;
    maya.position.z = resolved.z;
    if (resolved.blocked === 'x' || resolved.blocked === 'both') velRef.current.x = 0;
    if (resolved.blocked === 'z' || resolved.blocked === 'both') velRef.current.z = 0;

    // Face movement direction
    const speed2d = Math.hypot(velRef.current.x, velRef.current.z);
    if (speed2d > 0.15) {
      const target = Math.atan2(velRef.current.x, velRef.current.z);
      maya.rotation.y = THREE.MathUtils.lerp(maya.rotation.y, target, Math.min(dt * 10, 1));
    }

    // Publish position for any systems that read animState
    leadCharPos.set(maya.position.x, 0, maya.position.z);
    publishDiagnostics(gameMode, currentChapterId, false, resolved.blocked);
  });

  return null;
};
