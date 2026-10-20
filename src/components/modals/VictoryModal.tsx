'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { triggerConfetti } from '../../utils/confetti';
import { Trophy, CheckCircle2, ArrowRight, BookOpen, RotateCcw } from 'lucide-react';

export const VictoryModal: React.FC = () => {
  const {
    currentChapter,
    showVictoryModal,
    nextChapter,
    resetLevel,
    closeModals,
    budget,
    currentChapterId,
    settings,
  } = useGameStore();

  useEffect(() => {
    if (showVictoryModal && !settings.reducedMotion) {
      triggerConfetti();
    }
  }, [showVictoryModal, settings.reducedMotion]);

  if (!showVictoryModal) return null;

  const complete = currentChapter.dialogues.complete;
  const isFinalChapter = currentChapterId >= 3;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-midnight-950/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
      data-testid="victory-modal"
    >
      <div className="w-full max-w-lg bg-midnight-900 border-2 border-emerald-500/80 rounded-3xl p-5 sm:p-8 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
          <Trophy className="w-4 h-4" />
          <span>Chapter {currentChapter.chapterNumber} Complete!</span>
        </div>

        <h2 id="victory-title" className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mb-2">
          {complete.title}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 mb-4">
          {complete.celebration}
        </p>

        {/* Civics stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-3 rounded-xl bg-midnight-950/70 border border-midnight-800 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
              Residents Connected
            </span>
            <span className="text-lg font-mono font-black text-emerald-400">
              {currentChapter.residents.length} / {currentChapter.residents.length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-midnight-950/70 border border-midnight-800 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
              Remaining Budget
            </span>
            <span className="text-lg font-mono font-black text-glow-amber">
              ${budget}
            </span>
          </div>
        </div>

        {/* Universal Design Takeaway box */}
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 mb-6">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Inclusive Design Takeaway:</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
            {complete.inclusiveTakeaway}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={resetLevel}
            className="py-3 px-4 rounded-xl bg-midnight-800 hover:bg-midnight-700 border border-midnight-600 text-slate-300 font-semibold text-xs transition"
          >
            <RotateCcw className="w-4 h-4 inline mr-1" />
            Replay
          </button>
          <button
            onClick={nextChapter}
            autoFocus
            data-testid="victory-continue-button"
            className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm tracking-wide flex items-center justify-center space-x-2 shadow-lantern transition-all"
          >
            <span>{isFinalChapter ? 'View Grand Finale' : 'Continue to Next Chapter'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
