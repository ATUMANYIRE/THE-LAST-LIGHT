import { describe, it, expect } from 'vitest';
import { chapter1, chapter2, chapter3 } from '../levels';
import { buildTileMap, findPathForResident, recalculateLighting } from '../pathfinding';
import { GridTile } from '../../types/game';

describe('Deterministic Pathfinding Engine & Accessibility Constraints', () => {
  describe('Chapter 1: The Shortcut & Invisible Resident (Sam)', () => {
    it('allows Maya to traverse stairs to reach the Clocktower Library', () => {
      // Maya starts at (1, 1), Library at (6, 2)
      // Create a connected paved path from (1, 1) to (6, 2) via stairs at (3, 2)
      const tiles: GridTile[] = JSON.parse(JSON.stringify(chapter1.initialTiles));
      const tileMap = buildTileMap(tiles);

      // Connect (1, 1) to (3, 2) and (4, 2) to (6, 2)
      const pathCoords = [
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        // (3, 2) is staircase
        // (4, 2) is stone alley
        { x: 5, y: 2 },
      ];

      for (const c of pathCoords) {
        const t = tileMap.get(`${c.x},${c.y}`);
        if (t) t.type = 'paved_walkway';
      }

      const maya = chapter1.residents.find((r) => r.id === 'maya')!;
      const result = findPathForResident(maya, tileMap, chapter1.gridWidth, chapter1.gridHeight);

      expect(result.success).toBe(true);
      expect(result.path.length).toBeGreaterThan(0);
      expect(result.path[0]).toEqual({ x: 1, y: 1 });
      expect(result.path[result.path.length - 1]).toEqual({ x: 6, y: 2 });
    });

    it('blocks Sam (wheelchair) on the staircase without a ramp with barrierType "stairs"', () => {
      const tiles: GridTile[] = JSON.parse(JSON.stringify(chapter1.initialTiles));
      const tileMap = buildTileMap(tiles);

      // Connect paths
      const pathCoords = [
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        // (3, 2) is staircase WITHOUT ramp
        { x: 5, y: 2 },
      ];

      for (const c of pathCoords) {
        const t = tileMap.get(`${c.x},${c.y}`);
        if (t) t.type = 'paved_walkway';
      }

      const sam = chapter1.residents.find((r) => r.id === 'sam')!;
      const result = findPathForResident(sam, tileMap, chapter1.gridWidth, chapter1.gridHeight);

      expect(result.success).toBe(false);
      expect(result.barrierType).toBe('stairs');
      expect(result.failureReason).toContain('wheelchair');
    });

    it('enables Sam to reach destination once a ramp is placed on the steps', () => {
      const tiles: GridTile[] = JSON.parse(JSON.stringify(chapter1.initialTiles));
      const tileMap = buildTileMap(tiles);

      // Connect paths
      const pathCoords = [
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 5, y: 2 },
      ];

      for (const c of pathCoords) {
        const t = tileMap.get(`${c.x},${c.y}`);
        if (t) t.type = 'paved_walkway';
      }

      // Convert staircase to ramp or add ramp
      const stairs = tileMap.get('3,2');
      if (stairs) {
        stairs.type = 'ramp';
        stairs.hasRamp = true;
      }

      const sam = chapter1.residents.find((r) => r.id === 'sam')!;
      const result = findPathForResident(sam, tileMap, chapter1.gridWidth, chapter1.gridHeight);

      expect(result.success).toBe(true);
      expect(result.path[result.path.length - 1]).toEqual({ x: 6, y: 2 });
    });
  });

  describe('Chapter 2: The Silent Crossing & Sensory Inclusion', () => {
    it('allows Kai (visual) to cross standard crosswalk', () => {
      const tiles: GridTile[] = JSON.parse(JSON.stringify(chapter2.initialTiles));
      const tileMap = buildTileMap(tiles);

      // Pave sidewalk from (1, 2) to crosswalk at (4, 2) and from (4, 2) to (7, 2)
      for (const x of [2, 3, 5, 6]) {
        const t = tileMap.get(`${x},2`);
        if (t) t.type = 'paved_walkway';
      }

      const kai = chapter2.residents.find((r) => r.id === 'kai')!;
      const result = findPathForResident(kai, tileMap, chapter2.gridWidth, chapter2.gridHeight);

      expect(result.success).toBe(true);
    });

    it('blocks Elena (low vision) at silent crosswalk lacking acoustic signal', () => {
      const tiles: GridTile[] = JSON.parse(JSON.stringify(chapter2.initialTiles));
      const tileMap = buildTileMap(tiles);

      for (const x of [2, 3, 5, 6]) {
        const t = tileMap.get(`${x},3`);
        if (t) {
          t.type = 'paved_walkway';
          t.hasTactile = true;
        }
      }

      const elena = chapter2.residents.find((r) => r.id === 'elena')!;
      const result = findPathForResident(elena, tileMap, chapter2.gridWidth, chapter2.gridHeight);

      expect(result.success).toBe(false);
      expect(result.barrierType).toBe('missing_audio');
    });

    it('allows Elena to cross once Acoustic Beacon is installed at crosswalk', () => {
      const tiles: GridTile[] = JSON.parse(JSON.stringify(chapter2.initialTiles));
      const tileMap = buildTileMap(tiles);

      for (const x of [2, 3, 5, 6]) {
        const t = tileMap.get(`${x},3`);
        if (t) {
          t.type = 'paved_walkway';
          t.hasTactile = true;
        }
      }

      // Add acoustic beacon to crosswalk
      const crosswalk = tileMap.get('4,3');
      if (crosswalk) {
        crosswalk.hasAudioBeacon = true;
        crosswalk.hasTactile = true;
      }

      const elena = chapter2.residents.find((r) => r.id === 'elena')!;
      const result = findPathForResident(elena, tileMap, chapter2.gridWidth, chapter2.gridHeight);

      expect(result.success).toBe(true);
      expect(result.path[result.path.length - 1]).toEqual({ x: 7, y: 3 });
    });
  });

  describe('Chapter 3: One Light Left & Fatigue / Bench Constraint', () => {
    it('stops Mr. Henderson from exhaustion if walking > 4 tiles without a resting bench', () => {
      const tiles: GridTile[] = JSON.parse(JSON.stringify(chapter3.initialTiles));
      const tileMap = buildTileMap(tiles);

      // Pave 7 continuous tiles from (1, 4) to (8, 4) with light and zero elevation, but NO benches
      for (let x = 2; x <= 7; x++) {
        const t = tileMap.get(`${x},4`);
        if (t) {
          t.type = 'paved_walkway';
          t.elevation = 0;
          t.hasLight = true;
          t.hasBench = false;
        }
      }

      const henderson = chapter3.residents.find((r) => r.id === 'henderson')!;
      const result = findPathForResident(henderson, tileMap, chapter3.gridWidth, chapter3.gridHeight);

      expect(result.success).toBe(false);
      expect(result.barrierType).toBe('exhaustion');
      expect(result.failureReason).toContain('resting bench');
    });

    it('allows Mr. Henderson to reach Warm Commons when a resting bench is placed midway', () => {
      const tiles: GridTile[] = JSON.parse(JSON.stringify(chapter3.initialTiles));
      const tileMap = buildTileMap(tiles);

      for (let x = 2; x <= 7; x++) {
        const t = tileMap.get(`${x},4`);
        if (t) {
          t.type = 'paved_walkway';
          t.elevation = 0;
          t.hasLight = true;
        }
      }

      // Place bench at x = 4 (3 steps in)
      const benchTile = tileMap.get('4,4');
      if (benchTile) {
        benchTile.hasBench = true;
        benchTile.type = 'resting_bench';
      }

      const henderson = chapter3.residents.find((r) => r.id === 'henderson')!;
      const result = findPathForResident(henderson, tileMap, chapter3.gridWidth, chapter3.gridHeight);

      expect(result.success).toBe(true);
      expect(result.path[result.path.length - 1]).toEqual({ x: 8, y: 4 });
      expect(result.restStops?.length).toBeGreaterThan(0);
    });

    it('calculates streetlamp radius illumination correctly', () => {
      const tiles: GridTile[] = JSON.parse(JSON.stringify(chapter3.initialTiles));
      // Place streetlamp at (3, 3)
      const t = tiles.find((tile) => tile.x === 3 && tile.y === 3)!;
      t.type = 'streetlamp';
      t.lightSource = true;

      const litTiles = recalculateLighting(tiles, chapter3.gridWidth, chapter3.gridHeight);

      // (3, 3) is lit
      expect(litTiles.find((tile) => tile.x === 3 && tile.y === 3)?.hasLight).toBe(true);
      // (3, 4) is 1 unit away, should be lit
      expect(litTiles.find((tile) => tile.x === 3 && tile.y === 4)?.hasLight).toBe(true);
      // (3, 5) is 2 units away, should be lit
      expect(litTiles.find((tile) => tile.x === 3 && tile.y === 5)?.hasLight).toBe(true);
      // (3, 6) is 3 units away, should NOT be lit by this lamp
      expect(litTiles.find((tile) => tile.x === 3 && tile.y === 6)?.hasLight).toBe(false);
    });
  });
});
