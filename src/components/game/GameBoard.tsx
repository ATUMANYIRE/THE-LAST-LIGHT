'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { GridTile, ResidentProfile } from '../../types/game';
import { CharacterAvatar } from './CharacterAvatar';
import {
  Volume2,
  Footprints,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

export const GameBoard: React.FC = () => {
  const {
    currentChapter,
    tiles,
    cursor,
    applyToolToTile,
    setCursor,
    isSimulating,
    simulationResult,
    settings,
  } = useGameStore();

  const [simStep, setSimStep] = useState<number>(0);

  // Animate resident steps when simulating
  useEffect(() => {
    if (!isSimulating || !simulationResult) {
      setSimStep(0);
      return;
    }

    const maxSteps = Math.max(
      ...simulationResult.residentResults.map((r) => r.path.length),
      1
    );

    const interval = setInterval(() => {
      setSimStep((prev) => {
        if (prev < maxSteps) {
          return prev + 1;
        }
        return prev;
      });
    }, settings.reducedMotion ? 50 : 350);

    return () => clearInterval(interval);
  }, [isSimulating, simulationResult, settings.reducedMotion]);

  // Determine current display position of each resident
  const getResidentCurrentPosition = (resident: ResidentProfile) => {
    if (!simulationResult) {
      return resident.startPosition;
    }
    const resResult = simulationResult.residentResults.find(
      (r) => r.residentId === resident.id
    );
    if (!resResult || resResult.path.length === 0) {
      return resident.startPosition;
    }
    const idx = Math.min(simStep, resResult.path.length - 1);
    return resResult.path[idx] || resident.startPosition;
  };

  const tileSize = 72; // px
  const boardWidth = currentChapter.gridWidth * tileSize;
  const boardHeight = currentChapter.gridHeight * tileSize;

  return (
    <div className="relative flex flex-col items-center justify-center p-3 sm:p-6 bg-midnight-900/90 rounded-2xl border border-midnight-700/80 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Board Title & Context Header */}
      <div className="w-full flex items-center justify-between mb-3 text-xs sm:text-sm text-slate-300">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-glow-amber animate-pulse" />
          <span className="font-medium text-slate-200">
            District Grid: {currentChapter.gridWidth} × {currentChapter.gridHeight} Blocks
          </span>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="hidden sm:inline text-slate-400">
            Click / Space to build • Arrow keys to move
          </span>
          <span className="px-2 py-0.5 rounded bg-midnight-800 text-glow-soft font-mono border border-midnight-600">
            Cursor: ({cursor.x}, {cursor.y})
          </span>
        </div>
      </div>

      {/* Interactive Board Wrapper */}
      <div
        className="relative rounded-xl border border-midnight-700 bg-midnight-950 overflow-auto max-w-full shadow-inner select-none p-2"
        role="grid"
        aria-label={`${currentChapter.title} City Board`}
      >
        <svg
          width={boardWidth}
          height={boardHeight}
          className="block"
          viewBox={`0 0 ${boardWidth} ${boardHeight}`}
        >
          <defs>
            {/* Ambient streetlamp glow radial gradient */}
            <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0a0f1d" stopOpacity="0" />
            </radialGradient>

            {/* Tactile blister studs pattern */}
            <pattern id="tactilePattern" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.8" fill="#eab308" />
            </pattern>

            {/* Crosswalk stripes */}
            <pattern id="crosswalkPattern" width="16" height="16" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="8" height="16" fill="#f8fafc" opacity="0.85" />
              <rect x="8" y="0" width="8" height="16" fill="#1e293b" />
            </pattern>
          </defs>

          {/* Render Tiles */}
          {tiles.map((tile) => {
            const tx = tile.x * tileSize;
            const ty = tile.y * tileSize;
            const isCursorHere = cursor.x === tile.x && cursor.y === tile.y;

            return (
              <g
                key={`${tile.x},${tile.y}`}
                data-testid={`tile-${tile.x}-${tile.y}`}
                transform={`translate(${tx}, ${ty})`}
                onClick={() => {
                  setCursor({ x: tile.x, y: tile.y });
                  applyToolToTile(tile.x, tile.y);
                }}
                className="cursor-pointer transition-transform hover:opacity-95"
              >
                {/* Base Ground */}
                <rect
                  width={tileSize - 2}
                  height={tileSize - 2}
                  x={1}
                  y={1}
                  rx={6}
                  fill={
                    tile.hasLight || tile.lightSource
                      ? tile.type === 'empty'
                        ? '#0f172a'
                        : '#1e293b'
                      : '#05070d' // Dark sector in blackout
                  }
                  stroke={
                    tile.hasLight
                      ? '#334155'
                      : '#1e1b4b'
                  }
                  strokeWidth={1}
                />

                {/* Specific Tile Types Graphic Renderings */}
                {tile.type === 'paved_walkway' && (
                  <g>
                    <rect
                      x={4}
                      y={4}
                      width={tileSize - 8}
                      height={tileSize - 8}
                      rx={5}
                      fill="#334155"
                      stroke="#64748b"
                      strokeWidth={1.5}
                    />
                    <path
                      d="M 12 18 L 60 18 M 12 36 L 60 36 M 12 54 L 60 54"
                      stroke="#475569"
                      strokeWidth={1}
                      strokeDasharray="4,4"
                    />
                  </g>
                )}

                {tile.type === 'sidewalk' && (
                  <g>
                    <rect
                      x={3}
                      y={3}
                      width={tileSize - 6}
                      height={tileSize - 6}
                      rx={4}
                      fill="#1e293b"
                      stroke="#475569"
                      strokeWidth={1.5}
                    />
                    <rect
                      x={6}
                      y={6}
                      width={tileSize - 12}
                      height={tileSize - 12}
                      rx={3}
                      fill="#0f172a"
                      opacity={0.4}
                    />
                  </g>
                )}

                {tile.type === 'ramp' && (
                  <g>
                    <rect
                      x={3}
                      y={3}
                      width={tileSize - 6}
                      height={tileSize - 6}
                      rx={5}
                      fill="#047857"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                    {/* Slope gradient markings & accessible chevron */}
                    <path
                      d="M 18 46 L 36 24 L 54 46"
                      fill="none"
                      stroke="#d1fae5"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 24 54 L 36 40 L 48 54"
                      fill="none"
                      stroke="#a7f3d0"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                )}

                {tile.type === 'staircase' && (
                  <g>
                    <rect
                      x={3}
                      y={3}
                      width={tileSize - 6}
                      height={tileSize - 6}
                      rx={4}
                      fill="#78350f"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                    />
                    {/* 3 Step Treads */}
                    <rect x={6} y={8} width={tileSize - 12} height={16} fill="#92400e" stroke="#451a03" />
                    <rect x={6} y={26} width={tileSize - 12} height={16} fill="#b45309" stroke="#451a03" />
                    <rect x={6} y={44} width={tileSize - 12} height={18} fill="#d97706" stroke="#451a03" />
                    <text x={tileSize / 2} y={38} textAnchor="middle" fill="#fef3c7" fontSize={9} fontWeight="bold">
                      STEPS
                    </text>
                  </g>
                )}

                {tile.type === 'curb_drop' && (
                  <g>
                    <rect
                      x={3}
                      y={3}
                      width={tileSize - 6}
                      height={tileSize - 6}
                      rx={4}
                      fill="#450a0a"
                      stroke="#ef4444"
                      strokeWidth={1.5}
                    />
                    <line x1={6} y1={tileSize / 2} x2={tileSize - 6} y2={tileSize / 2} stroke="#fca5a5" strokeWidth={3} />
                    <text x={tileSize / 2} y={tileSize / 2 + 15} textAnchor="middle" fill="#fecaca" fontSize={9} fontWeight="bold">
                      CURB
                    </text>
                  </g>
                )}

                {tile.type === 'tactile_paving' && (
                  <g>
                    <rect
                      x={3}
                      y={3}
                      width={tileSize - 6}
                      height={tileSize - 6}
                      rx={5}
                      fill="#713f12"
                      stroke="#eab308"
                      strokeWidth={2}
                    />
                    <rect x={6} y={6} width={tileSize - 12} height={tileSize - 12} fill="url(#tactilePattern)" />
                  </g>
                )}

                {tile.type === 'acoustic_beacon' && (
                  <g>
                    <rect
                      x={3}
                      y={3}
                      width={tileSize - 6}
                      height={tileSize - 6}
                      rx={5}
                      fill="#064e3b"
                      stroke="#34d399"
                      strokeWidth={2}
                    />
                    {/* Animated sound wave rings */}
                    <circle cx={tileSize / 2} cy={tileSize / 2} r={12} fill="none" stroke="#34d399" strokeWidth={2} className="acoustic-wave" />
                    <circle cx={tileSize / 2} cy={tileSize / 2} r={6} fill="#34d399" />
                  </g>
                )}

                {tile.type === 'resting_bench' && (
                  <g>
                    <rect
                      x={3}
                      y={3}
                      width={tileSize - 6}
                      height={tileSize - 6}
                      rx={5}
                      fill="#1e3a5f"
                      stroke="#38bdf8"
                      strokeWidth={2}
                    />
                    {/* Wooden bench slats & armrests */}
                    <rect x={14} y={22} width={tileSize - 28} height={10} rx={2} fill="#b45309" stroke="#fcd34d" />
                    <rect x={14} y={35} width={tileSize - 28} height={14} rx={2} fill="#92400e" stroke="#fcd34d" />
                    <line x1={14} y1={20} x2={14} y2={52} stroke="#64748b" strokeWidth={3} strokeLinecap="round" />
                    <line x1={tileSize - 14} y1={20} x2={tileSize - 14} y2={52} stroke="#64748b" strokeWidth={3} strokeLinecap="round" />
                  </g>
                )}

                {tile.type === 'crosswalk_standard' && (
                  <rect
                    x={2}
                    y={2}
                    width={tileSize - 4}
                    height={tileSize - 4}
                    fill="url(#crosswalkPattern)"
                    stroke="#475569"
                  />
                )}

                {tile.type === 'building' && (
                  <g>
                    {/* 2.5D Building facade */}
                    <rect
                      x={4}
                      y={4}
                      width={tileSize - 8}
                      height={tileSize - 8}
                      rx={4}
                      fill="#1e1b4b"
                      stroke="#4338ca"
                      strokeWidth={2}
                    />
                    {/* Illuminated windows */}
                    <rect x={12} y={14} width={16} height={16} rx={2} fill="#fbbf24" opacity={0.85} />
                    <rect x={tileSize - 28} y={14} width={16} height={16} rx={2} fill="#fbbf24" opacity={0.85} />
                    <rect x={12} y={38} width={16} height={16} rx={2} fill="#f59e0b" opacity={0.7} />
                    <rect x={tileSize - 28} y={38} width={16} height={16} rx={2} fill="#f59e0b" opacity={0.7} />
                  </g>
                )}

                {tile.type === 'obstacle' && (
                  <g>
                    <rect
                      x={4}
                      y={4}
                      width={tileSize - 8}
                      height={tileSize - 8}
                      rx={4}
                      fill="#374151"
                      stroke="#9ca3af"
                      strokeWidth={1.5}
                    />
                    <path
                      d="M 12 12 L 60 60 M 60 12 L 12 60"
                      stroke="#ef4444"
                      strokeWidth={3}
                      strokeLinecap="round"
                    />
                  </g>
                )}

                {/* Streetlamp and radial illumination */}
                {(tile.type === 'streetlamp' || tile.lightSource) && (
                  <g>
                    {/* Ambient light circle */}
                    <circle
                      cx={tileSize / 2}
                      cy={tileSize / 2}
                      r={tileSize * 1.5}
                      fill="url(#lampGlow)"
                      className="pointer-events-none"
                    />
                    {/* Lantern post */}
                    <circle cx={tileSize / 2} cy={tileSize / 2} r={9} fill="#fbbf24" className="lantern-pulse" />
                    <circle cx={tileSize / 2} cy={tileSize / 2} r={5} fill="#ffffff" />
                  </g>
                )}

                {/* Destination Banner */}
                {tile.label && tile.isInitialFixed && (
                  <text
                    x={tileSize / 2}
                    y={tileSize - 6}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize={8.5}
                    fontFamily="monospace"
                    className="pointer-events-none select-none font-semibold"
                  >
                    {tile.label.slice(0, 10)}
                  </text>
                )}

                {/* Focus/Cursor Ring for Accessible Keyboard & Mouse selection */}
                {isCursorHere && (
                  <rect
                    x={2}
                    y={2}
                    width={tileSize - 4}
                    height={tileSize - 4}
                    rx={6}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth={3}
                    strokeDasharray="4,2"
                    className="animate-pulse"
                  />
                )}
              </g>
            );
          })}

          {/* Render Path Traces when simulation results exist */}
          {simulationResult &&
            simulationResult.residentResults.map((res) => {
              if (res.path.length < 2) return null;
              const points = res.path
                .map((p) => `${p.x * tileSize + tileSize / 2},${p.y * tileSize + tileSize / 2}`)
                .join(' ');

              return (
                <g key={`path-${res.residentId}`} className="pointer-events-none">
                  <polyline
                    points={points}
                    fill="none"
                    stroke={res.success ? '#10b981' : '#ef4444'}
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={res.success ? 'none' : '6,4'}
                    opacity={0.8}
                  />
                </g>
              );
            })}

          {/* Render Resident Tokens */}
          {currentChapter.residents
            .filter((r) => useGameStore.getState().activeResidentIds.includes(r.id))
            .map((resident) => {
              const pos = getResidentCurrentPosition(resident);
              const cx = pos.x * tileSize + tileSize / 2;
              const cy = pos.y * tileSize + tileSize / 2;

              const isAtGoal =
                pos.x === resident.destinationPosition.x &&
                pos.y === resident.destinationPosition.y;

              return (
                <g
                  key={`resident-${resident.id}`}
                  transform={`translate(${cx}, ${cy})`}
                  className="transition-transform duration-300 pointer-events-none"
                >
                  {/* Subtle shadow */}
                  <ellipse cx={0} cy={16} rx={14} ry={6} fill="#000000" opacity={0.6} />

                  {/* Character token badge */}
                  <circle
                    cx={0}
                    cy={0}
                    r={18}
                    fill={resident.color}
                    stroke="#ffffff"
                    strokeWidth={2.5}
                    className="drop-shadow-lg"
                  />

                  {/* Character Icon / Symbol */}
                  <text
                    x={0}
                    y={5}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize={12}
                    fontWeight="900"
                    fontFamily="sans-serif"
                  >
                    {resident.name[0]}
                  </text>

                  {/* Status Indicator bubble */}
                  {isAtGoal && (
                    <circle cx={12} cy={-12} r={6} fill="#10b981" stroke="#ffffff" strokeWidth={1.5} />
                  )}
                </g>
              );
            })}
        </svg>
      </div>

      {/* Accessible Screen Reader DOM Grid Overlay */}
      <div className="sr-only" aria-label="Accessible Grid Cells Navigation">
        {tiles.map((t) => (
          <button
            key={`sr-${t.x}-${t.y}`}
            tabIndex={cursor.x === t.x && cursor.y === t.y ? 0 : -1}
            onClick={() => {
              setCursor({ x: t.x, y: t.y });
              applyToolToTile(t.x, t.y);
            }}
          >
            Tile ({t.x}, {t.y}): {t.label || t.type}, elevation {t.elevation},{' '}
            {t.hasLight ? 'illuminated' : 'unlit'}.
          </button>
        ))}
      </div>
    </div>
  );
};
