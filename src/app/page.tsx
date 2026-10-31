'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '../store/gameStore';
import { GameHUD3D } from '../components/game3d/GameHUD3D';
import { TouchDPad } from '../components/game3d/TouchDPad';
import { TitleScreen } from '../components/game3d/TitleScreen';
import { GameBoard } from '../components/game/GameBoard';
import { AudioCaptions } from '../components/layout/AudioCaptions';
import { TutorialOverlay } from '../components/ui/TutorialOverlay';
import { PlayerNameScreen } from '../components/ui/PlayerNameScreen';
import { GameplayLoopModal } from '../components/ui/GameplayLoopModal';
import { friendlyText } from '../utils/friendlyText';

import { IntroModal } from '../components/modals/IntroModal';
import { RevealModal } from '../components/modals/RevealModal';
import { VictoryModal } from '../components/modals/VictoryModal';
import { FailureModal } from '../components/modals/FailureModal';
import { SettingsModal } from '../components/modals/SettingsModal';
import { HelpModal } from '../components/modals/HelpModal';
import { ChapterSelectModal } from '../components/modals/ChapterSelectModal';
import { FinaleModal } from '../components/modals/FinaleModal';

// Dynamically import 3D Canvas with ssr: false for Next.js App Router WebGL compatibility
const CityCanvas3D = dynamic(
  () => import('../components/game3d/CityCanvas3D').then((m) => m.CityCanvas3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center font-sans text-sm" style={{ background: '#1A2830', color: '#DDD7CB' }}>
        <span className="animate-pulse tracking-widest uppercase text-xs">Loading city…</span>
      </div>
    ),
  }
);

export default function GamePage() {
  const {
    moveCursor,
    applyToolAtCursor,
    selectTool,
    undo,
    redo,
    resetLevel,
    closeModals,
    loadChapter,
    setPlayerName,
    settings,
    announcement,
    currentChapter,
    phase,
    showIntroModal,
    currentChapterId,
    gameMode,
    setGameMode,
  } = useGameStore();

  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [showCinematic, setShowCinematic] = useState<boolean>(true);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [showNameScreen, setShowNameScreen] = useState<boolean>(false);
  const [showLoopModal, setShowLoopModal] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const prevAnnouncementRef = useRef<string>('');

  // Defer rendering until client-side localStorage is loaded (prevents SSR/client store mismatch)
  useEffect(() => setMounted(true), []);

  // Show name entry screen for first-time visitors
  useEffect(() => {
    if (!mounted) return;
    try {
      const savedName = localStorage.getItem('tll_player_name');
      if (!savedName || savedName.trim().length === 0) {
        setShowNameScreen(true);
      }
    } catch {}
  }, [mounted]);

  const handleNameSubmit = (name: string) => {
    setPlayerName(name);
    setShowNameScreen(false);
    setShowLoopModal(true);
  };

  const handleLoopDone = () => {
    setShowLoopModal(false);
  };

  // Show error toast when placement fails (visible feedback, not just screen-reader announcement)
  useEffect(() => {
    if (!announcement || announcement === prevAnnouncementRef.current) return;
    prevAnnouncementRef.current = announcement;
    if (/Cannot|Insufficient|already has/i.test(announcement)) {
      setToast(announcement);
      const t = setTimeout(() => setToast(null), 2800);
      return () => clearTimeout(t);
    }
    setToast(null);
  }, [announcement]);

  // Show tutorial on first visit, after intro modal is dismissed
  useEffect(() => {
    if (!showCinematic && !showIntroModal && currentChapterId === 1) {
      try {
        const done = localStorage.getItem('tll_tutorial_done');
        if (!done) setShowTutorial(true);
      } catch {}
    }
  }, [showCinematic, showIntroModal, currentChapterId]);

  // Keyboard navigation & Shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input/textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName) || target?.isContentEditable) {
        return;
      }

      // Let overlays own their keyboard controls and preserve native button activation.
      if (document.querySelector('[data-testid="title-screen"], [data-testid="player-name-screen"], [data-testid="gameplay-loop-modal"], [aria-label="Tutorial"]')) return;
      if (target?.tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;

      if (e.key === 'Escape') {
        closeModals();
        return;
      }

      // Tab switches modes from the world/board; focused controls retain Tab navigation.
      const worldHasFocus = target === document.body || target?.tagName === 'CANVAS' || target?.getAttribute('role') === 'grid';
      if ((e.key === 'Tab' && !e.shiftKey && worldHasFocus) ||
          (e.key.toLowerCase() === 'v' && !e.ctrlKey && !e.metaKey && !e.altKey)) {
        e.preventDefault();
        const { gameMode: gm } = useGameStore.getState();
        setGameMode(gm === 'explore' ? 'design' : 'explore');
        return;
      }

      if (document.querySelector('[aria-modal="true"]')) return;

      // Undo & Redo shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      // Positional tool hotkeys — matches toolbar display order (same as button labels)
      if (e.key.length === 1) {
        const numKey = parseInt(e.key, 10);
        if (!isNaN(numKey)) {
          if (numKey === 0) {
            selectTool('demolish');
            return;
          }
          if (numKey >= 1 && numKey <= 9) {
            const availToolIds = phase === 'initial'
              ? currentChapter.availableToolsInitial
              : currentChapter.availableToolsPostReveal;
            const positional = availToolIds.filter((id) => id !== 'demolish');
            const toolId = positional[numKey - 1];
            if (toolId) selectTool(toolId);
            return;
          }
        }
      }

      // In explore mode, WASD/arrows drive the character controller — skip cursor
      if (useGameStore.getState().gameMode === 'explore') {
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','W','a','A','s','S','d','D',' ','Enter'].includes(e.key)) return;
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
  }, [moveCursor, applyToolAtCursor, selectTool, undo, redo, resetLevel, closeModals, setGameMode, currentChapter, phase]);

  // Apply accessibility classes to root
  const rootClasses = [
    'min-h-screen',
    'h-screen',
    'w-screen',
    'overflow-hidden',
    'relative',
    settings.highContrast ? 'high-contrast' : '',
    settings.reducedMotion ? 'reduced-motion' : '',
    settings.largeText ? 'large-text' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (!mounted) {
    return (
      <div className="h-screen w-screen overflow-hidden flex items-center justify-center" style={{ background: '#1A2830', color: '#DDD7CB' }}>
        <span className="animate-pulse tracking-widest uppercase text-xs font-sans">Loading city…</span>
      </div>
    );
  }

  return (
    <div className={rootClasses}>
      {/* Screen Reader ARIA Live Region */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* First-visit player name entry */}
      {showNameScreen && (
        <PlayerNameScreen onSubmit={handleNameSubmit} />
      )}

      {/* Gameplay loop explainer — shown after name entry */}
      {showLoopModal && !showNameScreen && (
        <GameplayLoopModal onDismiss={handleLoopDone} />
      )}

      {/* Title Screen — overlaid on the 3D world */}
      {showCinematic && !showNameScreen && !showLoopModal && (
        <TitleScreen onComplete={() => setShowCinematic(false)} />
      )}

      {/* Primary 3D Viewport or 2D Tactical View */}
      {showNameScreen || showLoopModal ? (
        <div className="absolute inset-0" style={{ background: '#1A2830' }} aria-hidden="true" />
      ) : viewMode === '3d' ? (
        <div className="w-full h-full absolute inset-0">
          <CityCanvas3D />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
          <GameBoard />
        </div>
      )}

      {/* Floating Modernized Game HUD */}
      <GameHUD3D
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((prev) => (prev === '3d' ? '2d' : '3d'))}
        onWatchCinematic={() => setShowCinematic(true)}
      />

      {!showCinematic && !showNameScreen && !showLoopModal && !showTutorial && viewMode === '3d' && <TouchDPad />}

      {/* Floating Procedural Audio Captions */}
      <AudioCaptions />

      {/* Tutorial overlay — shown on first play */}
      {showTutorial && !showCinematic && (
        <TutorialOverlay onDismiss={() => setShowTutorial(false)} />
      )}

      {/* Interactive Modal Dialogs */}
      {!showCinematic && <IntroModal />}
      <RevealModal />
      <VictoryModal />
      <FailureModal />
      <SettingsModal />
      <HelpModal />
      <ChapterSelectModal />
      <FinaleModal />

      {/* ── Explore / Design mode HUD ── */}
      {!showCinematic && !showNameScreen && !showLoopModal && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 pointer-events-none"
          style={{ userSelect: 'none' }}
        >
          {/* Objective pill */}
          {gameMode === 'explore' && (
            <div
              className="px-3 py-1.5 rounded-xl font-sans text-xs font-semibold"
              style={{
                background: 'rgba(37,52,59,0.88)',
                border: '1px solid rgba(221,215,203,0.14)',
                color: '#F6F3EB',
                boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
              }}
            >
              {friendlyText(currentChapter.dialogues.intro.objective)}
            </div>
          )}
          {/* Controls hint */}
          {gameMode === 'explore' && (
            <div
              className="px-3 py-1.5 rounded-xl font-sans text-[10px]"
              style={{
                background: 'rgba(37,52,59,0.75)',
                border: '1px solid rgba(221,215,203,0.08)',
                color: 'rgba(221,215,203,0.55)',
              }}
            >
              WASD · Drag to look · Tab = Design
            </div>
          )}
        </div>
      )}

      {/* Mode toggle button (bottom-left above budget) */}
      {!showCinematic && !showNameScreen && !showLoopModal && (
        <button
          onClick={() => setGameMode(gameMode === 'explore' ? 'design' : 'explore')}
          className="fixed z-40 font-sans text-xs font-semibold px-3 py-2 rounded-xl cursor-pointer transition-all"
          style={{
            bottom: '5.5rem',
            left: '1rem',
            background: gameMode === 'explore' ? 'rgba(181,154,103,0.15)' : 'rgba(200,125,112,0.15)',
            border: gameMode === 'explore' ? '1px solid rgba(181,154,103,0.35)' : '1px solid rgba(200,125,112,0.35)',
            color: gameMode === 'explore' ? '#B59A67' : '#C87D70',
            backdropFilter: 'blur(4px)',
          }}
          aria-label={gameMode === 'explore' ? 'Switch to Design Mode' : 'Switch to Explore Mode'}
        >
          {gameMode === 'explore' ? '🔨 Design Mode' : '🚶 Explore Mode'}
        </button>
      )}

      {/* Placement error toast — fixed so it sits above WebGL canvas stacking context */}
      {toast && (
        <div
          className="pointer-events-none fixed bottom-28 left-0 right-0 flex justify-center"
          style={{ zIndex: 9999 }}
          data-testid="placement-feedback"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div
            className="px-4 py-2 rounded-xl font-sans text-xs font-medium max-w-xs text-center"
            style={{
              backgroundColor: 'rgba(200,125,112,0.97)',
              color: '#F6F3EB',
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
