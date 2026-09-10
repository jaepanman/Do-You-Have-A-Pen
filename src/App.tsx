import React, { useState, useEffect, useMemo } from 'react';
import {
  AnimalIdentity,
  SchoolSupply,
  SupplyId,
  GameMode,
  RoomState,
} from './types';
import {
  ANIMAL_CHARACTERS,
  SCHOOL_SUPPLIES,
  SUPPLY_MAP,
  ANIMAL_MAP,
} from './data/gameData';
import { Navbar } from './components/Navbar';
import { SuppliesBar } from './components/SuppliesBar';
import { AnimalCard } from './components/AnimalCard';
import { SecretCard } from './components/SecretCard';
import { QuestionModal } from './components/QuestionModal';
import { GuessModal } from './components/GuessModal';
import { ComputerTurnModal } from './components/ComputerTurnModal';
import { PassTurnModal } from './components/PassTurnModal';
import { WinModal } from './components/WinModal';
import { VocabModal } from './components/VocabModal';
import { TwoDeviceLobby } from './components/TwoDeviceLobby';
import { TwoDeviceIncomingQuestionModal } from './components/TwoDeviceIncomingQuestionModal';
import { subscribeToRoom, sendRoomAction } from './utils/twoDeviceClient';
import {
  playClickSound,
  playCardFlipSound,
  setSoundMuted,
  getSoundMuted,
  playYesChime,
} from './utils/audio';
import {
  HelpCircle,
  Sparkles,
  Users,
  Bot,
  Shuffle,
  RotateCcw,
  CheckCircle,
  Eye,
  Layers,
  Filter,
  Smartphone,
  Copy,
  Check,
  LogOut,
  Radio,
  Loader2,
} from 'lucide-react';

export default function App() {
  // Global settings
  const [gameMode, setGameMode] = useState<GameMode>('vs_computer');
  const [showJapanese, setShowJapanese] = useState(true);
  const [isMuted, setIsMutedState] = useState(false);
  const [vocabModalOpen, setVocabModalOpen] = useState(false);

  // 2-Device Mode State
  const [twoDeviceRoomId, setTwoDeviceRoomId] = useState<string | null>(null);
  const [twoDeviceRole, setTwoDeviceRole] = useState<'player1' | 'player2' | null>(null);
  const [twoDeviceRoom, setTwoDeviceRoom] = useState<RoomState | null>(null);
  const [twoDeviceCopied, setTwoDeviceCopied] = useState(false);

  // Active hover preview on school supplies
  const [activeSupplyHover, setActiveSupplyHover] = useState<SupplyId | null>(null);

  // Player 1 state
  const [p1SecretAnimal, setP1SecretAnimal] = useState<AnimalIdentity>(() => {
    return ANIMAL_CHARACTERS[Math.floor(Math.random() * ANIMAL_CHARACTERS.length)];
  });
  const [p1EliminatedIds, setP1EliminatedIds] = useState<string[]>([]);
  const [p1AskedSupplies, setP1AskedSupplies] = useState<SupplyId[]>([]);
  const [p1TurnCount, setP1TurnCount] = useState(0);

  // Player 2 / Computer state
  const [p2SecretAnimal, setP2SecretAnimal] = useState<AnimalIdentity>(() => {
    const remaining = ANIMAL_CHARACTERS.filter((a) => a.id !== p1SecretAnimal.id);
    return remaining[Math.floor(Math.random() * remaining.length)];
  });
  const [p2EliminatedIds, setP2EliminatedIds] = useState<string[]>([]);
  const [p2AskedSupplies, setP2AskedSupplies] = useState<SupplyId[]>([]);
  const [p2TurnCount, setP2TurnCount] = useState(0);

  // Active turn in two_player mode: 0 = Player 1, 1 = Player 2
  const [activePlayerIndex, setActivePlayerIndex] = useState<0 | 1>(0);

  // Computer's candidate pool in vs_computer mode
  const [computerCandidates, setComputerCandidates] = useState<AnimalIdentity[]>([
    ...ANIMAL_CHARACTERS,
  ]);

  // Modals state
  const [selectedSupply, setSelectedSupply] = useState<SchoolSupply | null>(null);
  const [targetGuessAnimal, setTargetGuessAnimal] = useState<AnimalIdentity | null>(null);
  const [computerTurnModalOpen, setComputerTurnModalOpen] = useState(false);
  const [passTurnModalOpen, setPassTurnModalOpen] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState<{
    winner: string;
    animal: AnimalIdentity;
    turnCount: number;
  } | null>(null);

  // Filter tab for the board
  const [boardFilter, setBoardFilter] = useState<'all' | 'active' | 'eliminated'>('all');

  // Check URL query parameters for ?room=... on startup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setGameMode('two_device');
    }
  }, []);

  // Subscribe to real-time updates for 2-Device Mode
  useEffect(() => {
    if (gameMode !== 'two_device' || !twoDeviceRoomId) return;

    const unsubscribe = subscribeToRoom(twoDeviceRoomId, (updatedRoom) => {
      setTwoDeviceRoom(updatedRoom);
    });

    return () => {
      unsubscribe();
    };
  }, [gameMode, twoDeviceRoomId]);

  // Sync mute state
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMutedState(nextMute);
    setSoundMuted(nextMute);
  };

  // Reset/Start New Game
  const startNewGame = (mode: GameMode = gameMode) => {
    if (mode === 'two_device' && twoDeviceRoomId && twoDeviceRole) {
      sendRoomAction(twoDeviceRoomId, twoDeviceRole, 'restart_game', {}).catch(() => {});
      return;
    }

    // Pick 2 distinct random animals
    const shuffled = [...ANIMAL_CHARACTERS].sort(() => Math.random() - 0.5);
    const p1 = shuffled[0];
    const p2 = shuffled[1];

    setP1SecretAnimal(p1);
    setP1EliminatedIds([]);
    setP1AskedSupplies([]);
    setP1TurnCount(0);

    setP2SecretAnimal(p2);
    setP2EliminatedIds([]);
    setP2AskedSupplies([]);
    setP2TurnCount(0);

    setActivePlayerIndex(0);
    setComputerCandidates([...ANIMAL_CHARACTERS]);
    setSelectedSupply(null);
    setTargetGuessAnimal(null);
    setComputerTurnModalOpen(false);
    setPassTurnModalOpen(false);
    setWinnerInfo(null);
    setActiveSupplyHover(null);
  };

  // Leave 2-device room
  const handleLeaveTwoDeviceRoom = () => {
    playClickSound();
    setTwoDeviceRoomId(null);
    setTwoDeviceRole(null);
    setTwoDeviceRoom(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.replaceState({}, '', url.pathname);
  };

  // 2-Device mode active player references
  const isTwoDeviceActive = gameMode === 'two_device' && !!twoDeviceRoom;
  const twoDeviceIsMyTurn = isTwoDeviceActive && twoDeviceRoom?.turn === twoDeviceRole;
  const twoDeviceMyPlayer =
    twoDeviceRole === 'player1'
      ? twoDeviceRoom?.player1
      : twoDeviceRoom?.player2;
  const twoDeviceOpponentPlayer =
    twoDeviceRole === 'player1'
      ? twoDeviceRoom?.player2
      : twoDeviceRoom?.player1;

  // Current active player references for local/vs_computer modes
  const isP1Turn = activePlayerIndex === 0;
  const currentSecretAnimal = isTwoDeviceActive
    ? twoDeviceMyPlayer?.secretAnimal || p1SecretAnimal
    : isP1Turn
    ? p1SecretAnimal
    : p2SecretAnimal;

  const currentEliminatedIds = isTwoDeviceActive
    ? twoDeviceMyPlayer?.eliminatedIds || []
    : isP1Turn
    ? p1EliminatedIds
    : p2EliminatedIds;

  const currentAskedSupplies = isTwoDeviceActive
    ? twoDeviceMyPlayer?.askedSupplies || []
    : isP1Turn
    ? p1AskedSupplies
    : p2AskedSupplies;

  const opponentSecretAnimal = isTwoDeviceActive
    ? twoDeviceOpponentPlayer?.secretAnimal || p2SecretAnimal
    : isP1Turn
    ? p2SecretAnimal
    : p1SecretAnimal;

  const currentTurnCount = isTwoDeviceActive
    ? twoDeviceRoom?.turnCount || 0
    : isP1Turn
    ? p1TurnCount
    : p2TurnCount;

  // Active animals on board for current player
  const activeAnimals = useMemo(() => {
    return ANIMAL_CHARACTERS.filter((a) => !currentEliminatedIds.includes(a.id));
  }, [currentEliminatedIds]);

  // Displayed animals based on filter
  const displayedAnimals = useMemo(() => {
    if (boardFilter === 'active') {
      return ANIMAL_CHARACTERS.filter((a) => !currentEliminatedIds.includes(a.id));
    }
    if (boardFilter === 'eliminated') {
      return ANIMAL_CHARACTERS.filter((a) => currentEliminatedIds.includes(a.id));
    }
    return ANIMAL_CHARACTERS;
  }, [boardFilter, currentEliminatedIds]);

  // Toggle single animal card manually
  const handleToggleAnimal = (animalId: string) => {
    playCardFlipSound();
    if (isTwoDeviceActive && twoDeviceRoomId && twoDeviceRole) {
      sendRoomAction(twoDeviceRoomId, twoDeviceRole, 'toggle_eliminate', { animalId }).catch(() => {});
      return;
    }

    if (isP1Turn) {
      setP1EliminatedIds((prev) =>
        prev.includes(animalId)
          ? prev.filter((id) => id !== animalId)
          : [...prev, animalId]
      );
    } else {
      setP2EliminatedIds((prev) =>
        prev.includes(animalId)
          ? prev.filter((id) => id !== animalId)
          : [...prev, animalId]
      );
    }
  };

  // Process player asking a supply question (in local modes):
  const handleAnswerSupply = (hasSupply: boolean) => {
    if (!selectedSupply) return;

    const supplyId = selectedSupply.id;
    const newEliminations: string[] = [];
    ANIMAL_CHARACTERS.forEach((animal) => {
      const hasIt = animal.supplies.includes(supplyId);
      if (hasSupply && !hasIt) {
        newEliminations.push(animal.id);
      } else if (!hasSupply && hasIt) {
        newEliminations.push(animal.id);
      }
    });

    if (isP1Turn) {
      setP1EliminatedIds((prev) => Array.from(new Set([...prev, ...newEliminations])));
      setP1AskedSupplies((prev) =>
        prev.includes(supplyId) ? prev : [...prev, supplyId]
      );
      setP1TurnCount((c) => c + 1);
    } else {
      setP2EliminatedIds((prev) => Array.from(new Set([...prev, ...newEliminations])));
      setP2AskedSupplies((prev) =>
        prev.includes(supplyId) ? prev : [...prev, supplyId]
      );
      setP2TurnCount((c) => c + 1);
    }

    setSelectedSupply(null);

    if (gameMode === 'vs_computer') {
      setTimeout(() => {
        setComputerTurnModalOpen(true);
      }, 500);
    } else if (gameMode === 'two_player') {
      setTimeout(() => {
        setPassTurnModalOpen(true);
      }, 400);
    }
  };

  // 2-Device: Send question to opponent
  const handleTwoDeviceSendQuestion = async (supplyId: string) => {
    if (!twoDeviceRoomId || !twoDeviceRole) return;
    try {
      await sendRoomAction(twoDeviceRoomId, twoDeviceRole, 'ask_supply', { supplyId });
    } catch (e: any) {
      alert(e.message || 'Could not send question.');
    }
  };

  // 2-Device: Send guess to opponent
  const handleTwoDeviceSendGuess = async (animalId: string) => {
    if (!twoDeviceRoomId || !twoDeviceRole) return;
    try {
      await sendRoomAction(twoDeviceRoomId, twoDeviceRole, 'guess_animal', { targetAnimalId: animalId });
    } catch (e: any) {
      alert(e.message || 'Could not send guess.');
    }
  };

  // Process computer's question to Player 1:
  const handlePlayerAnswerSupplyToComputer = (supplyId: SupplyId, playerHasIt: boolean) => {
    const nextCandidates = computerCandidates.filter((cand) => {
      const hasIt = cand.supplies.includes(supplyId);
      return playerHasIt ? hasIt : !hasIt;
    });
    setComputerCandidates(nextCandidates);
    setComputerTurnModalOpen(false);
  };

  // Process computer's guess of player's identity:
  const handleComputerGuessPlayer = (guessedAnimal: AnimalIdentity, isCorrect: boolean) => {
    setComputerTurnModalOpen(false);

    if (isCorrect) {
      setWinnerInfo({
        winner: 'Robo-ALT 🤖',
        animal: p1SecretAnimal,
        turnCount: currentTurnCount + 1,
      });
    } else {
      const nextCandidates = computerCandidates.filter((c) => c.id !== guessedAnimal.id);
      setComputerCandidates(nextCandidates);
    }
  };

  // Process player's guess in local modes:
  const handleConfirmGuess = (isCorrect: boolean) => {
    if (!targetGuessAnimal) return;

    if (isCorrect) {
      const winnerName =
        gameMode === 'two_player'
          ? isP1Turn
            ? 'Player 1'
            : 'Player 2'
          : 'You';

      setWinnerInfo({
        winner: winnerName,
        animal: opponentSecretAnimal,
        turnCount: currentTurnCount + 1,
      });
      setTargetGuessAnimal(null);
    } else {
      handleToggleAnimal(targetGuessAnimal.id);
      setTargetGuessAnimal(null);

      if (gameMode === 'vs_computer') {
        setTimeout(() => {
          setComputerTurnModalOpen(true);
        }, 500);
      } else if (gameMode === 'two_player') {
        setTimeout(() => {
          setPassTurnModalOpen(true);
        }, 400);
      }
    }
  };

  // When pass device modal is closed
  const handlePassTurnReady = () => {
    setPassTurnModalOpen(false);
    setActivePlayerIndex((prev) => (prev === 0 ? 1 : 0));
  };

  // Reroll secret animal during setup
  const handleRerollSecret = () => {
    const pool = ANIMAL_CHARACTERS.filter((a) => a.id !== currentSecretAnimal.id);
    const nextAnimal = pool[Math.floor(Math.random() * pool.length)];
    if (isP1Turn) {
      setP1SecretAnimal(nextAnimal);
    } else {
      setP2SecretAnimal(nextAnimal);
    }
  };

  const handleCopyRoomLink = () => {
    if (!twoDeviceRoomId) return;
    const shareableUrl = `${window.location.origin}${window.location.pathname}?room=${twoDeviceRoomId}`;
    navigator.clipboard.writeText(shareableUrl);
    setTwoDeviceCopied(true);
    playYesChime();
    setTimeout(() => setTwoDeviceCopied(false), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 text-slate-800">
      {/* Navigation Header */}
      <Navbar
        gameMode={gameMode}
        onSelectGameMode={(mode) => {
          setGameMode(mode);
          startNewGame(mode);
        }}
        showJapanese={showJapanese}
        onToggleJapanese={() => setShowJapanese(!showJapanese)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenVocab={() => setVocabModalOpen(true)}
        onResetGame={() => startNewGame()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* 2-DEVICE MODE: LOBBY (when not in a room) */}
        {gameMode === 'two_device' && !twoDeviceRoom && (
          <TwoDeviceLobby
            showJapanese={showJapanese}
            onJoinSuccess={(roomId, role, room) => {
              setTwoDeviceRoomId(roomId);
              setTwoDeviceRole(role);
              setTwoDeviceRoom(room);
              const url = new URL(window.location.href);
              url.searchParams.set('room', roomId);
              window.history.replaceState({}, '', url.toString());
            }}
          />
        )}

        {/* 2-DEVICE MODE: WAITING FOR PLAYER 2 */}
        {gameMode === 'two_device' && twoDeviceRoom && twoDeviceRoom.status === 'waiting' && (
          <div className="max-w-xl mx-auto my-6 p-6 bg-white rounded-3xl border-4 border-amber-400 shadow-xl text-center space-y-5">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-900 shadow-inner">
              <Radio className="w-8 h-8 animate-pulse text-amber-700" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Fredoka',sans-serif]">
                Room Ready! Share Code
              </h2>
              <p className="text-xs sm:text-sm font-bold text-amber-700 mt-1">
                {showJapanese
                  ? '友達に合言葉を教えてゲームに参加してもらおう！'
                  : 'Tell your friend the code or share the link to join!'}
              </p>
            </div>

            {/* Room Code Display */}
            <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-300">
              <div className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">
                Room Code (部屋の合言葉):
              </div>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-widest font-mono">
                {twoDeviceRoom.roomId}
              </div>
            </div>

            {/* Copy link and actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleCopyRoomLink}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-extrabold text-sm text-slate-900 bg-amber-400 hover:bg-amber-500 active:scale-95 shadow-sm border border-amber-500 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {twoDeviceCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-800 stroke-[3]" />
                    <span>Link Copied! (コピー完了)</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Game Link (URLをコピー)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleLeaveTwoDeviceRoom}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Cancel / Leave</span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center gap-3 text-xs text-slate-600 font-bold">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <span>
                Waiting for Player 2 to enter code... (対戦相手の参加を待っています)
              </span>
            </div>
          </div>
        )}

        {/* 2-DEVICE MODE ROOM BAR (When playing) */}
        {isTwoDeviceActive && twoDeviceRoom.status !== 'waiting' && (
          <div className="bg-white rounded-2xl px-4 py-2.5 border-2 border-indigo-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-indigo-950 font-['Fredoka',sans-serif]">
                Online Room: <span className="font-mono text-indigo-700 font-extrabold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">{twoDeviceRoom.roomId}</span>
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                You are: <strong className="text-slate-800">{twoDeviceMyPlayer?.name} ({twoDeviceRole})</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyRoomLink}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1 transition-colors"
                title="Copy Room Link"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{twoDeviceCopied ? 'Copied!' : 'Copy Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleLeaveTwoDeviceRoom}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave</span>
              </button>
            </div>
          </div>
        )}

        {/* Top Status & Secret Card Section (Shown in local modes or active 2-device match) */}
        {(!isTwoDeviceActive || twoDeviceRoom.status !== 'waiting') && gameMode !== 'two_device' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
            {/* Active Player Status Badge */}
            <div className="bg-white rounded-2xl p-3.5 border-2 border-amber-200/80 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center font-bold text-amber-800">
                    {gameMode === 'vs_computer' ? (
                      <Bot className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <Users className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Current Turn
                    </div>
                    <div className="text-base sm:text-lg font-black text-slate-900 font-['Fredoka',sans-serif]">
                      {gameMode === 'vs_computer'
                        ? 'Your Turn (Player)'
                        : isP1Turn
                        ? "Player 1's Turn"
                        : "Player 2's Turn"}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                  Turn {currentTurnCount + 1}
                </span>
              </div>

              {showJapanese && (
                <p className="text-xs text-slate-500 font-medium">
                  {gameMode === 'vs_computer'
                    ? '上のアイテムを押してコンピューターに質問しよう！'
                    : '相手に「Do you have a...?」と英語で尋ねよう！'}
                </p>
              )}

              {/* Quick Guesses Left / Remaining candidates */}
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">
                  Remaining suspects:
                </span>
                <span className="font-black text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-lg">
                  {activeAnimals.length} / 24
                </span>
              </div>
            </div>

            {/* Secret Identity Card */}
            <div className="md:col-span-2">
              <SecretCard
                secretAnimal={currentSecretAnimal}
                playerName={
                  gameMode === 'vs_computer'
                    ? 'Your'
                    : isP1Turn
                    ? 'Player 1'
                    : 'Player 2'
                }
                showJapanese={showJapanese}
                onReroll={handleRerollSecret}
                canReroll={currentTurnCount === 0}
              />
            </div>
          </div>
        ) : null}

        {/* In 2-Device Mode when match is running: Turn Banner and Secret Card */}
        {isTwoDeviceActive && twoDeviceRoom.status !== 'waiting' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
            {/* 2-Device Turn Indicator Banner */}
            <div
              className={`rounded-2xl p-4 border-2 shadow-xs flex flex-col justify-between transition-all ${
                twoDeviceIsMyTurn
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-4 ring-emerald-200/60'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-950'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl">
                      {twoDeviceIsMyTurn ? '⭐' : '⏳'}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {twoDeviceIsMyTurn ? 'Your Turn to Ask!' : `${twoDeviceOpponentPlayer?.name}'s Turn`}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current">
                    Turn {currentTurnCount + 1}
                  </span>
                </div>

                <div className="text-lg font-black font-['Fredoka',sans-serif]">
                  {twoDeviceIsMyTurn ? (
                    <span>Choose a supply below to ask!</span>
                  ) : (
                    <span>Waiting for {twoDeviceOpponentPlayer?.name}...</span>
                  )}
                </div>

                {showJapanese && (
                  <p className="text-xs mt-1 font-semibold opacity-85">
                    {twoDeviceIsMyTurn
                      ? 'あなたの番です！下の持ち物を選んで相手にしつもんしましょう。'
                      : `${twoDeviceOpponentPlayer?.name} が質問を選ぶのを待っています。`}
                  </p>
                )}
              </div>

              {twoDeviceRoom.lastAction && (
                <div className="mt-3 pt-2 border-t border-current/20 text-xs font-medium opacity-90">
                  <span className="font-bold">Last:</span> {twoDeviceRoom.lastAction.text}
                </div>
              )}
            </div>

            {/* Secret Identity Card */}
            <div className="md:col-span-2">
              <SecretCard
                secretAnimal={currentSecretAnimal}
                playerName={twoDeviceMyPlayer?.name || 'Your'}
                showJapanese={showJapanese}
                onReroll={handleRerollSecret}
                canReroll={false}
              />
            </div>
          </div>
        )}

        {/* 12 School Supplies Asking Toolbar (Rendered when not in lobby/waiting) */}
        {(!isTwoDeviceActive || twoDeviceRoom.status !== 'waiting') && (
          <SuppliesBar
            onSelectSupply={(supply) => {
              if (isTwoDeviceActive && !twoDeviceIsMyTurn) {
                alert(`Please wait for ${twoDeviceOpponentPlayer?.name || 'your opponent'} to finish their turn.`);
                return;
              }
              setSelectedSupply(supply);
            }}
            askedSupplyIds={currentAskedSupplies}
            showJapanese={showJapanese}
            activeSupplyHover={activeSupplyHover}
            setActiveSupplyHover={setActiveSupplyHover}
          />
        )}

        {/* Board Controls: Filters and Remaining count */}
        {(!isTwoDeviceActive || twoDeviceRoom.status !== 'waiting') && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 font-['Fredoka',sans-serif] flex items-center gap-2">
                  <span>Animal Character Board</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {activeAnimals.length} Remaining
                  </span>
                </h2>
              </div>

              {/* Filter options */}
              <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200 shadow-2xs text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setBoardFilter('all');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    boardFilter === 'all'
                      ? 'bg-amber-400 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All (24)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setBoardFilter('active');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    boardFilter === 'active'
                      ? 'bg-amber-400 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Active ({activeAnimals.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setBoardFilter('eliminated');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    boardFilter === 'eliminated'
                      ? 'bg-amber-400 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Eliminated ({currentEliminatedIds.length})
                </button>
              </div>
            </div>

            {/* 24 Animal Character Cards Grid */}
            <div
              id="animal-board-grid"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6"
            >
              {displayedAnimals.map((animal) => {
                const isEliminated = currentEliminatedIds.includes(animal.id);

                return (
                  <AnimalCard
                    key={animal.id}
                    animal={animal}
                    isEliminated={isEliminated}
                    showJapanese={showJapanese}
                    highlightedSupplyId={activeSupplyHover}
                    onToggleEliminate={handleToggleAnimal}
                    onGuessAnimal={(a) => {
                      if (isTwoDeviceActive && !twoDeviceIsMyTurn) {
                        alert(`Please wait for ${twoDeviceOpponentPlayer?.name || 'your opponent'} to finish their turn.`);
                        return;
                      }
                      setTargetGuessAnimal(a);
                    }}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 px-6 bg-white/70 border-t border-amber-200 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            EFL English Learning Elimination Game • Designed for Elementary School Students in Japan
          </span>
          <span className="font-semibold text-slate-600">
            Target: <em>"Do you have a...?" / "Are you a...?"</em>
          </span>
        </div>
      </footer>

      {/* Modals */}
      {/* 1. Question Prompt Modal ("Do you have a...?") */}
      {selectedSupply && (
        <QuestionModal
          supply={selectedSupply}
          isOpen={!!selectedSupply}
          gameMode={gameMode}
          opponentSecretAnimal={opponentSecretAnimal}
          activeAnimals={activeAnimals}
          showJapanese={showJapanese}
          opponentName={twoDeviceOpponentPlayer?.name}
          onClose={() => setSelectedSupply(null)}
          onAnswer={handleAnswerSupply}
          onTwoDeviceSendQuestion={handleTwoDeviceSendQuestion}
        />
      )}

      {/* 2. Identity Guess Modal ("Are you a...?") */}
      {targetGuessAnimal && (
        <GuessModal
          targetAnimal={targetGuessAnimal}
          isOpen={!!targetGuessAnimal}
          gameMode={gameMode}
          opponentSecretAnimal={opponentSecretAnimal}
          showJapanese={showJapanese}
          opponentName={twoDeviceOpponentPlayer?.name}
          onClose={() => setTargetGuessAnimal(null)}
          onConfirmGuess={handleConfirmGuess}
          onTwoDeviceSendGuess={handleTwoDeviceSendGuess}
        />
      )}

      {/* 3. Computer's Turn Modal (when vs_computer mode) */}
      {computerTurnModalOpen && (
        <ComputerTurnModal
          isOpen={computerTurnModalOpen}
          playerSecretAnimal={p1SecretAnimal}
          computerCandidates={computerCandidates}
          showJapanese={showJapanese}
          onPlayerAnswerSupply={handlePlayerAnswerSupplyToComputer}
          onComputerGuessPlayer={handleComputerGuessPlayer}
        />
      )}

      {/* 4. Pass Turn Modal (when two_player mode) */}
      {passTurnModalOpen && (
        <PassTurnModal
          isOpen={passTurnModalOpen}
          nextPlayerName={isP1Turn ? 'Player 2' : 'Player 1'}
          onReady={handlePassTurnReady}
          showJapanese={showJapanese}
        />
      )}

      {/* 5. 2-Device Incoming Question Modal (Opponent asked you on their device) */}
      {isTwoDeviceActive &&
        twoDeviceRoom.pendingQuestion &&
        twoDeviceRoom.pendingQuestion.fromRole !== twoDeviceRole && (
          <TwoDeviceIncomingQuestionModal
            question={twoDeviceRoom.pendingQuestion}
            playerSecretAnimal={currentSecretAnimal}
            showJapanese={showJapanese}
            onAnswerSupply={(hasSupply) => {
              sendRoomAction(twoDeviceRoomId!, twoDeviceRole!, 'answer_supply', { hasSupply });
            }}
            onAnswerGuess={(isCorrect) => {
              sendRoomAction(twoDeviceRoomId!, twoDeviceRole!, 'answer_guess', { isCorrect });
            }}
          />
        )}

      {/* 6. Victory/Win Modal */}
      {(winnerInfo || (isTwoDeviceActive && twoDeviceRoom?.status === 'game_over' && twoDeviceRoom.winner)) && (
        <WinModal
          isOpen={true}
          winner={
            isTwoDeviceActive && twoDeviceRoom?.winner
              ? twoDeviceRoom.winner.winnerName
              : winnerInfo?.winner || 'Winner'
          }
          secretAnimal={
            isTwoDeviceActive && twoDeviceRoom?.winner
              ? twoDeviceRoom.winner.secretAnimal
              : winnerInfo?.animal || currentSecretAnimal
          }
          turnCount={
            isTwoDeviceActive && twoDeviceRoom?.winner
              ? twoDeviceRoom.winner.turnCount
              : winnerInfo?.turnCount || currentTurnCount
          }
          showJapanese={showJapanese}
          onPlayAgain={() => startNewGame()}
        />
      )}

      {/* 7. Vocabulary & Pronunciation Guide Modal */}
      {vocabModalOpen && (
        <VocabModal
          isOpen={vocabModalOpen}
          onClose={() => setVocabModalOpen(false)}
          showJapanese={showJapanese}
        />
      )}
    </div>
  );
}
