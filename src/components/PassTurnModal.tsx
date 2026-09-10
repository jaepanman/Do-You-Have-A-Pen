import React from 'react';
import { ArrowRight, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { playCardFlipSound } from '../utils/audio';

interface PassTurnModalProps {
  isOpen: boolean;
  nextPlayerName: string;
  onReady: () => void;
  showJapanese: boolean;
}

export const PassTurnModal: React.FC<PassTurnModalProps> = ({
  isOpen,
  nextPlayerName,
  onReady,
  showJapanese,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="pass-turn-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-amber-400 text-center relative">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center mx-auto mb-3 shadow-inner">
          <ShieldAlert className="w-8 h-8 text-amber-700 animate-pulse" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
          Pass & Play
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Fredoka',sans-serif] mt-2 mb-1">
          Pass Device to {nextPlayerName}!
        </h2>

        {showJapanese && (
          <p className="text-sm font-bold text-slate-600 mb-4">
            端末を {nextPlayerName} に渡してください（相手のカードを見ないでね！）
          </p>
        )}

        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-slate-700 text-xs sm:text-sm font-semibold my-4 text-left space-y-1">
          <div>🙈 Keep your secret identity hidden!</div>
          <div>🗣️ Remember to ask: <em>"Do you have a...?"</em></div>
          <div>👂 Listen carefully to your partner's answer!</div>
        </div>

        <button
          type="button"
          onClick={() => {
            playCardFlipSound();
            onReady();
          }}
          className="w-full py-4 px-6 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 font-['Fredoka',sans-serif]"
        >
          <UserCheck className="w-6 h-6" />
          <span>I'm {nextPlayerName} — Ready!</span>
        </button>
      </div>
    </div>
  );
};
