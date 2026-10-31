'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

// ─── Camera tuning ────────────────────────────────────────────────────────────
const FOLLOW_DIST   = 1.4;   // stay close enough that roofs do not hide the player
const FOLLOW_HEIGHT = 3.2;
const LOOK_HEIGHT   = 0.8;   // look-at height offset (Maya's head)
const CAM_LERP      = 0.08;  // position smoothing
const DRAG_SPEED    = 0.003; // radians per pixel of drag

// ─── Module-level drag state ──────────────────────────────────────────────────
const drag = { active: false, lastX: 0, lastY: 0 };

interface FollowCameraProps {
  mayaRef: React.RefObject<THREE.Group | null>;
  cameraYawRef: React.MutableRefObject<number>;
  pitchRef?: React.MutableRefObject<number>;
}

export const FollowCamera: React.FC<FollowCameraProps> = ({ mayaRef, cameraYawRef }) => {
  const { camera, gl } = useThree();

  const camPosRef    = useRef(new THREE.Vector3(0, FOLLOW_HEIGHT + 2, FOLLOW_DIST));
  const desiredPosRef = useRef(new THREE.Vector3());
  const lookTargetRef = useRef(new THREE.Vector3());

  // ─── Mouse / touch drag ───────────────────────────────────────────────────
  useEffect(() => {
    const el = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      // Only capture left-button drags; right-button panning belongs to design mode
      if (e.button !== 0) return;
      drag.active = true;
      drag.lastX  = e.clientX;
      drag.lastY  = e.clientY;
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag.active) return;
      const dx = e.clientX - drag.lastX;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      cameraYawRef.current -= dx * DRAG_SPEED;
    };

    const onPointerUp = (e: PointerEvent) => {
      drag.active = false;
      try { el.releasePointerCapture(e.pointerId); } catch {}
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup',   onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup',   onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      drag.active = false;
    };
  }, [gl.domElement, cameraYawRef]);

  // ─── Per-frame camera update ──────────────────────────────────────────────
  useFrame(() => {
    const maya = mayaRef.current;
    const yaw  = cameraYawRef.current;

    const mx = maya ? maya.position.x : 0;
    const mz = maya ? maya.position.z : 0;

    // Desired camera offset behind Maya, rotated by yaw
    const offsetX = Math.sin(yaw) * FOLLOW_DIST;
    const offsetZ = Math.cos(yaw) * FOLLOW_DIST;

    const desiredX = mx + offsetX;
    const desiredY = FOLLOW_HEIGHT;
    const desiredZ = mz + offsetZ;

    // Smooth camera position
    desiredPosRef.current.set(desiredX, desiredY, desiredZ);
    camPosRef.current.lerp(desiredPosRef.current, CAM_LERP);

    camera.position.copy(camPosRef.current);

    // Look at Maya's head
    lookTargetRef.current.set(mx, LOOK_HEIGHT, mz);
    camera.lookAt(lookTargetRef.current);
  });

  return null;
};
