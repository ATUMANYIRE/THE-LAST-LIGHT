'use client';

import React, { useState, useRef, useEffect } from 'react';

interface PlayerNameScreenProps {
  onSubmit: (name: string) => void;
}

export const PlayerNameScreen: React.FC<PlayerNameScreenProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
      inputRef.current?.focus();
    }, 80);
    return () => clearTimeout(t);
  }, []);

  const trimmed = name.trim();
  const isValid = trimmed.length >= 1 && trimmed.length <= 40;

  const handleSubmit = () => {
    if (!isValid) return;
    setVisible(false);
    setTimeout(() => onSubmit(trimmed), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-6 py-8"
      style={{
        zIndex: 9999,
        background: 'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(37,52,59,0.97) 0%, rgba(10,17,26,0.99) 100%)',
        transition: 'opacity 0.3s ease',
        opacity: visible ? 1 : 0,
      }}
      role="main"
      aria-label="Player name entry"
      data-testid="player-name-screen"
    >
      {/* Game title */}
      <div className="text-center mb-10">
        <p
          className="text-[10px] tracking-[0.45em] uppercase font-sans mb-4"
          style={{ color: 'rgba(181,154,103,0.7)' }}
        >
          The Invisible Resident
        </p>
        <h1
          className="font-display leading-none mb-4 select-none"
          style={{
            fontSize: 'clamp(3rem, 9vw, 6rem)',
            color: '#F6F3EB',
            letterSpacing: '-0.02em',
            textShadow: '0 2px 40px rgba(20,31,42,0.6)',
            fontWeight: 300,
            fontStyle: 'italic',
          }}
        >
          The Last Light
        </h1>
        <p
          className="text-sm font-sans max-w-xs mx-auto leading-relaxed"
          style={{ color: 'rgba(221,215,203,0.6)' }}
        >
          A city isn&rsquo;t truly connected until everyone can find their way home.
        </p>
      </div>

      {/* Name form card */}
      <div className="w-full max-w-sm">
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(37,52,59,0.88)',
            border: '1px solid rgba(221,215,203,0.12)',
            boxShadow: '0 8px 40px rgba(10,15,25,0.5)',
          }}
        >
          <label
            htmlFor="player-name-input"
            className="block text-sm font-sans font-semibold mb-1"
            style={{ color: '#F6F3EB' }}
          >
            What should we call you?
          </label>
          <p
            className="text-xs font-sans mb-4"
            style={{ color: 'rgba(221,215,203,0.5)' }}
          >
            You&rsquo;ll be the neighborhood designer, working alongside your residents.
          </p>

          <input
            id="player-name-input"
            ref={inputRef}
            type="text"
            value={name}
            onChange={e => setName(e.target.value.slice(0, 40))}
            onKeyDown={handleKeyDown}
            placeholder="Enter your name"
            maxLength={40}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Your name"
            aria-describedby="name-char-count"
            className="w-full rounded-xl px-4 py-3 font-sans text-sm"
            style={{
              background: 'rgba(246,243,235,0.08)',
              border: '1px solid rgba(221,215,203,0.18)',
              color: '#F6F3EB',
              outline: 'none',
              caretColor: '#C87D70',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(200,125,112,0.6)'; }}
            onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = 'rgba(221,215,203,0.18)'; }}
          />

          <div className="flex items-center justify-between mt-1.5 mb-4">
            <span
              className="text-[10px] font-sans"
              style={{ color: trimmed.length === 0 ? 'rgba(221,215,203,0.25)' : 'rgba(221,215,203,0.45)' }}
              aria-live="polite"
            >
              {trimmed.length > 0 ? `Hi, ${trimmed}!` : 'Start typing…'}
            </span>
            <span
              id="name-char-count"
              className="text-[10px] font-sans"
              style={{ color: trimmed.length > 35 ? '#C87D70' : 'rgba(221,215,203,0.3)' }}
              aria-label={`${trimmed.length} of 40 characters`}
            >
              {trimmed.length}/40
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isValid}
            data-testid="begin-journey-button"
            className="w-full py-3 rounded-xl font-sans font-semibold text-sm transition-all duration-200 disabled:cursor-not-allowed"
            style={{
              background: isValid ? '#C87D70' : 'rgba(200,125,112,0.35)',
              color: '#F6F3EB',
              opacity: isValid ? 1 : 0.6,
              boxShadow: isValid ? '0 4px 20px rgba(200,125,112,0.3)' : 'none',
              cursor: isValid ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={e => { if (isValid) (e.currentTarget as HTMLButtonElement).style.background = '#D88D80'; }}
            onMouseLeave={e => { if (isValid) (e.currentTarget as HTMLButtonElement).style.background = '#C87D70'; }}
          >
            Begin My Journey
          </button>
        </div>
      </div>

      {/* Chapter dots */}
      <div className="mt-8 flex items-center gap-2">
        {['I', 'II', 'III'].map((n, i) => (
          <div
            key={i}
            className="w-5 h-5 rounded-full flex items-center justify-center font-display text-[8px]"
            style={{
              background: i === 0 ? 'rgba(181,154,103,0.2)' : 'rgba(246,243,235,0.06)',
              color: i === 0 ? '#B59A67' : 'rgba(221,215,203,0.22)',
              border: i === 0 ? '1px solid rgba(181,154,103,0.3)' : '1px solid rgba(246,243,235,0.08)',
            }}
          >
            {n}
          </div>
        ))}
      </div>
      <p
        className="text-[9px] font-sans tracking-widest mt-2"
        style={{ color: 'rgba(221,215,203,0.22)' }}
      >
        Three chapters · One city
      </p>
    </div>
  );
};
