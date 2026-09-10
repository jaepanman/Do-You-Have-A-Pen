import React, { useState, useEffect } from 'react';
import { SchoolSupply, AnimalIdentity, GameMode } from '../types';
import { SupplyIcon } from './SupplyIcon';
import { getSupplyQuestion } from '../data/gameData';
import { Volume2, Check, X, Sparkles, HelpCircle, Loader2 } from 'lucide-react';
import { speakEnglish, playYesChime, playNoTone, playCardFlipSound, playClickSound } from '../utils/audio';

interface QuestionModalProps {
  supply: SchoolSupply;
  isOpen: boolean;
  gameMode: GameMode;
  opponentSecretAnimal?: AnimalIdentity;
  activeAnimals: AnimalIdentity[];
  showJapanese: boolean;
  opponentName?: string;
  onClose: () => void;
  onAnswer: (hasSupply: boolean) => void;
  onTwoDeviceSendQuestion?: (supplyId: string) => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  supply,
  isOpen,
  gameMode,
  opponentSecretAnimal,
  activeAnimals,
  showJapanese,
  opponentName,
  onClose,
  onAnswer,
  onTwoDeviceSendQuestion,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [computerThinking, setComputerThinking] = useState(false);
  const [computerAnswer, setComputerAnswer] = useState<boolean | null>(null);

  const { question, japanese, yesResponse, noResponse } = getSupplyQuestion(supply);

  // Calculate elimination impact
  const countWithItem = activeAnimals.filter((a) => a.supplies.includes(supply.id)).length;
  const countWithoutItem = activeAnimals.length - countWithItem;

  const handleSpeak = (text: string) => {
    setIsSpeaking(true);
    speakEnglish(text, {
      onEnd: () => setIsSpeaking(false),
    });
  };

  // When opened in vs_computer mode, automatically simulate the computer opponent answering
  useEffect(() => {
    if (!isOpen) {
      setComputerThinking(false);
      setComputerAnswer(null);
      return;
    }

    // Auto-read the question aloud to model pronunciation for elementary student
    handleSpeak(question);

    if (gameMode === 'vs_computer' && opponentSecretAnimal) {
      setComputerThinking(true);
      const timer = setTimeout(() => {
        const hasIt = opponentSecretAnimal.supplies.includes(supply.id);
        setComputerAnswer(hasIt);
        setComputerThinking(false);
        // Opponent speaks their answer
        const responseText = hasIt ? yesResponse : noResponse;
        if (hasIt) {
          playYesChime();
        } else {
          playNoTone();
        }
        speakEnglish(responseText);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, supply.id, gameMode, opponentSecretAnimal]);

  if (!isOpen) return null;

  return (
    <div
      id="question-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="question-modal-content"
        className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border-4 border-amber-300 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corner flair */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-100 rounded-full pointer-events-none opacity-60" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-amber-100 rounded-full pointer-events-none opacity-60" />

        {/* Close button */}
        <button
          id="close-question-modal"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Supply Icon & Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center shadow-inner mb-3">
            <SupplyIcon id={supply.id} size="xl" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full mb-1">
            Question Prompt
          </span>

          {/* Main Question Bubble */}
          <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200 w-full mt-2 relative">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Fredoka',sans-serif] tracking-tight">
              "{question}"
            </div>

            {showJapanese && (
              <div className="text-sm font-semibold text-slate-600 mt-1">
                {japanese}
              </div>
            )}

            {/* TTS Button */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                id="tts-question-btn"
                type="button"
                onClick={() => handleSpeak(question)}
                className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm ${
                  isSpeaking
                    ? 'bg-amber-500 text-white ring-4 ring-amber-300 scale-105'
                    : 'bg-amber-400 hover:bg-amber-500 text-slate-900 active:scale-95'
                }`}
              >
                <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-bounce' : ''}`} />
                <span>{isSpeaking ? 'Speaking...' : 'Listen to English (TTS)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Partner Response Section */}
        <div className="mb-4">
          <div className="text-center mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-['Fredoka',sans-serif]">
              {gameMode === 'vs_computer'
                ? 'Computer Opponent Response'
                : "What did your partner answer?"}
            </p>
          </div>

          {/* Computer mode thinking state */}
          {gameMode === 'vs_computer' && computerThinking && (
            <div className="flex items-center justify-center gap-2 py-4 text-slate-600 font-bold">
              <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
              <span>Checking school bag...</span>
            </div>
          )}

          {/* Computer mode answered state */}
          {gameMode === 'vs_computer' && !computerThinking && computerAnswer !== null && (
            <div
              className={`p-4 rounded-2xl border-2 text-center mb-3 animate-in zoom-in-95 ${
                computerAnswer
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-2xl">{computerAnswer ? '🎉' : '💭'}</span>
                <span className="text-2xl font-black font-['Fredoka',sans-serif]">
                  "{computerAnswer ? yesResponse : noResponse}"
                </span>
                <button
                  type="button"
                  onClick={() => handleSpeak(computerAnswer ? yesResponse : noResponse)}
                  className="p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-xs"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {showJapanese && (
                <div className="text-xs font-bold text-slate-600">
                  {computerAnswer ? 'はい、もっています。' : 'いいえ、もっていません。'}
                </div>
              )}

              <p className="text-xs mt-2 font-medium">
                {computerAnswer
                  ? `👉 Eliminating ${countWithoutItem} animals that do not have ${supply.article} ${supply.name}.`
                  : `👉 Eliminating ${countWithItem} animals that have ${supply.article} ${supply.name}.`}
              </p>

              <button
                id="apply-computer-answer-btn"
                type="button"
                onClick={() => {
                  playCardFlipSound();
                  onAnswer(computerAnswer);
                }}
                className="mt-3 w-full py-2.5 rounded-xl font-extrabold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md active:scale-98 transition-all"
              >
                Apply Elimination & Continue!
              </button>
            </div>
          )}

          {/* Two-Device Mode: Send Question to Opponent's screen */}
          {gameMode === 'two_device' && (
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-center text-xs text-indigo-900 font-medium">
                📲 This question will appear on <strong>{opponentName || 'your partner'}'s</strong> device!
                {showJapanese && <div className="text-[11px] text-indigo-700 mt-0.5">相手の画面にしつもんが送信されます。</div>}
              </div>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  if (onTwoDeviceSendQuestion) {
                    onTwoDeviceSendQuestion(supply.id);
                  }
                  onClose();
                }}
                className="w-full py-3.5 px-4 rounded-2xl font-black text-base text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 shadow-md border-2 border-indigo-700 flex items-center justify-center gap-2 font-['Fredoka',sans-serif] transition-all cursor-pointer"
              >
                <span>Ask {opponentName || 'Partner'}!</span>
                {showJapanese && <span className="text-xs font-normal">（質問を送る）</span>}
                <span className="text-lg">🚀</span>
              </button>
            </div>
          )}

          {/* Two-Player / Manual Response Buttons */}
          {gameMode !== 'two_device' && (gameMode !== 'vs_computer' || computerAnswer === null) && !computerThinking && (
            <div className="grid grid-cols-2 gap-3">
              {/* YES BUTTON */}
              <button
                id="answer-yes-btn"
                type="button"
                onClick={() => {
                  playYesChime();
                  playCardFlipSound();
                  onAnswer(true);
                }}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 border-emerald-400 bg-emerald-50 hover:bg-emerald-100 active:scale-98 transition-all group shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <span className="text-lg font-extrabold text-emerald-900 font-['Fredoka',sans-serif]">
                  Yes, I do!
                </span>
                {showJapanese && (
                  <span className="text-xs text-emerald-700 font-semibold">
                    はい、もっています
                  </span>
                )}
                <span className="text-[11px] text-emerald-800/80 mt-1 font-bold">
                  (Keeps {countWithItem} cards)
                </span>
              </button>

              {/* NO BUTTON */}
              <button
                id="answer-no-btn"
                type="button"
                onClick={() => {
                  playNoTone();
                  playCardFlipSound();
                  onAnswer(false);
                }}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 border-rose-400 bg-rose-50 hover:bg-rose-100 active:scale-98 transition-all group shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                  <X className="w-6 h-6 stroke-[3]" />
                </div>
                <span className="text-lg font-extrabold text-rose-900 font-['Fredoka',sans-serif]">
                  No, I don't!
                </span>
                {showJapanese && (
                  <span className="text-xs text-rose-700 font-semibold">
                    いいえ、もっていません
                  </span>
                )}
                <span className="text-[11px] text-rose-800/80 mt-1 font-bold">
                  (Keeps {countWithoutItem} cards)
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Tip for elementary students */}
        <div className="text-center text-xs text-slate-500 font-medium bg-slate-50 p-2 rounded-xl border border-slate-200">
          💡 <strong>ALT Tip:</strong> Say the question aloud clearly to your partner!
        </div>
      </div>
    </div>
  );
};
