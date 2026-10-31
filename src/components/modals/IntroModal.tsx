'use client';

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { ArrowRight } from 'lucide-react';
import { friendlyText } from '../../utils/friendlyText';

export const IntroModal: React.FC = () => {
  const { currentChapter, showIntroModal, closeModals } = useGameStore();
  if (!showIntroModal) return null;

  const intro = currentChapter.dialogues.intro;

  const chapterAccents = [
    { bg: '#B59A67', text: '#F6F3EB', muted: 'rgba(181,154,103,0.2)', border: 'rgba(181,154,103,0.3)' },
    { bg: '#C87D70', text: '#F6F3EB', muted: 'rgba(200,125,112,0.2)', border: 'rgba(200,125,112,0.3)' },
    { bg: '#8D9B87', text: '#F6F3EB', muted: 'rgba(141,155,135,0.2)', border: 'rgba(141,155,135,0.3)' },
  ];
  const accent = chapterAccents[(currentChapter.chapterNumber - 1) % 3];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
      data-testid="intro-modal"
      style={{ background: 'rgba(20,31,42,0.82)', backdropFilter: 'blur(6px)' }}
    >
      {/* Chapter context — upper center */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <p
          className="text-[10px] font-sans tracking-[0.45em] uppercase mb-3"
          style={{ color: 'rgba(221,215,203,0.5)' }}
        >
          Chapter {currentChapter.chapterNumber} · {currentChapter.districtName}
        </p>

        <h2
          id="intro-title"
          className="font-display font-light italic mb-2"
          style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            color: '#F6F3EB',
            letterSpacing: '-0.02em',
          }}
        >
          {intro.title}
        </h2>

        <p className="text-xs font-sans" style={{ color: 'rgba(221,215,203,0.45)' }}>
          {currentChapter.districtName} — {currentChapter.title}
        </p>
      </div>

      {/* Dialogue strip — lower portion */}
      <div
        className="mx-4 mb-4 sm:mx-6 sm:mb-6 rounded-2xl overflow-hidden"
        style={{ background: 'rgba(37,52,59,0.95)', border: '1px solid rgba(221,215,203,0.08)' }}
      >
        <div className="flex items-start gap-4 p-4 sm:p-5">
          {/* Character avatar */}
          <div
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-display text-lg font-light italic"
            style={{ background: accent.muted, color: accent.bg, border: `1px solid ${accent.border}` }}
          >
            {intro.speaker.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-sans font-semibold" style={{ color: '#F6F3EB' }}>
                {intro.speaker}
              </span>
              <span className="text-xs font-sans" style={{ color: 'rgba(221,215,203,0.45)' }}>
                {intro.speakerRole}
              </span>
            </div>
            <p className="text-sm font-sans leading-relaxed" style={{ color: 'rgba(221,215,203,0.85)', fontStyle: 'italic' }}>
              &ldquo;{intro.text}&rdquo;
            </p>
          </div>
        </div>

        {/* Objective + begin */}
        <div
          className="flex items-center gap-4 px-4 sm:px-5 py-3"
          style={{ borderTop: '1px solid rgba(221,215,203,0.06)' }}
        >
          <div className="flex-1 min-w-0">
            <span
              className="text-[9px] font-sans tracking-widest uppercase block mb-0.5"
              style={{ color: accent.bg }}
            >
              Objective
            </span>
            <p className="text-xs font-sans leading-snug line-clamp-2" style={{ color: 'rgba(221,215,203,0.75)' }}>
              {friendlyText(intro.objective)}
            </p>
          </div>

          <button
            onClick={closeModals}
            autoFocus
            data-testid="begin-chapter-button"
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans font-semibold text-sm cursor-pointer transition-all duration-150"
            style={{ background: accent.bg, color: accent.text }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            Begin
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
