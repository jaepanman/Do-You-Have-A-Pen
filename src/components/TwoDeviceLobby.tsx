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
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-800 shadow-inner mb-2">
          <Smartphone className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Fredoka',sans-serif]">
          2-Device Online Mode
        </h2>
        <p className="text-xs sm:text-sm font-bold text-amber-700 mt-0.5">
          {showJapanese
            ? 'それぞれのタブレットやパソコンで対戦！'
            : 'Play against each other on separate devices!'}
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-amber-50 rounded-2xl border border-amber-200 mb-6 font-['Fredoka',sans-serif]">
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setTab('create');
            setErrorMsg(null);
            if (playerName === 'Player 2') setPlayerName('Player 1');
          }}
          className={`py-2.5 px-4 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
            tab === 'create'
              ? 'bg-amber-400 text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Create Room</span>
          {showJapanese && <span className="text-xs font-normal">（部屋をつくる）</span>}
        </button>

        <button
          type="button"
          onClick={() => {
            playClickSound();
            setTab('join');
            setErrorMsg(null);
            if (playerName === 'Player 1') setPlayerName('Player 2');
          }}
          className={`py-2.5 px-4 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 ${
            tab === 'join'
              ? 'bg-amber-400 text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Join Room</span>
          {showJapanese && <span className="text-xs font-normal">（番号ではいる）</span>}
        </button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2 animate-shake">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      {/* TAB 1: CREATE ROOM */}
      {tab === 'create' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1.5">
              Your Name / Nickname (あなたのなまえ):
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={15}
              placeholder="Player 1"
              className="w-full px-4 py-3 rounded-2xl border-2 border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 outline-hidden font-bold text-slate-900 text-base"
            />
          </div>

          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-bold">💡 How it works (あそびかた):</p>
            <ol className="list-decimal list-inside space-y-0.5 text-slate-700">
              <li>Click "Create Game Room" to get a 4-letter Room Code.</li>
              <li>Share the code (or link) with your friend or classmate.</li>
              <li>Your friend enters the code on their device and the game starts!</li>
            </ol>
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
                <span>Creating Room...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 text-amber-950" />
                <span>Create Game Room! (部屋をつくる)</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* TAB 2: JOIN ROOM */}
      {tab === 'join' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1.5">
              Your Name / Nickname (あなたのなまえ):
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={15}
              placeholder="Player 2"
              className="w-full px-4 py-3 rounded-2xl border-2 border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 outline-hidden font-bold text-slate-900 text-base"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1.5">
              Room Code (4-character code / 部屋の合言葉):
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={10}
              placeholder="e.g. LION or 4821"
              className="w-full px-4 py-3 rounded-2xl border-2 border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 outline-hidden font-black tracking-widest text-slate-900 text-xl text-center uppercase"
            />
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
                <span>Joining Room...</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-slate-900 text-slate-900" />
                <span>Join Game! (参加する)</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
