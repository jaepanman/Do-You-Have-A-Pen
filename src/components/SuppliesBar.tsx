import React from 'react';
import { SchoolSupply, SupplyId } from '../types';
import { SCHOOL_SUPPLIES } from '../data/gameData';
import { SupplyIcon } from './SupplyIcon';
import { MessageCircleQuestion, Volume2, CheckCircle2 } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface SuppliesBarProps {
  onSelectSupply: (supply: SchoolSupply) => void;
  askedSupplyIds: SupplyId[];
  showJapanese: boolean;
  activeSupplyHover: SupplyId | null;
  setActiveSupplyHover: (id: SupplyId | null) => void;
}

export const SuppliesBar: React.FC<SuppliesBarProps> = ({
  onSelectSupply,
  askedSupplyIds,
  showJapanese,
  activeSupplyHover,
  setActiveSupplyHover,
}) => {
  return (
    <section className="bg-white rounded-2xl p-3 border-2 border-amber-200/80 shadow-sm mb-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 pb-2 border-b border-amber-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <MessageCircleQuestion className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-extrabold text-slate-800 font-['Fredoka',sans-serif] flex items-center gap-2">
              <span>Ask a Question</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                "Do you have a...?"
              </span>
            </h2>
            {showJapanese && (
              <p className="text-xs text-slate-500 font-medium">
                アイテムをクリックして相手に質問しよう！
              </p>
            )}
          </div>
        </div>
        <div className="text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-full">
          Asked: {askedSupplyIds.length} / {SCHOOL_SUPPLIES.length}
        </div>
      </div>

      {/* Grid of 12 School Supplies */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
        {SCHOOL_SUPPLIES.map((supply) => {
          const isAsked = askedSupplyIds.includes(supply.id);
          const isHovered = activeSupplyHover === supply.id;

          return (
            <button
              id={`supply-btn-${supply.id}`}
              key={supply.id}
              type="button"
              onClick={() => {
                playClickSound();
                onSelectSupply(supply);
              }}
              onMouseEnter={() => setActiveSupplyHover(supply.id)}
              onMouseLeave={() => setActiveSupplyHover(null)}
              className={`relative group flex flex-col items-center justify-center p-2 rounded-xl text-center border-2 transition-all duration-200 cursor-pointer ${
                isHovered
                  ? 'border-amber-400 bg-amber-50 shadow-md -translate-y-0.5 scale-105'
                  : isAsked
                  ? 'border-slate-200 bg-slate-50/80 opacity-75 hover:opacity-100'
                  : 'border-amber-100 hover:border-amber-300 bg-white hover:bg-amber-50/50 shadow-2xs'
              }`}
            >
              {/* Asked Check badge */}
              {isAsked && (
                <div className="absolute top-1 right-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                </div>
              )}

              {/* Icon */}
              <div className="p-1.5 rounded-lg bg-amber-50/60 group-hover:bg-white transition-colors mb-1">
                <SupplyIcon id={supply.id} size="md" />
              </div>

              {/* English Name with article */}
              <span className="text-xs font-bold text-slate-800 leading-tight group-hover:text-amber-950 font-['Nunito',sans-serif]">
                <span className="text-[10px] text-amber-700 font-medium block uppercase tracking-wider">
                  {supply.article}
                </span>
                {supply.name}
              </span>

              {/* Japanese translation */}
              {showJapanese && (
                <span className="text-[10px] text-slate-500 font-medium truncate max-w-[80px] mt-0.5">
                  {supply.japaneseName}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
