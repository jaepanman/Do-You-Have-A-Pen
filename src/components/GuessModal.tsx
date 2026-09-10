import React, { useState, useEffect } from 'react';
import { AnimalIdentity, GameMode } from '../types';
import { getAnimalQuestion } from '../data/gameData';
import { Volume2, Check, X, Sparkles, AlertCircle } from 'lucide-react';
import { speakEnglish, playYesChime, playNoTone, playWinFanfare, playClickSound } from '../utils/audio';

interface GuessModalProps {
  targetAnimal: AnimalIdentity | null;
  isOpen: boolean;
  gameMode: GameMode;
  opponentSecretAnimal?: AnimalIdentity;
  showJapanese: boolean;
  opponentName?: string;
  onClose: () => void;
  onConfirmGuess: (isCorrect: boolean) => void;
  onTwoDeviceSendGuess?: (animalId: string) => void;
}

export const GuessModal: React.FC<GuessModalProps> = ({
  targetAnimal,
  isOpen,
  gameMode,
  opponentSecretAnimal,
  showJapanese,
  opponentName,
  onClose,
  onConfirmGuess,
  onTwoDeviceSendGuess,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen || !targetAnimal) return null;

  const { question, japanese, yesResponse, noResponse } = getAnimalQuestion(targetAnimal);

  const handleSpeak = (text: string) => {
    setIsSpeaking(true);
    speakEnglish(text, {
      onEnd: () => setIsSpeaking(false),
    });
  };

  useEffect(() => {
    if (isOpen) {
      handleSpeak(question);
      setFeedbackMessage(null);
    }
  }, [isOpen, targetAnimal.id]);

  const handlePartnerResponse = (isCorrect: boolean) => {
    if (isCorrect) {
      playWinFanfare();
      speakEnglish('Yes, I am! You win!');
      onConfirmGuess(true);
    } else {
      playNoTone();
      speakEnglish("No, I'm not.");
      setFeedbackMessage(`Nope! Opponent is NOT ${targetAnimal.article} ${targetAnimal.name}!`);
      setTimeout(() => {
        onConfirmGuess(false);
      }, 1400);
    }
  };

  const handleComputerCheck = () => {
    if (!opponentSecretAnimal) return;
    const isCorrect = opponentSecretAnimal.id === targetAnimal.id;
    handlePartnerResponse(isCorrect);
  };

  return (
    <div
      id="guess-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="guess-modal-content"
        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-amber-400 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          id="close-guess-modal"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animal Avatar */}
        <div className="flex flex-col items-center text-center mb-4">
          <div className="text-6xl mb-2 filter drop-shadow-md animate-bounce">
            {targetAnimal.emoji}
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full mb-1">
            Identity Guess
          </span>

          {/* Question speech bubble */}
          <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200 w-full mt-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Fredoka',sans-serif]">
              "{question}"
            </h2>

            {showJapanese && (
              <p className="text-sm font-semibold text-slate-600 mt-1">
                {japanese}
              </p>
            )}

            {/* TTS Button */}
            <div className="mt-3 flex items-center justify-center">
              <button
                id="tts-guess-btn"
                type="button"
                onClick={() => handleSpeak(question)}
                className="px-4 py-2 rounded-xl font-bold text-sm bg-amber-400 hover:bg-amber-500 text-slate-900 flex items-center gap-2 shadow-sm transition-transform active:scale-95"
              >
                <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-bounce' : ''}`} />
                <span>Listen to English (TTS)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feedback message if wrong */}
        {feedbackMessage && (
          <div className="mb-4 p-3 bg-rose-100 border-2 border-rose-300 rounded-2xl text-center text-rose-900 font-extrabold text-sm flex items-center justify-center gap-2 animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Responses */}
        {!feedbackMessage && (
          <div>
            {gameMode === 'two_device' ? (
              <div className="space-y-3">
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-center text-xs text-indigo-900 font-medium">
                  🎯 Guess that <strong>{opponentName || 'your partner'}</strong> is {targetAnimal.article} {targetAnimal.name}!
                  {showJapanese && <div className="text-[11px] text-indigo-700 mt-0.5">相手の画面に推理が送信されます。</div>}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    if (onTwoDeviceSendGuess) {
                      onTwoDeviceSendGuess(targetAnimal.id);
                    }
                    onClose();
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl font-black text-base text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 shadow-md border-2 border-indigo-700 flex items-center justify-center gap-2 font-['Fredoka',sans-serif] transition-all cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Send Guess to {opponentName || 'Partner'}!</span>
                  {showJapanese && <span className="text-xs font-normal">（正体を推理する）</span>}
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center mb-2 font-['Fredoka',sans-serif]">
                  {gameMode === 'vs_computer'
                    ? 'Check with computer opponent'
                    : 'What did your partner say?'}
                </p>

                {gameMode === 'vs_computer' ? (
                  <button
                    id="computer-guess-submit-btn"
                    type="button"
                    onClick={handleComputerCheck}
                    className="w-full py-3.5 px-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 font-['Fredoka',sans-serif]"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Make My Guess!</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      id="guess-response-yes-btn"
                      type="button"
                      onClick={() => handlePartnerResponse(true)}
                      className="flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 border-emerald-400 bg-emerald-50 hover:bg-emerald-100 active:scale-98 transition-all shadow-sm"
                    >
                      <Check className="w-7 h-7 text-emerald-600 stroke-[3] mb-1" />
                      <span className="text-base font-extrabold text-emerald-900 font-['Fredoka',sans-serif]">
                        Yes, I am! 🎉
                      </span>
                      {showJapanese && (
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          当たり！（正解）
                        </span>
                      )}
                    </button>

                    <button
                      id="guess-response-no-btn"
                      type="button"
                      onClick={() => handlePartnerResponse(false)}
                      className="flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 border-rose-400 bg-rose-50 hover:bg-rose-100 active:scale-98 transition-all shadow-sm"
                    >
                      <X className="w-7 h-7 text-rose-600 stroke-[3] mb-1" />
                      <span className="text-base font-extrabold text-rose-900 font-['Fredoka',sans-serif]">
                        No, I'm not! ❌
                      </span>
                      {showJapanese && (
                        <span className="text-[11px] text-rose-700 font-semibold">
                          ハズレ（違います）
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
