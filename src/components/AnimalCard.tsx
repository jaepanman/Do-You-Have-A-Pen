import React from 'react';
import { AnimalIdentity, SupplyId } from '../types';
import { SUPPLY_MAP } from '../data/gameData';
import { SupplyIcon } from './SupplyIcon';
import { HelpCircle, Check, X, RotateCcw } from 'lucide-react';

interface AnimalCardProps {
  animal: AnimalIdentity;
  isEliminated: boolean;
  isTarget?: boolean;
  showJapanese: boolean;
  highlightedSupplyId?: SupplyId | null;
  onToggleEliminate: (id: string) => void;
  onGuessAnimal: (animal: AnimalIdentity) => void;
}

export const AnimalCard: React.FC<AnimalCardProps> = ({
  animal,
  isEliminated,
  showJapanese,
  highlightedSupplyId,
  onToggleEliminate,
  onGuessAnimal,
}) => {
  const hasHighlighted = highlightedSupplyId
    ? animal.supplies.includes(highlightedSupplyId)
    : false;

  return (
    <div
      id={`animal-card-${animal.id}`}
      className={`relative group rounded-2xl p-2.5 transition-all duration-300 flex flex-col justify-between select-none border-2 shadow-sm ${
        isEliminated
          ? 'bg-slate-100/90 border-slate-300 opacity-40 grayscale filter hover:opacity-75'
          : `bg-gradient-to-b ${animal.colorBg} ${animal.colorBorder} hover:shadow-md hover:-translate-y-0.5`
      } ${
        highlightedSupplyId && !isEliminated
          ? hasHighlighted
            ? 'ring-4 ring-emerald-400 scale-[1.02]'
            : 'ring-2 ring-rose-300 opacity-60'
          : ''
      }`}
    >
      {/* Top row: Avatar + Name + Elimination toggle */}
      <div className="flex items-start justify-between gap-1 mb-1">
        <div className="flex items-center gap-2">
          <span className="text-3xl filter drop-shadow-sm transition-transform duration-200 group-hover:scale-110">
            {animal.emoji}
          </span>
          <div>
            <h3 className="font-bold text-slate-800 text-base leading-tight font-['Fredoka',sans-serif]">
              {animal.name}
            </h3>
            {showJapanese && (
              <p className="text-[11px] text-slate-500 font-medium leading-none">
                {animal.japaneseName}
              </p>
            )}
          </div>
        </div>

        {/* Card Flip / Eliminate Toggle Button */}
        <button
          id={`toggle-btn-${animal.id}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleEliminate(animal.id);
          }}
          title={isEliminated ? 'Restore character' : 'Eliminate character'}
          className={`p-1.5 rounded-full transition-colors ${
            isEliminated
              ? 'bg-slate-300 hover:bg-slate-400 text-slate-700'
              : 'bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 shadow-xs'
          }`}
        >
          {isEliminated ? (
            <RotateCcw className="w-3.5 h-3.5" />
          ) : (
            <X className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* 4 School Supplies badges */}
      <div className="bg-white/80 backdrop-blur-xs rounded-xl p-1.5 mb-2 border border-slate-200/70">
        <div className="grid grid-cols-2 gap-1">
          {animal.supplies.map((supId) => {
            const supply = SUPPLY_MAP.get(supId);
            if (!supply) return null;
            const isMatch = highlightedSupplyId === supId;

            return (
              <div
                key={supId}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[11px] font-semibold border transition-all ${
                  isMatch
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-400 ring-1 ring-emerald-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200/80'
                }`}
              >
                <SupplyIcon id={supId} size="sm" />
                <span className="truncate capitalize font-['Nunito',sans-serif]">
                  {supply.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom action: Are you...? Guess button */}
      {!isEliminated ? (
        <button
          id={`guess-btn-${animal.id}`}
          type="button"
          onClick={() => onGuessAnimal(animal)}
          className="w-full py-1 px-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 active:scale-98 transition-all flex items-center justify-center gap-1 border border-amber-300 shadow-2xs"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
          <span>Guess</span>
        </button>
      ) : (
        <div
          onClick={() => onToggleEliminate(animal.id)}
          className="w-full py-1 text-center text-xs font-bold text-slate-400 flex items-center justify-center gap-1 cursor-pointer hover:text-slate-600"
        >
          <X className="w-3.5 h-3.5" />
          <span>Eliminated</span>
        </div>
      )}

      {/* Large Stamp overlay if eliminated */}
      {isEliminated && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="transform -rotate-12 border-2 border-rose-500/60 rounded-xl px-3 py-1 bg-rose-50/70 text-rose-600 font-extrabold text-xs tracking-wider uppercase font-['Fredoka',sans-serif]">
            Eliminated
          </div>
        </div>
      )}
    </div>
  );
};
