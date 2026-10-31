import {
  ChapterDefinition,
  GridTile,
  SimulationResult,
  ToolId,
} from '../types/game';
import { buildTileMap, findPathForResident } from './pathfinding';

/**
 * Pure, synchronous evaluation of all active residents across the given chapter and tile grid.
 * Completely decoupled from React, Zustand, timers, and browser APIs.
 */
export function simulateChapter(
  chapter: ChapterDefinition,
  tiles: GridTile[],
  activeResidentIds: string[],
  phase: 'initial' | 'post_reveal' = 'initial'
): SimulationResult {
  const tileMap = buildTileMap(tiles);

  // Filter to active residents for this simulation run
  const residentsToTest = chapter.residents.filter((r) => activeResidentIds.includes(r.id));
  const residentResults = residentsToTest.map((res) =>
    findPathForResident(res, tileMap, chapter.gridWidth, chapter.gridHeight)
  );

  const allSucceeded = residentResults.length > 0 && residentResults.every((r) => r.success);

  const summaryMessage = allSucceeded
    ? `All ${residentResults.length} traveler(s) safely reached their destinations!`
    : `Path blocked for ${residentResults
        .filter((r) => !r.success)
        .map((r) => r.residentName)
        .join(', ')}.`;

  return {
    allSucceeded,
    residentResults,
    phase,
    summaryMessage,
  };
}

/**
 * Pure validation for applying a tool to a coordinate without mutating state.
 */
export function validateToolPlacement(
  chapter: ChapterDefinition,
  tiles: GridTile[],
  budget: number,
  tool: ToolId,
  x: number,
  y: number
): { valid: boolean; reason?: string; cost: number; tileIndex: number } {
  const tileIdx = tiles.findIndex((t) => t.x === x && t.y === y);
  if (tileIdx === -1) {
    return { valid: false, reason: `Coordinates (${x}, ${y}) are out of grid bounds.`, cost: 0, tileIndex: -1 };
  }

  const tile = tiles[tileIdx];

  // Fixed buildings and obstacles are permanent municipal boundaries
  if (tile.isInitialFixed && (tile.type === 'building' || tile.type === 'obstacle')) {
    return {
      valid: false,
      reason: `Cannot modify permanent ${tile.type} at (${x}, ${y}).`,
      cost: 0,
      tileIndex: tileIdx,
    };
  }

  const cost = chapter.toolCosts[tool] ?? 0;

  if (tool === 'demolish') {
    if (tile.type === 'empty' || (tile.isInitialFixed && !tile.hasRamp)) {
      return {
        valid: false,
        reason: `Cannot demolish permanent municipal structure at (${x}, ${y}).`,
        cost: 0,
        tileIndex: tileIdx,
      };
    }
    if (budget < cost) {
      return {
        valid: false,
        reason: `Insufficient budget for demolition ($${cost} required).`,
        cost,
        tileIndex: tileIdx,
      };
    }
    return { valid: true, cost, tileIndex: tileIdx };
  }

  // Redundant placement check
  const isRedundant =
    (tool === 'paved_walkway' && tile.type === 'paved_walkway' && !tile.hasRamp) ||
    (tool === 'ramp' && tile.hasRamp) ||
    (tool === 'tactile_paving' && tile.hasTactile && tile.type === 'tactile_paving') ||
    (tool === 'acoustic_beacon' && tile.hasAudioBeacon) ||
    (tool === 'resting_bench' && tile.hasBench) ||
    (tool === 'streetlamp' && tile.lightSource);

  if (isRedundant) {
    return {
      valid: false,
      reason: `Tile (${x}, ${y}) already has ${tool.replace('_', ' ')}.`,
      cost: 0,
      tileIndex: tileIdx,
    };
  }

  if (budget < cost) {
    return {
      valid: false,
      reason: `Insufficient budget ($${cost} needed, $${budget} remaining).`,
      cost,
      tileIndex: tileIdx,
    };
  }

  return { valid: true, cost, tileIndex: tileIdx };
}
