import { SerializedGameState, ToolId } from '../types/game';
import { getChapterById } from './levels';

export const CURRENT_SAVE_VERSION = 1;

/**
 * Validates and parses raw JSON into a typed, verified SerializedGameState.
 * Returns null if the data is corrupted, malformed, or violates domain rules.
 */
export function validateAndParseGameState(rawJson: string): SerializedGameState | null {
  if (!rawJson || typeof rawJson !== 'string') return null;

  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== 'object') return null;

  // 1. Schema version check
  if (parsed.version !== CURRENT_SAVE_VERSION) return null;

  // 2. Chapter existence check
  if (typeof parsed.chapterId !== 'number') return null;
  const chapter = getChapterById(parsed.chapterId);
  if (!chapter) return null;

  // 3. Phase check
  if (parsed.phase !== 'initial' && parsed.phase !== 'post_reveal') return null;

  // 4. Budget tamper check
  if (typeof parsed.budget !== 'number' || isNaN(parsed.budget) || parsed.budget < 0) {
    return null;
  }
  // Budget cannot exceed starting budget
  if (parsed.budget > chapter.startingBudget) {
    return null;
  }

  // 5. Tiles dimension and integrity check
  if (!Array.isArray(parsed.tiles)) return null;
  const expectedTileCount = chapter.gridWidth * chapter.gridHeight;
  if (parsed.tiles.length !== expectedTileCount) return null;

  for (const t of parsed.tiles) {
    if (typeof t.x !== 'number' || typeof t.y !== 'number' || typeof t.type !== 'string') {
      return null;
    }
    if (t.x < 0 || t.x >= chapter.gridWidth || t.y < 0 || t.y >= chapter.gridHeight) {
      return null;
    }
  }

  // 6. Resident IDs check
  if (!Array.isArray(parsed.activeResidentIds)) return null;
  for (const id of parsed.activeResidentIds) {
    if (typeof id !== 'string' || !chapter.residents.some((r) => r.id === id)) {
      return null;
    }
  }

  // 7. Progression arrays check
  if (!Array.isArray(parsed.unlockedChapters) || !Array.isArray(parsed.completedChapters)) {
    return null;
  }

  const validTools: ToolId[] = [
    'paved_walkway',
    'ramp',
    'tactile_paving',
    'acoustic_beacon',
    'resting_bench',
    'streetlamp',
    'demolish',
  ];
  const selectedTool: ToolId = validTools.includes(parsed.selectedTool)
    ? parsed.selectedTool
    : chapter.availableToolsInitial[0] || 'paved_walkway';

  return {
    version: CURRENT_SAVE_VERSION,
    timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : Date.now(),
    chapterId: parsed.chapterId,
    phase: parsed.phase,
    budget: parsed.budget,
    tiles: parsed.tiles,
    activeResidentIds: parsed.activeResidentIds,
    revealedInvisibleResident: Boolean(parsed.revealedInvisibleResident),
    selectedTool,
    unlockedChapters: parsed.unlockedChapters.filter((n: any) => typeof n === 'number'),
    completedChapters: parsed.completedChapters.filter((n: any) => typeof n === 'number'),
    history: Array.isArray(parsed.history) ? parsed.history : [],
    redoStack: Array.isArray(parsed.redoStack) ? parsed.redoStack : [],
  };
}
