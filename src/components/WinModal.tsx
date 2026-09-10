import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AnimalIdentity } from '../types';
import { SUPPLY_MAP } from '../data/gameData';
import { SupplyIcon } from './SupplyIcon';
import { Trophy, Sparkles, RotateCcw, Volume2, Award } from 'lucide-react';
import { speakEnglish, playWinFanfare } from '../utils/audio';

interface WinModalProps {
  winner: string;
  secretAnimal: AnimalIdentity;
  turnCount: number;
  isOpen: boolean;
  onPlayAgain: () => void;
  showJapanese: boolean;
}

export const WinModal: React.FC<WinModalProps> = ({
  winner,
  secretAnimal,
  turnCount,
  isOpen,
  onPlayAgain,
  showJapanese,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Launch confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.debug('Confetti error', e);
      }
      playWinFanfare();
      speakEnglish(`Congratulations! ${winner} discovered ${secretAnimal.article} ${secretAnimal.name}!`);
    }
  }, [isOpen, winner, secretAnimal]);

  if (!isOpen) return null;

  return (
    <div
      id="win-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in"
    >
      <div
        id="win-modal-content"
        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-amber-400 text-center relative overflow-hidden"
      >
        {/* Floating trophy / stars */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center mb-3 shadow-inner">
          <Trophy className="w-10 h-10 text-amber-600 animate-bounce" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-amber-800 bg-amber-200/80 px-4 py-1 rounded-full">
          Game Complete!
        </span>

        <h1 className="text-3xl font-black text-slate-900 font-['Fredoka',sans-serif] mt-2 mb-1">
          {winner} Wins!
        </h1>

        {showJapanese && (
          <p className="text-sm font-bold text-amber-700">
            おめでとうございます！大正解です！
          </p>
        )}

        {/* Secret identity reveal card */}
        <div className="my-5 p-4 rounded-2xl bg-amber-50 border-2 border-amber-200">
          <div className="text-6xl mb-2 filter drop-shadow-md">
            {secretAnimal.emoji}
          </div>
          <div className="text-2xl font-black text-slate-900 font-['Fredoka',sans-serif]">
            {secretAnimal.name}
          </div>
          {showJapanese && (
            <div className="text-xs text-slate-500 font-semibold mb-3">
              {secretAnimal.japaneseName}
            </div>
          )}

          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            School Supplies:
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {secretAnimal.supplies.map((sId) => {
              const item = SUPPLY_MAP.get(sId);
              if (!item) return null;
              return (
                <div
                  key={sId}
                  className="flex items-center gap-1.5 p-1.5 rounded-xl bg-white border border-amber-200 text-xs font-bold text-slate-700"
                >
                  <SupplyIcon id={sId} size="sm" />
                  <span className="truncate capitalize">{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-500 mb-5">
          Solved in {turnCount} turns through English elimination!
        </div>

        {/* Play Again Button */}
        <button
          id="play-again-btn"
          type="button"
          onClick={onPlayAgain}
          className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-lg text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 font-['Fredoka',sans-serif]"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Play Again! (もういちど遊ぶ)</span>
        </button>
      </div>
    </div>
  );
};
