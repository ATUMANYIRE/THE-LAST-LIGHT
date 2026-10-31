#!/usr/bin/env node

import { chapter1, chapter2, chapter3, ALL_CHAPTERS, getChapterById } from '../engine/levels';
import { simulateChapter, validateToolPlacement } from '../engine/simulation';
import { recalculateLighting } from '../engine/pathfinding';
import { GridTile, ToolId } from '../types/game';

const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RED = '\x1b[31m';

interface SimulationReport {
  chapterId: number;
  chapterTitle: string;
  phase1Success: boolean;
  phase2Success: boolean;
  startingBudget: number;
  finalBudget: number;
  residentsPassed: string[];
}

function runChapter1Simulation(): SimulationReport {
  console.log(`\n${CYAN}${BOLD}=== CHAPTER 1: THE SHORTCUT (Old Clocktower Quarter) ===${RESET}`);
  const ch = chapter1;
  const tiles: GridTile[] = JSON.parse(JSON.stringify(ch.initialTiles));
  let budget = ch.startingBudget;

  console.log(`  Initial Budget: $${budget}`);
  console.log(`  Maya starts at (1, 1) -> Library at (6, 2)`);

  // Phase 1: Pave shortcut
  for (const [x, y] of [[2, 1], [2, 2], [5, 2]]) {
    const val = validateToolPlacement(ch, tiles, budget, 'paved_walkway', x, y);
    if (!val.valid) throw new Error(`Invalid placement: ${val.reason}`);
    tiles[val.tileIndex].type = 'paved_walkway';
    budget -= val.cost;
  }
  console.log(`  Phase 1 Construction complete. Budget remaining: $${budget}`);

  const sim1 = simulateChapter(ch, tiles, ['maya'], 'initial');
  console.log(`  Phase 1 Simulation: ${sim1.allSucceeded ? GREEN + 'SUCCESS' : RED + 'FAILED'}${RESET}`);
  if (!sim1.allSucceeded) throw new Error('Phase 1 Maya route failed');

  // Reveal Sam
  console.log(`  ${YELLOW}Reveal: Sam (wheelchair user) trapped at Sunken Stone Steps (3, 2).${RESET}`);

  // Phase 2: Place Modular Ramp at (3, 2)
  const rampVal = validateToolPlacement(ch, tiles, budget, 'ramp', 3, 2);
  if (!rampVal.valid) throw new Error(`Invalid ramp placement: ${rampVal.reason}`);
  tiles[rampVal.tileIndex].type = 'ramp';
  tiles[rampVal.tileIndex].hasRamp = true;
  budget -= rampVal.cost;
  console.log(`  Phase 2 Ramp installed at (3, 2). Final budget: $${budget}`);

  const sim2 = simulateChapter(ch, tiles, ['maya', 'sam'], 'post_reveal');
  console.log(`  Phase 2 Universal Simulation: ${sim2.allSucceeded ? GREEN + 'SUCCESS' : RED + 'FAILED'}${RESET}`);
  if (!sim2.allSucceeded) throw new Error('Phase 2 universal route failed');

  return {
    chapterId: 1,
    chapterTitle: ch.title,
    phase1Success: sim1.allSucceeded,
    phase2Success: sim2.allSucceeded,
    startingBudget: ch.startingBudget,
    finalBudget: budget,
    residentsPassed: ['Maya', 'Sam'],
  };
}

function runChapter2Simulation(): SimulationReport {
  console.log(`\n${CYAN}${BOLD}=== CHAPTER 2: THE SILENT CROSSING (Neon Avenue) ===${RESET}`);
  const ch = chapter2;
  const tiles: GridTile[] = JSON.parse(JSON.stringify(ch.initialTiles));
  let budget = ch.startingBudget;

  console.log(`  Initial Budget: $${budget}`);
  console.log(`  Kai starts at (1, 2) -> Pharmacy at (7, 2)`);

  // Phase 1: Pave Kai's corridor
  for (const x of [2, 3, 5, 6]) {
    const val = validateToolPlacement(ch, tiles, budget, 'paved_walkway', x, 2);
    if (!val.valid) throw new Error(`Invalid placement: ${val.reason}`);
    tiles[val.tileIndex].type = 'paved_walkway';
    budget -= val.cost;
  }
  console.log(`  Phase 1 Construction complete. Budget remaining: $${budget}`);

  const sim1 = simulateChapter(ch, tiles, ['kai'], 'initial');
  console.log(`  Phase 1 Simulation: ${sim1.allSucceeded ? GREEN + 'SUCCESS' : RED + 'FAILED'}${RESET}`);
  if (!sim1.allSucceeded) throw new Error('Phase 1 Kai route failed');

  // Reveal Elena
  console.log(`  ${YELLOW}Reveal: Elena (low-vision elder) needs audible crossing and tactile ground guidance.${RESET}`);

  // Phase 2: Acoustic Beacon at (4, 3) + Tactile Paving on row 3
  const beaconVal = validateToolPlacement(ch, tiles, budget, 'acoustic_beacon', 4, 3);
  if (!beaconVal.valid) throw new Error(`Invalid beacon: ${beaconVal.reason}`);
  tiles[beaconVal.tileIndex].hasAudioBeacon = true;
  tiles[beaconVal.tileIndex].hasTactile = true;
  budget -= beaconVal.cost;

  for (const x of [2, 3, 5, 6]) {
    const val = validateToolPlacement(ch, tiles, budget, 'tactile_paving', x, 3);
    if (!val.valid) throw new Error(`Invalid tactile: ${val.reason}`);
    tiles[val.tileIndex].type = 'tactile_paving';
    tiles[val.tileIndex].hasTactile = true;
    budget -= val.cost;
  }
  console.log(`  Phase 2 Inclusive Signals installed. Final budget: $${budget}`);

  const sim2 = simulateChapter(ch, tiles, ['kai', 'elena'], 'post_reveal');
  console.log(`  Phase 2 Universal Simulation: ${sim2.allSucceeded ? GREEN + 'SUCCESS' : RED + 'FAILED'}${RESET}`);
  if (!sim2.allSucceeded) throw new Error('Phase 2 universal route failed');

  return {
    chapterId: 2,
    chapterTitle: ch.title,
    phase1Success: sim1.allSucceeded,
    phase2Success: sim2.allSucceeded,
    startingBudget: ch.startingBudget,
    finalBudget: budget,
    residentsPassed: ['Kai', 'Elena'],
  };
}

function runChapter3Simulation(): SimulationReport {
  console.log(`\n${CYAN}${BOLD}=== CHAPTER 3: ONE LIGHT LEFT (St. Jude Civic Common) ===${RESET}`);
  const ch = chapter3;
  let tiles: GridTile[] = JSON.parse(JSON.stringify(ch.initialTiles));
  let budget = ch.startingBudget;

  console.log(`  Initial Budget: $${budget}`);
  console.log(`  Blackout active. Flood barrier at column 4.`);

  // Phase 1: Streetlamp at (5, 3), Ramp at (4, 3), Walkways at (3, 3), (6, 3), (7, 3)
  const lampVal = validateToolPlacement(ch, tiles, budget, 'streetlamp', 5, 3);
  tiles[lampVal.tileIndex].type = 'streetlamp';
  tiles[lampVal.tileIndex].lightSource = true;
  budget -= lampVal.cost;

  const rampVal = validateToolPlacement(ch, tiles, budget, 'ramp', 4, 3);
  tiles[rampVal.tileIndex].type = 'ramp';
  tiles[rampVal.tileIndex].hasRamp = true;
  budget -= rampVal.cost;

  for (const x of [3, 6, 7]) {
    const walkVal = validateToolPlacement(ch, tiles, budget, 'paved_walkway', x, 3);
    tiles[walkVal.tileIndex].type = 'paved_walkway';
    budget -= walkVal.cost;
  }
  tiles = recalculateLighting(tiles, ch.gridWidth, ch.gridHeight);
  console.log(`  Phase 1 Construction complete. Budget remaining: $${budget}`);

  const sim1 = simulateChapter(ch, tiles, ['maya', 'sam'], 'initial');
  console.log(`  Phase 1 Simulation: ${sim1.allSucceeded ? GREEN + 'SUCCESS' : RED + 'FAILED'}${RESET}`);
  if (!sim1.allSucceeded) throw new Error('Phase 1 Maya & Sam route failed');

  // Reveal Mr. Henderson
  console.log(`  ${YELLOW}Reveal: Mr. Henderson (78-year-old elder) exhausted without resting benches.${RESET}`);

  // Phase 2: Resting Benches at (3, 3) and (6, 3)
  for (const x of [3, 6]) {
    const benchVal = validateToolPlacement(ch, tiles, budget, 'resting_bench', x, 3);
    tiles[benchVal.tileIndex].type = 'resting_bench';
    tiles[benchVal.tileIndex].hasBench = true;
    budget -= benchVal.cost;
  }
  console.log(`  Phase 2 Universal Benches placed. Final budget: $${budget}`);

  const sim2 = simulateChapter(ch, tiles, ['maya', 'sam', 'henderson'], 'post_reveal');
  console.log(`  Phase 2 Universal Simulation: ${sim2.allSucceeded ? GREEN + 'SUCCESS' : RED + 'FAILED'}${RESET}`);
  if (!sim2.allSucceeded) throw new Error('Phase 2 universal route failed');

  return {
    chapterId: 3,
    chapterTitle: ch.title,
    phase1Success: sim1.allSucceeded,
    phase2Success: sim2.allSucceeded,
    startingBudget: ch.startingBudget,
    finalBudget: budget,
    residentsPassed: ['Maya', 'Sam', 'Mr. Henderson'],
  };
}

function main() {
  console.log(`\n${BOLD}================================================================${RESET}`);
  console.log(`${BOLD}  THE LAST LIGHT: The Invisible Resident — Headless Engine CLI  ${RESET}`);
  console.log(`${BOLD}================================================================${RESET}`);

  try {
    const r1 = runChapter1Simulation();
    const r2 = runChapter2Simulation();
    const r3 = runChapter3Simulation();

    console.log(`\n${GREEN}${BOLD}================================================================${RESET}`);
    console.log(`${GREEN}${BOLD}  ALL 3 CHAPTERS SIMULATED SUCCESSFULLY WITHOUT BROWSER OR REACT!${RESET}`);
    console.log(`${GREEN}${BOLD}================================================================${RESET}\n`);

    console.table([
      { Chapter: '1. The Shortcut', Phase1: 'PASS', Phase2: 'PASS', BudgetLeft: `$${r1.finalBudget}`, Residents: r1.residentsPassed.join(', ') },
      { Chapter: '2. The Silent Crossing', Phase1: 'PASS', Phase2: 'PASS', BudgetLeft: `$${r2.finalBudget}`, Residents: r2.residentsPassed.join(', ') },
      { Chapter: '3. One Light Left', Phase1: 'PASS', Phase2: 'PASS', BudgetLeft: `$${r3.finalBudget}`, Residents: r3.residentsPassed.join(', ') },
    ]);

    process.exit(0);
  } catch (err: any) {
    console.error(`\n${RED}${BOLD}Simulation Error:${RESET}`, err.message);
    process.exit(1);
  }
}

main();
