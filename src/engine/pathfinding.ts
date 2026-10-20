import { GridTile, ResidentProfile, ResidentPathResult } from '../types/game';

interface PathNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  stepsSinceRest: number;
  parent?: PathNode;
  failureReason?: string;
  barrierType?: ResidentPathResult['barrierType'];
}

function manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function getTileKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function buildTileMap(tiles: GridTile[]): Map<string, GridTile> {
  const map = new Map<string, GridTile>();
  for (const t of tiles) {
    map.set(getTileKey(t.x, t.y), t);
  }
  return map;
}

/**
 * Validates whether a resident can traverse from fromTile to toTile.
 */
export function validateMove(
  fromTile: GridTile,
  toTile: GridTile,
  resident: ResidentProfile,
  currentStepsSinceRest: number
): {
  allowed: boolean;
  reason?: string;
  barrierType?: ResidentPathResult['barrierType'];
  resetsRest?: boolean;
} {
  // 1. Obstacle & Building collision
  if (toTile.type === 'building' || toTile.type === 'obstacle') {
    return {
      allowed: false,
      reason: `Blocked by ${toTile.type === 'building' ? 'building' : 'obstruction'} at (${toTile.x}, ${toTile.y}).`,
      barrierType: 'blocked',
    };
  }

  // 2. Terrain walkability - empty tiles are unpaved/rough or off-path
  const isPathTile =
    toTile.type === 'sidewalk' ||
    toTile.type === 'paved_walkway' ||
    toTile.type === 'ramp' ||
    toTile.type === 'tactile_paving' ||
    toTile.type === 'acoustic_beacon' ||
    toTile.type === 'resting_bench' ||
    toTile.type === 'streetlamp' ||
    toTile.type === 'crosswalk_standard' ||
    toTile.type === 'crosswalk_accessible' ||
    toTile.type === 'staircase' ||
    toTile.type === 'curb_drop';

  if (!isPathTile) {
    return {
      allowed: false,
      reason: `Unpaved ground at (${toTile.x}, ${toTile.y}) is unsafe to traverse.`,
      barrierType: 'blocked',
    };
  }

  // 3. Elevation & Staircase / Curb check
  const elevationDiff = Math.abs(toTile.elevation - fromTile.elevation);
  const isStaircase = toTile.type === 'staircase' || fromTile.type === 'staircase';
  const isCurbDrop = toTile.type === 'curb_drop' || fromTile.type === 'curb_drop';
  const hasRamp = toTile.hasRamp || fromTile.hasRamp || toTile.type === 'ramp' || fromTile.type === 'ramp';

  if (!resident.constraints.canTraverseStairs) {
    if (isStaircase && !hasRamp) {
      return {
        allowed: false,
        reason: `${resident.name} uses a wheelchair and cannot climb steps without a ramp at (${toTile.x}, ${toTile.y}).`,
        barrierType: 'stairs',
      };
    }

    if (elevationDiff > 0 && !hasRamp) {
      return {
        allowed: false,
        reason: `Elevation change of ${elevationDiff} unit(s) at (${toTile.x}, ${toTile.y}) lacks an accessible curb ramp.`,
        barrierType: 'curb',
      };
    }

    if (isCurbDrop && !hasRamp) {
      return {
        allowed: false,
        reason: `Drop-off curb at (${toTile.x}, ${toTile.y}) traps wheelchair wheels without a curb cut.`,
        barrierType: 'curb',
      };
    }
  }

  // 4. Lighting & Visibility
  if (resident.constraints.requiresLight) {
    const isLit = toTile.hasLight || toTile.lightSource;
    const hasTactileGuidance = toTile.hasTactile || toTile.type === 'tactile_paving';

    if (!isLit && !hasTactileGuidance) {
      return {
        allowed: false,
        reason: `Unlit dark sector at (${toTile.x}, ${toTile.y}) has no lighting or tactile wayfinding.`,
        barrierType: 'darkness',
      };
    }
  }

  // 5. Tactile Wayfinding requirement (e.g. for low-vision residents in fog/dusk)
  if (resident.constraints.requiresTactileInDark) {
    const hasTactile = toTile.hasTactile || toTile.type === 'tactile_paving';
    const isLit = toTile.hasLight || toTile.lightSource;
    if (!hasTactile && !isLit) {
      return {
        allowed: false,
        reason: `${resident.name} lost the route at (${toTile.x}, ${toTile.y}): missing continuous tactile ground pavers.`,
        barrierType: 'darkness',
      };
    }
  }

  // 6. Crosswalk acoustic signaling
  if (resident.constraints.requiresAcousticAtRoads) {
    const isRoadCrossing = toTile.type === 'crosswalk_standard';
    const hasAudio = toTile.hasAudioBeacon || toTile.type === 'crosswalk_accessible' || toTile.type === 'acoustic_beacon';
    if (isRoadCrossing && !hasAudio) {
      return {
        allowed: false,
        reason: `Standard street crossing at (${toTile.x}, ${toTile.y}) has no accessible audible crosswalk beacon.`,
        barrierType: 'missing_audio',
      };
    }
  }

  // 7. Fatigue & Resting Bench requirements
  const isBench = toTile.hasBench || toTile.type === 'resting_bench';
  if (resident.constraints.maxContinuousWalk > 0) {
    const nextSteps = currentStepsSinceRest + 1;
    if (nextSteps > resident.constraints.maxContinuousWalk && !isBench) {
      return {
        allowed: false,
        reason: `${resident.name} cannot walk more than ${resident.constraints.maxContinuousWalk} tiles without a resting bench. Exhausted at (${toTile.x}, ${toTile.y}).`,
        barrierType: 'exhaustion',
      };
    }
  }

  return {
    allowed: true,
    resetsRest: isBench,
  };
}

interface FailureCandidate {
  priority: number;
  reason: string;
  barrierType: ResidentPathResult['barrierType'];
  tile: { x: number; y: number };
  g: number;
}

function getBarrierPriority(barrierType: ResidentPathResult['barrierType']): number {
  switch (barrierType) {
    case 'stairs':
    case 'curb':
    case 'missing_audio':
    case 'exhaustion':
    case 'darkness':
    case 'glare':
      return 10;
    case 'blocked':
    default:
      return 1;
  }
}

/**
 * A* Pathfinding for a specific resident across the city grid.
 */
export function findPathForResident(
  resident: ResidentProfile,
  tileMap: Map<string, GridTile>,
  gridWidth: number,
  gridHeight: number
): ResidentPathResult {
  const startKey = getTileKey(resident.startPosition.x, resident.startPosition.y);
  const targetKey = getTileKey(resident.destinationPosition.x, resident.destinationPosition.y);

  const startTile = tileMap.get(startKey);
  const targetTile = tileMap.get(targetKey);

  if (!startTile || !targetTile) {
    return {
      residentId: resident.id,
      residentName: resident.name,
      success: false,
      path: [],
      failureReason: `Invalid start or destination coordinate for ${resident.name}.`,
      barrierType: 'blocked',
    };
  }

  // Check if start tile itself violates constraints (e.g. unlit start tile in blackout)
  if (resident.constraints.requiresLight && !startTile.hasLight && !startTile.lightSource) {
    return {
      residentId: resident.id,
      residentName: resident.name,
      success: false,
      path: [{ x: startTile.x, y: startTile.y }],
      failureReason: `${resident.name} is stranded in pitch darkness at (${startTile.x}, ${startTile.y}).`,
      barrierType: 'darkness',
    };
  }

  const openSet: PathNode[] = [
    {
      x: startTile.x,
      y: startTile.y,
      g: 0,
      h: manhattanDistance(startTile.x, startTile.y, targetTile.x, targetTile.y),
      f: manhattanDistance(startTile.x, startTile.y, targetTile.x, targetTile.y),
      stepsSinceRest: 0,
    },
  ];

  const closedSet = new Set<string>();
  const gScores = new Map<string, number>();
  gScores.set(startKey, 0);

  let closestNode: PathNode = openSet[0];
  let bestFailureCandidate: FailureCandidate | null = null;

  const neighbors = [
    { dx: 0, dy: -1 }, // North
    { dx: 1, dy: 0 },  // East
    { dx: 0, dy: 1 },  // South
    { dx: -1, dy: 0 }, // West
  ];

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    const currentKey = getTileKey(current.x, current.y);

    if (current.h < closestNode.h) {
      closestNode = current;
    }

    // Reached destination!
    if (current.x === targetTile.x && current.y === targetTile.y) {
      const reconstructedPath: Array<{ x: number; y: number }> = [];
      const restStops: Array<{ x: number; y: number }> = [];
      let trace: PathNode | undefined = current;

      while (trace) {
        reconstructedPath.unshift({ x: trace.x, y: trace.y });
        const t = tileMap.get(getTileKey(trace.x, trace.y));
        if (t && (t.hasBench || t.type === 'resting_bench')) {
          restStops.unshift({ x: trace.x, y: trace.y });
        }
        trace = trace.parent;
      }

      return {
        residentId: resident.id,
        residentName: resident.name,
        success: true,
        path: reconstructedPath,
        restStops,
      };
    }

    closedSet.add(currentKey);
    const currentTile = tileMap.get(currentKey)!;

    for (const offset of neighbors) {
      const nx = current.x + offset.dx;
      const ny = current.y + offset.dy;

      if (nx < 0 || nx >= gridWidth || ny < 0 || ny >= gridHeight) {
        continue;
      }

      const neighborKey = getTileKey(nx, ny);
      if (closedSet.has(neighborKey)) {
        continue;
      }

      const nextTile = tileMap.get(neighborKey);
      if (!nextTile) continue;

      const moveValidation = validateMove(currentTile, nextTile, resident, current.stepsSinceRest);

      if (!moveValidation.allowed) {
        const priority = getBarrierPriority(moveValidation.barrierType);
        if (
          !bestFailureCandidate ||
          priority > bestFailureCandidate.priority ||
          (priority === bestFailureCandidate.priority && current.g >= bestFailureCandidate.g)
        ) {
          bestFailureCandidate = {
            priority,
            reason: moveValidation.reason || 'Accessibility barrier encountered.',
            barrierType: moveValidation.barrierType || 'blocked',
            tile: { x: nx, y: ny },
            g: current.g,
          };
        }
        continue;
      }

      const tentativeG = current.g + 1;
      const existingG = gScores.get(neighborKey) ?? Infinity;

      if (tentativeG < existingG) {
        gScores.set(neighborKey, tentativeG);
        const h = manhattanDistance(nx, ny, targetTile.x, targetTile.y);
        const stepsSinceRest = moveValidation.resetsRest ? 0 : current.stepsSinceRest + 1;

        const neighborNode: PathNode = {
          x: nx,
          y: ny,
          g: tentativeG,
          h,
          f: tentativeG + h,
          stepsSinceRest,
          parent: current,
        };

        const existingIdx = openSet.findIndex((n) => n.x === nx && n.y === ny);
        if (existingIdx !== -1) {
          openSet[existingIdx] = neighborNode;
        } else {
          openSet.push(neighborNode);
        }
      }
    }
  }

  // Partial path to closest node
  const partialPath: Array<{ x: number; y: number }> = [];
  let trace: PathNode | undefined = closestNode;
  while (trace) {
    partialPath.unshift({ x: trace.x, y: trace.y });
    trace = trace.parent;
  }

  return {
    residentId: resident.id,
    residentName: resident.name,
    success: false,
    path: partialPath,
    failureReason: bestFailureCandidate?.reason || `${resident.name} could not find a safe accessible route to ${resident.destinationLabel}.`,
    failureTile: bestFailureCandidate?.tile || { x: closestNode.x, y: closestNode.y },
    barrierType: bestFailureCandidate?.barrierType || 'blocked',
  };
}

/**
 * Recomputes dynamic lighting grid.
 */
export function recalculateLighting(tiles: GridTile[], gridWidth: number, gridHeight: number): GridTile[] {
  const map = buildTileMap(tiles);
  const litCoords = new Set<string>();

  for (const t of tiles) {
    if (t.lightSource || t.type === 'streetlamp') {
      const radius = 2;
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (Math.abs(dx) + Math.abs(dy) <= radius) {
            const lx = t.x + dx;
            const ly = t.y + dy;
            if (lx >= 0 && lx < gridWidth && ly >= 0 && ly < gridHeight) {
              litCoords.add(getTileKey(lx, ly));
            }
          }
        }
      }
    }
  }

  return tiles.map((t) => ({
    ...t,
    hasLight: litCoords.has(getTileKey(t.x, t.y)) || t.lightSource === true,
  }));
}
