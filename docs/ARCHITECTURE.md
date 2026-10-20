# THE LAST LIGHT — Technical Architecture

This document describes the engineering architecture, data pipelines, state lifecycle, and extensibility patterns of **THE LAST LIGHT: The Invisible Resident**.

---

## 1. Architectural Principles

The game adheres to strict separation of concerns:
```
┌────────────────────────────────────────────────────────┐
│                   Next.js App Router                   │
│          (Responsive Page Layout, Server/Client)       │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│     UI Layer (React)    │  │ Accessible DOM Layer     │
│  - GameBoard (SVG/DOM)  │  │  - role="grid" / ARIA    │
│  - ToolPalette          │  │  - Live Announcer        │
│  - ResidentCard         │  │  - Audio Captions Toast  │
│  - Narrative Modals     │  │  - Keyboard Navigation   │
└────────────┬────────────┘  └───────────┬─────────────┘
             │                           │
             └─────────────┬─────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│               Zustand State Store                      │
│  - Level state, undo/redo history, budget accounting   │
│  - Active resident IDs, simulation results             │
│  - Persistent progress & accessibility settings        │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│ Deterministic A* Engine │  │ Procedural Sound Engine │
│  - Graph pathfinding    │  │  - Web Audio synth       │
│  - Constraint validator │  │  - Captions dispatcher   │
│  - Dynamic lighting     │  │  - Accessible chimes     │
└─────────────────────────┘  └─────────────────────────┘
```

1. **Decoupled Game Logic**: The pathfinding engine (`src/engine/pathfinding.ts`) and level definitions (`src/engine/levels.ts`) are 100% pure TypeScript functions with zero UI or browser DOM dependencies. They can be tested independently in Node/Vitest.
2. **Deterministic State**: Given a grid configuration and resident profile, the pathfinding engine will always produce the identical route, barrier diagnostics, and step counts.
3. **Inclusive by Construction**: The UI is built with dual rendering: rich visual graphics (SVG coordinates, atmospheric lighting, glowing lanterns) coupled with a fully parallel, hidden-accessible DOM grid (`role="grid"`, `tabIndex`, screen-reader announcements).
4. **Zero Heavy External Dependencies**: No external audio files to fetch over slow connections (uses procedural Web Audio API synthesizers). No external heavy UI libraries.

---

## 2. Data Models (`src/types/game.ts`)

### `GridTile`
```typescript
export interface GridTile {
  x: number;
  y: number;
  type: TileType;
  isInitialFixed: boolean; // Permanent town hall, clocktower, etc.
  elevation: number;       // 0 = level, 1 = elevated/curb, 2 = steep
  hasLight: boolean;       // Ambient or direct illumination
  lightSource?: boolean;   // Placed or fixed streetlight
  hasTactile: boolean;     // Blister paving guidance
  hasAudioBeacon: boolean; // APS audio signal for crossings
  hasBench: boolean;       // Support armrest resting bench
  hasRamp: boolean;        // Modular ramp / curb cut
  label?: string;
}
```

### `ResidentProfile` & Constraints
```typescript
export interface ResidentConstraints {
  canTraverseStairs: boolean;
  maxCurbs: number;                // 0 for wheelchair / rolling devices
  requiresTactileInDark: boolean;  // Low-vision need guidance
  requiresLight: boolean;          // Must be illuminated or have sensory guide
  requiresAcousticAtRoads: boolean;// Must have audio signal at crosswalks
  maxContinuousWalk: number;       // Max tiles before needing bench
  sensitiveToGlare: boolean;       // Disoriented by harsh floodlights
}
```

---

## 3. Pathfinding Engine (`src/engine/pathfinding.ts`)

The pathfinding system implements an A* search algorithm with Manhattan distance heuristics and an extensible constraint validation pipeline (`validateMove`).

### Barrier Detection Priority
When a resident cannot traverse a candidate tile, the engine categorizes the failure into prioritized accessibility barriers:
1. **Physical Elevation Barrier**: Stairs without ramp (`barrierType: 'stairs'`) or unramped curb drop (`barrierType: 'curb'`).
2. **Sensory Inaccessibility**: Silent vehicular crossing without acoustic locator beacon (`barrierType: 'missing_audio'`).
3. **Visual / Wayfinding Inaccessibility**: Pitch dark sector without illumination or tactile blister pavers (`barrierType: 'darkness'`).
4. **Endurance / Fatigue Barrier**: Walking distance exceeding safe capacity without a resting bench (`barrierType: 'exhaustion'`).
5. **General Obstruction**: Collision with fixed buildings or debris (`barrierType: 'blocked'`).

---

## 4. How to Add a New Chapter

Adding a new level takes four simple steps without modifying rendering code:
1. In `src/engine/levels.ts`, create a new `ChapterDefinition`:
   - Set `gridWidth`, `gridHeight`, `startingBudget`.
   - Define `initialTiles` (buildings, obstacles, historic paths).
   - Define `residents`: one initial active resident and one `invisibleResidentId`.
   - Write respectful narrative dialogues for `intro`, `reveal`, and `complete`.
2. Add the chapter to `ALL_CHAPTERS` array in `levels.ts`.
3. Add a solvability test in `src/engine/__tests__/gameplay.test.ts`.
4. Run `npm test` to verify solvability under budget.
