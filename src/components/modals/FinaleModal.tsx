'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { triggerConfetti } from '../../utils/confetti';
import { CharacterAvatar } from '../game/CharacterAvatar';
import {
  Trophy,
  Sparkles,
  Heart,
  Compass,
  RotateCcw,
  Map,
  X,
  Award,
  CheckCircle2,
} from 'lucide-react';

export const FinaleModal: React.FC = () => {
  const {
    showFinaleModal,
    openFinale,
    openChapterSelect,
    loadChapter,
    settings,
  } = useGameStore();

  useEffect(() => {
    if (showFinaleModal && !settings.reducedMotion) {
      triggerConfetti();
    }
  }, [showFinaleModal, settings.reducedMotion]);

  if (!showFinaleModal) return null;

  const residentStories = [
    {
      name: 'Maya & Sam',
      district: 'Chapter 1: Clocktower Quarter',
      avatar: 'sam',
      barrier: 'Steep sunken stone steps',
      solution: 'Modular curb ramp & smooth paving',
      takeaway: 'The Curb-Cut Effect: When we design for wheelchair users, we ease the way for strollers, travelers, and deliveries alike.',
    },
    {
      name: 'Kai & Elena',
      district: 'Chapter 2: Neon Avenue',
      avatar: 'elena',
      barrier: 'Silent electric traffic & no tactile guides',
      solution: 'Acoustic pedestrian beacons & tactile ground pavers',
      takeaway: 'Multisensory Information: Safe transit must speak to sight, touch, and sound simultaneously.',
    },
    {
      name: 'Maya, Sam & Mr. Henderson',
      district: 'Chapter 3: St. Jude Civic Common',
      avatar: 'henderson',
      barrier: 'Rolling blackout & cardiopulmonary fatigue',
      solution: 'Warm solar luminaries & frequent resting benches',
      takeaway: 'Civic Stamina: Rest stops and gentle lighting are fundamental health infrastructure, not aesthetic luxuries.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-midnight-950/90 backdrop-blur-lg overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="finale-title"
      data-testid="finale-modal"
    >
      <div className="w-full max-w-2xl bg-midnight-900 border-2 border-glow-amber/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-300">
        {/* Amber beacon flare */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-glow-amber/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-civic-emerald/20 blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-midnight-800 mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-glow-amber to-amber-600 text-slate-950 shadow-lantern">
              <Award className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <span className="text-xs font-bold text-glow-warm uppercase tracking-widest block">
                Grand Finale Commendation
              </span>
              <h2 id="finale-title" className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                Universal City Achieved
              </h2>
            </div>
          </div>
          <button
            onClick={() => openFinale(false)}
            className="p-2 rounded-xl bg-midnight-800 hover:bg-midnight-700 text-slate-400 hover:text-slate-100 transition"
            aria-label="Close finale modal"
            data-testid="close-finale-button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-midnight-950/70 to-emerald-500/15 border border-glow-amber/40 mb-6">
          <div className="flex items-center space-x-2 text-glow-warm text-sm font-bold mb-1.5">
            <Sparkles className="w-4 h-4 fill-amber-400" />
            <span>The City Isn’t Connected Until Everyone Can Find Their Way Home</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            You began each chapter designing for the visible traveler. But in every district, you listened to the Invisible Resident—the neighbor whose needs were left out of standard municipal blueprints. By transforming steps into ramps, silent roads into acoustic crossings, and dark corridors into illuminated benches, you realized the promise of Universal Design.
          </p>
        </div>

        {/* Civics Metrics Matrix */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-midnight-950/80 border border-midnight-800 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
              Districts Connected
            </span>
            <span className="text-xl font-mono font-black text-glow-warm">
              3 / 3
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-midnight-950/80 border border-midnight-800 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
              Neighbors Empowered
            </span>
            <span className="text-xl font-mono font-black text-emerald-400">
              6 / 6
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-midnight-950/80 border border-midnight-800 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
              Barriers Eliminated
            </span>
            <span className="text-xl font-mono font-black text-civic-sky">
              100%
            </span>
          </div>
        </div>

        {/* Resident Journeys Carousel / List */}
        <div className="space-y-3 mb-6 max-h-56 overflow-y-auto pr-1">
          {residentStories.map((story) => (
            <div
              key={story.name}
              className="p-3.5 rounded-xl bg-midnight-950/60 border border-midnight-800 hover:border-midnight-700 transition"
            >
              <div className="flex items-start space-x-3">
                <CharacterAvatar avatarKey={story.avatar} size={42} alt={`${story.name} avatar`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">{story.name}</span>
                    <span className="text-[10px] text-glow-soft font-mono px-2 py-0.5 rounded bg-midnight-800">
                      {story.district}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    <strong className="text-red-300">Barrier:</strong> {story.barrier} →{' '}
                    <strong className="text-emerald-300">Solution:</strong> {story.solution}
                  </p>
                  <p className="text-[11px] text-slate-400 italic mt-1 leading-snug">
                    "{story.takeaway}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Girls Who Code HHS Hackathon Dedication */}
        <div className="p-3.5 rounded-xl bg-midnight-950/90 border border-midnight-800 flex items-center justify-between text-xs text-slate-400 mb-6">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
            <span>Built for Girls Who Code HHS Hackathon 2026</span>
          </div>
          <span className="text-glow-soft font-semibold font-mono">Theme: The Invisible Resident</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              openFinale(false);
              loadChapter(1);
            }}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-midnight-800 hover:bg-midnight-700 border border-midnight-600 text-slate-200 font-semibold text-xs flex items-center justify-center space-x-2 transition"
            data-testid="replay-from-chapter-1"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay From Chapter 1</span>
          </button>

          <button
            onClick={() => {
              openFinale(false);
              openChapterSelect(true);
            }}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-glow-amber to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide flex items-center justify-center space-x-2 shadow-lantern transition-all"
            data-testid="explore-district-map"
          >
            <Map className="w-4 h-4 text-slate-950" />
            <span>Explore District Map & Chapters</span>
          </button>
        </div>
      </div>
    </div>
  );
};
