'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Settings, ChevronRight, Map, RefreshCw } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

interface TitleScreenProps {
  onComplete: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onComplete }) => {
  const [visible, setVisible] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const { openSettings, openChapterSelect, openHelp, loadChapter, completedChapters, playerName } = useGameStore();

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleBegin = () => {
    setVisible(false);
    setTimeout(() => onCompleteRef.current(), 320);
  };

  const handleRestartCh1 = () => {
    try { localStorage.removeItem('tll_tutorial_done'); } catch {}
    loadChapter(1);
    handleBegin();
  };

  const hasPlayed = completedChapters.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      data-testid="title-screen"
      style={{
        // Subtle warm vignette — city shows through in center
        background: 'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(246,243,235,0.08) 0%, rgba(20,31,42,0.72) 100%)',
        transition: 'opacity 0.32s ease',
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Top bar — hackathon attribution */}
      <div className="flex items-center justify-between px-6 pt-5">
        <span
          className="text-[10px] tracking-[0.3em] uppercase font-sans"
          style={{ color: 'rgba(221,215,203,0.5)' }}
        >
          Girls Who Code · HHS Hackathon 2026
        </span>
        <span
          className="text-[10px] tracking-[0.2em] uppercase font-sans"
          style={{ color: 'rgba(221,215,203,0.35)' }}
        >
          An Urban Accessibility Puzzle
        </span>
      </div>

      {/* Center — game title */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <p
          className="text-xs tracking-[0.5em] uppercase mb-5 font-sans"
          style={{ color: 'rgba(181,154,103,0.75)' }}
        >
          The Invisible Resident
        </p>

        <h1
          className="font-display leading-none mb-4 select-none"
          style={{
            fontSize: 'clamp(3.5rem, 10vw, 7rem)',
            color: '#F6F3EB',
            letterSpacing: '-0.02em',
            textShadow: '0 2px 40px rgba(20,31,42,0.6), 0 0 80px rgba(181,154,103,0.15)',
            fontWeight: 300,
            fontStyle: 'italic',
          }}
        >
          The Last Light
        </h1>

        <p
          className="text-sm max-w-sm leading-relaxed mb-2 font-sans"
          style={{ color: 'rgba(221,215,203,0.65)' }}
        >
          A city isn&rsquo;t truly connected until everyone can find their way home.
        </p>

        {playerName && hasPlayed && (
          <p
            className="text-sm font-sans mb-8"
            style={{ color: 'rgba(181,154,103,0.75)', fontStyle: 'italic' }}
          >
            Welcome back, {playerName}.
          </p>
        )}
        {(!playerName || !hasPlayed) && <div className="mb-8" />}

        {/* Primary action */}
        <button
          onClick={handleBegin}
          autoFocus
          data-testid="enter-3d-world-button"
          className="group flex items-center gap-3 px-8 py-4 rounded-2xl font-sans font-semibold text-base mb-4 cursor-pointer transition-all duration-200"
          style={{
            background: '#C87D70',
            color: '#F6F3EB',
            boxShadow: '0 4px 24px rgba(200,125,112,0.35)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#D88D80'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#C87D70'; }}
        >
          Begin Journey
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>

        {/* Secondary menu row */}
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => { handleBegin(); setTimeout(() => openHelp(true), 350); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-sans text-sm cursor-pointer transition-all duration-150"
            style={{ color: 'rgba(221,215,203,0.7)', background: 'rgba(246,243,235,0.07)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(246,243,235,0.14)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(246,243,235,0.07)'; }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            How to Play
          </button>

          <button
            onClick={() => { handleBegin(); setTimeout(() => openChapterSelect(true), 350); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-sans text-sm cursor-pointer transition-all duration-150"
            style={{ color: 'rgba(221,215,203,0.7)', background: 'rgba(246,243,235,0.07)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(246,243,235,0.14)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(246,243,235,0.07)'; }}
          >
            <Map className="w-3.5 h-3.5" />
            Chapters
          </button>

          <button
            onClick={() => { handleBegin(); setTimeout(() => openSettings(true), 350); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-sans text-sm cursor-pointer transition-all duration-150"
            style={{ color: 'rgba(221,215,203,0.7)', background: 'rgba(246,243,235,0.07)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(246,243,235,0.14)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(246,243,235,0.07)'; }}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
        </div>

        {/* Replay from Ch.1 — shown only after completing at least one chapter */}
        {hasPlayed && (
          <button
            onClick={handleRestartCh1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-sans text-xs cursor-pointer transition-all duration-150 mt-3"
            style={{ color: 'rgba(181,154,103,0.8)', background: 'rgba(181,154,103,0.1)', border: '1px solid rgba(181,154,103,0.2)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(181,154,103,0.18)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(181,154,103,0.1)'; }}
          >
            <RefreshCw className="w-3 h-3" />
            Replay from Chapter 1
          </button>
        )}
      </div>

      {/* Bottom — chapter dots */}
      <div className="pb-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          {['I', 'II', 'III'].map((n, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full flex items-center justify-center font-display text-[9px]"
              style={{
                background: i === 0 ? 'rgba(181,154,103,0.3)' : 'rgba(246,243,235,0.08)',
                color: i === 0 ? '#B59A67' : 'rgba(221,215,203,0.3)',
                border: i === 0 ? '1px solid rgba(181,154,103,0.4)' : '1px solid rgba(246,243,235,0.1)',
              }}
            >
              {n}
            </div>
          ))}
        </div>
        <p
          className="text-[10px] font-sans tracking-widest"
          style={{ color: 'rgba(221,215,203,0.3)' }}
        >
          Three chapters · One city
        </p>
      </div>
    </div>
  );
};
