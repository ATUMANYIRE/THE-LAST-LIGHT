# THE LAST LIGHT: The Invisible Resident — Game Design Document

**Competition**: Girls Who Code HHS Hackathon 2026  
**Category**: Social-Impact Puzzle Game  
**Tagline**: *A city isn't truly connected until everyone can find their way home.*

---

## 1. Executive Summary & Educational Vision

In traditional urban design and computer gaming alike, infrastructure is almost universally designed for an idealized, able-bodied "average" pedestrian: someone who sees with 20/20 clarity, navigates steps and curbs without hesitation, walks indefatigably, and processes high-contrast neon stimuli without distress.

**THE LAST LIGHT: The Invisible Resident** turns this paradigm inside out through an authentic, interactive social-impact puzzle mechanic:
- The player steps into the role of a community route builder at dusk.
- The initial challenge appears straightforward: connect a resident to a vital community hub under a civic budget.
- The player succeeds, celebration bells ring—and then **night falls deeper**.
- The signature mechanic triggers: **THE INVISIBLE RESIDENT**.
- A previously overlooked neighbor steps into the street. The player’s "convenient shortcut" or "efficient route" has created an exclusionary barrier: a 3-step stone drop traps manual wheelchair wheels; a silent crosswalk leaves a blind botanist stranded in vehicular danger; a dark corridor without resting benches causes an elder with cardiopulmonary fatigue to collapse.
- The player must return to the board, analyze the environmental barrier, and redesign the urban infrastructure using **Universal Design principles** so that *both* residents reach safety within the civic budget.

### Core Message: The Social Model of Disability
Our game strictly adheres to the **Social Model of Disability**:
> Disability is not an individual medical deficit or a personal flaw to be "cured." Disability occurs when the built environment contains physical, sensory, and procedural barriers that exclude people from equitable participation. When we remove environmental barriers, we build a city that honors human dignity for all.

---

## 2. The Curb-Cut Effect

The emotional and intellectual payoff of the game comes from discovering the **Curb-Cut Effect**:
- When curb cuts and modular ramps were first mandated for wheelchair users, city officials worried they were an expensive niche accommodation.
- In reality, curb cuts transformed everyday life for parents pushing strollers, travelers rolling luggage, delivery workers steering hand trucks, and workers with temporary injuries.
- In *The Last Light*, every accessible intervention—ramps, acoustic beacons, continuous tactile paving, shielded warm luminaries, and resting benches—demonstrates how universal accessibility enriches the entire civic fabric.

---

## 3. Chapter Breakdown

### Chapter 1: The Shortcut (Old Clocktower Quarter)
- **District**: Historic cobblestone neighborhood with sunken stone alleyways and brick townhouses.
- **Initial Resident**: **Maya** (High school senior & community tutor, able-bodied). Needs to reach the Clocktower Community Library before study hall doors lock.
- **Initial Solution**: Maya traverses a direct path through a 3-step sunken stone alleyway at (3, 2).
- **The Invisible Resident Reveal**: **Sam**, a neighbor and freelance illustrator who uses a manual wheelchair, tries to follow the new route. The 3-step drop traps their wheels. The temperature is falling.
- **Universal Design Principle 1: Equitable Use**: The shortest route is not an accessible route.
- **Toolkit Unlock**: **Modular Ramp / Curb Cut**.
- **Winning Resolution**: The player retrofits the sunken stone steps with a modular ramp or paves an accessible level detour, enabling both Maya and Sam to arrive safely at the library under budget ($150).

### Chapter 2: The Silent Crossing (Neon Market & Transit Avenue)
- **District**: High-traffic arterial avenue with autonomous electric buses and bustling storefronts.
- **Initial Resident**: **Kai** (Audio engineering student, neurodivergent, highly sensory-sensitive). Needs to pick up their sister's medication at the 24-hour Pharmacy.
- **Initial Solution**: Kai navigates a quiet corridor and crosses the arterial avenue using visual sightlines.
- **The Invisible Resident Reveal**: **Elena**, a retired botanist who navigates with a long white cane, reaches the curb. The pedestrian traffic signal is silent. Electric vehicles make virtually zero engine noise. Elena cannot safely detect traffic gaps, and the open plaza lacks tactile ground wayfinding.
- **Universal Design Principle 4: Perceptible Information**: Information must never rely solely on a single sensory modality (visual-only). It requires redundancy through touch (tactile blister pavers) and sound (Accessible Pedestrian Signals).
- **Toolkit Unlock**: **Tactile Pavers** and **Acoustic Signals (APS)**.
- **Winning Resolution**: The player installs an Acoustic Crossing Beacon that chirps audible locator tones and lays continuous tactile directional blister paving, guiding both Kai and Elena safely to transit and the pharmacy ($190 budget).

### Chapter 3: One Light Left (St. Jude Civic Common)
- **District**: Outer harbor district impacted by a sudden blackout and storm debris.
- **Initial Residents**: **Maya** and **Sam**, navigating storm-damaged curbs to reach the heated community shelter.
- **The Invisible Resident Reveal**: **Mr. Henderson** (78-year-old retired postal carrier living with COPD and heart recovery). The power grid failure plunged the neighborhood into pitch darkness. Walking 5 continuous blocks without a resting bench strains his lungs dangerously.
- **Universal Design Principle 3 & 6: Low Physical Effort & Community Resilience**: Public seating and warm pedestrian lighting are not decorative luxuries—they are vital life-support infrastructure.
- **Toolkit Unlock**: **Resting Benches** and **Warm Luminaries (Streetlamps)**.
- **Winning Resolution**: The player deploys strategic streetlamps that illuminate 2-unit radii without glare and installs resting benches at maximum 4-tile intervals, guiding Maya, Sam, and Mr. Henderson to warmth and safety ($240 budget).

---

## 4. Characters & Authentic Representation

| Resident | Identity & Role | Mobility Profile | Environmental Constraints |
|:---|:---|:---|:---|
| **Maya** | Student, 17, she/her | Pedestrian | Able to navigate stairs and uneven terrain. Requires lighting during blackouts. |
| **Sam** | Neighbor & Illustrator, 24, they/them | Manual Wheelchair User | Requires zero-step grading, curb cuts, and modular ramps. Blocked by stairs and curbs. |
| **Elena** | Retired Botanist, 68, she/her | Low-Vision / White Cane User | Requires continuous tactile blister pavers in fog/dusk and audible crosswalk signals. |
| **Kai** | Sound Student, 19, he/they | Neurodivergent / Sensory Sensitive | Sensitive to chaotic construction and harsh industrial glare. Requires clear, predictable routes. |
| **Mr. Henderson** | Retired Postal Worker, 78, he/him | Chronic Fatigue / COPD Recovery | Cannot walk more than 4 continuous tiles without a resting bench. Requires lighting. |

---

## 5. Scoring & Hackathon Rubric Alignment

1. **Social Impact (35 Points)**: Directly teaches players why inclusive design is a civil right through immediate, non-punitive cause-and-effect gameplay.
2. **Coding & Implementation (30 Points)**: Deterministic A* graph pathfinding with custom per-resident constraint validators, strict state management, and 100% automated test coverage.
3. **User Experience & Accessibility (20 Points)**: Fully playable via keyboard alone, screen reader ARIA live region announcements, high-contrast mode, reduced-motion overrides, on-screen sound captions, and large text support.
4. **Originality (15 Points)**: The "Invisible Resident" two-phase reveal subverts traditional optimization puzzles by prioritizing human dignity and community over raw speed.
