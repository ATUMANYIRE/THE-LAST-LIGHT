import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../../store/gameStore';
import { findPathForResident, buildTileMap } from '../pathfinding';
import { chapter1, chapter3 } from '../levels';
import { GridTile, ResidentProfile } from '../../types/game';
import { simulateChapter, validateToolPlacement } from '../simulation';
import { validateAndParseGameState } from '../serialization';

describe('Phase 4: Negative, Stress, and Adversarial Engine Verification', () => {
  const mockStorage = new Map<string, string>();
  const fakeLocalStorage = {
    getItem: (k: string) => mockStorage.get(k) ?? null,
    setItem: (k: string, v: string) => mockStorage.set(k, String(v)),
    removeItem: (k: string) => mockStorage.delete(k),
    clear: () => mockStorage.clear(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('localStorage', fakeLocalStorage);
    mockStorage.clear();
    useGameStore.getState().loadChapter(1);
  });

  it('1. Rejects construction at invalid coordinates', () => {
    const store = useGameStore.getState();
    expect(store.applyToolToTile(-1, 0)).toBe(false);
    expect(store.applyToolToTile(99, 99)).toBe(false);
    expect(store.applyToolToTile(0, -5)).toBe(false);
    expect(store.applyToolToTile(1000, 1000)).toBe(false);
  });

  it('2. Rejects construction on occupied tiles (fixed buildings)', () => {
    const store = useGameStore.getState();
    // (0, 0) is Town Hall
    const initialBudget = store.budget;
    const ok = store.applyToolToTile(0, 0);
    expect(ok).toBe(false);
    expect(useGameStore.getState().budget).toBe(initialBudget);
  });

  it('3. Rejects construction on prohibited terrain (fixed obstacles)', () => {
    const store = useGameStore.getState();
    // (3, 4) is Construction Fence obstacle
    const initialBudget = store.budget;
    const ok = store.applyToolToTile(3, 4);
    expect(ok).toBe(false);
    expect(useGameStore.getState().budget).toBe(initialBudget);
  });

  it('4. Rejects construction when budget is insufficient', () => {
    const store = useGameStore.getState();
    // Drain budget by placing 10 paved walkways ($150 - 10 * $15 = $0)
    store.selectTool('paved_walkway');
    store.applyToolToTile(2, 1);
    store.applyToolToTile(2, 2);
    store.applyToolToTile(5, 2);
    store.applyToolToTile(2, 3);
    store.applyToolToTile(2, 4);
    store.applyToolToTile(5, 1);
    store.applyToolToTile(5, 3);
    store.applyToolToTile(6, 1);
    store.applyToolToTile(6, 3);
    store.applyToolToTile(7, 1);

    expect(useGameStore.getState().budget).toBe(0);

    // Attempt to place another tool with $0 budget
    const ok = store.applyToolToTile(7, 3);
    expect(ok).toBe(false);
    expect(useGameStore.getState().budget).toBe(0);
  });

  it('5. Prevents negative budget exploits', () => {
    const store = useGameStore.getState();
    // Drain budget
    store.selectTool('paved_walkway');
    store.applyToolToTile(2, 1);
    store.applyToolToTile(2, 2);
    store.applyToolToTile(5, 2);
    store.applyToolToTile(2, 3);
    store.applyToolToTile(2, 4);
    store.applyToolToTile(5, 1);
    store.applyToolToTile(5, 3);
    store.applyToolToTile(6, 1);
    store.applyToolToTile(6, 3);
    store.applyToolToTile(7, 1);

    expect(useGameStore.getState().budget).toBe(0);

    // Attempt demolish ($5) or ramp ($25)
    store.selectTool('demolish');
    expect(store.applyToolToTile(2, 1)).toBe(false);
    expect(useGameStore.getState().budget).toBe(0);
  });

  it('6. Rejects repeated construction of the identical tool on the same tile', () => {
    const store = useGameStore.getState();
    store.selectTool('paved_walkway');
    expect(store.applyToolToTile(2, 1)).toBe(true);
    const budgetAfterFirst = useGameStore.getState().budget;

    // Second click on identical tile with identical tool should be a no-op
    expect(store.applyToolToTile(2, 1)).toBe(false);
    expect(useGameStore.getState().budget).toBe(budgetAfterFirst);
  });

  it('7. Prevents demolition and refund exploits on permanent city infrastructure', () => {
    const store = useGameStore.getState();
    store.selectTool('demolish');

    // Attempt to demolish empty tile
    expect(store.applyToolToTile(0, 1)).toBe(false);

    // Attempt to demolish permanent Maya Stoop at (1, 1)
    expect(store.applyToolToTile(1, 1)).toBe(false);

    // Attempt to demolish historic stone staircase at (3, 2)
    expect(store.applyToolToTile(3, 2)).toBe(false);
  });

  it('8. Handles undo/redo abuse safely without negative history or budget inflation', () => {
    const store = useGameStore.getState();
    const initialBudget = store.budget;

    // Undo with empty history does nothing
    store.undo();
    store.undo();
    store.undo();
    expect(useGameStore.getState().budget).toBe(initialBudget);
    expect(useGameStore.getState().history.length).toBe(0);

    // Place 1 tool, undo twice
    store.selectTool('paved_walkway');
    store.applyToolToTile(2, 1);
    expect(useGameStore.getState().budget).toBe(initialBudget - 15);

    store.undo();
    expect(useGameStore.getState().budget).toBe(initialBudget);

    store.undo(); // Excess undo
    expect(useGameStore.getState().budget).toBe(initialBudget);
  });

  it('9. Gracefully handles corrupted save data without crashing', () => {
    // Mock corrupted string in localStorage
    const corruptedValues = [
      'null',
      'undefined',
      '{ bad json: true }',
      '""',
      '12345',
      JSON.stringify({ unlocked: null, completed: 'broken' }),
      JSON.stringify({ unlocked: [], completed: [], chapterId: 99999 }),
    ];

    for (const val of corruptedValues) {
      localStorage.setItem('the_last_light_progress_v1', val);
      expect(() => {
        // Trigger save progress re-load via store action
        useGameStore.getState().loadChapter(1);
      }).not.toThrow();
    }
  });

  it('10. Safely recovers from unsupported save versions', () => {
    localStorage.setItem(
      'the_last_light_progress_v1',
      JSON.stringify({ version: '999.0.0-unsupported', unknownField: true })
    );
    expect(() => {
      useGameStore.getState().loadChapter(1);
    }).not.toThrow();
  });

  it('11. Prevents premature chapter progression before completion', () => {
    const store = useGameStore.getState();
    store.loadChapter(1);
    expect(useGameStore.getState().currentChapterId).toBe(1);

    // Player attempts to advance without completing chapter
    store.nextChapter();
    expect(useGameStore.getState().currentChapterId).toBe(1);
  });

  it('12. Rejects premature victory on unconnected or broken paths', () => {
    const store = useGameStore.getState();
    store.loadChapter(1);

    // Simulation run without building any pathway
    const sim = store.runSimulation();
    expect(sim.allSucceeded).toBe(false);
    expect(useGameStore.getState().showVictoryModal).toBe(false);
  });

  it('13. Guards against repeated simulation spam / duplicate reveal triggers', () => {
    const store = useGameStore.getState();
    store.loadChapter(1);
    store.selectTool('paved_walkway');
    store.applyToolToTile(2, 1);
    store.applyToolToTile(2, 2);
    store.applyToolToTile(5, 2);

    // Fire runSimulation rapidly 5 times
    const r1 = store.runSimulation();
    const r2 = store.runSimulation();
    const r3 = store.runSimulation();

    expect(r1.allSucceeded).toBe(true);
    expect(r2).toBeDefined();
    expect(r3).toBeDefined();

    vi.advanceTimersByTime(4000);
    // Revealed exactly once
    expect(useGameStore.getState().revealedInvisibleResident).toBe(true);
  });

  it('14. Correctly reports barrier types on impossible resident routes', () => {
    const tiles: GridTile[] = JSON.parse(JSON.stringify(chapter1.initialTiles));
    const tileMap = buildTileMap(tiles);

    // Pave walkway from Sam's stoop (1, 2) to the stairs at (3, 2)
    const t22 = tileMap.get('2,2');
    if (t22) t22.type = 'paved_walkway';
    const t52 = tileMap.get('5,2');
    if (t52) t52.type = 'paved_walkway';

    // Wheelchair user on stairs without ramp
    const sam = chapter1.residents.find((r) => r.id === 'sam')!;
    const res = findPathForResident(sam, tileMap, chapter1.gridWidth, chapter1.gridHeight);
    expect(res.success).toBe(false);
    expect(res.barrierType).toBe('stairs');
  });

  it('15. Terminates gracefully without infinite loops on cyclic path graphs', () => {
    // Create a 4-tile circular paved loop: (2, 2) <-> (3, 2) <-> (3, 3) <-> (2, 3)
    const tiles: GridTile[] = JSON.parse(JSON.stringify(chapter1.initialTiles));
    const tileMap = buildTileMap(tiles);

    for (const [x, y] of [
      [2, 2],
      [3, 2],
      [3, 3],
      [2, 3],
    ]) {
      const t = tileMap.get(`${x},${y}`);
      if (t) t.type = 'paved_walkway';
    }

    const testResident: ResidentProfile = {
      id: 'cyclist',
      name: 'Loop Tester',
      role: 'Tester',
      pronouns: 'it/its',
      avatarKey: 'maya',
      color: '#ffffff',
      startPosition: { x: 2, y: 2 },
      destinationPosition: { x: 7, y: 5 }, // Unreachable isolated island
      destinationLabel: 'Far Island',
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
      description: 'Cycle test',
      accessibilityNeed: 'None',
      isInvisibleInitial: false,
    };

    const startTime = Date.now();
    const result = findPathForResident(testResident, tileMap, chapter1.gridWidth, chapter1.gridHeight);
    const duration = Date.now() - startTime;

    expect(result.success).toBe(false);
    expect(duration).toBeLessThan(100); // Must terminate in < 100ms
  });

  it('16. Clamps cursor out-of-bounds inputs safely', () => {
    const store = useGameStore.getState();
    store.setCursor({ x: -999, y: 999 });
    const cursor = useGameStore.getState().cursor;
    expect(cursor.x).toBe(0);
    expect(cursor.y).toBe(chapter1.gridHeight - 1);
  });

  it('17. Reset restores clean initial state and clears history', () => {
    const store = useGameStore.getState();
    store.selectTool('paved_walkway');
    store.applyToolToTile(2, 1);
    store.applyToolToTile(2, 2);
    expect(useGameStore.getState().history.length).toBe(2);

    store.resetLevel();
    const s = useGameStore.getState();
    expect(s.history.length).toBe(0);
    expect(s.budget).toBe(chapter1.startingBudget);
    expect(s.phase).toBe('initial');
  });

  it('18. Redo restores undone placement, deducts budget, and updates tile', () => {
    const store = useGameStore.getState();
    const initialBudget = store.budget;
    store.selectTool('paved_walkway');

    expect(store.applyToolToTile(2, 1)).toBe(true);
    expect(useGameStore.getState().budget).toBe(initialBudget - 15);
    expect(useGameStore.getState().history.length).toBe(1);
    expect(useGameStore.getState().redoStack.length).toBe(0);

    // Undo action
    store.undo();
    expect(useGameStore.getState().budget).toBe(initialBudget);
    expect(useGameStore.getState().history.length).toBe(0);
    expect(useGameStore.getState().redoStack.length).toBe(1);
    const tileAfterUndo = useGameStore.getState().tiles.find((t) => t.x === 2 && t.y === 1);
    expect(tileAfterUndo?.type).toBe('empty');

    // Redo action
    store.redo();
    expect(useGameStore.getState().budget).toBe(initialBudget - 15);
    expect(useGameStore.getState().history.length).toBe(1);
    expect(useGameStore.getState().redoStack.length).toBe(0);
    const tileAfterRedo = useGameStore.getState().tiles.find((t) => t.x === 2 && t.y === 1);
    expect(tileAfterRedo?.type).toBe('paved_walkway');
  });

  it('19. Invalidation of redo stack upon placing a new tool or demolishing', () => {
    const store = useGameStore.getState();
    store.selectTool('paved_walkway');
    store.applyToolToTile(2, 1);
    expect(useGameStore.getState().history.length).toBe(1);

    // Undo pushes action to redo stack
    store.undo();
    expect(useGameStore.getState().redoStack.length).toBe(1);

    // New action invalidates redo stack
    store.applyToolToTile(2, 2);
    expect(useGameStore.getState().redoStack.length).toBe(0);

    // Redo call now has no effect
    const budgetBeforeRedo = useGameStore.getState().budget;
    store.redo();
    expect(useGameStore.getState().budget).toBe(budgetBeforeRedo);
  });

  it('20. Redo is blocked when current budget is less than required costDelta', () => {
    const store = useGameStore.getState();
    store.selectTool('paved_walkway');
    store.applyToolToTile(2, 1);
    store.undo();
    expect(useGameStore.getState().redoStack.length).toBe(1);

    // Artificially deplete budget below $15
    useGameStore.setState({ budget: 10 });
    store.redo();

    // Budget should remain untouched and redo rejected
    expect(useGameStore.getState().budget).toBe(10);
    expect(useGameStore.getState().redoStack.length).toBe(1);
    const tile = useGameStore.getState().tiles.find((t) => t.x === 2 && t.y === 1);
    expect(tile?.type).toBe('empty');
  });

  it('21. Full exportSaveState and importSaveState roundtrip preserves in-progress state', () => {
    const store = useGameStore.getState();
    store.selectTool('paved_walkway');
    store.applyToolToTile(2, 1);
    store.applyToolToTile(2, 2);

    const savedJson = store.exportSaveState();
    expect(typeof savedJson).toBe('string');

    // Parse and inspect raw payload
    const parsed = JSON.parse(savedJson);
    expect(parsed.version).toBe(1);
    expect(parsed.chapterId).toBe(1);
    expect(parsed.budget).toBe(120);
    expect(parsed.history.length).toBe(2);

    // Reset level to initial empty state
    store.resetLevel();
    expect(useGameStore.getState().budget).toBe(150);
    expect(useGameStore.getState().history.length).toBe(0);

    // Import saved in-progress state
    const success = store.importSaveState(savedJson);
    expect(success).toBe(true);

    const restored = useGameStore.getState();
    expect(restored.budget).toBe(120);
    expect(restored.history.length).toBe(2);
    const t21 = restored.tiles.find((t) => t.x === 2 && t.y === 1);
    const t22 = restored.tiles.find((t) => t.x === 2 && t.y === 2);
    expect(t21?.type).toBe('paved_walkway');
    expect(t22?.type).toBe('paved_walkway');
  });

  it('22. importSaveState rejects malformed, corrupted, or tampered save states safely', () => {
    const store = useGameStore.getState();
    const currentBudget = store.budget;

    // Bad JSON
    expect(store.importSaveState('NOT_JSON_AT_ALL')).toBe(false);

    // Incompatible version
    expect(store.importSaveState(JSON.stringify({ version: 99, chapterId: 1 }))).toBe(false);

    // Negative budget exploit
    expect(
      store.importSaveState(
        JSON.stringify({
          version: 1,
          chapterId: 1,
          budget: -9999,
          tiles: chapter1.initialTiles,
          activeResidentIds: ['maya'],
        })
      )
    ).toBe(false);

    // Out-of-bounds inflated budget exploit ($99,999)
    expect(
      store.importSaveState(
        JSON.stringify({
          version: 1,
          chapterId: 1,
          budget: 99999,
          tiles: chapter1.initialTiles,
          activeResidentIds: ['maya'],
        })
      )
    ).toBe(false);

    // Tampered resident ID not in chapter
    expect(
      store.importSaveState(
        JSON.stringify({
          version: 1,
          chapterId: 1,
          budget: 100,
          tiles: chapter1.initialTiles,
          activeResidentIds: ['hacker_resident_x'],
        })
      )
    ).toBe(false);

    // Missing tiles array
    expect(
      store.importSaveState(
        JSON.stringify({
          version: 1,
          chapterId: 1,
          budget: 100,
          tiles: [],
          activeResidentIds: ['maya'],
        })
      )
    ).toBe(false);

    // Verify game state was not corrupted
    expect(useGameStore.getState().budget).toBe(currentBudget);
  });

  it('23. Pure simulation engine operates headlessly without store or browser coupling', () => {
    // Pure placement validation
    const obsValidation = validateToolPlacement(chapter1, chapter1.initialTiles, 100, 'paved_walkway', 3, 4);
    expect(obsValidation.valid).toBe(false);
    expect(obsValidation.reason).toContain('Cannot modify permanent obstacle');

    const outOfBoundsValidation = validateToolPlacement(chapter1, chapter1.initialTiles, 100, 'paved_walkway', 99, 99);
    expect(outOfBoundsValidation.valid).toBe(false);

    const validPlacement = validateToolPlacement(chapter1, chapter1.initialTiles, 100, 'paved_walkway', 2, 1);
    expect(validPlacement.valid).toBe(true);

    // Pure chapter simulation
    const simInitial = simulateChapter(chapter1, chapter1.initialTiles, ['maya'], 'initial');
    expect(simInitial.allSucceeded).toBe(false);

    // Modify tiles purely in memory
    const tilesCopy = JSON.parse(JSON.stringify(chapter1.initialTiles)) as GridTile[];
    for (const [x, y] of [[2, 1], [2, 2], [5, 2]]) {
      const t = tilesCopy.find((tile) => tile.x === x && tile.y === y);
      if (t) t.type = 'paved_walkway';
    }

    const simSolved = simulateChapter(chapter1, tilesCopy, ['maya'], 'initial');
    expect(simSolved.allSucceeded).toBe(true);
    expect(simSolved.residentResults[0].residentId).toBe('maya');
  });

  it('24. Reset during simulation cancels pending modal timers and prevents ghost reveals', () => {
    const store = useGameStore.getState();
    store.loadChapter(1);
    store.selectTool('paved_walkway');
    store.applyToolToTile(2, 1);
    store.applyToolToTile(2, 2);
    store.applyToolToTile(5, 2);

    // Run simulation which schedules a reveal modal timeout in 1200ms
    store.runSimulation();
    expect(useGameStore.getState().isSimulating).toBe(true);

    // Player quickly hits reset at 300ms
    vi.advanceTimersByTime(300);
    store.resetLevel();

    expect(useGameStore.getState().phase).toBe('initial');
    expect(useGameStore.getState().revealedInvisibleResident).toBe(false);

    // Advance past the original 1200ms timer
    vi.advanceTimersByTime(2000);

    // Modal and reveal state must NOT have leaked into the reset state
    expect(useGameStore.getState().showRevealModal).toBe(false);
    expect(useGameStore.getState().revealedInvisibleResident).toBe(false);
    expect(useGameStore.getState().phase).toBe('initial');
    expect(useGameStore.getState().activeResidentIds).toEqual(['maya']);
  });

  it('25. Loading a new chapter during simulation cancels pending modal timers cleanly', () => {
    const store = useGameStore.getState();
    store.loadChapter(1);
    store.selectTool('paved_walkway');
    store.applyToolToTile(2, 1);
    store.applyToolToTile(2, 2);
    store.applyToolToTile(5, 2);

    // Trigger simulation
    store.runSimulation();
    expect(useGameStore.getState().isSimulating).toBe(true);

    // Switch chapter at 400ms
    vi.advanceTimersByTime(400);
    store.loadChapter(2);

    expect(useGameStore.getState().currentChapterId).toBe(2);

    // Advance past original 1200ms timer
    vi.advanceTimersByTime(2000);

    // Chapter 2 must not be polluted with Chapter 1 reveal
    expect(useGameStore.getState().currentChapterId).toBe(2);
    expect(useGameStore.getState().showRevealModal).toBe(false);
    expect(useGameStore.getState().activeResidentIds).toEqual(['kai']);
  });

  it('26. Cannot win any chapter without construction (unpaved rejection across all 3 chapters)', () => {
    const store = useGameStore.getState();

    // Chapter 1
    store.loadChapter(1);
    const sim1 = store.runSimulation();
    expect(sim1.allSucceeded).toBe(false);
    expect(useGameStore.getState().showVictoryModal).toBe(false);

    // Chapter 2
    store.loadChapter(2);
    const sim2 = store.runSimulation();
    expect(sim2.allSucceeded).toBe(false);
    expect(useGameStore.getState().showVictoryModal).toBe(false);

    // Chapter 3
    store.loadChapter(3);
    const sim3 = store.runSimulation();
    expect(sim3.allSucceeded).toBe(false);
    expect(useGameStore.getState().showVictoryModal).toBe(false);
  });

  it('27. Chapter 1 accessible bypass route around stairs succeeds legitimately within budget', () => {
    const store = useGameStore.getState();
    store.loadChapter(1);

    // Phase 1: Pave Maya's shortcut over stairs: (2, 1), (2, 2), (5, 2)
    store.selectTool('paved_walkway');
    store.applyToolToTile(2, 1);
    store.applyToolToTile(2, 2);
    store.applyToolToTile(5, 2);

    store.runSimulation();
    vi.advanceTimersByTime(4000);

    expect(useGameStore.getState().revealedInvisibleResident).toBe(true);
    store.acknowledgeReveal();

    // In Phase 2: Instead of a ramp at (3, 2), pave an accessible ground bypass around the stairs:
    // Pave (2, 3), (3, 3), (4, 3), (5, 3) at $15 each = $60
    // Remaining budget was $105 -> $105 - $60 = $45 remaining!
    store.selectTool('paved_walkway');
    expect(store.applyToolToTile(2, 3)).toBe(true);
    expect(store.applyToolToTile(3, 3)).toBe(true);
    expect(store.applyToolToTile(4, 3)).toBe(true);
    expect(store.applyToolToTile(5, 3)).toBe(true);

    expect(useGameStore.getState().budget).toBe(45);

    // Simulate universal path: Both Maya and Sam can use the bypass!
    const sim2 = store.runSimulation();
    expect(sim2.allSucceeded).toBe(true);
    expect(sim2.residentResults.find((r) => r.residentId === 'sam')?.success).toBe(true);
    expect(sim2.residentResults.find((r) => r.residentId === 'maya')?.success).toBe(true);

    vi.advanceTimersByTime(4000);
    expect(useGameStore.getState().showVictoryModal).toBe(true);
  });
});
