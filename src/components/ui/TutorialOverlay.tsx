'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { X, ChevronRight, MapPin, Hammer, Coins, Play, RotateCcw } from 'lucide-react';

const STEPS = [
  {
    id: 'welcome',
    icon: MapPin,
    title: 'Welcome to The Last Light',
    body: 'You guide Maya through a city that leaves some neighbors behind. Walk with WASD or arrow keys, or use the on-screen arrows on touch devices. Drag to look around. Press Tab or tap Design Mode to build a route.',
    highlight: null,
    tip: 'Tab switches Explore and Design Mode',
  },
  {
    id: 'objective',
    icon: MapPin,
    title: 'Connect Resident to Destination',
    body: 'Your first goal is to help Maya reach the Clocktower Library. The goal is shown at the top. Look for Maya and the Library marker in Explore Mode, then switch to Design Mode to see their labeled tiles.',
    highlight: 'objective-strip',
    tip: 'Start and destination tiles glow on the 3D board',
  },
  {
    id: 'tools',
    icon: Hammer,
    title: 'What Each Tool Does',
    body: 'Path: pave empty ground. Ramp: replace stairs (wheelchair access). Lamp: light dark tiles. Tactile: ground markings for low vision. Beacon: audio signal for blind residents. Bench: rest point for limited mobility.',
    highlight: 'toolbar',
    tip: 'Later chapters unlock new tools as new residents appear',
  },
  {
    id: 'select-tool',
    icon: Hammer,
    title: 'Select a Tool',
    body: 'Click a button in the bottom toolbar. "Path" is the first tool — click it now. The selected tool turns red-orange. Each tool shows its cost in dollars.',
    highlight: 'toolbar',
    tip: 'Keys 1–6 match the toolbar buttons left to right',
  },
  {
    id: 'place-tile',
    icon: Hammer,
    title: 'Place on the Board',
    body: 'Switch to Design Mode, then click or tap an empty tile to place the selected tool. The cost is deducted automatically. Fixed buildings and obstacles cannot be replaced.',
    highlight: 'board',
    tip: 'Arrow keys move the cursor; Space or Enter places the selected tool',
  },
  {
    id: 'budget',
    icon: Coins,
    title: 'Budget',
    body: 'Your remaining money is shown bottom-left. If you run out, you cannot place more tiles. Press Ctrl+Z (Undo) to remove a tile and recover its cost.',
    highlight: 'budget',
    tip: 'Press R to reset the whole level and restore the full budget',
  },
  {
    id: 'test',
    icon: Play,
    title: 'Test Your Route',
    body: 'When the path looks connected, press "Test Route" at the bottom right. Your resident walks the route. If they get blocked, a red highlight shows exactly which tile stopped them.',
    highlight: 'simulate',
    tip: 'Press Skip to jump straight to the result without watching the animation',
  },
] as const;

type StepId = typeof STEPS[number]['id'];

const HIGHLIGHT_STYLES: Record<string, React.CSSProperties> = {
  toolbar: { outline: '2px solid #C87D70', outlineOffset: '4px', borderRadius: '16px' },
  budget: { outline: '2px solid #B59A67', outlineOffset: '4px', borderRadius: '8px' },
  simulate: { outline: '2px solid #8D9B87', outlineOffset: '4px', borderRadius: '12px' },
  undo: { outline: '2px solid #A9C7D8', outlineOffset: '4px', borderRadius: '8px' },
};

interface TutorialOverlayProps {
  onDismiss: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onDismiss }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(onDismiss, 300);
    try { localStorage.setItem('tll_tutorial_done', '1'); } catch {}
  }, [onDismiss]);

  const advance = useCallback(() => {
    if (isLast) { dismiss(); return; }
    setStepIndex(i => i + 1);
  }, [isLast, dismiss]);

  // Keyboard handling
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
      if (e.key === 'Enter' || e.key === 'ArrowRight') advance();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dismiss, advance]);

  // Apply highlight to HUD elements
  useEffect(() => {
    const resetAll = () => {
      document.querySelectorAll('[data-tut]').forEach(el => {
        (el as HTMLElement).style.outline = '';
        (el as HTMLElement).style.outlineOffset = '';
        (el as HTMLElement).style.borderRadius = '';
      });
    };
    resetAll();
    if (!step.highlight || step.highlight === 'objective-strip' || step.highlight === 'board') return resetAll;
    const s = HIGHLIGHT_STYLES[step.highlight];
    if (!s) return resetAll;
    const el = document.querySelector(`[data-tut="${step.highlight}"]`) as HTMLElement | null;
    if (el) { Object.assign(el.style, s); }
    return resetAll;
  }, [step]);

  const Icon = step.icon;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-40 flex items-end justify-center"
      aria-live="polite"
    >
      {/* Tutorial card */}
      <div
        className="pointer-events-auto mb-20 mx-4 w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(37,52,59,0.97)',
          border: '1px solid rgba(221,215,203,0.12)',
          boxShadow: '0 8px 40px rgba(10,15,25,0.6)',
          opacity: exiting ? 0 : 1,
          transform: exiting ? 'translateY(12px)' : 'translateY(0)',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
        }}
        role="dialog"
        aria-label="Tutorial"
      >
        {/* Progress bar */}
        <div style={{ background: 'rgba(221,215,203,0.08)', height: '2px' }}>
          <div
            style={{
              background: '#C87D70',
              height: '100%',
              width: `${((stepIndex + 1) / STEPS.length) * 100}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(200,125,112,0.15)', color: '#C87D70' }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-sans font-semibold" style={{ color: '#F6F3EB' }}>
                {step.title}
              </span>
            </div>
            <button
              onClick={dismiss}
              className="p-1 rounded-lg cursor-pointer transition"
              style={{ color: 'rgba(221,215,203,0.4)' }}
              aria-label="Skip tutorial"
              title="Skip tutorial (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Body */}
          <p className="text-[12px] font-sans leading-relaxed mb-2.5" style={{ color: 'rgba(221,215,203,0.8)' }}>
            {step.body}
          </p>

          {/* Tip */}
          <p className="text-[10px] font-sans" style={{ color: 'rgba(221,215,203,0.4)', fontStyle: 'italic' }}>
            {step.tip}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(221,215,203,0.06)' }}>
            <span className="text-[9px] font-sans tracking-widest" style={{ color: 'rgba(221,215,203,0.3)' }}>
              {stepIndex + 1} / {STEPS.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={dismiss}
                className="text-[10px] font-sans cursor-pointer transition"
                style={{ color: 'rgba(221,215,203,0.4)' }}
              >
                Skip
              </button>
              <button
                onClick={advance}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-sans font-semibold cursor-pointer transition-all"
                style={{ background: '#C87D70', color: '#F6F3EB' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#D88D80'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#C87D70'; }}
                autoFocus
              >
                {isLast ? 'Start Playing' : 'Next'}
                {!isLast && <ChevronRight className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
