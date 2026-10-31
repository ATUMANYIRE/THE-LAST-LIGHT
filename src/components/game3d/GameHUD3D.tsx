'use client';

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { friendlyText } from '../../utils/friendlyText';
import {
  RotateCcw, Undo2, Redo2, Volume2, VolumeX,
  Compass, HelpCircle, Settings, Sparkles,
  Footprints, ArrowUpRight, Grid3x3, Bell, Lightbulb, Eraser, SofaIcon, FastForward,
} from 'lucide-react';

const TOOL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  paved_walkway: Footprints,
  ramp: ArrowUpRight,
  tactile_paving: Grid3x3,
  acoustic_beacon: Bell,
  resting_bench: SofaIcon,
  streetlamp: Lightbulb,
  demolish: Eraser,
};

const TOOL_LABELS: Record<string, string> = {
  paved_walkway: 'Path',
  ramp: 'Ramp',
  tactile_paving: 'Tactile',
  acoustic_beacon: 'Beacon',
  resting_bench: 'Bench',
  streetlamp: 'Lamp',
  demolish: 'Clear',
};

interface GameHUD3DProps {
  onWatchCinematic?: () => void;
  viewMode: '3d' | '2d';
  onToggleViewMode: () => void;
}

const PANEL = 'rgba(37,52,59,0.78)';
const PANEL_BORDER = 'rgba(221,215,203,0.1)';

export const GameHUD3D: React.FC<GameHUD3DProps> = ({ onWatchCinematic, viewMode, onToggleViewMode }) => {
  const {
    currentChapter, budget, undo, redo, resetLevel,
    toggleSound, settings, openHelp, openSettings,
    openChapterSelect, selectedTool, selectTool,
    runSimulation, isSimulating, skipAnimation, history, redoStack, phase, cursor, gameMode,
  } = useGameStore();

  const canUndo = history.length > 0;
  const canRedo = redoStack.length > 0;

  const availableToolIds = phase === 'initial'
    ? currentChapter.availableToolsInitial
    : currentChapter.availableToolsPostReveal;

  const toolsList = availableToolIds.map((id, idx) => ({
    id,
    label: TOOL_LABELS[id] || id,
    cost: currentChapter.toolCosts[id] || 0,
    hotkey: id === 'demolish' ? '0' : String(idx + 1),
    Icon: TOOL_ICONS[id] || Sparkles,
  }));

  const chapterColor = currentChapter.chapterNumber === 1 ? '#B59A67'
    : currentChapter.chapterNumber === 2 ? '#C87D70'
    : '#8D9B87';

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between select-none">

      {/* ── Top bar ── */}
      <header
        className="flex items-center justify-between px-3 sm:px-4 py-2.5 pointer-events-auto"
        style={{ background: PANEL, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${PANEL_BORDER}` }}
      >
        {/* Chapter + phase */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span
              className="font-display text-sm font-light italic"
              style={{ color: chapterColor }}
            >
              Ch.{currentChapter.chapterNumber}
            </span>
            <span className="text-[11px] font-sans" style={{ color: 'rgba(221,215,203,0.6)' }}>
              {currentChapter.districtName}
            </span>
          </div>
          <span
            className="hidden sm:inline text-[9px] px-2 py-0.5 rounded-md font-sans tracking-wider uppercase"
            style={{
              background: phase === 'initial' ? 'rgba(169,199,216,0.15)' : 'rgba(141,155,135,0.2)',
              color: phase === 'initial' ? '#A9C7D8' : '#8D9B87',
              border: `1px solid ${phase === 'initial' ? 'rgba(169,199,216,0.2)' : 'rgba(141,155,135,0.25)'}`,
            }}
          >
            {gameMode === 'explore' ? 'Explore' : phase === 'initial' ? 'Design · Phase 1' : 'Redesign · Phase 2'}
          </span>
        </div>

        {/* Utility buttons */}
        <div data-tut="undo" className="flex items-center gap-0.5">
          {[
            { Icon: Undo2, action: undo, disabled: !canUndo, testId: 'undo-button', label: 'Undo', title: 'Undo (Ctrl+Z)' },
            { Icon: Redo2, action: redo, disabled: !canRedo, testId: 'redo-button', label: 'Redo', title: 'Redo (Ctrl+Y)' },
            { Icon: RotateCcw, action: resetLevel, disabled: false, testId: 'reset-button', label: 'Reset', title: 'Reset (R)' },
          ].map(({ Icon, action, disabled, testId, label, title }) => (
            <button
              key={testId}
              onClick={action}
              disabled={disabled}
              data-testid={testId}
              title={title}
              aria-label={label}
              className="p-1.5 rounded-lg transition cursor-pointer disabled:opacity-25"
              style={{ color: 'rgba(221,215,203,0.7)' }}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
          <span className="w-px h-4 mx-1" style={{ background: PANEL_BORDER }} />
          <button
            onClick={toggleSound}
            data-testid="audio-toggle-button"
            title="Toggle Sound"
            aria-label={settings.soundEnabled ? 'Mute' : 'Unmute'}
            className="p-1.5 rounded-lg transition cursor-pointer"
            style={{ color: settings.soundEnabled ? '#A9C7D8' : 'rgba(221,215,203,0.4)' }}
          >
            {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onToggleViewMode}
            data-testid="view-mode-button"
            title={viewMode === '3d' ? 'Show 2D board' : 'Show 3D city'}
            aria-label={viewMode === '3d' ? 'Show 2D board' : 'Show 3D city'}
            className="p-1.5 rounded-lg transition cursor-pointer"
            style={{ color: 'rgba(221,215,203,0.7)' }}
          >
            <Grid3x3 className="w-3.5 h-3.5" />
          </button>
          {viewMode === '3d' && (
            <button
              onClick={() => window.dispatchEvent(new Event('tll-reset-camera'))}
              data-testid="reset-camera-button"
              title="Reset Camera"
              aria-label="Reset Camera"
              className="p-1.5 rounded-lg transition cursor-pointer"
              style={{ color: 'rgba(221,215,203,0.7)' }}
            >
              <Compass className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => openChapterSelect(true)}
            data-testid="chapter-select-button"
            title="Chapters"
            aria-label="Chapter Select"
            className="p-1.5 rounded-lg transition cursor-pointer"
            style={{ color: 'rgba(141,155,135,0.85)' }}
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => openHelp(true)}
            data-testid="help-button"
            title="How to Play"
            aria-label="How to Play"
            className="p-1.5 rounded-lg transition cursor-pointer"
            style={{ color: 'rgba(221,215,203,0.6)' }}
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => openSettings(true)}
            data-testid="settings-button"
            title="Settings"
            aria-label="Settings"
            className="p-1.5 rounded-lg transition cursor-pointer"
            style={{ color: 'rgba(221,215,203,0.6)' }}
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── Objective strip ── */}
      <div className="px-3 sm:px-4 pt-2 pointer-events-none">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg max-w-xs sm:max-w-sm"
          style={{ background: 'rgba(37,52,59,0.65)', backdropFilter: 'blur(8px)' }}
        >
          <Footprints className="w-3 h-3 shrink-0" style={{ color: chapterColor }} />
          <p className="text-[11px] font-sans leading-snug line-clamp-2" style={{ color: 'rgba(221,215,203,0.9)' }}>
            {friendlyText(phase === 'initial'
              ? currentChapter.dialogues.intro.objective
              : currentChapter.dialogues.reveal.newObjective)}
          </p>
        </div>
      </div>

      <div className="flex-1" />

      {/* ── Bottom palette dock ── */}
      <footer className="px-3 sm:px-4 pb-3 sm:pb-4 pointer-events-auto">
        <div
          className="flex items-center gap-2 rounded-2xl px-3 py-2.5"
          style={{
            background: PANEL,
            backdropFilter: 'blur(16px)',
            border: `1px solid ${PANEL_BORDER}`,
          }}
        >
          {/* Budget */}
          <div
            data-testid="budget-display"
            data-tut="budget"
            className="flex flex-col items-center shrink-0 min-w-[3rem]"
            role="status"
            aria-live="polite"
          >
            <span className="text-[8px] font-sans tracking-widest uppercase" style={{ color: 'rgba(221,215,203,0.4)' }}>
              Budget
            </span>
            <span
              className="text-base font-display font-light leading-none mt-0.5"
              style={{ color: budget < 20 ? '#C87D70' : '#F6F3EB' }}
            >
              ${budget}
            </span>
          </div>

          <div className="w-px h-8 shrink-0" style={{ background: PANEL_BORDER }} />

          {/* Tools */}
          <div data-tut="toolbar" className="flex items-center gap-1 overflow-x-auto flex-1 py-0.5" style={{ scrollbarWidth: 'none' }}>
            {toolsList.map(({ id, label, cost, hotkey, Icon }) => {
              const sel = selectedTool === id;
              return (
                <button
                  key={id}
                  onClick={() => selectTool(id)}
                  data-testid={`tool-${id}`}
                  aria-pressed={sel}
                  aria-label={`${label}, cost $${cost}, key ${hotkey}`}
                  title={`${label} ($${cost}) [${hotkey}]`}
                  className="flex flex-col items-center px-2.5 py-1.5 rounded-xl shrink-0 transition-all duration-150 cursor-pointer"
                  style={sel
                    ? { background: '#C87D70', color: '#F6F3EB', boxShadow: '0 2px 12px rgba(200,125,112,0.4)' }
                    : { color: 'rgba(221,215,203,0.65)', background: 'transparent' }
                  }
                  onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = 'rgba(246,243,235,0.08)'; }}
                  onMouseLeave={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[9px] font-sans font-medium mt-0.5 leading-none">{label}</span>
                  <span className="text-[8px] font-mono leading-none mt-0.5 opacity-60">${cost}</span>
                </button>
              );
            })}
          </div>

          <div className="w-px h-8 shrink-0" style={{ background: PANEL_BORDER }} />

          {/* Simulate */}
          <button
            onClick={() => runSimulation()}
            disabled={isSimulating}
            data-testid="run-simulation-button"
            data-tut="simulate"
            aria-label="Run accessibility simulation"
            className="flex flex-col items-center px-3 py-1.5 rounded-xl shrink-0 cursor-pointer disabled:opacity-40 transition-all duration-150 font-sans"
            style={{
              background: isSimulating ? 'rgba(141,155,135,0.3)' : '#8D9B87',
              color: '#F6F3EB',
              boxShadow: isSimulating ? 'none' : '0 2px 12px rgba(141,155,135,0.3)',
            }}
            onMouseEnter={e => { if (!isSimulating) (e.currentTarget as HTMLElement).style.background = '#7A8A78'; }}
            onMouseLeave={e => { if (!isSimulating) (e.currentTarget as HTMLElement).style.background = '#8D9B87'; }}
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[9px] font-semibold mt-0.5 leading-none">Test Route</span>
          </button>

          {isSimulating && (
            <button
              onClick={() => skipAnimation()}
              aria-label="Skip to simulation result"
              className="flex flex-col items-center px-2.5 py-1.5 rounded-xl shrink-0 cursor-pointer transition-all duration-150 font-sans"
              style={{ background: 'rgba(181,154,103,0.25)', color: '#B59A67', border: '1px solid rgba(181,154,103,0.3)' }}
            >
              <FastForward className="w-4 h-4" />
              <span className="text-[9px] font-semibold mt-0.5 leading-none">Skip</span>
            </button>
          )}
        </div>

        {/* Cursor hint */}
        {selectedTool && selectedTool !== 'demolish' && (
          <div className="text-center mt-1.5 text-[9px] font-sans" style={{ color: 'rgba(221,215,203,0.35)' }}>
            Click an empty tile to place · Arrow keys or drag to move
          </div>
        )}
      </footer>
    </div>
  );
};
