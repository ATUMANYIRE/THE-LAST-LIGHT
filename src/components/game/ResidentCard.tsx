'use client';

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { CharacterAvatar } from './CharacterAvatar';
import { CheckCircle2, AlertCircle, Clock, MapPin, Sparkles } from 'lucide-react';

export const ResidentCard: React.FC = () => {
  const { currentChapter, activeResidentIds, simulationResult } = useGameStore();

  const activeResidents = currentChapter.residents.filter((r) =>
    activeResidentIds.includes(r.id)
  );

  return (
    <div className="w-full flex flex-col space-y-3 bg-midnight-900/90 rounded-2xl border border-midnight-700/80 p-4 sm:p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-midnight-800 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Travelers in the District
          </h2>
          <p className="text-xs text-slate-400">
            {activeResidents.length} resident(s) seeking their way home
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-midnight-800 text-glow-soft border border-midnight-700 font-medium">
          Target: {activeResidents[0]?.destinationLabel || 'Shelter'}
        </span>
      </div>

      <div className="flex flex-col space-y-2.5">
        {activeResidents.map((resident) => {
          const simRes = simulationResult?.residentResults.find(
            (r) => r.residentId === resident.id
          );

          const isSuccess = simRes?.success;
          const isFailed = simRes && !simRes.success;

          return (
            <div
              key={resident.id}
              className={`p-3 rounded-xl border transition-colors ${
                isSuccess
                  ? 'bg-emerald-950/40 border-emerald-500/60'
                  : isFailed
                  ? 'bg-red-950/40 border-red-500/60'
                  : 'bg-midnight-950/60 border-midnight-800'
              }`}
            >
              <div className="flex items-start space-x-3">
                <CharacterAvatar
                  avatarKey={resident.avatarKey}
                  size={44}
                  alt={`${resident.name} portrait`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <h3 className="text-sm font-bold text-slate-100 truncate">
                        {resident.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ({resident.pronouns})
                      </span>
                    </div>

                    {/* Status badge */}
                    {isSuccess && (
                      <span className="inline-flex items-center space-x-1 text-xs text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Arrived</span>
                      </span>
                    )}
                    {isFailed && (
                      <span className="inline-flex items-center space-x-1 text-xs text-red-400 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Blocked</span>
                      </span>
                    )}
                    {!simRes && (
                      <span className="inline-flex items-center space-x-1 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>At Home ({resident.startPosition.x}, {resident.startPosition.y})</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    {resident.role}
                  </p>

                  <div className="mt-2 text-[11px] px-2.5 py-1 rounded-md bg-midnight-900 border border-midnight-700/80 text-glow-soft">
                    <span className="font-semibold text-slate-200">Environmental Needs: </span>
                    {resident.accessibilityNeed}
                  </div>

                  {isFailed && simRes.failureReason && (
                    <div className="mt-2 text-xs text-red-300 bg-red-950/80 border border-red-800/80 p-2 rounded-md font-medium">
                      ⚠️ {simRes.failureReason}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
