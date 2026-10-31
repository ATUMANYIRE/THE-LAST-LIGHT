'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import { CityScene3D } from './CityScene3D';

interface CityCanvas3DProps {
  onTileClick?: (x: number, y: number) => void;
}

export const CityCanvas3D: React.FC<CityCanvas3DProps> = ({ onTileClick }) => {
  const { tiles, cursor, applyToolToTile, setCursor, currentChapter } = useGameStore();

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      style={{ background: '#B8CDD6' }}
      data-testid="city-canvas-3d-container"
    >
      {/* 3D WebGL Canvas */}
      <Canvas
        tabIndex={0}
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMappingExposure: 1.1,
        }}
        dpr={[1, 2]}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          <CityScene3D onTileClick={onTileClick} />
        </Suspense>
      </Canvas>

      {/* Accessible DOM Grid Overlay for Screen Readers & Automated E2E Interaction */}
      {/* Enables keyboard navigation, ARIA announcements, and test compatibility */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 z-10"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${currentChapter.gridWidth}, 1fr)`,
          gridTemplateRows: `repeat(${currentChapter.gridHeight}, 1fr)`,
        }}
        role="grid"
        aria-label={`${currentChapter.districtName} City Board`}
        data-testid="accessible-board-grid"
      >
        {tiles.map((tile) => (
          <button
            key={`dom-tile-${tile.x}-${tile.y}`}
            data-testid={`tile-${tile.x}-${tile.y}`}
            type="button"
            className="w-full h-full"
            tabIndex={cursor.x === tile.x && cursor.y === tile.y ? 0 : -1}
            onClick={() => {
              if (useGameStore.getState().gameMode !== 'design') return;
              useGameStore.getState().setCursor({ x: tile.x, y: tile.y });
              useGameStore.getState().applyToolToTile(tile.x, tile.y);
              onTileClick?.(tile.x, tile.y);
            }}
          >
            Tile ({tile.x}, {tile.y}): {tile.label || tile.type}, elevation{' '}
            {tile.elevation}, {tile.hasLight ? 'illuminated' : 'unlit'}.
          </button>
        ))}
      </div>
    </div>
  );
};
