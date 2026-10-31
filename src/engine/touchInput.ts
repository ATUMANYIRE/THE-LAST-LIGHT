import { DirectionKeys } from './movement';

export type TouchDirection = keyof DirectionKeys;

const pointers = new Map<number, TouchDirection>();

export function pressTouchDirection(pointerId: number, direction: TouchDirection): void {
  pointers.set(pointerId, direction);
}

export function releaseTouchPointer(pointerId: number): void {
  pointers.delete(pointerId);
}

export function clearTouchInput(): void {
  pointers.clear();
}

export function getTouchDirection(): DirectionKeys {
  const active: DirectionKeys = { forward: false, backward: false, left: false, right: false };
  for (const direction of pointers.values()) active[direction] = true;
  return active;
}
