import { afterEach, describe, expect, it } from 'vitest';
import { clearTouchInput, getTouchDirection, pressTouchDirection, releaseTouchPointer } from '../touchInput';
import { normalizedInput } from '../movement';

afterEach(clearTouchInput);

describe('Touch input shared with the movement engine', () => {
  it('combines simultaneous directions at normalized diagonal speed', () => {
    pressTouchDirection(1, 'forward');
    pressTouchDirection(2, 'right');
    const input = normalizedInput(getTouchDirection());
    expect(input.moving).toBe(true);
    expect(Math.hypot(input.x, input.z)).toBeCloseTo(1, 6);
    releaseTouchPointer(1);
    expect(getTouchDirection()).toMatchObject({ forward: false, right: true });
    releaseTouchPointer(2);
    expect(normalizedInput(getTouchDirection()).moving).toBe(false);
  });

  it('keeps a direction held until all fingers on it release and clears on mode exit', () => {
    pressTouchDirection(3, 'left');
    pressTouchDirection(4, 'left');
    releaseTouchPointer(3);
    expect(getTouchDirection().left).toBe(true);
    clearTouchInput();
    expect(getTouchDirection().left).toBe(false);
  });
});
