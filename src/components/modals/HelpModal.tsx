'use client';

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { HelpCircle, X, Keyboard, Compass, Lightbulb } from 'lucide-react';

export const HelpModal: React.FC = () => {
  const { showHelpModal, openHelp } = useGameStore();

  if (!showHelpModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      data-testid="help-modal"
    >
      <div className="w-full max-w-lg bg-midnight-900 border border-midnight-700 rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-midnight-800 mb-4 gap-2">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <HelpCircle className="w-5 h-5 text-civic-sky shrink-0" />
            <h2 id="help-title" className="text-lg font-bold text-slate-100 truncate">
              Game Guide & Controls
            </h2>
          </div>
          <button
            onClick={() => openHelp(false)}
            data-testid="close-help-button"
            className="p-1.5 rounded-lg bg-midnight-800 hover:bg-midnight-700 text-slate-400 hover:text-slate-100 transition shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer relative z-10"
            aria-label="Close guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-5 rounded-xl border border-civic-emerald/30 bg-midnight-950/70 p-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
          <strong className="text-glow-soft">Start here:</strong> Guide Maya toward the Library in Explore Mode. Switch to Design Mode with Tab or the mode button, choose a Path tool, and place tiles to connect her start to the destination. Press Test Route. If a journey fails, read the barrier explanation, improve the route, and test again. A successful chapter offers the next chapter button.
        </div>

        {/* Keyboard Controls Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-glow-warm uppercase tracking-wider mb-2.5">
            <Keyboard className="w-4 h-4" />
            <span>Accessible Keyboard Controls</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-midnight-950/80 border border-midnight-800">
              <span className="text-glow-soft font-bold block mb-0.5">Explore: WASD / arrows</span>
              <span className="text-slate-400 font-sans text-[11px]">Walk; hold Shift to jog. Drag to look. Touch: use the on-screen arrows.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-midnight-950/80 border border-midnight-800">
              <span className="text-glow-soft font-bold block mb-0.5">Design: arrows + Space</span>
              <span className="text-slate-400 font-sans text-[11px]">Move the board cursor and place the selected tool. Tab switches modes.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-midnight-950/80 border border-midnight-800">
              <span className="text-glow-soft font-bold block mb-0.5">Keys 1 - 6</span>
              <span className="text-slate-400 font-sans text-[11px]">Switch infrastructure tools</span>
            </div>
            <div className="p-2.5 rounded-lg bg-midnight-950/80 border border-midnight-800">
              <span className="text-glow-soft font-bold block mb-0.5">Key 0</span>
              <span className="text-slate-400 font-sans text-[11px]">Select Demolish tool</span>
            </div>
          </div>
        </div>

        {/* Core Game Philosophy */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-civic-emerald uppercase tracking-wider mb-2">
            <Lightbulb className="w-4 h-4" />
            <span>The Invisible Resident Mechanic</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-midnight-950/60 p-3.5 rounded-xl border border-midnight-800">
            A city is often designed only for the "default" pedestrian. In every chapter, your initial route connects one resident. But when dusk falls, an uncounted neighbor appears who faces a barrier—steps without a ramp, silent crossings, or dark corridors without resting benches.
            <br /><br />
            <span className="text-glow-soft font-semibold">The Curb-Cut Effect:</span> When you build infrastructure that accommodates residents with disabilities, the entire community benefits equally.
          </p>
        </div>

        {/* Universal Design Toolkit Legend */}
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-dusk-lavender uppercase tracking-wider mb-2.5">
            <Compass className="w-4 h-4" />
            <span>Universal Design Toolkit Legend</span>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="p-2.5 rounded-lg bg-midnight-950/70 border border-midnight-800">
              <strong className="text-slate-100">Modular Ramp:</strong> Converts stairs and drop-off curbs into zero-step slopes. Essential for manual/power wheelchairs and strollers.
            </div>
            <div className="p-2.5 rounded-lg bg-midnight-950/70 border border-midnight-800">
              <strong className="text-slate-100">Tactile Paving:</strong> Raised blister studs that signal directional paths and hazards to long-white-cane users.
            </div>
            <div className="p-2.5 rounded-lg bg-midnight-950/70 border border-midnight-800">
              <strong className="text-slate-100">Acoustic Signal:</strong> Accessible Pedestrian Signals (APS) that chirp safe intervals across busy roadways.
            </div>
            <div className="p-2.5 rounded-lg bg-midnight-950/70 border border-midnight-800">
              <strong className="text-slate-100">Resting Bench:</strong> Provides recovery seating along extended corridors for elderly residents and people with cardiopulmonary fatigue.
            </div>
          </div>
        </div>

        <button
          onClick={() => openHelp(false)}
          data-testid="bottom-close-help-button"
          className="w-full mt-6 py-2.5 px-4 rounded-xl bg-midnight-800 hover:bg-midnight-700 text-slate-200 font-semibold text-xs border border-midnight-600 transition"
        >
          Close Guide
        </button>
      </div>
    </div>
  );
};
