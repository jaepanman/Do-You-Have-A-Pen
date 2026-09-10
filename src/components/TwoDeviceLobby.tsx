import React, { useState, useEffect } from 'react';
import { Smartphone, Users, Sparkles, Copy, Check, ArrowRight, Loader2, Play, RefreshCw, QrCode } from 'lucide-react';
import { createRoom, joinRoom } from '../utils/twoDeviceClient';
import { RoomState } from '../types';
import { playClickSound, playYesChime, playNoTone } from '../utils/audio';

interface TwoDeviceLobbyProps {
  onJoinSuccess: (roomId: string, role: 'player1' | 'player2', room: RoomState) => void;
  showJapanese: boolean;
}

export const TwoDeviceLobby: React.FC<TwoDeviceLobbyProps> = ({
  onJoinSuccess,
  showJapanese,
}) => {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState('Player 1');
  const [joinCode, setJoinCode] = useState('');
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [createdRoomState, setCreatedRoomState] = useState<RoomState | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check URL query parameters for ?room=CODE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setJoinCode(roomParam.toUpperCase());
      setTab('join');
      setPlayerName('Player 2');
    }
  }, []);

  const handleCreateRoom = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      playClickSound();

      const result = await createRoom(playerName || 'Player 1');
      setCreatedRoomId(result.roomId);
      setCreatedRoomState(result.room);
      onJoinSuccess(result.roomId, 'player1', result.room);
    } catch (err: any) {
      playNoTone();
      setErrorMsg(err.message || 'Could not create room.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) {
      setErrorMsg('Please enter a room code.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      playClickSound();

      const code = joinCode.trim().toUpperCase();
      const result = await joinRoom(code, playerName || 'Player 2');
      playYesChime();
      onJoinSuccess(code, result.role, result.room);
    } catch (err: any) {
      playNoTone();
      setErrorMsg(err.message || 'Could not join room. Check the code.');
    } finally {
      setLoading(false);
    }
  };

  const shareableUrl = createdRoomId
    ? `${window.location.origin}${window.location.pathname}?room=${createdRoomId}`
    : '';

  const handleCopyLink = () => {
    if (!shareableUrl) return;
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    playYesChime();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-xl mx-auto my-4 p-4 sm:p-6 bg-white rounded-3xl border-4 border-amber-300 shadow-xl">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-800 shadow-inner mb-2">
          <Smartphone className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Fredoka',sans-serif]">
          2-Device Online Mode
        </h2>
        <p className="text-sm font-extrabold text-amber-800 mt-1">
          {showJapanese
            ? '📱 タブレットやパソコン 2台で対戦するモード'
            : 'Play against each other on 2 separate devices!'}
        </p>

        {/* 9-year-old Friendly Pair Guide Notice */}
        {showJapanese && (
          <div className="mt-3 p-3 bg-blue-50/90 rounded-2xl border-2 border-blue-200 text-left text-xs text-blue-950 shadow-2xs">
            <div className="font-black text-blue-900 flex items-center gap-1.5 mb-1 text-xs sm:text-sm">
              <span>💡</span>
              <span>【ふたりで対戦するときのお約束】</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] sm:text-xs">
              <div className="bg-white p-2 rounded-xl border border-blue-200">
                <span className="font-extrabold text-amber-600">👤 1人目の人：</span>
                <p className="font-bold text-slate-700 mt-0.5">
                  左の<strong>「① へやをつくる」</strong>を押して、合言葉（あいことば）をだしてね！
                </p>
              </div>
              <div className="bg-white p-2 rounded-xl border border-blue-200">
                <span className="font-extrabold text-emerald-600">👥 2人目の人：</span>
                <p className="font-bold text-slate-700 mt-0.5">
                  右の<strong>「② へやにはいる」</strong>を押して、その合言葉をいれてね！
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-amber-100/70 rounded-2xl border-2 border-amber-300 mb-5 font-['Fredoka',sans-serif]">
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setTab('create');
            setErrorMsg(null);
            if (playerName === 'Player 2') setPlayerName('Player 1');
          }}
          className={`py-3 px-3 rounded-xl font-black text-sm transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
            tab === 'create'
              ? 'bg-amber-400 text-slate-900 shadow-md ring-2 ring-amber-500'
              : 'text-slate-700 hover:text-slate-900 bg-white/50'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-900" />
            <span>① Create Room</span>
          </div>
          <span className="text-xs font-bold text-amber-950">（へやをつくる人）</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playClickSound();
            setTab('join');
            setErrorMsg(null);
            if (playerName === 'Player 1') setPlayerName('Player 2');
          }}
          className={`py-3 px-3 rounded-xl font-black text-sm transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
            tab === 'join'
              ? 'bg-emerald-400 text-slate-900 shadow-md ring-2 ring-emerald-500'
              : 'text-slate-700 hover:text-slate-900 bg-white/50'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-950" />
            <span>② Join Room</span>
          </div>
          <span className="text-xs font-bold text-emerald-950">（へやにはいる人）</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-black flex items-center gap-2 animate-shake">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      {/* TAB 1: CREATE ROOM */}
      {tab === 'create' && (
        <div className="space-y-4">
          <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200">
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
              ✏️ Your Name (あなたのなまえ・ニックネーム):
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={15}
              placeholder="なまえをいれてね（例: たろう）"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-amber-300 bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-200 outline-hidden font-bold text-slate-900 text-base"
            />
          </div>

          <div className="p-3.5 bg-amber-100/60 rounded-2xl border-2 border-amber-200 text-xs text-amber-950 space-y-2">
            <p className="font-black text-sm flex items-center gap-1">
              <span>📖</span>
              <span>1人目のやりかた (3ステップ)：</span>
            </p>
            <div className="space-y-1.5 text-xs text-slate-800 font-bold">
              <div className="flex items-start gap-2 bg-white/80 p-2 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-black text-xs shrink-0">1</span>
                <span>下の<strong>「へやをつくる！」</strong>ボタンを押します。</span>
              </div>
              <div className="flex items-start gap-2 bg-white/80 p-2 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-black text-xs shrink-0">2</span>
                <span>画面に<strong>英語の合言葉（あいことば）</strong>が出ます。となりの友だちに口でおしえてあげよう！</span>
              </div>
              <div className="flex items-start gap-2 bg-white/80 p-2 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-black text-xs shrink-0">3</span>
                <span>友だちが入ってきたら、<strong>自動でゲームが始まります！</strong></span>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleCreateRoom}
            className="w-full py-4 rounded-2xl font-black text-lg text-slate-900 bg-amber-400 hover:bg-amber-500 active:scale-98 shadow-md border-2 border-amber-500 flex items-center justify-center gap-2 font-['Fredoka',sans-serif] transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>へやを つくっています...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 text-amber-950" />
                <span>へやをつくる！ (Create Room)</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* TAB 2: JOIN ROOM */}
      {tab === 'join' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200">
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
              ✏️ Your Name (あなたのなまえ・ニックネーム):
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={15}
              placeholder="なまえをいれてね（例: はなこ）"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-emerald-300 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 outline-hidden font-bold text-slate-900 text-base"
            />
          </div>

          <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200">
            <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
              🔑 Room Code (友だちに聞いた「合言葉・4もじ」を入れてね):
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={10}
              placeholder="例: LION や PANDA"
              className="w-full px-4 py-3 rounded-xl border-2 border-emerald-300 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 outline-hidden font-black tracking-widest text-slate-900 text-2xl text-center uppercase"
            />
          </div>

          <div className="p-3.5 bg-emerald-100/60 rounded-2xl border-2 border-emerald-200 text-xs text-emerald-950 space-y-2">
            <p className="font-black text-sm flex items-center gap-1">
              <span>📖</span>
              <span>2人目のやりかた (3ステップ)：</span>
            </p>
            <div className="space-y-1.5 text-xs text-slate-800 font-bold">
              <div className="flex items-start gap-2 bg-white/80 p-2 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-900 flex items-center justify-center font-black text-xs shrink-0">1</span>
                <span>友だちが画面に出した<strong>合言葉（あいことば・英語4文字）</strong>を聞きます。</span>
              </div>
              <div className="flex items-start gap-2 bg-white/80 p-2 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-900 flex items-center justify-center font-black text-xs shrink-0">2</span>
                <span>上のわくに、その合言葉を入れます（例: LION）。</span>
              </div>
              <div className="flex items-start gap-2 bg-white/80 p-2 rounded-xl">
                <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-900 flex items-center justify-center font-black text-xs shrink-0">3</span>
                <span>下の<strong>「ゲームに参加する！」</strong>ボタンを押したらスタート！</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={loading || !joinCode.trim()}
            onClick={handleJoinRoom}
            className={`w-full py-4 rounded-2xl font-black text-lg text-slate-900 bg-emerald-400 hover:bg-emerald-500 active:scale-98 shadow-md border-2 border-emerald-500 flex items-center justify-center gap-2 font-['Fredoka',sans-serif] transition-all cursor-pointer ${
              !joinCode.trim() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>へやに はいっています...</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-slate-900 text-slate-900" />
                <span>ゲームに参加する！ (Join Game)</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
