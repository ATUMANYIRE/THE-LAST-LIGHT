'use client';

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { AlertTriangle, Wrench } from 'lucide-react';
import { friendlyText } from '../../utils/friendlyText';

export const FailureModal: React.FC = () => {
  const { simulationResult, showFailureModal, closeModals } = useGameStore();
  if (!showFailureModal || !simulationResult) return null;

  const failedResidents = simulationResult.residentResults.filter((r) => !r.success);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="failure-title"
      data-testid="failure-modal"
      style={{ background: 'rgba(20,31,42,0.80)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 sm:p-8"
        style={{
          background: 'rgba(37,52,59,0.97)',
          border: '1px solid rgba(200,125,112,0.25)',
          boxShadow: '0 20px 60px rgba(10,15,25,0.5)',
        }}
      >
        <div className="flex items-center gap-2 mb-3" style={{ color: '#C87D70' }}>
          <AlertTriangle className="w-4 h-4" />
          <span className="text-[10px] font-sans tracking-widest uppercase">Accessibility Barrier Encountered</span>
        </div>

        <h2
          id="failure-title"
          className="font-display font-light italic mb-2"
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: '#F6F3EB', letterSpacing: '-0.01em' }}
        >
          Route Needs Redesign
        </h2>

        <p className="text-sm font-sans mb-5" style={{ color: 'rgba(221,215,203,0.65)' }}>
          One or more neighbors were unable to safely complete their journey.
        </p>

        <div className="flex flex-col gap-2.5 mb-6">
          {failedResidents.map((r) => (
            <div
              key={r.residentId}
              className="p-3.5 rounded-xl text-sm font-sans leading-relaxed"
              style={{
                background: 'rgba(200,125,112,0.1)',
                border: '1px solid rgba(200,125,112,0.2)',
                color: 'rgba(221,215,203,0.85)',
              }}
            >
              <span className="font-semibold" style={{ color: '#C87D70' }}>{r.residentName}: </span>
              {friendlyText(r.failureReason ?? '')}
            </div>
          ))}
        </div>

        <button
          onClick={closeModals}
          autoFocus
          data-testid="failure-retry-button"
          className="w-full py-3 px-6 rounded-xl font-sans font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-150"
          style={{ background: '#C87D70', color: '#F6F3EB', boxShadow: '0 4px 16px rgba(200,125,112,0.3)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#D88D80'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#C87D70'; }}
        >
          <Wrench className="w-4 h-4" />
          Adjust Pathways & Try Again
        </button>
      </div>
    </div>
  );
};
