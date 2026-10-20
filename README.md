# THE LAST LIGHT: The Invisible Resident

> **A city isn't truly connected until everyone can find their way home.**  
> Built for the **Girls Who Code HHS Hackathon 2026** ($50 First Place Prize).

[![Production Build](https://img.shields.io/badge/Build-Passing-10b981?style=flat-square&logo=nextdotjs)](.)
[![Tests](https://img.shields.io/badge/Vitest-12%2F12%20Passed-10b981?style=flat-square&logo=vitest)](docs/TESTING.md)
[![E2E Tests](https://img.shields.io/badge/Playwright-16%2F16%20Passed-10b981?style=flat-square&logo=playwright)](docs/TESTING.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Mode-3178c6?style=flat-square&logo=typescript)](tsconfig.json)
[![Accessibility](https://img.shields.io/badge/Accessibility-Independently%20Audited-10b981?style=flat-square)](docs/TESTING.md)
[![License](https://img.shields.io/badge/License-MIT-334155?style=flat-square)](LICENSE)

---

## What is THE LAST LIGHT?

Continuous city infrastructure is often designed exclusively for the "average" pedestrian: agile, fully sighted, daylight walkers with boundless endurance. 

**THE LAST LIGHT** is a social-impact puzzle game that models the real-world consequences of urban planning through an innovative gameplay mechanic: **The Invisible Resident**.

1. **Phase 1: The Initial Route**: The player connects homes to essential destinations (the community library, clinic, or shelter) across a miniature nighttime city grid.
2. **The Turn: The Invisible Resident Emerges**: Just as celebration bells ring, night falls deeper. A previously uncounted resident appears on the street:
   - In **Chapter 1**, **Sam** (a manual wheelchair user) tries to use the player's shortcut—only to be trapped by an unramped 3-step sunken stone alley.
   - In **Chapter 2**, **Elena** (a botanist navigating with a long white cane) arrives at an arterial roadway, stranded by silent electric traffic and a lack of audible signals and tactile ground guides.
   - In **Chapter 3**, **Mr. Henderson** (a 78-year-old elder with cardiopulmonary fatigue) faces an 8-block blackout corridor without a single resting bench.
3. **Phase 2: Universal Redesign**: The player unlocks **Universal Design tools** (Modular Ramps, Tactile Blister Pavers, Acoustic Pedestrian Signals, Warm Luminaries, Resting Benches) and must redesign the neighborhood under a civic budget so that *everyone* gets home safely.

> **The Social Model of Disability**: Our game never frames disability as an individual defect to be cured. The problem is the built environment and its exclusionary barriers.

---

## The Three Chapters

| Chapter | District | Initial Resident | Invisible Resident | Barrier & Learning Principle |
|:---|:---|:---|:---|:---|
| **Ch. 1: The Shortcut** | Old Clocktower Quarter | Maya (Pedestrian Student) | Sam (Manual Wheelchair User) | **Sunken 3-Step Stairs**. *Equitable Use: The fastest route is not accessible to everyone.* |
| **Ch. 2: The Silent Crossing** | Neon Market & Avenue | Kai (Sensory-Sensitive Student) | Elena (Low-Vision White Cane User) | **Silent Road Crossing**. *Perceptible Information: Redundancy through sound, touch, and sight.* |
| **Ch. 3: One Light Left** | St. Jude Civic Common | Maya & Sam (Pedestrians/Wheels) | Mr. Henderson (Cardiopulmonary Fatigue) | **Rolling Blackout & Exhaustion**. *Low Physical Effort: Public seating and lighting are essential life infrastructure.* |

---

## Inclusive Design & Audited Accessibility Features

The game itself embodies the very inclusive principles it teaches. During our independent release audit, the following accessibility features were implemented and programmatically verified:

- **Full Keyboard Navigation (Verified)**: Complete playable experience without mouse interaction. Navigate tiles with `Arrow Keys` or `WASD`, place infrastructure with `Space` or `Enter`, switch tools with `1`-`6`, undo with `Ctrl+Z`, and reset with `R`.
- **Screen Reader Parity (Verified)**: Accessible DOM grid with `role="grid"` and interactive cell buttons, accompanied by dynamic `aria-live="polite"` status announcements reporting tile coordinates, lighting, elevation, municipal budget, and path traversal results.
- **High-Contrast Mode (Verified)**: Stark yellow (`#FFFF00`) and cyan (`#00FFFF`) on deep pitch-black (`#000000`), yielding a **19.56:1 contrast ratio** (far exceeding the WCAG AAA 7:1 threshold).
- **Reduced Motion (Verified)**: CSS-enforced suppression of camera pans, lantern pulses, and animated transforms (`animation-duration: 0.001ms !important`).
- **Procedural Sound & Visual Captions (Verified)**: Native Web Audio synthesizer paired with an on-screen visual toast displaying textual captions for all sound signals.
- **No Color-Only Information (Verified)**: Every tile, resident avatar, and barrier is distinguished by high-contrast geometric icons, textual labels, and borders.

> [!NOTE]
> *Audit Scope Transparency*: Automated ARIA attributes, keyboard control flows, contrast ratios, and dialog semantics have been verified with 100% pass rate in Playwright. Real-world end-user testing with physical Braille refreshable displays or third-party screen reader voice engines (e.g. JAWS, NVDA) remains designated as unverified real-device testing.

---

## Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Static Export ready)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Architecture**: [Zustand](https://github.com/pmndrs/zustand)
- **Audio Engine**: Native Web Audio API procedural synthesizer (zero external audio file dependencies)
- **Testing**: [Vitest](https://vitest.dev/) (Deterministic pathfinding and level solvability suite)

---

## Quickstart Guide

### Prerequisites
- Node.js 18+ (tested on Node v24.12.0)
- npm 9+

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/the-last-light.git
cd the-last-light

# Install dependencies
npm install
```

### 2. Launch Local Development Server
```bash
npm run dev
```
Open [http://localhost:3005](http://localhost:3005) in your web browser.

### 3. Run Automated Tests
```bash
# Run deterministic engine unit tests (Vitest)
npm test

# Run full browser end-to-end tests across desktop and mobile (Playwright)
npm run test:e2e
```

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## Project Structure

```
THE-LAST-LIGHT/
├── docs/
│   ├── GAME_DESIGN.md            # Complete game design and educational narrative
│   ├── ARCHITECTURE.md           # Architecture, data models, and extensibility guide
│   ├── TESTING.md                # Verification report and test suites breakdown
│   └── IMPLEMENTATION_STATUS.md  # Milestones progress and Go/No-Go release verdict
├── src/
│   ├── app/
│   │   ├── globals.css           # Design tokens, accessibility high-contrast styles
│   │   ├── layout.tsx            # HTML document wrapper with metadata
│   │   └── page.tsx              # Main game layout and keyboard listeners
│   ├── components/
│   │   ├── game/
│   │   │   ├── CharacterAvatar.tsx # Procedural SVG character portraits
│   │   │   ├── GameBoard.tsx       # 2.5D visual board & accessible DOM grid
│   │   │   ├── ResidentCard.tsx    # Active travelers and environmental needs
│   │   │   └── ToolPalette.tsx     # Infrastructure building tools
│   │   ├── layout/
│   │   │   ├── AudioCaptions.tsx   # Deaf/hard-of-hearing caption toaster
│   │   │   └── Header.tsx          # Chapter, district, and municipal budget bar
│   │   └── modals/
│   │       ├── ChapterSelectModal.tsx # Chapter selection and unlock progression
│   │       ├── FailureModal.tsx       # Respectful accessibility barrier guidance
│   │       ├── HelpModal.tsx          # Keyboard controls & Universal Design guide
│   │       ├── IntroModal.tsx         # Story introductions
│   │       ├── RevealModal.tsx        # The signature Invisible Resident Reveal
│   │       ├── SettingsModal.tsx      # High contrast, sound, and motion toggles
│   │       └── VictoryModal.tsx       # Celebration & Universal Design takeaway
│   ├── engine/
│   │   ├── __tests__/
│   │   │   ├── gameplay.test.ts    # Solvability & budget accounting suite
│   │   │   └── pathfinding.test.ts # A* pathfinding & mobility constraints suite
│   │   ├── audio.ts                # Web Audio API sound synthesizer
│   │   ├── levels.ts               # Chapters 1, 2, 3 level definitions
│   │   └── pathfinding.ts          # Deterministic A* routing & constraint validation
│   ├── store/
│   │   └── gameStore.ts            # Zustand game state, undo/redo, persistence
│   ├── types/
│   │   └── game.ts                 # TypeScript domain definitions
│   └── utils/
│       └── confetti.ts             # Lightweight zero-dependency celebration burst
├── package.json
├── PROGRESS.md                   # Milestone verification log
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## License

MIT License. Built with pride for the Girls Who Code HHS Hackathon 2026.
