import { ChapterDefinition, GridTile, ResidentProfile, ToolId } from '../types/game';
import { recalculateLighting } from './pathfinding';

// Helper to create empty grid
function createEmptyGrid(width: number, height: number): GridTile[] {
  const tiles: GridTile[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles.push({
        x,
        y,
        type: 'empty',
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
  return tiles;
}

// -------------------------------------------------------------
// CHAPTER 1: THE SHORTCUT
// -------------------------------------------------------------
const chapter1Width = 8;
const chapter1Height = 6;
const chapter1Tiles: GridTile[] = createEmptyGrid(chapter1Width, chapter1Height);

// Helper to update tile in array
function setTile(
  tiles: GridTile[],
  width: number,
  x: number,
  y: number,
  patch: Partial<GridTile>
) {
  const idx = y * width + x;
  if (tiles[idx]) {
    tiles[idx] = { ...tiles[idx], ...patch };
  }
}

// Fixed buildings & obstacles for Chapter 1
setTile(chapter1Tiles, chapter1Width, 0, 0, { type: 'building', isInitialFixed: true, label: 'Town Hall' });
setTile(chapter1Tiles, chapter1Width, 3, 0, { type: 'building', isInitialFixed: true, label: 'Bakery' });
setTile(chapter1Tiles, chapter1Width, 4, 0, { type: 'building', isInitialFixed: true });
setTile(chapter1Tiles, chapter1Width, 3, 1, { type: 'building', isInitialFixed: true });
setTile(chapter1Tiles, chapter1Width, 4, 1, { type: 'building', isInitialFixed: true });
setTile(chapter1Tiles, chapter1Width, 0, 3, { type: 'building', isInitialFixed: true });
setTile(chapter1Tiles, chapter1Width, 0, 4, { type: 'building', isInitialFixed: true });
setTile(chapter1Tiles, chapter1Width, 3, 4, { type: 'obstacle', isInitialFixed: true, label: 'Construction Fence' });
setTile(chapter1Tiles, chapter1Width, 4, 4, { type: 'obstacle', isInitialFixed: true });

// Sunken historic alleyway with steep 3-step stairs at (3, 2)
setTile(chapter1Tiles, chapter1Width, 3, 2, {
  type: 'staircase',
  isInitialFixed: true,
  elevation: 0,
  label: 'Sunken Stone Steps (3 steps)',
});
setTile(chapter1Tiles, chapter1Width, 4, 2, {
  type: 'paved_walkway',
  isInitialFixed: true,
  elevation: 0,
  label: 'Stone Alley',
});

// Existing starting sidewalk at home
setTile(chapter1Tiles, chapter1Width, 1, 1, {
  type: 'sidewalk',
  isInitialFixed: true,
  label: "Maya's Stoop",
});
setTile(chapter1Tiles, chapter1Width, 1, 2, {
  type: 'sidewalk',
  isInitialFixed: true,
  label: "Sam's Apartment",
});
// Destination Library
setTile(chapter1Tiles, chapter1Width, 6, 2, {
  type: 'sidewalk',
  isInitialFixed: true,
  label: 'Community Library Entry',
});
setTile(chapter1Tiles, chapter1Width, 7, 2, {
  type: 'building',
  isInitialFixed: true,
  label: 'Old Clocktower Library',
});

// Maya (Able-bodied student)
const mayaProfile: ResidentProfile = {
  id: 'maya',
  name: 'Maya',
  role: 'High School Senior & Tutor',
  pronouns: 'she/her',
  avatarKey: 'maya',
  color: '#38bdf8', // Sky blue
  startPosition: { x: 1, y: 1 },
  destinationPosition: { x: 6, y: 2 },
  destinationLabel: 'Clocktower Library',
  mobilityCategory: 'walker',
  constraints: {
    canTraverseStairs: true,
    maxCurbs: 2,
    requiresTactileInDark: false,
    requiresLight: false,
    requiresAcousticAtRoads: false,
    maxContinuousWalk: 0,
    sensitiveToGlare: false,
  },
  description: 'Carrying textbooks to open the evening study session at the community library.',
  accessibilityNeed: 'Able to navigate stairs and uneven flagstones without mobility aids.',
  isInvisibleInitial: false,
};

// Sam (Wheelchair user, revealed after Maya reaches destination)
const samProfile: ResidentProfile = {
  id: 'sam',
  name: 'Sam',
  role: 'Freelance Illustrator & Neighbor',
  pronouns: 'they/them',
  avatarKey: 'sam',
  color: '#f59e0b', // Warm amber
  startPosition: { x: 1, y: 2 },
  destinationPosition: { x: 6, y: 2 },
  destinationLabel: 'Clocktower Library',
  mobilityCategory: 'wheelchair',
  constraints: {
    canTraverseStairs: false,
    maxCurbs: 0,
    requiresTactileInDark: false,
    requiresLight: false,
    requiresAcousticAtRoads: false,
    maxContinuousWalk: 0,
    sensitiveToGlare: false,
  },
  description: 'Uses a manual wheelchair. Needs continuous smooth ground without abrupt drop-offs or steps.',
  accessibilityNeed: 'Zero-step thresholds, curb ramps with gentle slopes, and paved level surfaces.',
  isInvisibleInitial: true,
  revealDialogue: {
    headline: 'THE INVISIBLE RESIDENT',
    story:
      'Maya arrived on time through the sunken stone stairs. But Sam, living in the very next building, has been waiting at the corner in the dark. The sunken shortcut has a 3-step stone drop that completely traps wheelchair wheels.',
    barrierNotice: 'Sunken Staircase at (3, 2) blocks wheelchair travel.',
    takeaway: 'The shortest route is not an accessible route. Redesign the path with a modular ramp or build an accessible bypass so everyone can get home.',
  },
};

export const chapter1: ChapterDefinition = {
  id: 1,
  slug: 'the-shortcut',
  title: 'The Shortcut',
  chapterNumber: 1,
  districtName: 'Old Clocktower Quarter',
  tagline: 'The fastest path is not always a path for everyone.',
  learningPrinciple:
    'Universal Design Principle 1: Equitable Use. Physical shortcuts that rely on staircases exclude wheelchair users, parents with strollers, and residents with mobility aids.',
  gridWidth: chapter1Width,
  gridHeight: chapter1Height,
  startingBudget: 150,
  toolCosts: {
    paved_walkway: 15,
    ramp: 25,
    tactile_paving: 20,
    acoustic_beacon: 30,
    resting_bench: 20,
    streetlamp: 25,
    demolish: 5,
  },
  initialTiles: chapter1Tiles,
  residents: [mayaProfile, samProfile],
  initialActiveResidentIds: ['maya'],
  invisibleResidentId: 'sam',
  availableToolsInitial: ['paved_walkway', 'demolish'],
  availableToolsPostReveal: ['paved_walkway', 'ramp', 'demolish'],
  dialogues: {
    intro: {
      title: 'Chapter 1: The Shortcut',
      speaker: 'Maya',
      speakerRole: 'Student & Library Volunteer',
      text: "The sun is sinking behind the clocktower. I have 15 minutes before the study hall doors lock. Help me pave a quick route across the vacant lot so I don't get lost in the weeds!",
      objective: 'Connect Maya from her stoop (1, 1) to the Library (6, 2) using Paved Walkways under budget.',
    },
    reveal: {
      title: 'Wait! Look Closer...',
      speaker: 'Sam',
      speakerRole: 'Neighbor & Illustrator',
      text: "Hey! I saw the new paved shortcut everyone was talking about. I tried to follow you, but the sunken stone steps at the old alley have no ramp. My wheels are stuck, and the temperature is dropping.",
      barrierIdentified: 'Barrier: 3-step drop at (3, 2) is impassable for wheelchair users.',
      newObjective: 'Redesign the neighborhood path: Place a Modular Ramp on the steps or pave an accessible bypass so BOTH Maya and Sam reach the Library safely.',
    },
    complete: {
      title: 'Clocktower Quarter Connected!',
      celebration: 'Both Maya and Sam arrived safely at the warm library!',
      inclusiveTakeaway:
        'When we design only for the "average" pedestrian, we unintentionally build barriers. A simple ramp not only empowers Sam to travel independently, but also makes life easier for delivery couriers and luggage travelers. That is the Curb-Cut Effect!',
    },
  },
};

// -------------------------------------------------------------
// CHAPTER 2: THE SILENT CROSSING
// -------------------------------------------------------------
const chapter2Width = 9;
const chapter2Height = 6;
const chapter2Tiles: GridTile[] = createEmptyGrid(chapter2Width, chapter2Height);

// Buildings
setTile(chapter2Tiles, chapter2Width, 0, 0, { type: 'building', isInitialFixed: true, label: 'Residences' });
setTile(chapter2Tiles, chapter2Width, 1, 0, { type: 'building', isInitialFixed: true });
setTile(chapter2Tiles, chapter2Width, 7, 0, { type: 'building', isInitialFixed: true, label: 'Pharmacy' });
setTile(chapter2Tiles, chapter2Width, 8, 0, { type: 'building', isInitialFixed: true, label: 'Transit Hub' });
setTile(chapter2Tiles, chapter2Width, 0, 5, { type: 'building', isInitialFixed: true });
setTile(chapter2Tiles, chapter2Width, 1, 5, { type: 'building', isInitialFixed: true });
setTile(chapter2Tiles, chapter2Width, 7, 5, { type: 'building', isInitialFixed: true });
setTile(chapter2Tiles, chapter2Width, 8, 5, { type: 'building', isInitialFixed: true, label: 'Community Clinic' });

// Central busy arterial road at columns 4
for (let y = 0; y < chapter2Height; y++) {
  setTile(chapter2Tiles, chapter2Width, 4, y, {
    type: 'crosswalk_standard',
    isInitialFixed: true,
    hasLight: true,
    label: y === 2 ? 'High-Traffic Crosswalk (Silent Signal)' : 'Avenue Traffic Lane',
  });
}

// Starting sidewalk
setTile(chapter2Tiles, chapter2Width, 1, 2, { type: 'sidewalk', isInitialFixed: true, label: "Kai's Studio" });
setTile(chapter2Tiles, chapter2Width, 1, 3, { type: 'sidewalk', isInitialFixed: true, hasTactile: true, label: "Elena's Garden Flat" });

// Destination Clinic / Pharmacy
setTile(chapter2Tiles, chapter2Width, 7, 2, { type: 'sidewalk', isInitialFixed: true, label: '24h Pharmacy Plaza' });
setTile(chapter2Tiles, chapter2Width, 7, 3, { type: 'sidewalk', isInitialFixed: true, hasTactile: true, label: 'Transit Station' });

// Kai (Sensory-sensitive sound student)
const kaiProfile: ResidentProfile = {
  id: 'kai',
  name: 'Kai',
  role: 'Audio Engineering Student',
  pronouns: 'he/they',
  avatarKey: 'kai',
  color: '#a855f7', // Lavender purple
  startPosition: { x: 1, y: 2 },
  destinationPosition: { x: 7, y: 2 },
  destinationLabel: '24h Pharmacy',
  mobilityCategory: 'sensory_sensitive',
  constraints: {
    canTraverseStairs: true,
    maxCurbs: 1,
    requiresTactileInDark: false,
    requiresLight: false,
    requiresAcousticAtRoads: false,
    maxContinuousWalk: 0,
    sensitiveToGlare: true,
  },
  description: 'Neurodivergent student with high sensory sensitivity. Can navigate roads using visual sightlines.',
  accessibilityNeed: 'Needs predictable pathways away from chaotic construction and calm, clear transit.',
  isInvisibleInitial: false,
};

// Elena (Elder with low vision, uses white cane, revealed in phase 2)
const elenaProfile: ResidentProfile = {
  id: 'elena',
  name: 'Elena',
  role: 'Retired Botanist & Grandmother',
  pronouns: 'she/her',
  avatarKey: 'elena',
  color: '#10b981', // Civic emerald
  startPosition: { x: 1, y: 3 },
  destinationPosition: { x: 7, y: 3 },
  destinationLabel: 'Transit Station',
  mobilityCategory: 'low_vision',
  constraints: {
    canTraverseStairs: true,
    maxCurbs: 1,
    requiresTactileInDark: true,
    requiresLight: false,
    requiresAcousticAtRoads: true, // Cannot cross silent roads without audible beepers
    maxContinuousWalk: 0,
    sensitiveToGlare: false,
  },
  description: 'Navigates with a long white cane. Relies on tactile ground blister paving and auditory traffic crosswalk beeps.',
  accessibilityNeed: 'Continuous tactile paving lines and Accessible Pedestrian Signals (APS) chirps at vehicular crossings.',
  isInvisibleInitial: true,
  revealDialogue: {
    headline: 'THE INVISIBLE RESIDENT',
    story:
      'Kai crossed the wide avenue easily using the visual green signal. But Elena has stopped at the curb. The traffic signal has no audible chirping beacon. Electric vehicles make almost no engine noise, making a silent crossing potentially fatal.',
    barrierNotice: 'Silent Crosswalk at (4, 2)-(4, 3) lacks Acoustic Pedestrian Signals and tactile ground guide tiles.',
    takeaway: 'Information must never depend on a single sensory modality. Installing an Acoustic Beacon and Tactile Paving empowers everyone to navigate safely.',
  },
};

export const chapter2: ChapterDefinition = {
  id: 2,
  slug: 'the-silent-crossing',
  title: 'The Silent Crossing',
  chapterNumber: 2,
  districtName: 'Neon Avenue & Market Crossings',
  tagline: 'When signals are only visual, the city becomes a silent labyrinth.',
  learningPrinciple:
    'Universal Design Principle 4: Perceptible Information. Information must be communicated redundancy through sight (high-contrast markings), sound (acoustic chirps), and touch (tactile blister paving).',
  gridWidth: chapter2Width,
  gridHeight: chapter2Height,
  startingBudget: 190,
  toolCosts: {
    paved_walkway: 15,
    ramp: 25,
    tactile_paving: 15,
    acoustic_beacon: 30,
    resting_bench: 20,
    streetlamp: 25,
    demolish: 5,
  },
  initialTiles: chapter2Tiles,
  residents: [kaiProfile, elenaProfile],
  initialActiveResidentIds: ['kai'],
  invisibleResidentId: 'elena',
  availableToolsInitial: ['paved_walkway', 'demolish'],
  availableToolsPostReveal: ['paved_walkway', 'tactile_paving', 'acoustic_beacon', 'demolish'],
  dialogues: {
    intro: {
      title: 'Chapter 2: The Silent Crossing',
      speaker: 'Kai',
      speakerRole: 'Student',
      text: 'The evening rush hour on Neon Avenue is noisy and overwhelming. I need to pick up my sister’s prescription at the Pharmacy across the avenue. Help me chart a clean path across the crosswalk!',
      objective: 'Connect Kai from (1, 2) across the avenue to the Pharmacy (7, 2) within budget.',
    },
    reveal: {
      title: 'Listen Closely to the Curb...',
      speaker: 'Elena',
      speakerRole: 'Botanist & Neighbor',
      text: 'I can hear the rush of wind, but electric buses are nearly silent. The pedestrian light turned green, but without an audible crossing beacon or tactile guidance along the curb, I cannot tell when it is safe to step into the roadway.',
      barrierIdentified: 'Barrier: The standard crosswalk is silent and the ground lacks directional tactile tiles.',
      newObjective: 'Install an Acoustic Crosswalk Beacon and continuous Tactile Paving so both Kai and Elena reach their destinations safely.',
    },
    complete: {
      title: 'Avenue Crossing Made Inclusive!',
      celebration: 'Elena and Kai both navigated the arterial crossing with confidence!',
      inclusiveTakeaway:
        'Accessible Pedestrian Signals (APS) and tactile directional paving remove fear and doubt. When crosswalks provide synchronized auditory and physical cues, distracted pedestrians, children, and low-vision elders all benefit equally.',
    },
  },
};

// -------------------------------------------------------------
// CHAPTER 3: ONE LIGHT LEFT
// -------------------------------------------------------------
const chapter3Width = 10;
const chapter3Height = 7;
const chapter3Tiles: GridTile[] = createEmptyGrid(chapter3Width, chapter3Height);

// In Chapter 3, a rolling blackout has hit: most tiles start with hasLight: false!
for (const t of chapter3Tiles) {
  t.hasLight = false;
}

// Buildings & Obstacles
setTile(chapter3Tiles, chapter3Width, 0, 0, { type: 'building', isInitialFixed: true, label: 'Shelter Hub' });
setTile(chapter3Tiles, chapter3Width, 1, 0, { type: 'building', isInitialFixed: true });
setTile(chapter3Tiles, chapter3Width, 8, 0, { type: 'building', isInitialFixed: true });
setTile(chapter3Tiles, chapter3Width, 9, 0, { type: 'building', isInitialFixed: true, label: 'Community Kitchen' });
setTile(chapter3Tiles, chapter3Width, 0, 6, { type: 'building', isInitialFixed: true });
setTile(chapter3Tiles, chapter3Width, 9, 6, { type: 'building', isInitialFixed: true });

// Storm debris and flooded drop at column 5
setTile(chapter3Tiles, chapter3Width, 4, 2, { type: 'curb_drop', isInitialFixed: true, elevation: 1, label: 'Broken Curb' });
setTile(chapter3Tiles, chapter3Width, 4, 3, { type: 'staircase', isInitialFixed: true, elevation: 1, label: 'Washed-Out Steps' });
setTile(chapter3Tiles, chapter3Width, 4, 4, { type: 'curb_drop', isInitialFixed: true, elevation: 1, label: 'Broken Curb' });
setTile(chapter3Tiles, chapter3Width, 5, 1, { type: 'obstacle', isInitialFixed: true, label: 'Fallen Tree Branch' });
setTile(chapter3Tiles, chapter3Width, 5, 5, { type: 'obstacle', isInitialFixed: true, label: 'Storm Debris' });

// Emergency generator streetlight at start (2, 3) and destination (8, 3)
setTile(chapter3Tiles, chapter3Width, 2, 3, {
  type: 'streetlamp',
  isInitialFixed: true,
  lightSource: true,
  hasLight: true,
  label: 'Resilience Micro-Generator',
});
setTile(chapter3Tiles, chapter3Width, 8, 3, {
  type: 'streetlamp',
  isInitialFixed: true,
  lightSource: true,
  hasLight: true,
  label: 'Shelter Solar Lantern',
});

// Destination Community Center
setTile(chapter3Tiles, chapter3Width, 8, 2, { type: 'sidewalk', isInitialFixed: true, hasLight: true, label: 'St. Jude Shelter' });
setTile(chapter3Tiles, chapter3Width, 8, 4, { type: 'sidewalk', isInitialFixed: true, hasLight: true, label: 'Warm Commons' });

// Starting sidewalks at residential stoops
setTile(chapter3Tiles, chapter3Width, 1, 2, { type: 'sidewalk', isInitialFixed: true, label: "Maya's Stoop" });
setTile(chapter3Tiles, chapter3Width, 1, 3, { type: 'sidewalk', isInitialFixed: true, label: "Sam's Apartment" });
setTile(chapter3Tiles, chapter3Width, 1, 4, { type: 'sidewalk', isInitialFixed: true, label: "Henderson's Residence" });

// Maya & Sam start at (1, 2) and (1, 3)
const mayaCh3: ResidentProfile = {
  ...mayaProfile,
  startPosition: { x: 1, y: 2 },
  destinationPosition: { x: 8, y: 2 },
  destinationLabel: 'St. Jude Shelter',
  constraints: {
    ...mayaProfile.constraints,
    requiresLight: true, // In blackout, everyone needs lighting or guide
  },
};

const samCh3: ResidentProfile = {
  ...samProfile,
  startPosition: { x: 1, y: 3 },
  destinationPosition: { x: 8, y: 2 },
  destinationLabel: 'St. Jude Shelter',
  constraints: {
    ...samProfile.constraints,
    requiresLight: true,
  },
};

// Mr. Henderson (Retired postal carrier with cardiopulmonary fatigue, revealed in Phase 2)
const hendersonProfile: ResidentProfile = {
  id: 'henderson',
  name: 'Mr. Henderson',
  role: 'Retired Postal Carrier (78 yrs)',
  pronouns: 'he/him',
  avatarKey: 'henderson',
  color: '#eab308', // Golden yellow
  startPosition: { x: 1, y: 4 },
  destinationPosition: { x: 8, y: 4 },
  destinationLabel: 'Warm Commons',
  mobilityCategory: 'fatigue_elder',
  constraints: {
    canTraverseStairs: false,
    maxCurbs: 0,
    requiresTactileInDark: false,
    requiresLight: true,
    requiresAcousticAtRoads: false,
    maxContinuousWalk: 4, // Needs bench every 4 tiles
    sensitiveToGlare: false,
  },
  description: 'Community elder living with COPD and heart recovery. Enjoys walking but cannot walk more than 4 tiles without resting.',
  accessibilityNeed: 'Frequent resting benches with armrests, gentle zero-step grading, and clear warm lighting.',
  isInvisibleInitial: true,
  revealDialogue: {
    headline: 'THE INVISIBLE RESIDENT',
    story:
      'Maya and Sam traversed the district! But as the municipal sirens echo, Mr. Henderson collapsed onto a damp curb at tile 4. His lungs are strained and there isn’t a single resting bench along the 8-block stretch. In the pitch black, he cannot catch his breath.',
    barrierNotice: 'Physical exhaustion: Continuous distance exceeds safe stamina (4 tiles) with zero resting benches.',
    takeaway: 'Public seating is not a luxury or an afterthought—it is essential life infrastructure for elderly residents and people with chronic health conditions.',
  },
};

export const chapter3: ChapterDefinition = {
  id: 3,
  slug: 'one-light-left',
  title: 'One Light Left',
  chapterNumber: 3,
  districtName: 'St. Jude Civic Common',
  tagline: 'When darkness descends, true resilience means leaving no one behind.',
  learningPrinciple:
    'Universal Design Principle 3: Simple, Intuitive, and Low Physical Effort. A truly resilient city integrates continuous lighting, resting benches, ramped curbs, and universal pathways within realistic civic budgets.',
  gridWidth: chapter3Width,
  gridHeight: chapter3Height,
  startingBudget: 240,
  toolCosts: {
    paved_walkway: 15,
    ramp: 25,
    tactile_paving: 15,
    acoustic_beacon: 30,
    resting_bench: 20,
    streetlamp: 25,
    demolish: 5,
  },
  initialTiles: recalculateLighting(chapter3Tiles, chapter3Width, chapter3Height),
  residents: [mayaCh3, samCh3, hendersonProfile],
  initialActiveResidentIds: ['maya', 'sam'],
  invisibleResidentId: 'henderson',
  availableToolsInitial: ['paved_walkway', 'ramp', 'streetlamp', 'demolish'],
  availableToolsPostReveal: ['paved_walkway', 'ramp', 'streetlamp', 'resting_bench', 'demolish'],
  dialogues: {
    intro: {
      title: 'Chapter 3: One Light Left',
      speaker: 'Maya & Sam',
      speakerRole: 'Community Organizers',
      text: 'A lightning strike knocked out the primary power grid across the St. Jude district! The flood debris has blocked the main boulevard. We need to guide our neighbors to the heated emergency shelter before the cold night settles in.',
      objective: 'Place Streetlamps and Paved Ramps to guide Maya and Sam across the dark district to the Shelter (8, 2) within budget.',
    },
    reveal: {
      title: 'An Elder in the Dark...',
      speaker: 'Mr. Henderson',
      speakerRole: 'Retired Postal Carrier',
      text: 'I worked these streets for 42 years delivering the mail. But with my heart condition, walking 5 blocks straight without a bench to rest my legs is more than I can bear. My chest is tightening, and the darkness makes every step perilous.',
      barrierIdentified: 'Barrier: Complete lack of resting benches along the 8-block stretch causes dangerous physical exhaustion.',
      newObjective: 'Integrate Resting Benches (at least every 4 tiles) along the illuminated path so Mr. Henderson, Sam, and Maya all reach safety.',
    },
    complete: {
      title: 'The City Fully Illuminated!',
      celebration: 'All neighbors have arrived safely at St. Jude Common as the golden dawn breaks!',
      inclusiveTakeaway:
        'When you built ramps for Sam, benches for Mr. Henderson, and warm lamps for Maya, you built a city that honors human dignity. Inclusive design is never about special treatment—it is about recognizing that every human being deserves a safe way home.',
    },
  },
};

export const ALL_CHAPTERS: ChapterDefinition[] = [chapter1, chapter2, chapter3];

export function getChapterById(id: number): ChapterDefinition | undefined {
  return ALL_CHAPTERS.find((c) => c.id === id);
}
