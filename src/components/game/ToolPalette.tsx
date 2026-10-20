'use client';

import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { ToolId } from '../../types/game';
import {
  Footprints,
  TrendingUp,
  Grid,
  Radio,
  Armchair,
  Lamp,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface ToolMeta {
  id: ToolId;
  label: string;
  hotkey: string;
  icon: React.ReactNode;
  description: string;
  inclusiveBenefit: string;
}

const ALL_TOOL_METAS: ToolMeta[] = [
  {
    id: 'paved_walkway',
    label: 'Paved Walkway',
    hotkey: '1',
    icon: <Footprints className="w-4 h-4 text-slate-200" />,
    description: 'Smooth, continuous paved flagstone walkway.',
    inclusiveBenefit: 'Provides safe, firm pedestrian footing without trip hazards.',
  },
  {
    id: 'ramp',
    label: 'Modular Ramp',
    hotkey: '2',
    icon: <TrendingUp className="w-4 h-4 text-emerald-300" />,
    description: 'Gentle curb cut or sloped ramp over steps.',
    inclusiveBenefit: 'Eliminates step barriers for wheelchairs, strollers, and carts.',
  },
  {
    id: 'tactile_paving',
    label: 'Tactile Pavers',
    hotkey: '3',
    icon: <Grid className="w-4 h-4 text-amber-300" />,
    description: 'Raised directional & hazard blister paving studs.',
    inclusiveBenefit: 'Enables white-cane users and low-vision pedestrians to detect route paths.',
  },
  {
    id: 'acoustic_beacon',
    label: 'Acoustic Signal',
    hotkey: '4',
    icon: <Radio className="w-4 h-4 text-teal-300" />,
    description: 'Audible crossing beacon with chirping locator tones.',
    inclusiveBenefit: 'Signals safe crossing times for blind and visually impaired travelers.',
  },
  {
    id: 'resting_bench',
    label: 'Resting Bench',
    hotkey: '5',
    icon: <Armchair className="w-4 h-4 text-sky-300" />,
    description: 'Ergonomic bench with sturdy support armrests.',
    inclusiveBenefit: 'Allows elders and pedestrians with cardiopulmonary fatigue to rest.',
  },
  {
    id: 'streetlamp',
    label: 'Warm Luminary',
    hotkey: '6',
    icon: <Lamp className="w-4 h-4 text-amber-300" />,
    description: 'Pedestrian streetlight casting gentle warm illumination (radius 2).',
    inclusiveBenefit: 'Dispels nighttime darkness and avoids harsh glare that disorients sensitive travelers.',
  },
  {
    id: 'demolish',
    label: 'Clear / Recycle',
    hotkey: '0',
    icon: <Trash2 className="w-4 h-4 text-red-400" />,
    description: 'Remove infrastructure and clear tile space.',
    inclusiveBenefit: 'Allows redesigning routes under budget constraints.',
  },
];

export const ToolPalette: React.FC = () => {
  const {
    currentChapter,
    phase,
    selectedTool,
    selectTool,
    budget,
    runSimulation,
    isSimulating,
  } = useGameStore();

  const availableToolIds =
    phase === 'post_reveal'
      ? currentChapter.availableToolsPostReveal
      : currentChapter.availableToolsInitial;

  const visibleTools = ALL_TOOL_METAS.filter((t) => availableToolIds.includes(t.id));

  return (
    <div className="w-full flex flex-col space-y-4 bg-midnight-900/90 rounded-2xl border border-midnight-700/80 p-4 sm:p-5 shadow-xl backdrop-blur-md">
      {/* Title & Phase Indicator */}
      <div className="flex items-center justify-between border-b border-midnight-800 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Infrastructure Toolkit
          </h2>
          <p className="text-xs text-slate-400">
            {phase === 'post_reveal'
              ? '✨ Universal Design Tools Unlocked!'
              : 'Select tool to build or clear paths'}
          </p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded bg-midnight-800 text-slate-300 border border-midnight-700 font-mono">
          Keys: [1-{visibleTools.length}]
        </span>
      </div>

      {/* Tool Selector Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {visibleTools.map((tool) => {
          const cost = currentChapter.toolCosts[tool.id] ?? 0;
          const isSelected = selectedTool === tool.id;
          const canAfford = budget >= cost;

          return (
            <button
              key={tool.id}
              data-testid={`tool-${tool.id}`}
              onClick={() => selectTool(tool.id)}
              className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-amber-500/15 border-glow-amber text-slate-100 shadow-md shadow-amber-950/40 ring-1 ring-glow-amber'
                  : 'bg-midnight-950/60 border-midnight-800 hover:border-midnight-600 text-slate-300 hover:bg-midnight-800/60'
              } ${!canAfford && !isSelected ? 'opacity-60' : ''}`}
              aria-pressed={isSelected}
              aria-label={`${tool.label}, cost $${cost}. ${tool.description}`}
            >
              <div className="flex items-start space-x-2.5">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? 'bg-amber-500/20 text-glow-warm' : 'bg-midnight-800 text-slate-300'
                  }`}
                >
                  {tool.icon}
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-semibold text-slate-100">{tool.label}</span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-midnight-800 text-slate-400 font-mono border border-midnight-700">
                      [{tool.hotkey}]
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    {tool.description}
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ml-2 ${
                  cost > 0
                    ? isSelected
                      ? 'bg-glow-amber/20 text-glow-warm border border-glow-amber/40'
                      : 'bg-midnight-800 text-slate-300 border border-midnight-700'
                    : 'text-slate-400'
                }`}
              >
                ${cost}
              </span>
            </button>
          );
        })}
      </div>

      {/* Primary Simulation CTA Button */}
      <button
        onClick={() => runSimulation()}
        disabled={isSimulating}
        data-testid="run-simulation-button"
        className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm sm:text-base tracking-wide flex items-center justify-center space-x-2.5 shadow-lantern hover:shadow-lantern-lg transition-all transform active:scale-98 disabled:opacity-50 disabled:cursor-wait"
        aria-label="Illuminate and test pathways for all residents"
      >
        <Sparkles className="w-5 h-5 fill-slate-950" />
        <span>
          {isSimulating
            ? 'Simulating Safe Journeys...'
            : phase === 'post_reveal'
            ? 'Verify Universal Accessible Route'
            : 'Illuminate & Test Pathways'}
        </span>
      </button>
    </div>
  );
};
