'use client';

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { CharacterAvatar } from '../game/CharacterAvatar';
import { Sparkles, ArrowRight } from 'lucide-react';

export const IntroModal: React.FC = () => {
  const { currentChapter, showIntroModal, closeModals } = useGameStore();

  if (!showIntroModal) return null;

  const intro = currentChapter.dialogues.intro;
  const leadResident = currentChapter.residents[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-midnight-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
      data-testid="intro-modal"
    >
      <div className="w-full max-w-lg bg-midnight-900 border border-midnight-700 rounded-3xl p-5 sm:p-8 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Ambient atmospheric glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-glow-amber/15 blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-2 text-xs font-semibold text-glow-warm uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 fill-amber-400" />
          <span>Chapter {currentChapter.chapterNumber} • {currentChapter.districtName}</span>
        </div>

        <h2 id="intro-title" className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mb-4">
          {intro.title}
        </h2>

        {/* Narrative dialogue bubble */}
        <div className="flex items-start space-x-4 p-4 rounded-2xl bg-midnight-950/70 border border-midnight-800 mb-5">
          <CharacterAvatar avatarKey={leadResident.avatarKey} size={56} alt={`${intro.speaker} portrait`} />
          <div className="flex-1">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-100 text-sm">{intro.speaker}</span>
              <span className="text-xs text-slate-400 font-medium">({intro.speakerRole})</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 italic mt-1 leading-relaxed">
              "{intro.text}"
            </p>
          </div>
        </div>

        {/* Objective card */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-glow-amber/40 mb-6">
          <span className="text-xs uppercase font-bold text-glow-warm tracking-wider block mb-1">
            Civil Objective:
          </span>
          <p className="text-xs sm:text-sm text-slate-200 font-medium">
            {intro.objective}
          </p>
        </div>

        <button
          onClick={closeModals}
          autoFocus
          data-testid="begin-chapter-button"
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-glow-amber to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide flex items-center justify-center space-x-2 shadow-lantern transition-all"
        >
          <span>Begin Planning Route</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
