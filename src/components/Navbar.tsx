import React from 'react';
import { GameMode } from '../types';
import { Bot, Users, Presentation, Volume2, VolumeX, BookOpen, RotateCcw, Languages, Smartphone } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface NavbarProps {
  gameMode: GameMode;
  onSelectGameMode: (mode: GameMode) => void;
  showJapanese: boolean;
  onToggleJapanese: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenVocab: () => void;
  onResetGame: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  gameMode,
  onSelectGameMode,
  showJapanese,
  onToggleJapanese,
  isMuted,
  onToggleMute,
  onOpenVocab,
  onResetGame,
}) => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b-2 border-amber-200 sticky top-0 z-40 px-3 sm:px-6 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 border-2 border-amber-500 flex items-center justify-center text-xl shadow-inner font-extrabold text-amber-950">
            🎒
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-['Fredoka',sans-serif] leading-tight">
                School Supplies Guess Who
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                EFL Japan
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Elementary English Elimination Game • 24 Animal Characters
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center bg-amber-100/70 p-1 rounded-2xl border border-amber-200">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onSelectGameMode('vs_computer');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              gameMode === 'vs_computer'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className="w-4 h-4 text-indigo-600" />
            <span>Solo vs Bot</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              onSelectGameMode('two_player');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              gameMode === 'two_player'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>1 Device (Pair)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              onSelectGameMode('two_device');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              gameMode === 'two_device'
                ? 'bg-white text-slate-900 shadow-xs ring-2 ring-amber-400'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-amber-600" />
            <span>2 Devices (各自)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClickSound();
              onSelectGameMode('practice');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all hidden md:flex ${
              gameMode === 'practice'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Presentation className="w-4 h-4 text-amber-700" />
            <span>Classroom Board</span>
          </button>
        </div>

        {/* Right utility buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Japanese hints toggle */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onToggleJapanese();
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              showJapanese
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle Japanese hints"
          >
            <Languages className="w-4 h-4 text-amber-700" />
            <span className="hidden sm:inline">日本語</span>
            <span className="text-[10px] font-extrabold">{showJapanese ? 'ON' : 'OFF'}</span>
          </button>

          {/* Pronunciation & Study Guide */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onOpenVocab();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-amber-50 hover:border-amber-300 transition-colors"
            title="Study Guide"
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Word Guide</span>
          </button>

          {/* Sound Mute */}
          <button
            type="button"
            onClick={() => {
              onToggleMute();
            }}
            className="p-2 rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-600" />
            )}
          </button>

          {/* Reset game */}
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onResetGame();
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
