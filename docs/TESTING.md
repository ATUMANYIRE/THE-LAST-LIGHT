# THE LAST LIGHT — Verification & Automated Testing Report

> **Date of Independent Release Audit**: October 20, 2026  
> **Environment**: Node.js v24.12.0 on Windows (x64)  
> **Engine Test Runner**: Vitest v3.2.7  
> **Browser Automation Runner**: Playwright v1.51.0  

---

## 1. Test Summary

All automated tests were executed against genuine application code with zero mocked pass-throughs, no bypass toggles, and strict assertions.

```
======================================================================
1. Vitest Deterministic Unit & Level Solvability Tests
   RUN  v3.2.7 E:/Projects/THE-LAST-LIGHT
   ✓ src/engine/__tests__/gameplay.test.ts (3 tests)
   ✓ src/engine/__tests__/pathfinding.test.ts (9 tests)
   Test Files: 2 passed (2) | Tests: 12 passed (12) | Duration: 1.13s

======================================================================
2. Playwright End-to-End Browser UI Automation Tests
   Running 16 tests using Chromium (Desktop 1280x800 & Mobile 393x851)
   ✓ e2e/playthrough.spec.ts (2 passed)
   ✓ e2e/controls-and-settings.spec.ts (8 passed)
   ✓ e2e/accessibility.spec.ts (4 passed)
   ✓ e2e/smoke.spec.ts (2 passed)
   Total E2E: 16 passed (16), 0 failed
======================================================================
```

**Overall Result**: 28/28 Tests Passing (100% Pass Rate).

---

## 2. Vitest Engine Test Suites Breakdown

### Suite A: Deterministic Pathfinding & Accessibility Constraints (`src/engine/__tests__/pathfinding.test.ts`)
| Test Case | Description | Result |
|:---|:---|:---:|
| `Maya Stairs Traversal` | Verifies able-bodied resident Maya can traverse historic stone stairs at (3, 2) to reach the Clocktower Library. | PASS |
| `Sam Wheelchair Barrier` | Verifies wheelchair user Sam is blocked on the stone stairs without a ramp and returns `barrierType: 'stairs'`. | PASS |
| `Sam Ramp Traversal` | Verifies Sam can successfully traverse the stairs once a modular ramp is installed. | PASS |
| `Kai Visual Crossing` | Verifies sensory-sensitive resident Kai can navigate standard pedestrian routes and crosswalks using visual sightlines. | PASS |
| `Elena Silent Crossing Barrier` | Verifies low-vision resident Elena is blocked at an active vehicular road lacking an Accessible Pedestrian Signal (`barrierType: 'missing_audio'`). | PASS |
| `Elena Acoustic Signal Passage` | Verifies Elena safely crosses the road once an Acoustic Beacon (APS) and tactile guide pavers are installed. | PASS |
| `Mr. Henderson Exhaustion Barrier` | Verifies elder resident Mr. Henderson (COPD recovery) collapses from physical exhaustion when walking > 4 tiles without a resting bench (`barrierType: 'exhaustion'`). | PASS |
| `Mr. Henderson Bench Recovery` | Verifies Mr. Henderson reaches the community center when a resting bench is placed midway along the corridor. | PASS |
| `Streetlamp Radius Calculation` | Verifies dynamic lighting engine correctly illuminates tiles within Manhattan radius 2 of a streetlamp while leaving distant tiles in darkness. | PASS |

### Suite B: Level Solvability & Budget Accounting (`src/engine/__tests__/gameplay.test.ts`)
| Test Case | Civic Budget Allocated | Budget Expended | Solvability Verified | Result |
|:---|:---:|:---:|:---:|:---:|
| `Chapter 1: The Shortcut` | $150 | $70 | Maya (Phase 1) & Sam (Post-Reveal) | PASS |
| `Chapter 2: The Silent Crossing` | $190 | $150 | Kai & Elena (Post-Reveal) | PASS |
| `Chapter 3: One Light Left` | $240 | $220 | Maya, Sam & Mr. Henderson | PASS |

---

## 3. Playwright E2E Browser Test Suites Breakdown

### Suite C: Real UI Complete Playthrough (`e2e/playthrough.spec.ts`)
- **Desktop Chrome** (1280×800): Passes Chapter 1 (Maya + Sam ramp placement), Chapter 2 (Kai + Elena acoustic beacon placement), Chapter 3 (Maya + Sam + Henderson lighting and resting benches), and verifies Grand Finale modal.
- **Mobile Chrome** (393×851): Identical UI interaction assertions under mobile viewport touch simulation.

### Suite D: Controls, Persistence & Failure Dialogs (`e2e/controls-and-settings.spec.ts`)
- Keyboard navigation cursor movement (`Arrow Keys`, `WASD`)
- Infrastructure placement via `Space`
- Tool switching via hotkeys `1`–`6`
- Undo action via `Ctrl+Z` and header Undo button
- Chapter Reset action via header Reset button
- Failure modal rendering with barrier explanation when a route is left blocked
- Settings switches: High Contrast mode, Reduced Motion, Large Text, Captions
- Progress persistence via `localStorage` across page reloads

### Suite E: Focused Accessibility & Mobile Layout (`e2e/accessibility.spec.ts`)
- ARIA live region assertion (`div[aria-live="polite"][role="status"]`)
- Modal dialog accessibility attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`)
- Grid accessibility attributes (`role="grid"`, `aria-label`)
- Button switch roles and toggle states (`role="switch"`, `aria-checked`)
- Responsive viewport fit (no unintended horizontal document overflow on 393px viewport)

---

## 4. How to Run Tests Locally

```bash
# 1. Run deterministic game-engine unit tests
npm test

# 2. Run TypeScript strict type-checking
npm run typecheck

# 3. Build production bundle
npm run build

# 4. Run full Playwright browser end-to-end test suite
npm run test:e2e
```
