export interface MovementObstacle {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface DirectionKeys {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

export function normalizedInput(keys: DirectionKeys): { x: number; z: number; moving: boolean } {
  let x = Number(keys.right) - Number(keys.left);
  let z = Number(keys.backward) - Number(keys.forward);
  const length = Math.hypot(x, z);
  if (length > 1) {
    x /= length;
    z /= length;
  }
  return { x, z, moving: length > 0 };
}

function overlaps(x: number, z: number, obstacles: MovementObstacle[], radius: number): boolean {
  return obstacles.some(obstacle =>
    x + radius > obstacle.minX && x - radius < obstacle.maxX &&
    z + radius > obstacle.minZ && z - radius < obstacle.maxZ
  );
}

export function resolveMovement(
  x: number,
  z: number,
  dx: number,
  dz: number,
  boundX: number,
  boundZ: number,
  obstacles: MovementObstacle[],
  radius: number,
): { x: number; z: number; blocked: 'none' | 'x' | 'z' | 'both' } {
  const nextX = Math.max(-boundX, Math.min(boundX, x + dx));
  const nextZ = Math.max(-boundZ, Math.min(boundZ, z + dz));
  if (!overlaps(nextX, nextZ, obstacles, radius)) return { x: nextX, z: nextZ, blocked: 'none' };
  if (!overlaps(nextX, z, obstacles, radius)) return { x: nextX, z, blocked: 'z' };
  if (!overlaps(x, nextZ, obstacles, radius)) return { x, z: nextZ, blocked: 'x' };
  return { x, z, blocked: 'both' };
}
