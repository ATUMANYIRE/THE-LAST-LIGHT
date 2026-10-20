'use client';

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Settings, X, Eye, Volume2, Type, Activity, Subtitles } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    showSettingsModal,
    openSettings,
    settings,
    toggleHighContrast,
    toggleReducedMotion,
    toggleSound,
    toggleCaptions,
    toggleLargeText,
  } = useGameStore();

  if (!showSettingsModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      data-testid="settings-modal"
    >
      <div className="w-full max-w-md bg-midnight-900 border border-midnight-700 rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-midnight-800 mb-5">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Settings className="w-5 h-5 text-civic-emerald shrink-0" />
            <h2 id="settings-title" className="text-lg font-bold text-slate-100 truncate">
              Accessibility & Settings
            </h2>
          </div>
          <button
            onClick={() => openSettings(false)}
            data-testid="close-settings-x-button"
            className="p-1.5 rounded-lg bg-midnight-800 hover:bg-midnight-700 text-slate-400 hover:text-slate-100 transition shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col space-y-4">
          {/* High Contrast */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-midnight-950/70 border border-midnight-800 gap-3">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Eye className="w-5 h-5 text-glow-amber shrink-0" />
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-slate-200 block truncate">
                  High Contrast Mode
                </span>
                <span className="text-[11px] text-slate-400 block leading-tight">
                  WCAG AAA stark yellow/cyan on deep black
                </span>
              </div>
            </div>
            <button
              onClick={toggleHighContrast}
              role="switch"
              data-testid="toggle-high-contrast"
              aria-checked={settings.highContrast}
              className={`w-12 h-6 shrink-0 flex items-center rounded-full p-1 transition-colors relative z-10 cursor-pointer ${
                settings.highContrast ? 'bg-glow-amber justify-end' : 'bg-midnight-800 justify-start'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full ${
                  settings.highContrast ? 'bg-slate-950' : 'bg-slate-400'
                }`}
              />
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-midnight-950/70 border border-midnight-800 gap-3">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Activity className="w-5 h-5 text-dusk-lavender shrink-0" />
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-slate-200 block truncate">
                  Reduced Motion
                </span>
                <span className="text-[11px] text-slate-400 block leading-tight">
                  Minimizes board animations and camera pulses
                </span>
              </div>
            </div>
            <button
              onClick={toggleReducedMotion}
              role="switch"
              data-testid="toggle-reduced-motion"
              aria-checked={settings.reducedMotion}
              className={`w-12 h-6 shrink-0 flex items-center rounded-full p-1 transition-colors relative z-10 cursor-pointer ${
                settings.reducedMotion ? 'bg-glow-amber justify-end' : 'bg-midnight-800 justify-start'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full ${
                  settings.reducedMotion ? 'bg-slate-950' : 'bg-slate-400'
                }`}
              />
            </button>
          </div>

          {/* Sound Effects */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-midnight-950/70 border border-midnight-800 gap-3">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Volume2 className="w-5 h-5 text-civic-sky shrink-0" />
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-slate-200 block truncate">
                  Procedural Audio Cues
                </span>
                <span className="text-[11px] text-slate-400 block leading-tight">
                  Synthesized Web Audio beacons and feedback
                </span>
              </div>
            </div>
            <button
              onClick={toggleSound}
              role="switch"
              data-testid="toggle-sound"
              aria-checked={settings.soundEnabled}
              className={`w-12 h-6 shrink-0 flex items-center rounded-full p-1 transition-colors relative z-10 cursor-pointer ${
                settings.soundEnabled ? 'bg-glow-amber justify-end' : 'bg-midnight-800 justify-start'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full ${
                  settings.soundEnabled ? 'bg-slate-950' : 'bg-slate-400'
                }`}
              />
            </button>
          </div>

          {/* Audio Captions */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-midnight-950/70 border border-midnight-800 gap-3">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Subtitles className="w-5 h-5 text-civic-teal shrink-0" />
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-slate-200 block truncate">
                  Sound Captions Toast
                </span>
                <span className="text-[11px] text-slate-400 block leading-tight">
                  Displays on-screen text for all auditory signals
                </span>
              </div>
            </div>
            <button
              onClick={toggleCaptions}
              role="switch"
              data-testid="toggle-captions"
              aria-checked={settings.captionsEnabled}
              className={`w-12 h-6 shrink-0 flex items-center rounded-full p-1 transition-colors relative z-10 cursor-pointer ${
                settings.captionsEnabled ? 'bg-glow-amber justify-end' : 'bg-midnight-800 justify-start'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full ${
                  settings.captionsEnabled ? 'bg-slate-950' : 'bg-slate-400'
                }`}
              />
            </button>
          </div>

          {/* Large Text */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-midnight-950/70 border border-midnight-800 gap-3">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Type className="w-5 h-5 text-glow-soft shrink-0" />
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-slate-200 block truncate">
                  Large Text Mode
                </span>
                <span className="text-[11px] text-slate-400 block leading-tight">
                  Scales interface labels by 115%
                </span>
              </div>
            </div>
            <button
              onClick={toggleLargeText}
              role="switch"
              data-testid="toggle-large-text"
              aria-checked={settings.largeText}
              className={`w-12 h-6 shrink-0 flex items-center rounded-full p-1 transition-colors relative z-10 cursor-pointer ${
                settings.largeText ? 'bg-glow-amber justify-end' : 'bg-midnight-800 justify-start'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full ${
                  settings.largeText ? 'bg-slate-950' : 'bg-slate-400'
                }`}
              />
            </button>
          </div>
        </div>

        <button
          onClick={() => openSettings(false)}
          data-testid="close-settings-button"
          className="w-full mt-6 py-2.5 px-4 rounded-xl bg-midnight-800 hover:bg-midnight-700 text-slate-200 font-semibold text-xs border border-midnight-600 transition"
        >
          Save & Close Settings
        </button>
      </div>
    </div>
  );
};
