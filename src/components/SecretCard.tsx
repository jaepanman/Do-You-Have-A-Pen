import React, { useState } from 'react';
import { AnimalIdentity } from '../types';
import { SUPPLY_MAP } from '../data/gameData';
import { SupplyIcon } from './SupplyIcon';
import { Eye, EyeOff, ShieldCheck, Sparkles, Shuffle } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface SecretCardProps {
  secretAnimal: AnimalIdentity;
  playerName: string;
  showJapanese: boolean;
  onReroll?: () => void;
  canReroll?: boolean;
}

export const SecretCard: React.FC<SecretCardProps> = ({
  secretAnimal,
  playerName,
  showJapanese,
  onReroll,
  canReroll = false,
}) => {
  const [isRevealed, setIsRevealed] = useState(true);

  const cardTitle = (() => {
    const trimmed = (playerName || '').trim();
    if (!trimmed || trimmed.toLowerCase() === 'you' || trimmed.toLowerCase() === 'your' || trimmed.toLowerCase() === "your's") {
      return 'Your Secret Card';
    }
    if (trimmed.endsWith("'s") || trimmed.endsWith("’s")) {
      return `${trimmed} Secret Card`;
    }
    return `${trimmed}'s Secret Card`;
  })();

  return (
    <div
      id="secret-identity-card"
      className="bg-white rounded-2xl p-3 border-2 border-amber-300 shadow-sm relative overflow-hidden"
    >
      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-amber-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span className="font-['Fredoka',sans-serif] uppercase tracking-wide">
            {cardTitle}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {canReroll && onReroll && (
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onReroll();
              }}
              className="p-1 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Change Animal"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="text-[11px]">Change</span>
            </button>
          )}

          <button
            id="toggle-secret-visibility-btn"
            type="button"
            onClick={() => {
              playClickSound();
              setIsRevealed(!isRevealed);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 bg-amber-50 hover:bg-amber-100 transition-colors"
          >
            {isRevealed ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Peek</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isRevealed ? (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Animal avatar */}
          <div className="flex items-center gap-2">
            <span className="text-4xl filter drop-shadow-sm">{secretAnimal.emoji}</span>
            <div>
              <div className="text-xs font-semibold text-slate-400">You are:</div>
              <div className="text-lg font-extrabold text-slate-900 font-['Fredoka',sans-serif] leading-tight">
                {secretAnimal.name}
              </div>
              {showJapanese && (
                <div className="text-xs text-slate-500 font-medium">
                  {secretAnimal.japaneseName}
                </div>
              )}
            </div>
          </div>

          {/* Supplies list */}
          <div className="w-full sm:w-auto flex-1 bg-amber-50/70 rounded-xl p-1.5 border border-amber-200">
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800 mb-1">
              Your School Supplies (4 items):
            </div>
            <div className="grid grid-cols-2 gap-1">
              {secretAnimal.supplies.map((supId) => {
                const supply = SUPPLY_MAP.get(supId);
                if (!supply) return null;

                return (
                  <div
                    key={supId}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white text-slate-800 text-xs font-bold border border-amber-200/80 shadow-2xs"
                  >
                    <SupplyIcon id={supId} size="sm" />
                    <span className="truncate capitalize">{supply.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsRevealed(true)}
          className="py-6 px-4 text-center cursor-pointer hover:bg-amber-50/40 rounded-xl border border-dashed border-amber-200 transition-colors"
        >
          <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-sm">
            <EyeOff className="w-5 h-5 text-amber-500" />
            <span>Card Hidden (Click "Peek" to view your character)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Keep secret from your partner!
          </p>
        </div>
      )}
    </div>
  );
};
