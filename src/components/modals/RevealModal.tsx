'use client';

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Eye, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { friendlyText } from '../../utils/friendlyText';

export const RevealModal: React.FC = () => {
  const { currentChapter, showRevealModal, acknowledgeReveal } = useGameStore();
  if (!showRevealModal) return null;

  const reveal = currentChapter.dialogues.reveal;
  const invisibleResident = currentChapter.residents.find(
    (r) => r.id === currentChapter.invisibleResidentId
  );
  if (!invisibleResident) return null;

  const accent = '#B59A67';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reveal-title"
      data-testid="reveal-modal"
      style={{ background: 'rgba(20,31,42,0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 sm:p-8"
        style={{
          background: 'rgba(37,52,59,0.97)',
          border: `1px solid ${accent}30`,
          boxShadow: '0 20px 60px rgba(10,15,25,0.5)',
        }}
      >
        <div className="flex items-center gap-2 mb-3" style={{ color: accent }}>
          <Eye className="w-4 h-4" />
          <span className="text-[10px] font-sans tracking-widest uppercase">The Invisible Resident Revealed</span>
        </div>

        <h2
          id="reveal-title"
          className="font-display font-light italic mb-2"
          style={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', color: '#F6F3EB', letterSpacing: '-0.01em' }}
        >
          {reveal.title}
        </h2>

        <p className="text-sm font-sans mb-5" style={{ color: 'rgba(221,215,203,0.65)' }}>
          The first route worked — but a second resident faces barriers the city never designed around.
        </p>

        {/* Character dialogue */}
        <div
          className="flex items-start gap-4 p-4 rounded-xl mb-4"
          style={{ background: 'rgba(246,243,235,0.04)', border: '1px solid rgba(221,215,203,0.08)' }}
        >
          <div
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-display text-lg font-light italic"
            style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}30` }}
          >
            {invisibleResident.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-sans font-semibold" style={{ color: '#F6F3EB' }}>
                {invisibleResident.name}
              </span>
              <span className="text-xs font-sans" style={{ color: 'rgba(221,215,203,0.45)' }}>
                {invisibleResident.role}
              </span>
            </div>
            <p className="text-sm font-sans leading-relaxed italic" style={{ color: 'rgba(221,215,203,0.8)' }}>
              &ldquo;{reveal.text}&rdquo;
            </p>
          </div>
        </div>

        {/* Barrier */}
        <div
          className="p-3.5 rounded-xl mb-3"
          style={{ background: 'rgba(200,125,112,0.1)', border: '1px solid rgba(200,125,112,0.2)' }}
        >
          <div className="flex items-center gap-2 mb-1" style={{ color: '#C87D70' }}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="text-[10px] font-sans tracking-wider uppercase font-semibold">Barrier Identified</span>
          </div>
          <p className="text-sm font-sans leading-relaxed" style={{ color: 'rgba(221,215,203,0.8)' }}>
            {friendlyText(reveal.barrierIdentified)}
          </p>
        </div>

        {/* New goal */}
        <div
          className="p-3.5 rounded-xl mb-6"
          style={{ background: 'rgba(141,155,135,0.1)', border: '1px solid rgba(141,155,135,0.2)' }}
        >
          <div className="flex items-center gap-2 mb-1" style={{ color: '#8D9B87' }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] font-sans tracking-wider uppercase font-semibold">New Objective</span>
          </div>
          <p className="text-sm font-sans leading-relaxed" style={{ color: 'rgba(221,215,203,0.8)' }}>
            {friendlyText(reveal.newObjective)}
          </p>
        </div>

        <button
          onClick={acknowledgeReveal}
          autoFocus
          data-testid="acknowledge-reveal-button"
          className="w-full py-3 px-6 rounded-xl font-sans font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-150"
          style={{ background: '#8D9B87', color: '#F6F3EB', boxShadow: '0 4px 16px rgba(141,155,135,0.3)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#7A8A78'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#8D9B87'; }}
        >
          Redesign for Everyone
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
