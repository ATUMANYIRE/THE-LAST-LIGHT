'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Coordinate } from '../../types/game';

interface PathTrailProps {
  path: Coordinate[];
  isSuccess?: boolean;
  gridOriginX?: number;
  gridOriginZ?: number;
}

export const PathTrail3D: React.FC<PathTrailProps> = ({
  path,
  isSuccess = true,
  gridOriginX = 0,
  gridOriginZ = 0,
}) => {
  const linePoints = useMemo(() => {
    if (!path || path.length < 2) return [];
    return path.map((coord) => {
      const worldX = coord.x - gridOriginX;
      const worldZ = coord.y - gridOriginZ;
      return new THREE.Vector3(worldX, 0.14, worldZ);
    });
  }, [path, gridOriginX, gridOriginZ]);

  const curve = useMemo(() => {
    if (linePoints.length < 2) return null;
    return new THREE.CatmullRomCurve3(linePoints, false, 'centripetal', 0.2);
  }, [linePoints]);

  const tubeGeometry = useMemo(() => {
    if (!curve) return null;
    return new THREE.TubeGeometry(curve, Math.max(path.length * 6, 12), 0.03, 8, false);
  }, [curve, path]);

  const trailColor = isSuccess ? '#10b981' : '#f59e0b';

  return (
    <group>
      {/* Glowing 3D Path Tube */}
      {tubeGeometry && (
        <mesh geometry={tubeGeometry}>
          <meshStandardMaterial
            color={trailColor}
            emissive={trailColor}
            emissiveIntensity={isSuccess ? 2.5 : 1.8}
            roughness={0.2}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* Stepping light dots along the path nodes */}
      {linePoints.map((pt, i) => (
        <group key={`step-${i}`} position={[pt.x, pt.y, pt.z]}>
          <mesh>
            <cylinderGeometry args={[0.07, 0.07, 0.015, 12]} />
            <meshStandardMaterial
              color={trailColor}
              emissive={trailColor}
              emissiveIntensity={2.0}
            />
          </mesh>
        </group>
      ))}

      {/* Failure barrier marker if path was blocked */}
      {!isSuccess && linePoints.length > 0 && (
        <group
          position={[
            linePoints[linePoints.length - 1].x,
            0.3,
            linePoints[linePoints.length - 1].z,
          ]}
        >
          <mesh>
            <octahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={3.0}
            />
          </mesh>
          <pointLight color="#ef4444" intensity={2.0} distance={1.5} />
        </group>
      )}
    </group>
  );
};
