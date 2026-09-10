import React, { useState, useEffect } from 'react';
import { AnimalIdentity, SchoolSupply, SupplyId } from '../types';
import { SUPPLY_MAP, SCHOOL_SUPPLIES, getSupplyQuestion, getAnimalQuestion } from '../data/gameData';
import { SupplyIcon } from './SupplyIcon';
import { Bot, Volume2, Check, X, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';
import { speakEnglish, playYesChime, playNoTone } from '../utils/audio';

interface ComputerTurnModalProps {
  isOpen: boolean;
  playerSecretAnimal: AnimalIdentity;
  computerCandidates: AnimalIdentity[];
  showJapanese: boolean;
  onPlayerAnswerSupply: (supplyId: SupplyId, hasIt: boolean) => void;
  onComputerGuessPlayer: (guessedAnimal: AnimalIdentity, isCorrect: boolean) => void;
}

export const ComputerTurnModal: React.FC<ComputerTurnModalProps> = ({
  isOpen,
  playerSecretAnimal,
  computerCandidates,
  showJapanese,
  onPlayerAnswerSupply,
  onComputerGuessPlayer,
}) => {
  const [selectedSupply, setSelectedSupply] = useState<SchoolSupply | null>(null);
  const [guessAnimal, setGuessAnimal] = useState<AnimalIdentity | null>(null);
  const [, setIsSpeaking] = useState(false);
  const [isPeekingBoard, setIsPeekingBoard] = useState(false);

  // Decide computer's move when turn starts
  useEffect(() => {
    if (!isOpen) {
      setSelectedSupply(null);
      setGuessAnimal(null);
      setIsPeekingBoard(false);
      return;
    }

    // If only 1 candidate left, computer attempts to guess!
    if (computerCandidates.length === 1) {
      const target = computerCandidates[0];
      setGuessAnimal(target);
      setSelectedSupply(null);

      const q = getAnimalQuestion(target).question;
      speakEnglish(`It is my turn! Are you ${target.article} ${target.name}?`);
    } else {
      // Find the supply that splits computer's candidates as evenly as possible
      let bestSupply = SCHOOL_SUPPLIES[0];
      let bestScore = Infinity; // aim for count close to length/2

      for (const s of SCHOOL_SUPPLIES) {
        const count = computerCandidates.filter((c) => c.supplies.includes(s.id)).length;
        // Avoid supplies that eliminate 0 or all
        if (count === 0 || count === computerCandidates.length) continue;
        const score = Math.abs(count - computerCandidates.length / 2);
        if (score < bestScore) {
          bestScore = score;
          bestSupply = s;
        }
      }

      setSelectedSupply(bestSupply);
      setGuessAnimal(null);

      const q = getSupplyQuestion(bestSupply).question;
      speakEnglish(`It is my turn! ${q}`);
    }
  }, [isOpen, computerCandidates]);

  if (!isOpen) return null;

  const handleSpeak = (text: string) => {
    setIsSpeaking(true);
    speakEnglish(text, {
      onEnd: () => setIsSpeaking(false),
    });
  };

  // If user is peeking at the board, show a floating bar to return
  if (isPeekingBoard) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-indigo-400 animate-in slide-in-from-bottom-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-indigo-300 animate-pulse" />
          <span className="text-xs font-bold">
            Peeking at board... (盤面を確認中)
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsPeekingBoard(false)}
          className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-md transition-all active:scale-95"
        >
          Return to Question ↩
        </button>
      </div>
    );
  }

  // When computer guesses player identity
  if (guessAnimal) {
    const { question, japanese } = getAnimalQuestion(guessAnimal);
    const isActuallyCorrect = playerSecretAnimal.id === guessAnimal.id;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
        <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border-4 border-indigo-400 relative my-auto">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-300 flex items-center justify-center shadow-inner">
                <Bot className="w-5 h-5 text-indigo-700" />
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  Robo-ALT is Guessing You!
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  ロボ先生が正体を推理中
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPeekingBoard(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
              title="Peek at the board"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Peek Board</span>
            </button>
          </div>

          {/* Computer's Question */}
          <div className="bg-indigo-50 rounded-2xl p-4 border-2 border-indigo-200 text-center mb-4">
            <div className="text-4xl mb-1 filter drop-shadow-xs">{guessAnimal.emoji}</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Fredoka',sans-serif]">
              "{question}"
            </div>
            {showJapanese && (
              <div className="text-xs font-semibold text-slate-600 mt-1">
                {japanese}
              </div>
            )}

            <button
              type="button"
              onClick={() => handleSpeak(question)}
              className="mt-2.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-indigo-200 hover:bg-indigo-300 text-indigo-950 font-bold text-xs transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen Again</span>
            </button>
          </div>

          {/* Player's Secret Identity Display inside Modal */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border-2 border-slate-200 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Your Secret Card (あなたのカード):</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-3xl">{playerSecretAnimal.emoji}</span>
              <div>
                <div className="text-base font-extrabold text-slate-900 font-['Fredoka',sans-serif]">
                  {playerSecretAnimal.name}
                </div>
                {showJapanese && (
                  <div className="text-xs font-semibold text-slate-500">
                    {playerSecretAnimal.japaneseName}
                  </div>
                )}
              </div>
            </div>

            {/* Hint banner */}
            <div
              className={`mt-2.5 p-2 rounded-xl text-xs font-bold text-center ${
                isActuallyCorrect
                  ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                  : 'bg-rose-100 text-rose-950 border border-rose-300'
              }`}
            >
              {isActuallyCorrect ? (
                <span>
                  🎉 The computer is correct! Click <strong>"Yes, I am!"</strong>
                  {showJapanese && '（正解です！「Yes, I am!」をクリック）'}
                </span>
              ) : (
                <span>
                  ❌ That is NOT you! Click <strong>"No, I'm not!"</strong>
                  {showJapanese && '（ちがいます！「No, I\'m not!」をクリック）'}
                </span>
              )}
            </div>
          </div>

          <div className="text-center mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Answer the computer (Only the correct button is enabled):
            </p>
          </div>

          {/* Response Buttons with single-choice enforcement */}
          <div className="grid grid-cols-2 gap-3">
            {/* YES BUTTON */}
            <button
              type="button"
              disabled={!isActuallyCorrect}
              onClick={() => {
                playNoTone(); // Computer won
                speakEnglish('Yes, I am.');
                onComputerGuessPlayer(guessAnimal, true);
              }}
              className={`p-3.5 rounded-2xl border-2 font-extrabold flex flex-col items-center justify-center font-['Fredoka',sans-serif] transition-all ${
                isActuallyCorrect
                  ? 'border-emerald-500 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 ring-4 ring-emerald-300 shadow-md cursor-pointer active:scale-95'
                  : 'border-slate-200 bg-slate-100 text-slate-400 opacity-40 cursor-not-allowed pointer-events-none shadow-none'
              }`}
            >
              {isActuallyCorrect ? (
                <Check className="w-6 h-6 text-emerald-600 mb-1 stroke-[3]" />
              ) : (
                <Lock className="w-5 h-5 text-slate-400 mb-1" />
              )}
              <span className="text-base">Yes, I am!</span>
              {showJapanese && (
                <span className="text-[11px] font-normal text-emerald-800">
                  正解です
                </span>
              )}
              {isActuallyCorrect ? (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-200/80 px-2 py-0.5 rounded-full mt-1">
                  👉 Click this!
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-normal mt-1">
                  Locked
                </span>
              )}
            </button>

            {/* NO BUTTON */}
            <button
              type="button"
              disabled={isActuallyCorrect}
              onClick={() => {
                playYesChime(); // Player survived
                speakEnglish("No, I'm not.");
                onComputerGuessPlayer(guessAnimal, false);
              }}
              className={`p-3.5 rounded-2xl border-2 font-extrabold flex flex-col items-center justify-center font-['Fredoka',sans-serif] transition-all ${
                !isActuallyCorrect
                  ? 'border-rose-500 bg-rose-100 hover:bg-rose-200 text-rose-950 ring-4 ring-rose-300 shadow-md cursor-pointer active:scale-95'
                  : 'border-slate-200 bg-slate-100 text-slate-400 opacity-40 cursor-not-allowed pointer-events-none shadow-none'
              }`}
            >
              {!isActuallyCorrect ? (
                <X className="w-6 h-6 text-rose-600 mb-1 stroke-[3]" />
              ) : (
                <Lock className="w-5 h-5 text-slate-400 mb-1" />
              )}
              <span className="text-base">No, I'm not!</span>
              {showJapanese && (
                <span className="text-[11px] font-normal text-rose-800">
                  ちがいます
                </span>
              )}
              {!isActuallyCorrect ? (
                <span className="text-[10px] text-rose-700 font-bold bg-rose-200/80 px-2 py-0.5 rounded-full mt-1">
                  👉 Click this!
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-normal mt-1">
                  Locked
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // When computer asks a supply question
  if (!selectedSupply) return null;

  const { question, japanese } = getSupplyQuestion(selectedSupply);
  const playerHasIt = playerSecretAnimal.supplies.includes(selectedSupply.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border-4 border-indigo-400 relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-indigo-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-300 flex items-center justify-center shadow-inner">
              <Bot className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Robo-ALT's Turn to Ask
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                ロボ先生のしつもん
              </div>
            </div>
          </div>

          {/* Peek at Board button */}
          <button
            type="button"
            onClick={() => setIsPeekingBoard(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            title="Peek at the board"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Peek Board</span>
          </button>
        </div>

        {/* Question Prompt Bubble */}
        <div className="bg-indigo-50 rounded-2xl p-4 border-2 border-indigo-200 text-center mb-4">
          <div className="w-12 h-12 rounded-xl bg-white mx-auto flex items-center justify-center border border-indigo-200 shadow-2xs mb-2">
            <SupplyIcon id={selectedSupply.id} size="lg" />
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Fredoka',sans-serif]">
            "{question}"
          </div>
          {showJapanese && (
            <div className="text-xs font-semibold text-slate-600 mt-1">
              {japanese}
            </div>
          )}

          <button
            type="button"
            onClick={() => handleSpeak(question)}
            className="mt-2.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-indigo-200 hover:bg-indigo-300 text-indigo-950 font-bold text-xs transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span>Listen Again</span>
          </button>
        </div>

        {/* Player's Secret Card & Held Supplies showcase inside the modal */}
        <div className="bg-amber-50/90 rounded-2xl p-3.5 border-2 border-amber-300 mb-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900 uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Your Secret Card & Supplies (あなたのカードと持ち物):</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-extrabold text-slate-800 bg-white px-2 py-0.5 rounded-lg border border-amber-200">
              <span className="text-base">{playerSecretAnimal.emoji}</span>
              <span>{playerSecretAnimal.name}</span>
            </div>
          </div>

          {/* 4 Held items grid */}
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            {playerSecretAnimal.supplies.map((supId) => {
              const supply = SUPPLY_MAP.get(supId);
              if (!supply) return null;
              const isTargetMatch = supId === selectedSupply.id;

              return (
                <div
                  key={supId}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                    isTargetMatch
                      ? 'bg-emerald-100 border-2 border-emerald-500 text-emerald-950 font-black shadow-sm ring-2 ring-emerald-300'
                      : 'bg-white border border-amber-200 text-slate-700 font-semibold shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <SupplyIcon id={supId} size="sm" />
                    <div className="truncate">
                      <div className="truncate capitalize text-xs">{supply.name}</div>
                      {showJapanese && (
                        <div className="text-[10px] text-slate-500 font-normal leading-tight">
                          {supply.japaneseName}
                        </div>
                      )}
                    </div>
                  </div>

                  {isTargetMatch && (
                    <span className="text-[10px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded-md shrink-0 ml-1">
                      MATCH!
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Status summary banner */}
          <div
            className={`p-2 rounded-xl text-xs font-bold text-center ${
              playerHasIt
                ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                : 'bg-rose-100 text-rose-950 border border-rose-300'
            }`}
          >
            {playerHasIt ? (
              <span>
                ✅ You <strong>HAVE</strong> {selectedSupply.article} {selectedSupply.name}! Click <strong>"Yes, I do!"</strong>
                {showJapanese && '（持っています！下の「Yes, I do!」をクリック）'}
              </span>
            ) : (
              <span>
                ❌ You <strong>DO NOT</strong> have {selectedSupply.article} {selectedSupply.name}! Click <strong>"No, I don't!"</strong>
                {showJapanese && '（持っていません！下の「No, I don\'t!」をクリック）'}
              </span>
            )}
          </div>
        </div>

        <div className="text-center mb-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Respond to Robo-ALT (Only the correct button is enabled):
          </p>
        </div>

        {/* Response Buttons with single-choice enforcement */}
        <div className="grid grid-cols-2 gap-3">
          {/* YES BUTTON */}
          <button
            type="button"
            disabled={!playerHasIt}
            onClick={() => {
              playYesChime();
              speakEnglish('Yes, I do.');
              onPlayerAnswerSupply(selectedSupply.id, true);
            }}
            className={`p-3.5 rounded-2xl border-2 font-extrabold flex flex-col items-center justify-center font-['Fredoka',sans-serif] transition-all ${
              playerHasIt
                ? 'border-emerald-500 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 ring-4 ring-emerald-300 shadow-md cursor-pointer active:scale-95'
                : 'border-slate-200 bg-slate-100 text-slate-400 opacity-40 cursor-not-allowed pointer-events-none shadow-none'
            }`}
          >
            {playerHasIt ? (
              <Check className="w-6 h-6 text-emerald-600 mb-1 stroke-[3]" />
            ) : (
              <Lock className="w-5 h-5 text-slate-400 mb-1" />
            )}
            <span className="text-base">Yes, I do!</span>
            {showJapanese && (
              <span className="text-[11px] font-normal text-emerald-800">
                はい、もっています
              </span>
            )}
            {playerHasIt ? (
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-200/80 px-2 py-0.5 rounded-full mt-1">
                👉 Click this! (正解)
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-normal mt-1">
                Locked (Not in bag)
              </span>
            )}
          </button>

          {/* NO BUTTON */}
          <button
            type="button"
            disabled={playerHasIt}
            onClick={() => {
              playNoTone();
              speakEnglish("No, I don't.");
              onPlayerAnswerSupply(selectedSupply.id, false);
            }}
            className={`p-3.5 rounded-2xl border-2 font-extrabold flex flex-col items-center justify-center font-['Fredoka',sans-serif] transition-all ${
              !playerHasIt
                ? 'border-rose-500 bg-rose-100 hover:bg-rose-200 text-rose-950 ring-4 ring-rose-300 shadow-md cursor-pointer active:scale-95'
                : 'border-slate-200 bg-slate-100 text-slate-400 opacity-40 cursor-not-allowed pointer-events-none shadow-none'
            }`}
          >
            {!playerHasIt ? (
              <X className="w-6 h-6 text-rose-600 mb-1 stroke-[3]" />
            ) : (
              <Lock className="w-5 h-5 text-slate-400 mb-1" />
            )}
            <span className="text-base">No, I don't!</span>
            {showJapanese && (
              <span className="text-[11px] font-normal text-rose-800">
                いいえ、もっていません
              </span>
            )}
            {!playerHasIt ? (
              <span className="text-[10px] text-rose-700 font-bold bg-rose-200/80 px-2 py-0.5 rounded-full mt-1">
                👉 Click this! (正解)
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-normal mt-1">
                Locked (In your bag)
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

