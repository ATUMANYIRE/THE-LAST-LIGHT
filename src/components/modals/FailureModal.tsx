'use client';

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { AlertTriangle, RotateCcw, Wrench } from 'lucide-react';

export const FailureModal: React.FC = () => {
  const { simulationResult, showFailureModal, closeModals } = useGameStore();

  if (!showFailureModal || !simulationResult) return null;

  const failedResidents = simulationResult.residentResults.filter((r) => !r.success);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-midnight-950/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="failure-title"
      data-testid="failure-modal"
    >
      <div className="w-full max-w-lg bg-midnight-900 border-2 border-red-500/70 rounded-3xl p-5 sm:p-8 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-red-500/15 blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span>Accessibility Barrier Encountered</span>
        </div>

        <h2 id="failure-title" className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mb-2">
          Route Needs Redesign
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 mb-4">
          One or more neighbors were unable to safely complete their journey. Inspect the environmental obstacles below:
        </p>

        <div className="flex flex-col space-y-2.5 mb-6">
          {failedResidents.map((r) => (
            <div
              key={r.residentId}
              className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs sm:text-sm text-red-200 leading-normal"
            >
              <div className="font-bold text-red-300 mb-0.5 flex items-center space-x-1">
                <span>{r.residentName}:</span>
              </div>
              <p>{r.failureReason}</p>
            </div>
          ))}
        </div>

        <button
          onClick={closeModals}
          autoFocus
          data-testid="failure-retry-button"
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide flex items-center justify-center space-x-2 shadow-lantern transition-all"
        >
          <Wrench className="w-4 h-4" />
          <span>Adjust Pathways & Try Again</span>
        </button>
      </div>
    </div>
  );
};
