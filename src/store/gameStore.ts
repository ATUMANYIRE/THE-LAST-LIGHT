import { create } from 'zustand';
import {
  ChapterDefinition,
  GridTile,
  HistoryAction,
  SimulationResult,
  ToolId,
  ResidentProfile,
  SerializedGameState,
} from '../types/game';
import { ALL_CHAPTERS, getChapterById } from '../engine/levels';
import { findPathForResident, recalculateLighting, buildTileMap } from '../engine/pathfinding';
import { simulateChapter } from '../engine/simulation';
import { validateAndParseGameState, CURRENT_SAVE_VERSION } from '../engine/serialization';
import { soundEngine } from '../engine/audio';
import { ANIM_TILES_PER_SEC, ANIM_POST_DELAY_MS } from '../engine/animConfig';

const STORAGE_KEY_PROGRESS = 'the_last_light_progress_v1';
const STORAGE_KEY_SETTINGS = 'the_last_light_settings_v1';
const STORAGE_KEY_SAVE_STATE = 'the_last_light_saved_state_v1';
const STORAGE_KEY_PLAYER_NAME = 'tll_player_name';

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
  redoStack: HistoryAction[];

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
  redo: () => void;
  resetLevel: () => void;
  runSimulation: () => SimulationResult;
  acknowledgeReveal: () => void;
  nextChapter: () => void;
  exportSaveState: () => string;
  importSaveState: (serialized: string) => boolean;
  openSettings: (open: boolean) => void;
  openHelp: (open: boolean) => void;
  openChapterSelect: (open: boolean) => void;
  openFinale: (open: boolean) => void;
  closeModals: () => void;
  skipAnimation: () => void;

  // Setting toggles
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  toggleSound: () => void;
  toggleCaptions: () => void;
  toggleLargeText: () => void;

  // Player identity
  playerName: string;
  setPlayerName: (name: string) => void;

  // Explore / Design mode
  gameMode: 'explore' | 'design';
  setGameMode: (mode: 'explore' | 'design') => void;
}

function loadInitialPlayerName(): string {
  if (typeof window === 'undefined') return '';
  try { return localStorage.getItem(STORAGE_KEY_PLAYER_NAME) || ''; } catch { return ''; }
}

function loadInitialSettings(): SettingsState {
  const fallback: SettingsState = {
    highContrast: false,
    reducedMotion: false,
    soundEnabled: true,
    captionsEnabled: true,
    largeText: false,
  };
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        highContrast: Boolean(parsed.highContrast),
        reducedMotion: Boolean(parsed.reducedMotion),
        soundEnabled: parsed.soundEnabled !== undefined ? Boolean(parsed.soundEnabled) : true,
        captionsEnabled: parsed.captionsEnabled !== undefined ? Boolean(parsed.captionsEnabled) : true,
        largeText: Boolean(parsed.largeText),
      };
    }
  } catch {
    // fallback on JSON parse or storage access errors
  }
  return fallback;
}

function loadSavedProgress(): { unlocked: number[]; completed: number[]; chapterId: number } {
  const fallback = { unlocked: [1], completed: [], chapterId: 1 };
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray(parsed.unlocked) &&
      Array.isArray(parsed.completed) &&
      typeof parsed.chapterId === 'number' &&
      getChapterById(parsed.chapterId) !== undefined
    ) {
      return {
        unlocked: parsed.unlocked.filter((n: any) => typeof n === 'number'),
        completed: parsed.completed.filter((n: any) => typeof n === 'number'),
        chapterId: parsed.chapterId,
      };
    }
  } catch {
    // fallback on corrupted or invalid save
  }
  return fallback;
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

function saveFullState(state: GameStoreState) {
  if (typeof window === 'undefined') return;
  try {
    const serialized: SerializedGameState = {
      version: CURRENT_SAVE_VERSION,
      timestamp: Date.now(),
      chapterId: state.currentChapterId,
      phase: state.phase,
      budget: state.budget,
      tiles: state.tiles,
      activeResidentIds: state.activeResidentIds,
      revealedInvisibleResident: state.revealedInvisibleResident,
      selectedTool: state.selectedTool,
      unlockedChapters: state.unlockedChapters,
      completedChapters: state.completedChapters,
      history: state.history,
      redoStack: state.redoStack,
    };
    localStorage.setItem(STORAGE_KEY_SAVE_STATE, JSON.stringify(serialized));
  } catch {
    // ignore
  }
}

const initialSaved = loadSavedProgress();
const initialChapter = getChapterById(initialSaved.chapterId) || ALL_CHAPTERS[0];

let activeSimulationTimeout: ReturnType<typeof setTimeout> | null = null;
let currentSimulationGen = 0;

function cancelPendingSimulation() {
  if (activeSimulationTimeout) {
    clearTimeout(activeSimulationTimeout);
    activeSimulationTimeout = null;
  }
  currentSimulationGen++;
}

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
  redoStack: [],

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
  playerName: loadInitialPlayerName(),
  gameMode: 'explore' as const,

  loadChapter: (chapterId: number) => {
    cancelPendingSimulation();
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
      redoStack: [],
      showIntroModal: true,
      showRevealModal: false,
      showVictoryModal: false,
      showFailureModal: false,
      showChapterSelect: false,
      cursor: { x: 1, y: 1 },
      announcement: `Chapter ${ch.chapterNumber}: ${ch.title} loaded. Budget: $${ch.startingBudget}.`,
    });
    saveProgress(get().unlockedChapters, get().completedChapters, ch.id);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('tll-reset-player'));
      try {
        localStorage.removeItem(STORAGE_KEY_SAVE_STATE);
      } catch {}
    }
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
    const { currentChapter } = get();
    const nx = Math.max(0, Math.min(currentChapter.gridWidth - 1, pos.x));
    const ny = Math.max(0, Math.min(currentChapter.gridHeight - 1, pos.y));
    set({ cursor: { x: nx, y: ny } });
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

    // Cannot modify fixed boundary buildings or fixed permanent landmarks / obstacles
    if (tile.isInitialFixed && (tile.type === 'building' || tile.type === 'obstacle')) {
      set({ announcement: `Cannot build on fixed ${tile.type} at (${x}, ${y}).` });
      soundEngine.play('click');
      return false;
    }

    const cost = currentChapter.toolCosts[selectedTool] ?? 0;

    if (selectedTool === 'demolish') {
      // Cannot demolish empty tiles or fixed permanent landmarks (unless user placed a ramp on them)
      if (tile.type === 'empty' || (tile.isInitialFixed && !tile.hasRamp)) {
        set({ announcement: `Cannot demolish permanent municipal structure at (${x}, ${y}).` });
        return false;
      }
      if (budget < cost) {
        set({ announcement: `Insufficient budget for demolition ($${cost} required).` });
        return false;
      }

      const before = { ...tile };
      const after: GridTile = {
        ...tile,
        type: tile.isInitialFixed ? (currentChapter.initialTiles[tileIdx]?.type || 'empty') : 'empty',
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
        redoStack: [], // Invalidate redo stack on new action
        announcement: `Demolished infrastructure at (${x}, ${y}). Remaining budget: $${budget - cost}.`,
      });
      saveFullState(get());
      return true;
    }

    // Guard against duplicate redundant placements of the identical tool
    const isRedundant =
      (selectedTool === 'paved_walkway' && tile.type === 'paved_walkway' && !tile.hasRamp) ||
      (selectedTool === 'ramp' && tile.hasRamp) ||
      (selectedTool === 'tactile_paving' && tile.hasTactile && tile.type === 'tactile_paving') ||
      (selectedTool === 'acoustic_beacon' && tile.hasAudioBeacon) ||
      (selectedTool === 'resting_bench' && tile.hasBench) ||
      (selectedTool === 'streetlamp' && tile.lightSource);

    if (isRedundant) {
      set({ announcement: `Tile (${x}, ${y}) already has ${selectedTool.replace('_', ' ')}.` });
      return false;
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
      redoStack: [], // Invalidate redo stack on new action
      announcement: `Placed ${selectedTool.replace('_', ' ')} at (${x}, ${y}). Remaining budget: $${budget - cost}.`,
    });
    saveFullState(get());
    return true;
  },

  undo: () => {
    const { history, redoStack, tiles, budget, currentChapter } = get();
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
      redoStack: [lastAction, ...redoStack],
      announcement: `Undid last placement at (${lastAction.tileBefore.x}, ${lastAction.tileBefore.y}). Refunded $${lastAction.costDelta}.`,
    });
    saveFullState(get());
  },

  redo: () => {
    const { redoStack, history, tiles, budget, currentChapter } = get();
    if (redoStack.length === 0) return;

    const [actionToRedo, ...remainingRedo] = redoStack;
    if (actionToRedo.costDelta > 0 && budget < actionToRedo.costDelta) {
      set({
        announcement: `Cannot redo: insufficient budget ($${actionToRedo.costDelta} required, $${budget} remaining).`,
      });
      soundEngine.play('barrier_hit');
      return;
    }

    const tileIdx = tiles.findIndex(
      (t) => t.x === actionToRedo.tileAfter.x && t.y === actionToRedo.tileAfter.y
    );
    if (tileIdx === -1) return;

    const newTiles = [...tiles];
    newTiles[tileIdx] = { ...actionToRedo.tileAfter };
    const recomputed = recalculateLighting(newTiles, currentChapter.gridWidth, currentChapter.gridHeight);

    const newBudget = budget - actionToRedo.costDelta;
    soundEngine.play('place');

    set({
      tiles: recomputed,
      budget: newBudget,
      history: [actionToRedo, ...history],
      redoStack: remainingRedo,
      announcement: `Redid placement at (${actionToRedo.tileAfter.x}, ${actionToRedo.tileAfter.y}). Remaining budget: $${newBudget}.`,
    });
    saveFullState(get());
  },

  resetLevel: () => {
    cancelPendingSimulation();
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
      isSimulating: false,
      history: [],
      redoStack: [],
      showVictoryModal: false,
      showFailureModal: false,
      showRevealModal: false,
      announcement: `Reset ${currentChapter.title} to initial state.`,
    });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('tll-reset-player'));
      try {
        localStorage.removeItem(STORAGE_KEY_SAVE_STATE);
      } catch {}
    }
  },

  runSimulation: () => {
    const state = get();
    if (state.isSimulating && state.simulationResult) {
      return state.simulationResult;
    }
    cancelPendingSimulation();
    const simGen = currentSimulationGen;
    const { currentChapter, tiles, phase, activeResidentIds, revealedInvisibleResident } = state;

    // Use pure simulation engine
    const simResult = simulateChapter(currentChapter, tiles, activeResidentIds, phase);

    set({
      simulationResult: simResult,
      isSimulating: true,
      announcement: simResult.summaryMessage,
    });

    const maxPathLen = Math.max(...simResult.residentResults.map((r) => r.path.length), 1);
    const animDelay = state.settings.reducedMotion
      ? 80
      : Math.round((maxPathLen / ANIM_TILES_PER_SEC) * 1000 + ANIM_POST_DELAY_MS);

    if (simResult.allSucceeded) {
      if (phase === 'initial' && !revealedInvisibleResident) {
        // Phase 1 victory triggers the INVISIBLE RESIDENT REVEAL!
        activeSimulationTimeout = setTimeout(() => {
          if (simGen !== currentSimulationGen) return;
          activeSimulationTimeout = null;
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
        }, animDelay);
      } else {
        // Phase 2 (post reveal) victory triggers CHAPTER COMPLETE!
        activeSimulationTimeout = setTimeout(() => {
          if (simGen !== currentSimulationGen) return;
          activeSimulationTimeout = null;
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
        }, animDelay);
      }
    } else {
      activeSimulationTimeout = setTimeout(() => {
        if (simGen !== currentSimulationGen) return;
        activeSimulationTimeout = null;
        soundEngine.play('barrier_hit');
        set({
          isSimulating: false,
          showFailureModal: true,
        });
      }, animDelay);
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
    const { currentChapterId, loadChapter, completedChapters } = get();
    // Guard against premature chapter skip before victory is achieved
    if (!completedChapters.includes(currentChapterId)) {
      set({ announcement: `Complete Chapter ${currentChapterId} before advancing.` });
      return;
    }
    const nextId = currentChapterId + 1;
    if (getChapterById(nextId)) {
      loadChapter(nextId);
    } else {
      // Reached finale - celebrate universal city triumph!
      set({ showVictoryModal: false, showFinaleModal: true });
    }
  },

  exportSaveState: () => {
    const s = get();
    const data: SerializedGameState = {
      version: CURRENT_SAVE_VERSION,
      timestamp: Date.now(),
      chapterId: s.currentChapterId,
      phase: s.phase,
      budget: s.budget,
      tiles: s.tiles,
      activeResidentIds: s.activeResidentIds,
      revealedInvisibleResident: s.revealedInvisibleResident,
      selectedTool: s.selectedTool,
      unlockedChapters: s.unlockedChapters,
      completedChapters: s.completedChapters,
      history: s.history,
      redoStack: s.redoStack,
    };
    return JSON.stringify(data);
  },

  importSaveState: (serialized: string) => {
    cancelPendingSimulation();
    const parsed = validateAndParseGameState(serialized);
    if (!parsed) {
      set({ announcement: 'Save data is invalid, corrupted, or incompatible.' });
      return false;
    }
    const chapter = getChapterById(parsed.chapterId);
    if (!chapter) return false;

    const recomputed = recalculateLighting(parsed.tiles, chapter.gridWidth, chapter.gridHeight);

    set({
      currentChapterId: parsed.chapterId,
      currentChapter: chapter,
      tiles: recomputed,
      budget: parsed.budget,
      phase: parsed.phase,
      activeResidentIds: parsed.activeResidentIds,
      revealedInvisibleResident: parsed.revealedInvisibleResident,
      selectedTool: parsed.selectedTool,
      unlockedChapters: parsed.unlockedChapters,
      completedChapters: parsed.completedChapters,
      history: parsed.history,
      redoStack: parsed.redoStack,
      simulationResult: null,
      isSimulating: false,
      showIntroModal: false,
      showRevealModal: false,
      showVictoryModal: false,
      showFailureModal: false,
      announcement: `Successfully restored in-progress game for Chapter ${chapter.chapterNumber} ($${parsed.budget} budget).`,
    });
    saveFullState(get());
    return true;
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

  skipAnimation: () => {
    const state = get();
    if (!state.isSimulating || !state.simulationResult) return;
    cancelPendingSimulation();
    const { simulationResult, phase, revealedInvisibleResident, currentChapter } = state;
    if (simulationResult.allSucceeded) {
      if (phase === 'initial' && !revealedInvisibleResident) {
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
      } else {
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
      }
    } else {
      soundEngine.play('barrier_hit');
      set({ isSimulating: false, showFailureModal: true });
    }
  },

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

  setPlayerName: (name: string) => {
    const trimmed = name.trim().slice(0, 40);
    try { localStorage.setItem(STORAGE_KEY_PLAYER_NAME, trimmed); } catch {}
    set({ playerName: trimmed });
  },

  setGameMode: (mode: 'explore' | 'design') => set({ gameMode: mode }),
}));
