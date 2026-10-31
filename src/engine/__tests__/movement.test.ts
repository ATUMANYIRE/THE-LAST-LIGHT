import { describe, expect, it } from 'vitest';
import { normalizedInput, resolveMovement, MovementObstacle } from '../movement';

const building: MovementObstacle = { minX: 1, maxX: 2, minZ: 1, maxZ: 2 };

describe('Third-person controller math (deterministic checks)', () => {
  it('normalizes diagonals to the same speed as cardinal input and stops on release', () => {
    const forward = normalizedInput({ forward: true, backward: false, left: false, right: false });
    const diagonal = normalizedInput({ forward: true, backward: false, left: false, right: true });
    const released = normalizedInput({ forward: false, backward: false, left: false, right: false });
    expect(Math.hypot(forward.x, forward.z)).toBe(1);
    expect(Math.hypot(diagonal.x, diagonal.z)).toBeCloseTo(1, 10);
    expect(released).toEqual({ x: 0, z: 0, moving: false });
  });

  it('stops before building geometry and slides along a free wall axis', () => {
    const blocked = resolveMovement(0.7, 1.5, 0.3, 0, 4, 4, [building], 0.2);
    expect(blocked.x).toBe(0.7);
    expect(blocked.blocked).toBe('x');

    const sliding = resolveMovement(0.7, 0.7, 0.3, 0.3, 4, 4, [building], 0.2);
    expect(sliding.x).toBe(1);
    expect(sliding.z).toBe(0.7);
    expect(sliding.blocked).toBe('z');
  });

  it('clamps movement to world boundaries', () => {
    const edge = resolveMovement(3.9, -3.9, 1, -1, 4, 4, [], 0.2);
    expect(edge).toEqual({ x: 4, z: -4, blocked: 'none' });
  });
});
