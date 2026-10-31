import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../../store/gameStore';

describe('Phase 3: Machine-Executed Headless Playthrough Across All 3 Chapters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('Executes complete Chapter 1 (The Shortcut) state transitions headlessly', () => {
    const store = useGameStore.getState();

    // 1. Initial State Verification
    store.loadChapter(1);
    const s1 = useGameStore.getState();
    expect(s1.currentChapterId).toBe(1);
    expect(s1.budget).toBe(150);
    expect(s1.phase).toBe('initial');
    expect(s1.activeResidentIds).toEqual(['maya']);
    expect(s1.revealedInvisibleResident).toBe(false);

    // Verify Maya's initial constraints and coordinates
    const maya = s1.currentChapter.residents.find((r) => r.id === 'maya')!;
    expect(maya.startPosition).toEqual({ x: 1, y: 1 });
    expect(maya.destinationPosition).toEqual({ x: 6, y: 2 });
    expect(maya.constraints.canTraverseStairs).toBe(true);

    // 2. Action Sequence: Phase 1 Shortcut Construction
    store.selectTool('paved_walkway');
    const p1 = store.applyToolToTile(2, 1);
    const p2 = store.applyToolToTile(2, 2);
    const p3 = store.applyToolToTile(5, 2);
    expect(p1 && p2 && p3).toBe(true);

    const s2 = useGameStore.getState();
    expect(s2.budget).toBe(105); // $150 - 3 * $15 = $105
    expect(s2.history.length).toBe(3);

    // 3. Phase 1 Simulation: Maya traverses shortcut & stairs to Library
    const sim1 = store.runSimulation();
    expect(sim1.allSucceeded).toBe(true);
    expect(sim1.residentResults[0].residentId).toBe('maya');
    expect(sim1.residentResults[0].success).toBe(true);
    expect(sim1.residentResults[0].path[0]).toEqual({ x: 1, y: 1 });
    expect(sim1.residentResults[0].path[sim1.residentResults[0].path.length - 1]).toEqual({ x: 6, y: 2 });

    // Advance timers for Invisible Resident reveal transition (1200ms)
    vi.advanceTimersByTime(4000);

    const s3 = useGameStore.getState();
    expect(s3.revealedInvisibleResident).toBe(true);
    expect(s3.phase).toBe('post_reveal');
    expect(s3.showRevealModal).toBe(true);
    expect(s3.activeResidentIds).toContain('sam');

    // Verify Sam's wheelchair constraints
    const sam = s3.currentChapter.residents.find((r) => r.id === 'sam')!;
    expect(sam.constraints.canTraverseStairs).toBe(false);
    expect(sam.startPosition).toEqual({ x: 1, y: 2 });
    expect(sam.destinationPosition).toEqual({ x: 6, y: 2 });

    // Acknowledge reveal
    store.acknowledgeReveal();
    expect(useGameStore.getState().showRevealModal).toBe(false);

    // 4. Action Sequence: Phase 2 Modular Ramp Construction
    store.selectTool('ramp');
    const rampPlaced = store.applyToolToTile(3, 2);
    expect(rampPlaced).toBe(true);

    const s4 = useGameStore.getState();
    expect(s4.budget).toBe(80); // $105 - $25 = $80

    // 5. Phase 2 Simulation: Both Maya and Sam traverse the ramp to Library
    const sim2 = store.runSimulation();
    expect(sim2.allSucceeded).toBe(true);
    expect(sim2.residentResults.length).toBe(2);

    const mayaRes = sim2.residentResults.find((r) => r.residentId === 'maya')!;
    const samRes = sim2.residentResults.find((r) => r.residentId === 'sam')!;
    expect(mayaRes.success).toBe(true);
    expect(samRes.success).toBe(true);

    // Advance timer for victory celebration (1200ms)
    vi.advanceTimersByTime(4000);

    const s5 = useGameStore.getState();
    expect(s5.showVictoryModal).toBe(true);
    expect(s5.completedChapters).toContain(1);
    expect(s5.unlockedChapters).toContain(2);
  });

  it('Executes complete Chapter 2 (The Silent Crossing) state transitions headlessly', () => {
    const store = useGameStore.getState();

    // Advance to Chapter 2
    store.nextChapter();
    const s1 = useGameStore.getState();
    expect(s1.currentChapterId).toBe(2);
    expect(s1.budget).toBe(190);
    expect(s1.phase).toBe('initial');
    expect(s1.activeResidentIds).toEqual(['kai']);

    // 1. Phase 1 Construction: Pave Kai's corridor to pharmacy
    store.selectTool('paved_walkway');
    for (const x of [2, 3, 5, 6]) {
      const ok = store.applyToolToTile(x, 2);
      expect(ok).toBe(true);
    }

    const s2 = useGameStore.getState();
    expect(s2.budget).toBe(130); // $190 - 4 * $15 = $130

    // Run simulation for Kai
    const sim1 = store.runSimulation();
    expect(sim1.allSucceeded).toBe(true);
    expect(sim1.residentResults[0].residentId).toBe('kai');

    // Advance timers for reveal
    vi.advanceTimersByTime(4000);

    const s3 = useGameStore.getState();
    expect(s3.revealedInvisibleResident).toBe(true);
    expect(s3.phase).toBe('post_reveal');
    expect(s3.activeResidentIds).toContain('elena');

    // Elena constraints check
    const elena = s3.currentChapter.residents.find((r) => r.id === 'elena')!;
    expect(elena.constraints.requiresAcousticAtRoads).toBe(true);
    expect(elena.constraints.requiresTactileInDark).toBe(true);

    store.acknowledgeReveal();

    // 2. Phase 2 Construction: Acoustic Beacon at (4, 3) + Tactile Paving on row 3
    store.selectTool('acoustic_beacon');
    const beaconOk = store.applyToolToTile(4, 3);
    expect(beaconOk).toBe(true);

    store.selectTool('tactile_paving');
    for (const x of [2, 3, 5, 6]) {
      const ok = store.applyToolToTile(x, 3);
      expect(ok).toBe(true);
    }

    const s4 = useGameStore.getState();
    expect(s4.budget).toBe(40); // $130 - $30 (beacon) - 4 * $15 (tactile) = $40

    // 3. Phase 2 Simulation: Both Kai and Elena reach destination
    const sim2 = store.runSimulation();
    expect(sim2.allSucceeded).toBe(true);

    const kaiRes = sim2.residentResults.find((r) => r.residentId === 'kai')!;
    const elenaRes = sim2.residentResults.find((r) => r.residentId === 'elena')!;
    expect(kaiRes.success).toBe(true);
    expect(elenaRes.success).toBe(true);

    // Advance timer for victory
    vi.advanceTimersByTime(4000);

    const s5 = useGameStore.getState();
    expect(s5.showVictoryModal).toBe(true);
    expect(s5.completedChapters).toContain(2);
    expect(s5.unlockedChapters).toContain(3);
  });

  it('Executes complete Chapter 3 (One Light Left) state transitions headlessly to Grand Finale', () => {
    const store = useGameStore.getState();

    // Advance to Chapter 3
    store.nextChapter();
    const s1 = useGameStore.getState();
    expect(s1.currentChapterId).toBe(3);
    expect(s1.budget).toBe(240);
    expect(s1.phase).toBe('initial');
    expect(s1.activeResidentIds).toEqual(['maya', 'sam']);

    // 1. Phase 1 Construction: Streetlamp at (5, 3) + Ramp at (4, 3) + Paved Connectors at (3, 3), (6, 3), (7, 3)
    store.selectTool('streetlamp');
    expect(store.applyToolToTile(5, 3)).toBe(true); // cost $25

    store.selectTool('ramp');
    expect(store.applyToolToTile(4, 3)).toBe(true); // cost $25

    store.selectTool('paved_walkway');
    expect(store.applyToolToTile(3, 3)).toBe(true); // cost $15
    expect(store.applyToolToTile(6, 3)).toBe(true); // cost $15
    expect(store.applyToolToTile(7, 3)).toBe(true); // cost $15

    const s2 = useGameStore.getState();
    expect(s2.budget).toBe(145); // $240 - 25 - 25 - 45 = $145

    // Run Phase 1 simulation
    const sim1 = store.runSimulation();
    expect(sim1.allSucceeded).toBe(true);
    expect(sim1.residentResults.length).toBe(2);

    // Advance timers for reveal
    vi.advanceTimersByTime(4000);

    const s3 = useGameStore.getState();
    expect(s3.revealedInvisibleResident).toBe(true);
    expect(s3.phase).toBe('post_reveal');
    expect(s3.activeResidentIds).toContain('henderson');

    // Mr. Henderson constraints
    const henderson = s3.currentChapter.residents.find((r) => r.id === 'henderson')!;
    expect(henderson.constraints.maxContinuousWalk).toBe(4);
    expect(henderson.constraints.requiresLight).toBe(true);
    expect(henderson.constraints.canTraverseStairs).toBe(false);

    store.acknowledgeReveal();

    // 2. Phase 2 Construction: Resting benches at (3, 3) and (6, 3) along the universal corridor
    store.selectTool('resting_bench');
    expect(store.applyToolToTile(3, 3)).toBe(true); // cost $20
    expect(store.applyToolToTile(6, 3)).toBe(true); // cost $20

    const s4 = useGameStore.getState();
    expect(s4.budget).toBe(105); // $145 - 20 - 20 = $105

    // 3. Phase 2 Simulation: Maya, Sam, and Mr. Henderson all safely reach destination
    const sim2 = store.runSimulation();
    expect(sim2.allSucceeded).toBe(true);
    expect(sim2.residentResults.length).toBe(3);

    const hendersonRes = sim2.residentResults.find((r) => r.residentId === 'henderson')!;
    expect(hendersonRes.success).toBe(true);
    expect(hendersonRes.restStops?.length).toBeGreaterThan(0);
    expect(hendersonRes.restStops).toContainEqual({ x: 3, y: 3 });
    expect(hendersonRes.restStops).toContainEqual({ x: 6, y: 3 });

    // Advance timer for victory celebration
    vi.advanceTimersByTime(4000);

    const s5 = useGameStore.getState();
    expect(s5.showVictoryModal).toBe(true);
    expect(s5.completedChapters).toContain(3);

    // Advance to Finale
    store.nextChapter();
    const sFinal = useGameStore.getState();
    expect(sFinal.showFinaleModal).toBe(true);
  });
});
