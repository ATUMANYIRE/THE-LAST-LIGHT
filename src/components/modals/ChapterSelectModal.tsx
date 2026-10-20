'use client';

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { ALL_CHAPTERS } from '../../engine/levels';
import { Map, X, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

export const ChapterSelectModal: React.FC = () => {
  const {
    showChapterSelect,
    openChapterSelect,
    currentChapterId,
    unlockedChapters,
    completedChapters,
    loadChapter,
  } = useGameStore();

  if (!showChapterSelect) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chapter-select-title"
      data-testid="chapter-select-modal"
    >
      <div className="w-full max-w-lg bg-midnight-900 border border-midnight-700 rounded-3xl p-6 sm:p-7 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-midnight-800 mb-5">
          <div className="flex items-center space-x-2">
            <Map className="w-5 h-5 text-dusk-lavender" />
            <h2 id="chapter-select-title" className="text-lg font-bold text-slate-100">
              District Map & Chapters
            </h2>
          </div>
          <button
            onClick={() => openChapterSelect(false)}
            className="p-1.5 rounded-lg bg-midnight-800 hover:bg-midnight-700 text-slate-400 hover:text-slate-100 transition"
            aria-label="Close chapter selector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col space-y-3.5">
          {ALL_CHAPTERS.map((ch) => {
            const isUnlocked = unlockedChapters.includes(ch.id);
            const isCompleted = completedChapters.includes(ch.id);
            const isCurrent = currentChapterId === ch.id;

            return (
              <div
                key={ch.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-amber-500/10 border-glow-amber ring-1 ring-glow-amber'
                    : isUnlocked
                    ? 'bg-midnight-950/70 border-midnight-700 hover:border-midnight-500'
                    : 'bg-midnight-950/30 border-midnight-900 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-midnight-800 text-glow-soft font-mono font-bold">
                        Chapter {ch.chapterNumber}
                      </span>
                      <h3 className="text-sm font-bold text-slate-100">{ch.title}</h3>
                    </div>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      {ch.districtName}
                    </p>
                    <p className="text-[11px] text-slate-400 italic mt-0.5">
                      "{ch.tagline}"
                    </p>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    {isCompleted && (
                      <span className="inline-flex items-center space-x-1 text-xs text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completed</span>
                      </span>
                    )}

                    {!isUnlocked && (
                      <span className="inline-flex items-center space-x-1 text-xs text-slate-500 font-semibold">
                        <Lock className="w-4 h-4" />
                        <span>Locked</span>
                      </span>
                    )}

                    {isUnlocked && (
                      <button
                        onClick={() => loadChapter(ch.id)}
                        data-testid={`load-chapter-${ch.id}`}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                          isCurrent
                            ? 'bg-glow-amber text-slate-950'
                            : 'bg-midnight-800 hover:bg-midnight-700 text-slate-200'
                        }`}
                      >
                        <span>{isCurrent ? 'Playing' : 'Play'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
