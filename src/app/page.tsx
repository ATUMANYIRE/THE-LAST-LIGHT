'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { Header } from '../components/layout/Header';
import { GameBoard } from '../components/game/GameBoard';
import { ToolPalette } from '../components/game/ToolPalette';
import { ResidentCard } from '../components/game/ResidentCard';
import { AudioCaptions } from '../components/layout/AudioCaptions';

import { IntroModal } from '../components/modals/IntroModal';
import { RevealModal } from '../components/modals/RevealModal';
import { VictoryModal } from '../components/modals/VictoryModal';
import { FailureModal } from '../components/modals/FailureModal';
import { SettingsModal } from '../components/modals/SettingsModal';
import { HelpModal } from '../components/modals/HelpModal';
import { ChapterSelectModal } from '../components/modals/ChapterSelectModal';
import { FinaleModal } from '../components/modals/FinaleModal';

export default function GamePage() {
  const {
    moveCursor,
    applyToolAtCursor,
    selectTool,
    undo,
    resetLevel,
    closeModals,
    settings,
    announcement,
    currentChapter,
    phase,
  } = useGameStore();

  // Keyboard navigation & Shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        closeModals();
        return;
      }

      // Undo shortcut
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
        return;
      }

      // Directional cursor navigation
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          moveCursor(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          moveCursor(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          moveCursor(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          moveCursor(1, 0);
          break;

        case ' ':
        case 'Enter':
          e.preventDefault();
          applyToolAtCursor();
          break;

        case '1':
          selectTool('paved_walkway');
          break;
        case '2':
          selectTool('ramp');
          break;
        case '3':
          selectTool('tactile_paving');
          break;
        case '4':
          selectTool('acoustic_beacon');
          break;
        case '5':
          selectTool('resting_bench');
          break;
        case '6':
          selectTool('streetlamp');
          break;
        case '0':
          selectTool('demolish');
          break;

        case 'r':
        case 'R':
          if (!e.ctrlKey && !e.metaKey) {
            resetLevel();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveCursor, applyToolAtCursor, selectTool, undo, resetLevel, closeModals]);

  // Apply accessibility classes to root
  const rootClasses = [
    'min-h-screen',
    'bg-midnight-950',
    'text-slate-100',
    settings.highContrast ? 'high-contrast' : '',
    settings.reducedMotion ? 'reduced-motion' : '',
    settings.largeText ? 'large-text' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClasses}>
      {/* Screen Reader ARIA Live Region */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col lg:flex-row items-start justify-center gap-6">
        {/* Left Column: Interactive City Board */}
        <section className="w-full lg:flex-1 flex flex-col items-center" aria-label="City Board">
          <GameBoard />

          {/* Environmental Mission Subtext */}
          <div className="w-full max-w-2xl mt-4 px-4 py-3 rounded-xl bg-midnight-900/60 border border-midnight-800 text-xs text-slate-300 flex items-center justify-between">
            <span className="font-semibold text-glow-soft">
              {currentChapter.learningPrinciple}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Keyboard & Screen-Reader Accessible
            </span>
          </div>
        </section>

        {/* Right Column: Toolkit and Resident Cards */}
        <section className="w-full lg:w-96 flex flex-col space-y-4" aria-label="Planning Controls">
          <ToolPalette />
          <ResidentCard />
        </section>
      </main>

      {/* Floating Procedural Audio Captions */}
      <AudioCaptions />

      {/* Interactive Modal Dialogs */}
      <IntroModal />
      <RevealModal />
      <VictoryModal />
      <FailureModal />
      <SettingsModal />
      <HelpModal />
      <ChapterSelectModal />
      <FinaleModal />
    </div>
  );
}
