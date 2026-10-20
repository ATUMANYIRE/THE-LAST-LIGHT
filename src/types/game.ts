export type TileType =
  | 'empty'
  | 'sidewalk'
  | 'paved_walkway'
  | 'staircase'
  | 'curb_drop'
  | 'ramp'
  | 'tactile_paving'
  | 'acoustic_beacon'
  | 'resting_bench'
  | 'streetlamp'
  | 'obstacle'
  | 'building'
  | 'road_hazard'
  | 'crosswalk_standard'
  | 'crosswalk_accessible';

export type ToolId =
  | 'paved_walkway'
  | 'ramp'
  | 'tactile_paving'
  | 'acoustic_beacon'
  | 'resting_bench'
  | 'streetlamp'
  | 'demolish';

export type MobilityCategory =
  | 'walker'
  | 'wheelchair'
  | 'low_vision'
  | 'sensory_sensitive'
  | 'fatigue_elder';

export interface ResidentConstraints {
  canTraverseStairs: boolean;
  maxCurbs: number; // 0 for wheelchair / rolling devices
  requiresTactileInDark: boolean; // low vision need guidance
  requiresLight: boolean; // must be illuminated or have sensory guidance
  requiresAcousticAtRoads: boolean; // must have audio signal at crosswalks
  maxContinuousWalk: number; // tiles before needing resting bench (0 = unlimited)
  sensitiveToGlare: boolean; // avoids harsh industrial floodlights
}

export interface ResidentProfile {
  id: string;
  name: string;
  role: string;
  pronouns: string;
  avatarKey: string;
  color: string;
  startPosition: { x: number; y: number };
  destinationPosition: { x: number; y: number };
  destinationLabel: string;
  mobilityCategory: MobilityCategory;
  constraints: ResidentConstraints;
  description: string;
  accessibilityNeed: string;
  isInvisibleInitial: boolean; // True if revealed in second phase
  revealDialogue?: {
    headline: string;
    story: string;
    barrierNotice: string;
    takeaway: string;
  };
}

export interface GridTile {
  x: number;
  y: number;
  type: TileType;
  isInitialFixed: boolean; // Cannot be bulldozed/modified if true
  elevation: number; // 0, 1, 2
  hasLight: boolean; // Ambient or direct illumination
  lightSource?: boolean; // Placed or fixed streetlamp here
  hasTactile: boolean;
  hasAudioBeacon: boolean;
  hasBench: boolean;
  hasRamp: boolean;
  label?: string;
}

export interface ResidentPathResult {
  residentId: string;
  residentName: string;
  success: boolean;
  path: Array<{ x: number; y: number }>;
  failureReason?: string;
  failureTile?: { x: number; y: number };
  barrierType?: 'stairs' | 'curb' | 'darkness' | 'missing_audio' | 'exhaustion' | 'glare' | 'blocked';
  restStops?: Array<{ x: number; y: number }>;
}

export interface SimulationResult {
  allSucceeded: boolean;
  residentResults: ResidentPathResult[];
  phase: 'initial' | 'post_reveal';
  summaryMessage: string;
}

export interface ChapterDefinition {
  id: number;
  slug: string;
  title: string;
  chapterNumber: number;
  districtName: string;
  tagline: string;
  learningPrinciple: string;
  gridWidth: number;
  gridHeight: number;
  startingBudget: number;
  toolCosts: Record<ToolId, number>;
  initialTiles: GridTile[];
  residents: ResidentProfile[];
  initialActiveResidentIds: string[];
  invisibleResidentId: string;
  availableToolsInitial: ToolId[];
  availableToolsPostReveal: ToolId[];
  dialogues: {
    intro: {
      title: string;
      speaker: string;
      speakerRole: string;
      text: string;
      objective: string;
    };
    reveal: {
      title: string;
      speaker: string;
      speakerRole: string;
      text: string;
      barrierIdentified: string;
      newObjective: string;
    };
    complete: {
      title: string;
      celebration: string;
      inclusiveTakeaway: string;
    };
  };
}

export interface HistoryAction {
  tileBefore: GridTile;
  tileAfter: GridTile;
  costDelta: number;
}
