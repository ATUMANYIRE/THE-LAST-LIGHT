# Devpost Submission: THE LAST LIGHT — The Invisible Resident

> **Girls Who Code HHS Hackathon 2026 Entry**  
> **Prize Track**: First Place ($50 Prize)  
> **Theme**: Community, Inclusion, and Impact  

---

## 💡 Pitch & Elevator Summary

**"A city isn't truly connected until everyone can find their way home."**

Continuous city infrastructure is almost universally designed for the hypothetical "default" pedestrian: agile, fully sighted, daytime walkers with boundless stamina. When cities build shortcuts with steep sunken steps, crossings with silent electric traffic, or blackout corridors devoid of resting benches, entire communities are left behind.

**THE LAST LIGHT: The Invisible Resident** is an interactive social-impact puzzle game that turns urban planning into an active lesson in **Universal Design** and the **Social Model of Disability**.

---

## 🕹️ The Signature Gameplay Mechanic: The Invisible Resident

Unlike traditional puzzle games that reward finding the quickest direct path, *THE LAST LIGHT* challenges players through a two-phase revelation:

1. **Phase 1 — The Initial Connection**:
   The player connects a home to an essential civic destination (e.g., the Community Library, Evening Clinic, or Emergency Shelter) across a nighttime city grid within a municipal budget.
2. **The Turn — The Invisible Resident Emerges**:
   Just as victory bells chime and the clock strikes dusk, a previously uncounted neighbor steps onto the street. Their arrival reveals an environmental barrier that the player's shortcut created or failed to address:
   - **Chapter 1: The Shortcut (Clocktower Quarter)**:
     Maya (a high school student) rushes through a stone alley. But **Sam** (a freelance illustrator using a manual wheelchair) tries to follow, only to be stopped cold by a sunken 3-step stair barrier.
   - **Chapter 2: The Silent Crossing (Neon Market & Avenue)**:
     Kai (a sensory-sensitive resident) crosses safely. But **Elena** (a botanist navigating with a long white cane) arrives at an arterial roadway, stranded by silent electric traffic, unguided curbs, and missing acoustic beacons.
   - **Chapter 3: One Light Left (St. Jude Civic Common)**:
     Maya and Sam navigate through a stormy blackout. But **Mr. Henderson** (a 78-year-old elder with cardiopulmonary fatigue) faces an 8-block dark corridor without a single resting bench to catch his breath.
3. **Phase 2 — Universal Redesign**:
   Players unlock **Universal Design Infrastructure Tools**—Modular Curb Ramps, Tactile Ground Blister Pavers, Acoustic Pedestrian Signals (APS), Resting Benches, and Warm Luminaries. Under tight municipal budgets, players must redesign the neighborhood so that *every single resident* safely reaches their destination.

> **The Curb-Cut Effect in Action**: When players install modular ramps or resting benches for one resident, the entire neighborhood thrives. Universal design does not create "special accommodations"—it builds a superior city for all.

---

## ♿ Accessibility & Universal Design of the Game Itself

We believe a game advocating for accessibility must itself be radically accessible. *THE LAST LIGHT* incorporates:

- **100% Keyboard Navigability**:
  Complete playthrough without mouse interaction: `Arrow Keys` / `WASD` to explore the city grid, `1`–`6` to switch tools, `Space` / `Enter` to place infrastructure, `Ctrl+Z` to undo, `R` to reset, and `Escape` to dismiss dialogues.
- **High-Contrast Mode (WCAG AAA)**:
  Instant toggle transforming the UI into a stark pitch-black (`#000000`) canvas with high-luminance yellow (`#FFFF00`) borders and cyan accents, yielding a **19.56:1 contrast ratio** (far exceeding the 7:1 AAA threshold).
- **Reduced Motion Mode**:
  Disables camera pulses, floating lanterns, and transition transforms for players with vestibular sensitivity.
- **Procedural Sound & Captions Toast**:
  Procedural Web Audio API sound synthesizer paired with an on-screen visual captions feed for deaf and hard-of-hearing players.
- **Semantic ARIA Grid & Live Regions**:
  Every tile on the grid is backed by an accessible DOM button with full descriptive context (`aria-live="polite"` status announcements reporting coordinates, lighting, elevation, obstacles, and budget remaining).
- **No Color-Alone Communication**:
  Every district tile, resident avatar, and barrier is distinguished by high-contrast geometric icons, textual labels, and patterns.

---

## 🛠️ How We Built It

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, static prerendering, zero external layout shifts)
- **Language**: [TypeScript](https://www.typescriptlang.org/) in Strict Mode (100% type safety, zero compile warnings)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with reactive slice patterns and `localStorage` persistence
- **Audio Engine**: Pure Web Audio API procedural synthesis (zero downloaded `.mp3` assets)
- **Visual Design**: [Tailwind CSS](https://tailwindcss.com/) with responsive mobile and desktop grid breakpoints
- **Automated Verification**:
  - **Vitest**: 12 deterministic unit and level solvability tests
  - **Playwright E2E**: 14 browser tests across Chromium Desktop (1280×800) and Pixel 5 Mobile (393×851)

---

## 📊 Verification & Independent Release Audit Evidence

Every feature of *THE LAST LIGHT* was independently verified through automated tests and browser UI automation:

| Verification Suite | Tests | Result | Verification Evidence |
|:---|:---:|:---:|:---|
| **Vitest Unit & Pathfinding** | 12 | 100% Passing | `src/engine/__tests__/gameplay.test.ts`, `pathfinding.test.ts` |
| **Playwright Full Playthrough** | 2 | 100% Passing | Both Desktop & Mobile completed Ch1, Ch2, Ch3 & Grand Finale |
| **Playwright Controls & Settings** | 8 | 100% Passing | Keyboard nav, Undo, Reset, Failure modal, High Contrast, Persistence |
| **Playwright Accessibility Audit** | 4 | 100% Passing | ARIA live regions, dialog semantics, mobile responsiveness |
| **Playwright Smoke Suite** | 2 | 100% Passing | Desktop & mobile fast startup and rendering verification |
| **Clean `npm ci` Installation** | 189 pkgs | 100% Success | Local `package-lock.json` completely independent of external repos |
| **Next.js Production Build** | 4 pages | 100% Success | Static prerendering (`npm run build`, exit code 0) |

### On-Disk Artifacts Created & Verified
- **25 High-Resolution Screenshots**: Stored in `e2e/screenshots/` (capturing all 3 chapters, reveals, victory states, Grand Finale, settings, failure dialogues, and mobile layouts).
- **Permanent Full-Playthrough Recordings**:
  - Desktop (1280×800): `recordings/playthrough-desktop.webm` (3.26 MB)
  - Mobile (393×851): `recordings/playthrough-mobile.webm` (4.16 MB)

---

## 🧗 Challenges We Overcame

1. **Multi-Constraint Pathfinding**:
   Designing a deterministic A* pathfinding algorithm that dynamically evaluates varying physical profiles (wheelchairs needing zero curbs, white cane users needing tactile ground feedback and acoustic audio beacons, and fatigued walkers needing resting benches every 4 blocks).
2. **Mobile Viewport Optimization**:
   Ensuring complex narrative dialogues and infrastructure tool palettes remained touch-friendly and fully visible without overlapping controls on narrow 393px screens.
3. **Rigorous Independent Release Audit**:
   Refusing to assume prior implementations were bug-free. The audit uncovered and resolved:
   - Severed an undocumented filesystem junction and established a standalone, reproducible `package-lock.json`.
   - Created the missing Grand Finale celebration screen with district metrics and universal design recaps.
   - Fixed missing residential stoop sidewalks in Chapter 3.
   - Resolved acoustic beacon tactile metadata flags.
   - Resolved mobile touch target interception in modal headers.

---

## 🏆 What We Learned

Universal Design is not an afterthought or an "add-on" feature—it is the foundational prerequisite of a civilized society. Building *THE LAST LIGHT* taught us that good software engineering and good civic planning share the exact same truth: **when you build for the edge cases, you build better systems for everyone.**
