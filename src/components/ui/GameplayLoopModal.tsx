'use client';

import React, { useEffect, useRef } from 'react';
import { Eye, Hammer, MousePointer, Footprints, Users, RefreshCw } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

const STEPS = [
  { icon: Eye, label: 'Observe', desc: 'Read the chapter intro. Learn who your resident is and where they need to go.' },
  { icon: Hammer, label: 'Select a tool', desc: 'Pick from the toolbar: Path, Ramp, Lamp, Tactile Strip, Beacon, or Bench — each fixes a different barrier.' },
  { icon: MousePointer, label: 'Click to build', desc: 'Click any empty tile on the 3D board to place your chosen tool. Each tile costs part of your budget.' },
  { icon: Footprints, label: 'Test the route', desc: 'Hit "Test Route" to send your resident walking. Their path is highlighted in real time.' },
  { icon: Users, label: 'Watch the resident', desc: 'After testing, the resident reveals their needs. New tools unlock — tools built for them specifically.' },
  { icon: RefreshCw, label: 'Improve & repeat', desc: 'Use the new tools to fix any remaining barriers. You pass when the resident reaches their destination.' },
] as const;

interface GameplayLoopModalProps {
  onDismiss: () => void;
}

export const GameplayLoopModal: React.FC<GameplayLoopModalProps> = ({ onDismiss }) => {
  const { playerName } = useGameStore();
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const t = setTimeout(() => btnRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    try { localStorage.setItem('tll_loop_seen', '1'); } catch {}
    onDismiss();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape') handleDismiss();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayName = playerName.trim();

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-4 py-6 overflow-y-auto"
      style={{
        zIndex: 9998,
        background: 'rgba(10,17,26,0.92)',
        backdropFilter: 'blur(8px)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="How the game works"
      data-testid="gameplay-loop-modal"
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(30,44,52,0.98)',
          border: '1px solid rgba(221,215,203,0.1)',
          boxShadow: '0 16px 60px rgba(10,15,25,0.7)',
        }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(221,215,203,0.06)' }}>
          <p
            className="text-[10px] tracking-[0.4em] uppercase font-sans mb-1"
            style={{ color: 'rgba(181,154,103,0.7)' }}
          >
            The Invisible Resident
          </p>
          <h2
            className="font-display text-2xl leading-tight mb-1"
            style={{ color: '#F6F3EB', fontWeight: 300, fontStyle: 'italic' }}
          >
            {displayName ? `Welcome, ${displayName}.` : 'Welcome.'}
          </h2>
          <p className="text-xs font-sans" style={{ color: 'rgba(221,215,203,0.5)' }}>
            You are the neighborhood designer. Here is how each chapter works.
          </p>
        </div>

        {/* Steps */}
        <div className="px-6 py-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl p-3"
                style={{ background: 'rgba(246,243,235,0.04)', border: '1px solid rgba(221,215,203,0.06)' }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(200,125,112,0.12)', color: '#C87D70' }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-sans font-semibold mb-0.5" style={{ color: '#F6F3EB' }}>
                    <span
                      className="inline-block mr-1.5 text-[9px] font-mono rounded px-1"
                      style={{ background: 'rgba(181,154,103,0.15)', color: '#B59A67' }}
                    >
                      {i + 1}
                    </span>
                    {step.label}
                  </p>
                  <p className="text-[11px] font-sans leading-relaxed" style={{ color: 'rgba(221,215,203,0.55)' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex flex-col items-center gap-2">
          <button
            ref={btnRef}
            onClick={handleDismiss}
            data-testid="loop-begin-button"
            className="w-full py-3 rounded-xl font-sans font-semibold text-sm transition-all duration-200 cursor-pointer"
            style={{
              background: '#C87D70',
              color: '#F6F3EB',
              boxShadow: '0 4px 20px rgba(200,125,112,0.3)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#D88D80'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#C87D70'; }}
          >
            {"Let's Begin"}
          </button>
          <p className="text-[10px] font-sans" style={{ color: 'rgba(221,215,203,0.25)' }}>
            Press Enter or Esc to continue
          </p>
        </div>
      </div>
    </div>
  );
};
