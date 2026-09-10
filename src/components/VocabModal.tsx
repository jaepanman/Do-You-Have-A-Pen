import React, { useState } from 'react';
import { SCHOOL_SUPPLIES, ANIMAL_CHARACTERS } from '../data/gameData';
import { SupplyIcon } from './SupplyIcon';
import { Volume2, BookOpen, X, Sparkles, Languages } from 'lucide-react';
import { speakEnglish } from '../utils/audio';

interface VocabModalProps {
  isOpen: boolean;
  onClose: () => void;
  showJapanese: boolean;
}

export const VocabModal: React.FC<VocabModalProps> = ({
  isOpen,
  onClose,
  showJapanese,
}) => {
  const [activeTab, setActiveTab] = useState<'supplies' | 'animals' | 'grammar'>('supplies');

  if (!isOpen) return null;

  return (
    <div
      id="vocab-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="vocab-modal-content"
        className="bg-white rounded-3xl p-5 sm:p-6 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border-4 border-amber-300 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 font-['Fredoka',sans-serif]">
                EFL Study & Pronunciation Guide
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Tap any card to hear natural English pronunciation!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-2 my-3">
          <button
            type="button"
            onClick={() => setActiveTab('supplies')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'supplies'
                ? 'bg-amber-400 text-slate-900 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            School Supplies (12)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('animals')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'animals'
                ? 'bg-amber-400 text-slate-900 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Animal Characters (24)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('grammar')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'grammar'
                ? 'bg-amber-400 text-slate-900 shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Sentence Grammar
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'supplies' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SCHOOL_SUPPLIES.map((supply) => (
                <button
                  key={supply.id}
                  type="button"
                  onClick={() => speakEnglish(`${supply.article} ${supply.name}`)}
                  className="flex items-center gap-2 p-2.5 rounded-2xl border-2 border-amber-100 hover:border-amber-300 bg-amber-50/40 hover:bg-amber-50 text-left transition-all group"
                >
                  <div className="p-2 rounded-xl bg-white border border-amber-200 shadow-2xs group-hover:scale-105 transition-transform">
                    <SupplyIcon id={supply.id} size="md" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 capitalize leading-tight">
                      <span className="text-[10px] text-amber-700 font-semibold mr-1">
                        {supply.article}
                      </span>
                      {supply.name}
                    </div>
                    {showJapanese && (
                      <div className="text-[11px] text-slate-500 font-medium truncate">
                        {supply.japaneseName}
                      </div>
                    )}
                  </div>
                  <Volume2 className="w-4 h-4 text-amber-600 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                </button>
              ))}
            </div>
          )}

          {activeTab === 'animals' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {ANIMAL_CHARACTERS.map((animal) => (
                <button
                  key={animal.id}
                  type="button"
                  onClick={() => speakEnglish(`${animal.article} ${animal.name}`)}
                  className="flex items-center gap-2 p-2 rounded-2xl border-2 border-slate-100 hover:border-amber-300 bg-slate-50/70 hover:bg-amber-50 text-left transition-all group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {animal.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800 leading-tight">
                      {animal.name}
                    </div>
                    {showJapanese && (
                      <div className="text-[10px] text-slate-500 truncate">
                        {animal.japaneseName}
                      </div>
                    )}
                  </div>
                  <Volume2 className="w-3.5 h-3.5 text-amber-600 opacity-50 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          )}

          {activeTab === 'grammar' && (
            <div className="space-y-3">
              {/* Pattern 1 */}
              <div className="bg-amber-50 rounded-2xl p-3.5 border-2 border-amber-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase text-amber-800 bg-amber-200 px-2.5 py-0.5 rounded-full">
                    Pattern 1: Asking about School Supplies
                  </span>
                  <button
                    type="button"
                    onClick={() => speakEnglish('Do you have a pencil? Yes, I do. No, I don\'t.')}
                    className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-white px-2 py-1 rounded-lg border border-amber-300 shadow-2xs hover:bg-amber-100"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen All</span>
                  </button>
                </div>

                <div className="space-y-1.5 text-sm font-extrabold text-slate-800">
                  <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-amber-100">
                    <div>
                      <div>❓ "Do you have a / an [item]?"</div>
                      <div className="text-xs text-slate-500 font-normal">〜をもっていますか？</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => speakEnglish('Do you have a pencil?')}
                      className="p-1 text-amber-600 hover:text-amber-800"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-emerald-950 text-xs">
                      <div className="font-bold">✅ "Yes, I do."</div>
                      <div className="text-emerald-700 font-normal">はい、もっています。</div>
                    </div>
                    <div className="bg-rose-50 p-2 rounded-xl border border-rose-200 text-rose-950 text-xs">
                      <div className="font-bold">❌ "No, I don't."</div>
                      <div className="text-rose-700 font-normal">いいえ、もっていません。</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pattern 2 */}
              <div className="bg-sky-50 rounded-2xl p-3.5 border-2 border-sky-200">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase text-sky-800 bg-sky-200 px-2.5 py-0.5 rounded-full">
                    Pattern 2: Guessing Opponent Identity
                  </span>
                  <button
                    type="button"
                    onClick={() => speakEnglish('Are you a dog? Yes, I am. No, I\'m not.')}
                    className="flex items-center gap-1 text-xs font-bold text-sky-700 bg-white px-2 py-1 rounded-lg border border-sky-300 shadow-2xs hover:bg-sky-100"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen All</span>
                  </button>
                </div>

                <div className="space-y-1.5 text-sm font-extrabold text-slate-800">
                  <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-sky-100">
                    <div>
                      <div>❓ "Are you a / an [animal]?"</div>
                      <div className="text-xs text-slate-500 font-normal">あなたは〜ですか？</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => speakEnglish('Are you a dog?')}
                      className="p-1 text-sky-600 hover:text-sky-800"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-emerald-950 text-xs">
                      <div className="font-bold">🎉 "Yes, I am!"</div>
                      <div className="text-emerald-700 font-normal">そうです！（正解）</div>
                    </div>
                    <div className="bg-rose-50 p-2 rounded-xl border border-rose-200 text-rose-950 text-xs">
                      <div className="font-bold">❌ "No, I'm not."</div>
                      <div className="text-rose-700 font-normal">ちがいます。（ハズレ）</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grammar Note on a vs an */}
              <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-200 text-xs text-indigo-900">
                <strong>📝 English Grammar Tip: "a" vs "an"</strong>
                <p className="mt-1 text-indigo-800 font-medium">
                  We use <strong>"an"</strong> when the word begins with a vowel sound (a, e, i, o, u):
                </p>
                <div className="mt-1 font-bold flex flex-wrap gap-2">
                  <span className="bg-white px-2 py-0.5 rounded-lg border border-indigo-200">
                    an eraser
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded-lg border border-indigo-200">
                    an elephant
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded-lg border border-indigo-200">
                    an owl
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
