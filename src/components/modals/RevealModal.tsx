'use client';

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { CharacterAvatar } from '../game/CharacterAvatar';
import { Eye, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export const RevealModal: React.FC = () => {
  const { currentChapter, showRevealModal, acknowledgeReveal } = useGameStore();

  if (!showRevealModal) return null;

  const reveal = currentChapter.dialogues.reveal;
  const invisibleResident = currentChapter.residents.find(
    (r) => r.id === currentChapter.invisibleResidentId
  );

  if (!invisibleResident) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-midnight-950/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reveal-title"
      data-testid="reveal-modal"
    >
      <div className="w-full max-w-lg bg-midnight-900 border-2 border-glow-amber/70 rounded-3xl p-5 sm:p-8 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Amber beacon flare */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-56 h-56 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-2 text-xs font-bold text-glow-warm uppercase tracking-wider mb-2">
          <Eye className="w-4 h-4 text-glow-amber" />
          <span>The Invisible Resident Revealed</span>
        </div>

        <h2 id="reveal-title" className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mb-2">
          {reveal.title}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 mb-4">
          The first route worked for the initial traveler. But when night deepened, a previously overlooked resident emerged—facing an environmental barrier built into the city.
        </p>

        {/* Narrative dialogue bubble with new resident portrait */}
        <div className="flex items-start space-x-4 p-4 rounded-2xl bg-midnight-950/80 border border-midnight-800 mb-4 shadow-inner">
          <CharacterAvatar
            avatarKey={invisibleResident.avatarKey}
            size={60}
            alt={`${invisibleResident.name} portrait`}
          />
          <div className="flex-1">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-100 text-sm">{invisibleResident.name}</span>
              <span className="text-xs text-glow-soft font-mono">({invisibleResident.role})</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 italic mt-1.5 leading-relaxed">
              "{reveal.text}"
            </p>
          </div>
        </div>

        {/* Identified environmental barrier alert */}
        <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/50 mb-4">
          <div className="flex items-center space-x-2 text-red-400 font-semibold text-xs mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Environmental Barrier Identified:</span>
          </div>
          <p className="text-xs sm:text-sm text-red-200 font-medium leading-normal">
            {reveal.barrierIdentified}
          </p>
        </div>

        {/* New inclusive goal */}
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 mb-6">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Universal Design Challenge:</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-normal">
            {reveal.newObjective}
          </p>
        </div>

        <button
          onClick={acknowledgeReveal}
          autoFocus
          data-testid="acknowledge-reveal-button"
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm sm:text-base tracking-wide flex items-center justify-center space-x-2 shadow-lantern transition-all"
        >
          <span>Redesign City Pathways Inclusively</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
