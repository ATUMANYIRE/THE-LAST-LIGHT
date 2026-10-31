import { describe, it, expect } from 'vitest';
import { findPathForResident, recalculateLighting, buildTileMap } from '../pathfinding';
import { chapter1, chapter2, chapter3 } from '../levels';
import { GridTile, ResidentProfile, ToolId } from '../../types/game';

/**
 * INDEPENDENT REFERENCE SOLVER (BFS over (x, y, stepsSinceRest))
 * Completely separate from production A* implementation.
 * Uses exhaustive state-space search to find shortest path and reachability.
 */
interface RefState {
  x: number;
  y: number;
  stepsSinceRest: number;
  path: Array<{ x: number; y: number }>;
}

function solveIndependentBFS(
  resident: ResidentProfile,
  tiles: GridTile[],
  width: number,
  height: number
): { reachable: boolean; path: Array<{ x: number; y: number }> } {
  const tileMap = new Map<string, GridTile>();
  for (const t of tiles) {
    tileMap.set(`${t.x},${t.y}`, t);
  }

  const startTile = tileMap.get(`${resident.startPosition.x},${resident.startPosition.y}`);
  const targetTile = tileMap.get(`${resident.destinationPosition.x},${resident.destinationPosition.y}`);

  if (!startTile || !targetTile) {
    return { reachable: false, path: [] };
  }

  // Check start tile light constraint
  if (resident.constraints.requiresLight && !startTile.hasLight && !startTile.lightSource) {
    return { reachable: false, path: [] };
  }

  const queue: RefState[] = [
    {
      x: startTile.x,
      y: startTile.y,
      stepsSinceRest: 0,
      path: [{ x: startTile.x, y: startTile.y }],
    },
  ];

  // State key includes stepsSinceRest if fatigue constraint is active
  const visited = new Set<string>();
  const makeKey = (x: number, y: number, steps: number) =>
    resident.constraints.maxContinuousWalk > 0 ? `${x},${y},${steps}` : `${x},${y}`;

  visited.add(makeKey(startTile.x, startTile.y, 0));

  // Only orthogonal 4-directional moves (North, East, South, West)
  const DIRS = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
  ];

  while (queue.length > 0) {
    const cur = queue.shift()!;

    if (cur.x === targetTile.x && cur.y === targetTile.y) {
      return { reachable: true, path: cur.path };
    }

    const curTile = tileMap.get(`${cur.x},${cur.y}`)!;

    for (const d of DIRS) {
      const nx = cur.x + d.dx;
      const ny = cur.y + d.dy;

      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

      const nextTile = tileMap.get(`${nx},${ny}`);
      if (!nextTile) continue;

      // Obstacle / Building
      if (nextTile.type === 'building' || nextTile.type === 'obstacle') continue;

      // Walkable terrain types
      const walkable = [
        'sidewalk',
        'paved_walkway',
        'ramp',
        'tactile_paving',
        'acoustic_beacon',
        'resting_bench',
        'streetlamp',
        'crosswalk_standard',
        'crosswalk_accessible',
        'staircase',
        'curb_drop',
      ];
      if (!walkable.includes(nextTile.type)) continue;

      // Wheelchair stairs & curb check
      const hasRamp = nextTile.hasRamp || curTile.hasRamp || nextTile.type === 'ramp' || curTile.type === 'ramp';
      const isStairs = nextTile.type === 'staircase' || curTile.type === 'staircase';
      const isCurb = nextTile.type === 'curb_drop' || curTile.type === 'curb_drop';
      const elevDiff = Math.abs(nextTile.elevation - curTile.elevation);

      if (!resident.constraints.canTraverseStairs) {
        if (isStairs && !hasRamp) continue;
        if (isCurb && !hasRamp) continue;
        if (elevDiff > 0 && !hasRamp) continue;
      }

      // Lighting requirement
      if (resident.constraints.requiresLight) {
        const isLit = nextTile.hasLight || nextTile.lightSource;
        const hasTactile = nextTile.hasTactile || nextTile.type === 'tactile_paving';
        if (!isLit && !hasTactile) continue;
      }

      // Tactile in dark
      if (resident.constraints.requiresTactileInDark) {
        const hasTactile = nextTile.hasTactile || nextTile.type === 'tactile_paving';
        const isLit = nextTile.hasLight || nextTile.lightSource;
        if (!hasTactile && !isLit) continue;
      }

      // Audible crosswalk beacon
      if (resident.constraints.requiresAcousticAtRoads) {
        const isRoad = nextTile.type === 'crosswalk_standard';
        const hasAudio =
          nextTile.hasAudioBeacon ||
          nextTile.type === 'crosswalk_accessible' ||
          nextTile.type === 'acoustic_beacon';
        if (isRoad && !hasAudio) continue;
      }

      // Fatigue check
      const isBench = nextTile.hasBench || nextTile.type === 'resting_bench';
      let nextSteps = cur.stepsSinceRest + 1;
      if (resident.constraints.maxContinuousWalk > 0) {
        if (nextSteps > resident.constraints.maxContinuousWalk && !isBench) continue;
      }
      if (isBench) nextSteps = 0;

      const stateKey = makeKey(nx, ny, nextSteps);
      if (visited.has(stateKey)) continue;
      visited.add(stateKey);

      queue.push({
        x: nx,
        y: ny,
        stepsSinceRest: nextSteps,
        path: [...cur.path, { x: nx, y: ny }],
      });
    }
  }

  return { reachable: false, path: [] };
}

describe('Independent Reference Pathfinding Validation', () => {
  it('1. Rejects diagonal movement strictly in both reference and production solvers', () => {
    // 3x3 grid with start at (0, 0) and goal at (1, 1). Only (0, 0) and (1, 1) are paved.
    const tiles: GridTile[] = [];
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        tiles.push({
          x,
          y,
          type: (x === 0 && y === 0) || (x === 1 && y === 1) ? 'paved_walkway' : 'empty',
          isInitialFixed: false,
          elevation: 0,
          hasLight: true,
          hasTactile: false,
          hasAudioBeacon: false,
          hasBench: false,
          hasRamp: false,
        });
      }
    }

    const resident: ResidentProfile = {
      id: 'tester',
      name: 'Diagonal Tester',
      role: 'Tester',
      pronouns: 'they/them',
      avatarKey: 'maya',
      color: '#fff',
      startPosition: { x: 0, y: 0 },
      destinationPosition: { x: 1, y: 1 },
      destinationLabel: 'Diagonal Goal',
      mobilityCategory: 'walker',
      constraints: {
        canTraverseStairs: true,
        maxCurbs: 10,
        requiresTactileInDark: false,
        requiresLight: false,
        requiresAcousticAtRoads: false,
        maxContinuousWalk: 0,
        sensitiveToGlare: false,
      },
      description: 'Tests diagonal movement',
      accessibilityNeed: 'None',
      isInvisibleInitial: false,
    };

    const refResult = solveIndependentBFS(resident, tiles, 3, 3);
    const prodResult = findPathForResident(resident, buildTileMap(tiles), 3, 3);

    expect(refResult.reachable).toBe(false);
    expect(prodResult.success).toBe(false);
  });

  it('2. Evaluates identical reachability for Chapter 1 initial and solved states', () => {
    const maya = chapter1.residents.find((r) => r.id === 'maya')!;
    const sam = chapter1.residents.find((r) => r.id === 'sam')!;

    // Initial state: Maya succeeds, Sam fails
    const refMayaInitial = solveIndependentBFS(maya, chapter1.initialTiles, chapter1.gridWidth, chapter1.gridHeight);
    const prodMayaInitial = findPathForResident(maya, buildTileMap(chapter1.initialTiles), chapter1.gridWidth, chapter1.gridHeight);
    expect(prodMayaInitial.success).toBe(refMayaInitial.reachable);
    expect(refMayaInitial.reachable).toBe(false); // No paved shortcut yet

    // Add shortcut paving at (2, 1), (2, 2), (5, 2)
    const pavedTiles = JSON.parse(JSON.stringify(chapter1.initialTiles)) as GridTile[];
    for (const [x, y] of [[2, 1], [2, 2], [5, 2]]) {
      const t = pavedTiles.find((tile) => tile.x === x && tile.y === y);
      if (t) t.type = 'paved_walkway';
    }

    const refMayaShortcut = solveIndependentBFS(maya, pavedTiles, chapter1.gridWidth, chapter1.gridHeight);
    const prodMayaShortcut = findPathForResident(maya, buildTileMap(pavedTiles), chapter1.gridWidth, chapter1.gridHeight);
    expect(prodMayaShortcut.success).toBe(true);
    expect(refMayaShortcut.reachable).toBe(true);

    // Sam attempts shortcut with staircase: must fail
    const refSamShortcut = solveIndependentBFS(sam, pavedTiles, chapter1.gridWidth, chapter1.gridHeight);
    const prodSamShortcut = findPathForResident(sam, buildTileMap(pavedTiles), chapter1.gridWidth, chapter1.gridHeight);
    expect(prodSamShortcut.success).toBe(false);
    expect(refSamShortcut.reachable).toBe(false);

    // Add Ramp at (3, 2): Sam must now succeed
    const rampTile = pavedTiles.find((t) => t.x === 3 && t.y === 2);
    if (rampTile) {
      rampTile.type = 'ramp';
      rampTile.hasRamp = true;
    }

    const refSamSolved = solveIndependentBFS(sam, pavedTiles, chapter1.gridWidth, chapter1.gridHeight);
    const prodSamSolved = findPathForResident(sam, buildTileMap(pavedTiles), chapter1.gridWidth, chapter1.gridHeight);
    expect(prodSamSolved.success).toBe(true);
    expect(refSamSolved.reachable).toBe(true);
  });

  it('3. Evaluates identical reachability for Chapter 2 crosswalk acoustic/tactile needs', () => {
    const kai = chapter2.residents.find((r) => r.id === 'kai')!;
    const elena = chapter2.residents.find((r) => r.id === 'elena')!;

    // Initial Chapter 2: Kai and Elena
    const refKaiInit = solveIndependentBFS(kai, chapter2.initialTiles, chapter2.gridWidth, chapter2.gridHeight);
    const prodKaiInit = findPathForResident(kai, buildTileMap(chapter2.initialTiles), chapter2.gridWidth, chapter2.gridHeight);
    expect(prodKaiInit.success).toBe(refKaiInit.reachable);

    // Pave Kai's standard route
    const paved2 = JSON.parse(JSON.stringify(chapter2.initialTiles)) as GridTile[];
    for (const [x, y] of [[2, 2], [3, 2], [5, 2], [6, 2]]) {
      const t = paved2.find((tile) => tile.x === x && tile.y === y);
      if (t) t.type = 'paved_walkway';
    }

    const refKaiPaved = solveIndependentBFS(kai, paved2, chapter2.gridWidth, chapter2.gridHeight);
    const prodKaiPaved = findPathForResident(kai, buildTileMap(paved2), chapter2.gridWidth, chapter2.gridHeight);
    expect(prodKaiPaved.success).toBe(true);
    expect(refKaiPaved.reachable).toBe(true);

    // Elena needs tactile paving and acoustic beacon
    const refElenaBefore = solveIndependentBFS(elena, paved2, chapter2.gridWidth, chapter2.gridHeight);
    const prodElenaBefore = findPathForResident(elena, buildTileMap(paved2), chapter2.gridWidth, chapter2.gridHeight);
    expect(prodElenaBefore.success).toBe(false);
    expect(refElenaBefore.reachable).toBe(false);

    // Add acoustic beacon at (4, 3) and tactile pavers at (2, 3), (3, 3), (5, 3), (6, 3)
    const beacon = paved2.find((t) => t.x === 4 && t.y === 3);
    if (beacon) {
      beacon.type = 'acoustic_beacon';
      beacon.hasAudioBeacon = true;
      beacon.hasTactile = true;
    }
    for (const [x, y] of [[2, 3], [3, 3], [5, 3], [6, 3]]) {
      const t = paved2.find((tile) => tile.x === x && tile.y === y);
      if (t) {
        t.type = 'tactile_paving';
        t.hasTactile = true;
      }
    }

    const refElenaSolved = solveIndependentBFS(elena, paved2, chapter2.gridWidth, chapter2.gridHeight);
    const prodElenaSolved = findPathForResident(elena, buildTileMap(paved2), chapter2.gridWidth, chapter2.gridHeight);
    expect(prodElenaSolved.success).toBe(true);
    expect(refElenaSolved.reachable).toBe(true);
  });

  it('4. Evaluates stamina fatigue limits and bench resting recovery accurately', () => {
    const henderson = chapter3.residents.find((r) => r.id === 'henderson')!;
    // Henderson requires light and maxContinuousWalk = 4
    // Construct a straight 7-tile corridor of lit paved walkways from (1, 4) to (8, 4)
    const tiles: GridTile[] = [];
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 7; y++) {
        tiles.push({
          x,
          y,
          type: y === 4 && x >= 1 && x <= 8 ? 'paved_walkway' : 'empty',
          isInitialFixed: false,
          elevation: 0,
          hasLight: true,
          hasTactile: false,
          hasAudioBeacon: false,
          hasBench: false,
          hasRamp: false,
        });
      }
    }

    // Without benches: 7 steps > 4 steps limit -> Must FAIL
    const refNoBench = solveIndependentBFS(henderson, tiles, 10, 7);
    const prodNoBench = findPathForResident(henderson, buildTileMap(tiles), 10, 7);
    expect(prodNoBench.success).toBe(false);
    expect(refNoBench.reachable).toBe(false);
    expect(prodNoBench.barrierType).toBe('exhaustion');

    // Add a bench at tile 4: (4, 4)
    // Step count: (1,4)->(2,4)[1]->(3,4)[2]->(4,4)[bench, reset to 0]->(5,4)[1]->(6,4)[2]->(7,4)[3]->(8,4)[4]
    const benchTile = tiles.find((t) => t.x === 4 && t.y === 4)!;
    benchTile.type = 'resting_bench';
    benchTile.hasBench = true;

    const refWithBench = solveIndependentBFS(henderson, tiles, 10, 7);
    const prodWithBench = findPathForResident(henderson, buildTileMap(tiles), 10, 7);
    expect(prodWithBench.success).toBe(true);
    expect(refWithBench.reachable).toBe(true);
    expect(prodWithBench.restStops?.length).toBeGreaterThan(0);
  });

  it('5. Runs 30 randomized procedural mini-grids and verifies agreement between solvers', () => {
    let agreementCount = 0;

    for (let seed = 1; seed <= 30; seed++) {
      const W = 6;
      const H = 5;
      const grid: GridTile[] = [];

      for (let x = 0; x < W; x++) {
        for (let y = 0; y < H; y++) {
          const isObstacle = (x * 7 + y * 13 + seed) % 5 === 0;
          const isStairs = (x * 3 + y * 11 + seed) % 7 === 0;
          grid.push({
            x,
            y,
            type: isObstacle ? 'obstacle' : isStairs ? 'staircase' : 'paved_walkway',
            isInitialFixed: false,
            elevation: isStairs ? 1 : 0,
            hasLight: true,
            hasTactile: false,
            hasAudioBeacon: false,
            hasBench: false,
            hasRamp: false,
          });
        }
      }

      // Ensure start and destination are paved
      const startTile = grid.find((t) => t.x === 0 && t.y === 0)!;
      startTile.type = 'sidewalk';
      startTile.elevation = 0;

      const targetTile = grid.find((t) => t.x === W - 1 && t.y === H - 1)!;
      targetTile.type = 'sidewalk';
      targetTile.elevation = 0;

      const testResident: ResidentProfile = {
        id: `rand_${seed}`,
        name: `Random Walker ${seed}`,
        role: 'Test',
        pronouns: 'they/them',
        avatarKey: 'maya',
        color: '#fff',
        startPosition: { x: 0, y: 0 },
        destinationPosition: { x: W - 1, y: H - 1 },
        destinationLabel: 'Exit',
        mobilityCategory: seed % 2 === 0 ? 'wheelchair' : 'walker',
        constraints: {
          canTraverseStairs: seed % 2 !== 0,
          maxCurbs: 0,
          requiresTactileInDark: false,
          requiresLight: false,
          requiresAcousticAtRoads: false,
          maxContinuousWalk: 0,
          sensitiveToGlare: false,
        },
        description: 'Random test',
        accessibilityNeed: 'Random',
        isInvisibleInitial: false,
      };

      const ref = solveIndependentBFS(testResident, grid, W, H);
      const prod = findPathForResident(testResident, buildTileMap(grid), W, H);

      expect(prod.success).toBe(ref.reachable);
      agreementCount++;
    }

    expect(agreementCount).toBe(30);
  });
});
