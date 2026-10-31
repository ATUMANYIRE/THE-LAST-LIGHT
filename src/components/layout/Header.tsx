'use client';

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import {
  RotateCcw,
  Undo2,
  Redo2,
  Settings,
  HelpCircle,
  Map,
  Volume2,
  VolumeX,
  Coins,
  ShieldCheck,
  Moon,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentChapter,
    budget,
    history,
    redoStack,
    undo,
    redo,
    resetLevel,
    openSettings,
    openHelp,
    openChapterSelect,
    settings,
    toggleSound,
    phase,
  } = useGameStore();

  const isBudgetLow = budget < 35;
  const isBudgetCritical = budget < 15;

  return (
    <header className="w-full bg-midnight-950/80 border-b border-midnight-800/80 backdrop-blur-md px-4 py-3 sm:px-6 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3">
      {/* Brand & Chapter info */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-glow-amber to-amber-700 flex items-center justify-center shadow-lantern">
          <Moon className="w-5 h-5 text-slate-950 fill-amber-300" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-100 flex items-center gap-1.5">
              THE LAST LIGHT
              <span className="text-xs px-2 py-0.5 rounded-full bg-midnight-800 text-glow-warm border border-midnight-700 font-mono">
                Ch. {currentChapter.chapterNumber}
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {currentChapter.districtName} •{' '}
            <span className="text-glow-warm font-semibold">
              {phase === 'post_reveal' ? 'Universal Redesign' : currentChapter.title}
            </span>
          </p>
        </div>
      </div>

      {/* Municipal Budget Indicator */}
      <div className="flex items-center space-x-3">
        <div
          data-testid="budget-display"
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-sm font-semibold transition-colors ${
            isBudgetCritical
              ? 'bg-red-950/70 border-red-500/80 text-red-300 shadow-md shadow-red-950'
              : isBudgetLow
              ? 'bg-amber-950/70 border-amber-500/80 text-amber-200'
              : 'bg-midnight-900 border-midnight-700 text-slate-100'
          }`}
          role="status"
          aria-live="polite"
          aria-label={`Municipal Budget remaining: $${budget}`}
        >
          <Coins className={`w-4 h-4 ${isBudgetCritical ? 'text-red-400' : 'text-glow-amber'}`} />
          <span className="text-xs uppercase tracking-wider text-slate-400">Budget:</span>
          <span className="font-mono text-base font-bold">${budget}</span>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          <button
            onClick={undo}
            disabled={history.length === 0}
            data-testid="undo-button"
            className="p-2 rounded-lg bg-midnight-900 border border-midnight-700 text-slate-300 hover:text-slate-100 hover:bg-midnight-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            title="Undo last placement (Ctrl+Z)"
            aria-label="Undo last placement"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            data-testid="redo-button"
            className="p-2 rounded-lg bg-midnight-900 border border-midnight-700 text-slate-300 hover:text-slate-100 hover:bg-midnight-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            title="Redo last placement (Ctrl+Y / Ctrl+Shift+Z)"
            aria-label="Redo last placement"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            onClick={resetLevel}
            data-testid="reset-button"
            className="p-2 rounded-lg bg-midnight-900 border border-midnight-700 text-slate-300 hover:text-slate-100 hover:bg-midnight-800 transition"
            title="Reset chapter to start"
            aria-label="Reset chapter"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleSound}
            data-testid="sound-toggle-button"
            className="p-2 rounded-lg bg-midnight-900 border border-midnight-700 text-slate-300 hover:text-slate-100 hover:bg-midnight-800 transition"
            title={settings.soundEnabled ? 'Mute procedural audio' : 'Unmute audio'}
            aria-label={settings.soundEnabled ? 'Mute procedural audio' : 'Unmute audio'}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          <button
            onClick={() => openChapterSelect(true)}
            data-testid="chapter-select-button"
            className="p-2 rounded-lg bg-midnight-900 border border-midnight-700 text-slate-300 hover:text-slate-100 hover:bg-midnight-800 transition"
            title="Select Chapter"
            aria-label="Select Chapter"
          >
            <Map className="w-4 h-4 text-dusk-lavender" />
          </button>

          <button
            onClick={() => openHelp(true)}
            data-testid="help-button"
            className="p-2 rounded-lg bg-midnight-900 border border-midnight-700 text-slate-300 hover:text-slate-100 hover:bg-midnight-800 transition"
            title="Keyboard shortcuts & Universal Design Guide"
            aria-label="Help and controls"
          >
            <HelpCircle className="w-4 h-4 text-civic-sky" />
          </button>

          <button
            onClick={() => openSettings(true)}
            data-testid="settings-button"
            className="p-2 rounded-lg bg-midnight-900 border border-midnight-700 text-slate-300 hover:text-slate-100 hover:bg-midnight-800 transition"
            title="Accessibility settings (High contrast, Large text)"
            aria-label="Accessibility settings"
          >
            <Settings className="w-4 h-4 text-civic-emerald" />
          </button>
        </div>
      </div>
    </header>
  );
};
