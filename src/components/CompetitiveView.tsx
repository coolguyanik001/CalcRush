import React from 'react';
import { Swords } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CompetitiveLevelMap } from './CompetitiveLevelMap';

export const CompetitiveView: React.FC = () => {
  const { user } = useApp();
  const currentLevel = user?.competitiveLevel || 1;

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
      {/* Competitive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#0D1219] border border-[#202833]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-[#111720] border border-[#202833] text-cyan-400">
              <Swords className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#F5F7FA]">
              Competitive Progression
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#8B95A5]">
            10 progressive tiers. Satisfy accuracy & speed criteria to advance.
          </p>
        </div>

        {/* Current Standing Pill */}
        <div className="flex items-center space-x-3 bg-[#111720] p-3 rounded-xl border border-[#202833] self-start sm:self-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8B95A5] block">Rating</span>
            <span className="text-lg font-bold font-math text-cyan-400">
              ⚡ {user?.competitiveRating || 1000}
            </span>
          </div>
          <div className="h-8 w-px bg-[#202833]" />
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8B95A5] block">Tier</span>
            <span className="text-lg font-bold font-math text-[#F5F7FA]">
              L{currentLevel} / 10
            </span>
          </div>
        </div>
      </div>

      {/* 10-Level Visual Roadmap and Tier Cards */}
      <CompetitiveLevelMap />
    </div>
  );
};
