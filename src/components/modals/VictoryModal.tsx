'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { triggerConfetti } from '../../utils/confetti';
import { CheckCircle2, ArrowRight, BookOpen, RotateCcw } from 'lucide-react';

export const VictoryModal: React.FC = () => {
  const {
    currentChapter, showVictoryModal, nextChapter, resetLevel,
    budget, currentChapterId, settings,
  } = useGameStore();

  useEffect(() => {
    if (showVictoryModal && !settings.reducedMotion) {
      triggerConfetti();
    }
  }, [showVictoryModal, settings.reducedMotion]);

  if (!showVictoryModal) return null;

  const complete = currentChapter.dialogues.complete;
  const isFinalChapter = currentChapterId >= 3;

  const chapterBg = currentChapter.chapterNumber === 1 ? '#B59A67'
    : currentChapter.chapterNumber === 2 ? '#C87D70'
    : '#8D9B87';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
      data-testid="victory-modal"
      style={{ background: 'rgba(20,31,42,0.82)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 sm:p-8"
        style={{
          background: 'rgba(37,52,59,0.97)',
          border: `1px solid ${chapterBg}30`,
          boxShadow: '0 20px 60px rgba(10,15,25,0.5)',
        }}
      >
        <div className="flex items-center gap-2 mb-3" style={{ color: chapterBg }}>
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-[10px] font-sans tracking-widest uppercase">
            Chapter {currentChapter.chapterNumber} Complete
          </span>
        </div>

        <h2
          id="victory-title"
          className="font-display font-light italic mb-2"
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: '#F6F3EB', letterSpacing: '-0.01em' }}
        >
          {complete.title}
        </h2>

        <p className="text-sm font-sans mb-5" style={{ color: 'rgba(221,215,203,0.7)' }}>
          {complete.celebration}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Residents Connected', value: `${currentChapter.residents.length}/${currentChapter.residents.length}`, color: '#8D9B87' },
            { label: 'Budget Remaining', value: `$${budget}`, color: chapterBg },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="p-3 rounded-xl text-center"
              style={{ background: 'rgba(246,243,235,0.05)', border: '1px solid rgba(221,215,203,0.08)' }}
            >
              <span className="text-[9px] font-sans tracking-widest uppercase block mb-1" style={{ color: 'rgba(221,215,203,0.45)' }}>
                {label}
              </span>
              <span className="text-lg font-display font-light" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Takeaway */}
        <div
          className="p-4 rounded-xl mb-6"
          style={{ background: `${chapterBg}15`, border: `1px solid ${chapterBg}25` }}
        >
          <div className="flex items-center gap-2 mb-1.5" style={{ color: chapterBg }}>
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-[10px] font-sans tracking-wider uppercase font-semibold">
              Inclusive Design Takeaway
            </span>
          </div>
          <p className="text-sm font-sans leading-relaxed" style={{ color: 'rgba(221,215,203,0.8)' }}>
            {complete.inclusiveTakeaway}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={resetLevel}
            className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl font-sans text-sm cursor-pointer transition-all duration-150"
            style={{
              background: 'rgba(246,243,235,0.07)',
              color: 'rgba(221,215,203,0.7)',
              border: '1px solid rgba(221,215,203,0.1)',
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Replay
          </button>
          <button
            onClick={nextChapter}
            autoFocus
            data-testid="victory-continue-button"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-sans font-semibold text-sm cursor-pointer transition-all duration-150"
            style={{ background: chapterBg, color: '#F6F3EB', boxShadow: `0 4px 16px ${chapterBg}40` }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            {isFinalChapter ? 'View Grand Finale' : 'Continue to Chapter ' + (currentChapter.chapterNumber + 1)}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
