import { create } from 'zustand';
import {
  ChapterDefinition,
  GridTile,
  HistoryAction,
  SimulationResult,
  ToolId,
  ResidentProfile,
} from '../types/game';
import { ALL_CHAPTERS, getChapterById } from '../engine/levels';
import { findPathForResident, recalculateLighting, buildTileMap } from '../engine/pathfinding';
import { soundEngine } from '../engine/audio';

const STORAGE_KEY_PROGRESS = 'the_last_light_progress_v1';
const STORAGE_KEY_SETTINGS = 'the_last_light_settings_v1';

interface SettingsState {
  highContrast: boolean;
  reducedMotion: boolean;
  soundEnabled: boolean;
  captionsEnabled: boolean;
  largeText: boolean;
}

export interface GameStoreState {
  currentChapterId: number;
  currentChapter: ChapterDefinition;
  tiles: GridTile[];
  budget: number;
  selectedTool: ToolId;
  phase: 'initial' | 'post_reveal';
  activeResidentIds: string[];
  revealedInvisibleResident: boolean;
  simulationResult: SimulationResult | null;
  isSimulating: boolean;
  animatedStepIndex: number;
  unlockedChapters: number[];
  completedChapters: number[];
  history: HistoryAction[];

  // Modal dialog states
  showIntroModal: boolean;
  showRevealModal: boolean;
  showVictoryModal: boolean;
  showFailureModal: boolean;
  showSettingsModal: boolean;
  showHelpModal: boolean;
  showChapterSelect: boolean;
  showFinaleModal: boolean;

  // Accessibility & Keyboard navigation
  cursor: { x: number; y: number };
  announcement: string;
  settings: SettingsState;

  // Actions
  loadChapter: (chapterId: number) => void;
  selectTool: (tool: ToolId) => void;
  applyToolToTile: (x: number, y: number) => boolean;
  applyToolAtCursor: () => boolean;
  moveCursor: (dx: number, dy: number) => void;
  setCursor: (pos: { x: number; y: number }) => void;
  undo: () => void;
  resetLevel: () => void;
  runSimulation: () => SimulationResult;
  acknowledgeReveal: () => void;
  nextChapter: () => void;
  openSettings: (open: boolean) => void;
  openHelp: (open: boolean) => void;
  openChapterSelect: (open: boolean) => void;
  openFinale: (open: boolean) => void;
  closeModals: () => void;

  // Setting toggles
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  toggleSound: () => void;
  toggleCaptions: () => void;
  toggleLargeText: () => void;
}

function loadInitialSettings(): SettingsState {
  if (typeof window === 'undefined') {
    return {
      highContrast: false,
      reducedMotion: false,
      soundEnabled: true,
      captionsEnabled: true,
      largeText: false,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return {
    highContrast: false,
    reducedMotion: false,
    soundEnabled: true,
    captionsEnabled: true,
    largeText: false,
  };
}

function loadSavedProgress(): { unlocked: number[]; completed: number[]; chapterId: number } {
  if (typeof window === 'undefined') {
    return { unlocked: [1], completed: [], chapterId: 1 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return { unlocked: [1], completed: [], chapterId: 1 };
}

function saveProgress(unlocked: number[], completed: number[], chapterId: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify({ unlocked, completed, chapterId }));
  } catch {
    // ignore
  }
}

function saveSettings(settings: SettingsState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

const initialSaved = loadSavedProgress();
const initialChapter = getChapterById(initialSaved.chapterId) || ALL_CHAPTERS[0];

export const useGameStore = create<GameStoreState>((set, get) => ({
  currentChapterId: initialChapter.id,
  currentChapter: initialChapter,
  tiles: JSON.parse(JSON.stringify(initialChapter.initialTiles)),
  budget: initialChapter.startingBudget,
  selectedTool: initialChapter.availableToolsInitial[0] || 'paved_walkway',
  phase: 'initial',
  activeResidentIds: [...initialChapter.initialActiveResidentIds],
  revealedInvisibleResident: false,
  simulationResult: null,
  isSimulating: false,
  animatedStepIndex: 0,
  unlockedChapters: initialSaved.unlocked,
  completedChapters: initialSaved.completed,
  history: [],

  showIntroModal: true,
  showRevealModal: false,
  showVictoryModal: false,
  showFailureModal: false,
  showSettingsModal: false,
  showHelpModal: false,
  showChapterSelect: false,
  showFinaleModal: false,

  cursor: { x: 1, y: 1 },
  announcement: `${initialChapter.title} loaded. Press Arrow keys to navigate tiles, Space to place, 1-4 for tools.`,
  settings: loadInitialSettings(),

  loadChapter: (chapterId: number) => {
    const ch = getChapterById(chapterId);
    if (!ch) return;
    const tilesCopy = JSON.parse(JSON.stringify(ch.initialTiles));

    set({
      currentChapterId: ch.id,
      currentChapter: ch,
      tiles: tilesCopy,
      budget: ch.startingBudget,
      selectedTool: ch.availableToolsInitial[0] || 'paved_walkway',
      phase: 'initial',
      activeResidentIds: [...ch.initialActiveResidentIds],
      revealedInvisibleResident: false,
      simulationResult: null,
      isSimulating: false,
      animatedStepIndex: 0,
      history: [],
      showIntroModal: true,
      showRevealModal: false,
      showVictoryModal: false,
      showFailureModal: false,
      showChapterSelect: false,
      cursor: { x: 1, y: 1 },
      announcement: `Chapter ${ch.chapterNumber}: ${ch.title} loaded. Budget: $${ch.startingBudget}.`,
    });
  },

  selectTool: (tool: ToolId) => {
    soundEngine.play('click');
    set({
      selectedTool: tool,
      announcement: `Selected tool: ${tool.replace('_', ' ')}. Cost: $${get().currentChapter.toolCosts[tool] || 0}.`,
    });
  },

  moveCursor: (dx: number, dy: number) => {
    const { cursor, currentChapter, tiles } = get();
    const nx = Math.max(0, Math.min(currentChapter.gridWidth - 1, cursor.x + dx));
    const ny = Math.max(0, Math.min(currentChapter.gridHeight - 1, cursor.y + dy));
    const tile = tiles.find((t) => t.x === nx && t.y === ny);

    soundEngine.play('step');
    set({
      cursor: { x: nx, y: ny },
      announcement: `Tile (${nx}, ${ny}): ${tile?.label || tile?.type || 'empty'}, elevation ${tile?.elevation || 0}${
        tile?.hasLight ? ', lit' : ', dark'
      }.`,
    });
  },

  setCursor: (pos: { x: number; y: number }) => {
    set({ cursor: pos });
  },

  applyToolAtCursor: () => {
    const { cursor, applyToolToTile } = get();
    return applyToolToTile(cursor.x, cursor.y);
  },

  applyToolToTile: (x: number, y: number) => {
    const state = get();
    const { tiles, budget, selectedTool, currentChapter, history } = state;
    const tileIdx = tiles.findIndex((t) => t.x === x && t.y === y);
    if (tileIdx === -1) return false;

    const tile = tiles[tileIdx];

    // Cannot modify fixed boundary buildings or fixed permanent landmarks
    if (tile.isInitialFixed && tile.type === 'building') {
      set({ announcement: `Cannot build on fixed building at (${x}, ${y}).` });
      soundEngine.play('click');
      return false;
    }

    const cost = currentChapter.toolCosts[selectedTool] ?? 0;

    if (selectedTool === 'demolish') {
      if (tile.type === 'empty') return false;
      if (budget < cost) {
        set({ announcement: `Insufficient budget for demolition ($${cost} required).` });
        return false;
      }

      const before = { ...tile };
      const after: GridTile = {
        ...tile,
        type: 'empty',
        hasRamp: false,
        hasTactile: false,
        hasAudioBeacon: false,
        hasBench: false,
        lightSource: false,
      };

      const newTiles = [...tiles];
      newTiles[tileIdx] = after;
      const recomputed = recalculateLighting(newTiles, currentChapter.gridWidth, currentChapter.gridHeight);

      soundEngine.play('remove');
      set({
        tiles: recomputed,
        budget: budget - cost,
        history: [{ tileBefore: before, tileAfter: after, costDelta: cost }, ...history],
        announcement: `Demolished infrastructure at (${x}, ${y}). Remaining budget: $${budget - cost}.`,
      });
      return true;
    }

    // Applying infrastructure tool
    if (budget < cost) {
      set({ announcement: `Insufficient budget ($${cost} needed, $${budget} remaining).` });
      soundEngine.play('barrier_hit');
      return false;
    }

    const before = { ...tile };
    const after: GridTile = { ...tile };

    if (selectedTool === 'paved_walkway') {
      after.type = 'paved_walkway';
    } else if (selectedTool === 'ramp') {
      after.type = 'ramp';
      after.hasRamp = true;
    } else if (selectedTool === 'tactile_paving') {
      after.type = 'tactile_paving';
      after.hasTactile = true;
    } else if (selectedTool === 'acoustic_beacon') {
      after.type = 'acoustic_beacon';
      after.hasAudioBeacon = true;
      after.hasTactile = true; // APS buttons include tactile ground guidance
      soundEngine.play('crosswalk_chirp');
    } else if (selectedTool === 'resting_bench') {
      after.type = 'resting_bench';
      after.hasBench = true;
    } else if (selectedTool === 'streetlamp') {
      after.type = 'streetlamp';
      after.lightSource = true;
      after.hasLight = true;
    }

    const newTiles = [...tiles];
    newTiles[tileIdx] = after;
    const recomputed = recalculateLighting(newTiles, currentChapter.gridWidth, currentChapter.gridHeight);

    soundEngine.play('place');
    set({
      tiles: recomputed,
      budget: budget - cost,
      history: [{ tileBefore: before, tileAfter: after, costDelta: cost }, ...history],
      announcement: `Placed ${selectedTool.replace('_', ' ')} at (${x}, ${y}). Remaining budget: $${budget - cost}.`,
    });
    return true;
  },

  undo: () => {
    const { history, tiles, budget, currentChapter } = get();
    if (history.length === 0) return;

    const [lastAction, ...remainingHistory] = history;
    const tileIdx = tiles.findIndex((t) => t.x === lastAction.tileBefore.x && t.y === lastAction.tileBefore.y);
    if (tileIdx === -1) return;

    const newTiles = [...tiles];
    newTiles[tileIdx] = { ...lastAction.tileBefore };
    const recomputed = recalculateLighting(newTiles, currentChapter.gridWidth, currentChapter.gridHeight);

    soundEngine.play('remove');
    set({
      tiles: recomputed,
      budget: budget + lastAction.costDelta,
      history: remainingHistory,
      announcement: `Undid last placement at (${lastAction.tileBefore.x}, ${lastAction.tileBefore.y}). Refunded $${lastAction.costDelta}.`,
    });
  },

  resetLevel: () => {
    const { currentChapter } = get();
    const tilesCopy = JSON.parse(JSON.stringify(currentChapter.initialTiles));
    soundEngine.play('click');
    set({
      tiles: tilesCopy,
      budget: currentChapter.startingBudget,
      phase: 'initial',
      activeResidentIds: [...currentChapter.initialActiveResidentIds],
      revealedInvisibleResident: false,
      simulationResult: null,
      history: [],
      showVictoryModal: false,
      showFailureModal: false,
      showRevealModal: false,
      announcement: `Reset ${currentChapter.title} to initial state.`,
    });
  },

  runSimulation: () => {
    const state = get();
    const { currentChapter, tiles, phase, activeResidentIds, revealedInvisibleResident } = state;
    const tileMap = buildTileMap(tiles);

    // Get active resident objects
    const residentsToTest = currentChapter.residents.filter((r) => activeResidentIds.includes(r.id));
    const residentResults = residentsToTest.map((res) =>
      findPathForResident(res, tileMap, currentChapter.gridWidth, currentChapter.gridHeight)
    );

    const allSucceeded = residentResults.every((r) => r.success);

    const simResult: SimulationResult = {
      allSucceeded,
      residentResults,
      phase,
      summaryMessage: allSucceeded
        ? `All ${residentResults.length} traveler(s) safely reached their destinations!`
        : `Path blocked for ${residentResults.filter((r) => !r.success).map((r) => r.residentName).join(', ')}.`,
    };

    set({
      simulationResult: simResult,
      isSimulating: true,
      announcement: simResult.summaryMessage,
    });

    if (allSucceeded) {
      if (phase === 'initial' && !revealedInvisibleResident) {
        // Phase 1 victory triggers the INVISIBLE RESIDENT REVEAL!
        setTimeout(() => {
          soundEngine.play('reveal_chime');
          set({
            isSimulating: false,
            showRevealModal: true,
            revealedInvisibleResident: true,
            phase: 'post_reveal',
            activeResidentIds: currentChapter.residents.map((r) => r.id),
            selectedTool: currentChapter.availableToolsPostReveal[0] || 'ramp',
            announcement: `Phase 1 solved! But an Invisible Resident has appeared.`,
          });
        }, 1200);
      } else {
        // Phase 2 (post reveal) victory triggers CHAPTER COMPLETE!
        setTimeout(() => {
          soundEngine.play('victory_fanfare');
          const unlocked = Array.from(new Set([...state.unlockedChapters, currentChapter.id + 1]));
          const completed = Array.from(new Set([...state.completedChapters, currentChapter.id]));
          saveProgress(unlocked, completed, currentChapter.id);

          set({
            isSimulating: false,
            showVictoryModal: true,
            unlockedChapters: unlocked,
            completedChapters: completed,
            announcement: `Chapter ${currentChapter.chapterNumber} complete! Universal design achieved.`,
          });
        }, 1200);
      }
    } else {
      setTimeout(() => {
        soundEngine.play('barrier_hit');
        set({
          isSimulating: false,
          showFailureModal: true,
        });
      }, 1000);
    }

    return simResult;
  },

  acknowledgeReveal: () => {
    soundEngine.play('click');
    set({
      showRevealModal: false,
      simulationResult: null,
      announcement: `Invisible Resident revealed. Redesign route to include all residents.`,
    });
  },

  nextChapter: () => {
    const { currentChapterId, loadChapter } = get();
    const nextId = currentChapterId + 1;
    if (getChapterById(nextId)) {
      loadChapter(nextId);
    } else {
      // Reached finale - celebrate universal city triumph!
      set({ showVictoryModal: false, showFinaleModal: true });
    }
  },

  openSettings: (open: boolean) => set({ showSettingsModal: open }),
  openHelp: (open: boolean) => set({ showHelpModal: open }),
  openChapterSelect: (open: boolean) => set({ showChapterSelect: open }),
  openFinale: (open: boolean) => set({ showFinaleModal: open }),
  closeModals: () =>
    set({
      showIntroModal: false,
      showRevealModal: false,
      showVictoryModal: false,
      showFailureModal: false,
      showSettingsModal: false,
      showHelpModal: false,
      showChapterSelect: false,
      showFinaleModal: false,
    }),

  toggleHighContrast: () => {
    const s = { ...get().settings, highContrast: !get().settings.highContrast };
    saveSettings(s);
    set({ settings: s, announcement: `High contrast mode ${s.highContrast ? 'enabled' : 'disabled'}.` });
  },

  toggleReducedMotion: () => {
    const s = { ...get().settings, reducedMotion: !get().settings.reducedMotion };
    saveSettings(s);
    set({ settings: s, announcement: `Reduced motion ${s.reducedMotion ? 'enabled' : 'disabled'}.` });
  },

  toggleSound: () => {
    const s = { ...get().settings, soundEnabled: !get().settings.soundEnabled };
    soundEngine.setMuted(!s.soundEnabled);
    saveSettings(s);
    set({ settings: s, announcement: `Sound effects ${s.soundEnabled ? 'enabled' : 'muted'}.` });
  },

  toggleCaptions: () => {
    const s = { ...get().settings, captionsEnabled: !get().settings.captionsEnabled };
    saveSettings(s);
    set({ settings: s, announcement: `Audio captions ${s.captionsEnabled ? 'visible' : 'hidden'}.` });
  },

  toggleLargeText: () => {
    const s = { ...get().settings, largeText: !get().settings.largeText };
    saveSettings(s);
    set({ settings: s, announcement: `Large text ${s.largeText ? 'enabled' : 'disabled'}.` });
  },
}));
