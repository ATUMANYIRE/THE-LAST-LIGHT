import { describe, it, expect } from 'vitest';
import { chapter1, chapter2, chapter3 } from '../levels';
import { buildTileMap, findPathForResident } from '../pathfinding';
import { GridTile } from '../../types/game';

describe('Gameplay Verification: All 3 Chapters Solvability & Budgets', () => {
  it('Chapter 1 (The Shortcut) can be solved within budget ($150) in both Phase 1 and Post-Reveal', () => {
    // Budget: $150
    // Phase 1: Maya needs path from (1, 1) to (6, 2)
    // Cost: 3 paved walkways @ $15 each = $45
    // Phase 2: Sam (wheelchair) revealed at (1, 2). Needs ramp on (3, 2).
    // Cost: 1 ramp @ $25 = $25
    // Total cost: $70 <= $150 budget!
    const tiles: GridTile[] = JSON.parse(JSON.stringify(chapter1.initialTiles));
    const tileMap = buildTileMap(tiles);

    // Place path from (1, 1) to (6, 2)
    const placedWalkways = [
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 5, y: 2 },
    ];
    let budgetSpent = 0;
    for (const c of placedWalkways) {
      const t = tileMap.get(`${c.x},${c.y}`);
      if (t) {
        t.type = 'paved_walkway';
        budgetSpent += chapter1.toolCosts.paved_walkway;
      }
    }

    // Test Maya (Phase 1)
    const maya = chapter1.residents.find((r) => r.id === 'maya')!;
    const mayaPhase1 = findPathForResident(maya, tileMap, chapter1.gridWidth, chapter1.gridHeight);
    expect(mayaPhase1.success).toBe(true);

    // Post-reveal: Place ramp at (3, 2)
    const steps = tileMap.get('3,2');
    expect(steps).toBeDefined();
    if (steps) {
      steps.type = 'ramp';
      steps.hasRamp = true;
      budgetSpent += chapter1.toolCosts.ramp;
    }

    // Test both Maya and Sam in Phase 2
    const sam = chapter1.residents.find((r) => r.id === 'sam')!;
    const samResult = findPathForResident(sam, tileMap, chapter1.gridWidth, chapter1.gridHeight);
    const mayaResult = findPathForResident(maya, tileMap, chapter1.gridWidth, chapter1.gridHeight);

    expect(samResult.success).toBe(true);
    expect(mayaResult.success).toBe(true);
    expect(budgetSpent).toBeLessThanOrEqual(chapter1.startingBudget);
  });

  it('Chapter 2 (The Silent Crossing) can be solved within budget ($190)', () => {
    // Budget: $190
    // Kai at (1, 2) -> Pharmacy at (7, 2)
    // Elena at (1, 3) -> Transit at (7, 3)
    // Needs:
    // Paved path for Kai: (2, 2), (3, 2), (5, 2), (6, 2) = 4 * $15 = $60
    // Tactile path for Elena: (2, 3), (3, 3), (5, 3), (6, 3) = 4 * $15 = $60
    // Acoustic Beacon at crosswalk (4, 3): 1 * $30 = $30
    // Total spent: $150 <= $190 budget!
    const tiles: GridTile[] = JSON.parse(JSON.stringify(chapter2.initialTiles));
    const tileMap = buildTileMap(tiles);
    let budgetSpent = 0;

    // Connect Kai's path at row 2
    for (const x of [2, 3, 5, 6]) {
      const t = tileMap.get(`${x},2`);
      if (t) {
        t.type = 'paved_walkway';
        budgetSpent += chapter2.toolCosts.paved_walkway;
      }
    }

    // Connect Elena's tactile path at row 3
    for (const x of [2, 3, 5, 6]) {
      const t = tileMap.get(`${x},3`);
      if (t) {
        t.type = 'tactile_paving';
        t.hasTactile = true;
        budgetSpent += chapter2.toolCosts.tactile_paving;
      }
    }

    // Install acoustic beacon at road crosswalk (4, 3)
    const crosswalk = tileMap.get('4,3');
    if (crosswalk) {
      crosswalk.hasAudioBeacon = true;
      crosswalk.hasTactile = true;
      budgetSpent += chapter2.toolCosts.acoustic_beacon;
    }

    const kai = chapter2.residents.find((r) => r.id === 'kai')!;
    const elena = chapter2.residents.find((r) => r.id === 'elena')!;

    const kaiResult = findPathForResident(kai, tileMap, chapter2.gridWidth, chapter2.gridHeight);
    const elenaResult = findPathForResident(elena, tileMap, chapter2.gridWidth, chapter2.gridHeight);

    expect(kaiResult.success).toBe(true);
    expect(elenaResult.success).toBe(true);
    expect(budgetSpent).toBeLessThanOrEqual(chapter2.startingBudget);
  });

  it('Chapter 3 (One Light Left) can be solved within budget ($240)', () => {
    // Budget: $240
    // Maya at (1, 2) -> (8, 2)
    // Sam at (1, 3) -> (8, 2)
    // Mr. Henderson at (1, 4) -> (8, 4)
    // Storm path: row 2 and 3 have debris/curbs at (4, 2)-(4, 4)
    // Bypass route: row 1 or place ramp on curb at (4, 2)
    // Place streetlamp at (4, 3) which lights radius 2 (covers rows 1-5, cols 2-6)
    // Place resting bench at (4, 4)
    // Connect paved walkway along row 2 and row 4
    const tiles: GridTile[] = JSON.parse(JSON.stringify(chapter3.initialTiles));
    const tileMap = buildTileMap(tiles);
    let budgetSpent = 0;

    // Place central streetlamp at (5, 3)
    const centralLamp = tileMap.get('5,3');
    if (centralLamp) {
      centralLamp.type = 'streetlamp';
      centralLamp.lightSource = true;
      centralLamp.hasLight = true;
      centralLamp.elevation = 0;
      centralLamp.hasRamp = true;
      budgetSpent += chapter3.toolCosts.streetlamp;
    }

    // Place ramp on curb at (4, 2)
    const curbRamp = tileMap.get('4,2');
    if (curbRamp) {
      curbRamp.type = 'ramp';
      curbRamp.hasRamp = true;
      curbRamp.elevation = 0;
      budgetSpent += chapter3.toolCosts.ramp;
    }

    // Place resting bench with ramp at broken curb (4, 4)
    const bench = tileMap.get('4,4');
    if (bench) {
      bench.type = 'resting_bench';
      bench.hasBench = true;
      bench.hasRamp = true;
      bench.elevation = 0;
      budgetSpent += chapter3.toolCosts.resting_bench;
    }

    // Pave corridor row 2 (Maya & Sam)
    for (const x of [2, 3, 5, 6, 7]) {
      const t = tileMap.get(`${x},2`);
      if (t) {
        t.type = 'paved_walkway';
        budgetSpent += chapter3.toolCosts.paved_walkway;
      }
    }

    // Pave corridor row 4 (Mr. Henderson)
    for (const x of [2, 3, 5, 6, 7]) {
      const t = tileMap.get(`${x},4`);
      if (t) {
        t.type = 'paved_walkway';
        budgetSpent += chapter3.toolCosts.paved_walkway;
      }
    }

    // Recompute lighting across grid
    for (const t of tiles) {
      // Light is cast from (2, 3), (5, 3), (8, 3)
      for (const lampPos of [{ x: 2, y: 3 }, { x: 5, y: 3 }, { x: 8, y: 3 }]) {
        if (Math.abs(t.x - lampPos.x) + Math.abs(t.y - lampPos.y) <= 2) {
          t.hasLight = true;
        }
      }
    }

    const maya = chapter3.residents.find((r) => r.id === 'maya')!;
    const sam = chapter3.residents.find((r) => r.id === 'sam')!;
    const henderson = chapter3.residents.find((r) => r.id === 'henderson')!;

    const mayaRes = findPathForResident(maya, tileMap, chapter3.gridWidth, chapter3.gridHeight);
    const samRes = findPathForResident(sam, tileMap, chapter3.gridWidth, chapter3.gridHeight);
    const hendersonRes = findPathForResident(henderson, tileMap, chapter3.gridWidth, chapter3.gridHeight);

    expect(mayaRes.success).toBe(true);
    expect(samRes.success).toBe(true);
    expect(hendersonRes.success).toBe(true);
    expect(budgetSpent).toBeLessThanOrEqual(chapter3.startingBudget);
  });
});
