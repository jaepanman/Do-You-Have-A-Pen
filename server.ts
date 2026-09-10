import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { ANIMAL_CHARACTERS, SUPPLY_MAP, getSupplyQuestion, getAnimalQuestion } from './src/data/gameData';
import { RoomState, RoomPlayer, SupplyId, AnimalIdentity } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory Room Storage
const rooms = new Map<string, RoomState>();
const roomSockets = new Map<string, Set<WebSocket>>();

// Memorable word codes for school students
const ROOM_WORDS = [
  'LION', 'PANDA', 'TIGER', 'KOALA', 'BEAR', 'ZEBRA', 'FOX', 'FROG',
  'DUCK', 'CAT', 'DOG', 'MONKEY', 'PENGUIN', 'RABBIT', 'EAGLE', 'DEER'
];

function generateRoomCode(): string {
  // Try clean animal words first
  for (const word of ROOM_WORDS) {
    if (!rooms.has(word)) return word;
  }
  // If words are taken, generate a random 4-digit code
  let code = '';
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (rooms.has(code));
  return code;
}

function getRandomAnimals(): [AnimalIdentity, AnimalIdentity] {
  const shuffled = [...ANIMAL_CHARACTERS].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

function broadcastRoom(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  const sockets = roomSockets.get(roomId);
  if (!sockets) return;

  const data = JSON.stringify({ type: 'room_state', room });
  for (const ws of sockets) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  }
}

// Clean up old rooms after 4 hours
setInterval(() => {
  const now = Date.now();
  for (const [id, r] of rooms.entries()) {
    if (now - r.updatedAt > 4 * 60 * 60 * 1000) {
      rooms.delete(id);
      roomSockets.delete(id);
    }
  }
}, 30 * 60 * 1000);

// ==================== REST API ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', activeRooms: rooms.size });
});

// Create Room
app.post('/api/rooms/create', (req, res) => {
  const playerName = (req.body.playerName || 'Player 1').trim().slice(0, 20);
  const roomId = generateRoomCode();
  const [p1Animal, p2Animal] = getRandomAnimals();
  const playerId = 'p1_' + Math.random().toString(36).substring(2, 9);

  const player1: RoomPlayer = {
    id: playerId,
    name: playerName,
    role: 'player1',
    secretAnimal: p1Animal,
    eliminatedIds: [],
    askedSupplies: [],
    connected: true,
  };

  const room: RoomState = {
    roomId,
    player1,
    player2: null,
    turn: 'player1',
    status: 'waiting',
    pendingQuestion: null,
    lastAction: {
      type: 'room_created',
      text: `${playerName} created the room ${roomId}.`,
      japaneseText: `部屋 ${roomId} が作成されました。`,
      timestamp: Date.now(),
    },
    winner: null,
    turnCount: 0,
    updatedAt: Date.now(),
  };

  rooms.set(roomId, room);

  res.json({
    roomId,
    playerId,
    role: 'player1',
    room,
  });
});

// Join Room
app.post('/api/rooms/join', (req, res) => {
  const rawRoomId = (req.body.roomId || '').trim().toUpperCase();
  const playerName = (req.body.playerName || 'Player 2').trim().slice(0, 20);
  const existingPlayerId = req.body.playerId;

  const room = rooms.get(rawRoomId);
  if (!room) {
    return res.status(404).json({ error: `Room "${rawRoomId}" not found. Please check the code.` });
  }

  // Check if player is reconnecting
  if (existingPlayerId) {
    if (room.player1.id === existingPlayerId) {
      room.player1.connected = true;
      room.updatedAt = Date.now();
      broadcastRoom(rawRoomId);
      return res.json({ roomId: rawRoomId, playerId: existingPlayerId, role: 'player1', room });
    }
    if (room.player2 && room.player2.id === existingPlayerId) {
      room.player2.connected = true;
      room.updatedAt = Date.now();
      broadcastRoom(rawRoomId);
      return res.json({ roomId: rawRoomId, playerId: existingPlayerId, role: 'player2', room });
    }
  }

  // If Player 2 is already present
  if (room.player2) {
    return res.status(400).json({ error: 'This room already has 2 players.' });
  }

  // Pick an animal distinct from Player 1
  const availableAnimals = ANIMAL_CHARACTERS.filter((a) => a.id !== room.player1.secretAnimal.id);
  const p2Animal = availableAnimals[Math.floor(Math.random() * availableAnimals.length)];
  const playerId = 'p2_' + Math.random().toString(36).substring(2, 9);

  room.player2 = {
    id: playerId,
    name: playerName,
    role: 'player2',
    secretAnimal: p2Animal,
    eliminatedIds: [],
    askedSupplies: [],
    connected: true,
  };

  room.status = 'playing';
  room.lastAction = {
    type: 'player_joined',
    text: `${playerName} joined! The game begins. ${room.player1.name}'s turn.`,
    japaneseText: `${playerName} が参加しました！ゲームスタート。${room.player1.name} のターンです。`,
    timestamp: Date.now(),
  };
  room.updatedAt = Date.now();

  broadcastRoom(rawRoomId);

  res.json({
    roomId: rawRoomId,
    playerId,
    role: 'player2',
    room,
  });
});

// Get Room
app.get('/api/rooms/:roomId', (req, res) => {
  const roomId = req.params.roomId.trim().toUpperCase();
  const room = rooms.get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({ room });
});

// Perform Game Action
app.post('/api/rooms/:roomId/action', (req, res) => {
  const roomId = req.params.roomId.trim().toUpperCase();
  const { role, action, payload } = req.body;

  const room = rooms.get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const isP1 = role === 'player1';
  const player = isP1 ? room.player1 : room.player2;
  const opponent = isP1 ? room.player2 : room.player1;

  if (!player) {
    return res.status(400).json({ error: 'Invalid player' });
  }

  switch (action) {
    case 'ask_supply': {
      if (room.turn !== role) {
        return res.status(400).json({ error: 'Not your turn' });
      }
      const supply = SUPPLY_MAP.get(payload.supplyId as SupplyId);
      if (!supply) {
        return res.status(400).json({ error: 'Invalid supply' });
      }

      const { question, japanese } = getSupplyQuestion(supply);
      room.pendingQuestion = {
        fromRole: role,
        fromName: player.name,
        type: 'supply',
        supplyId: supply.id,
        questionText: question,
        japaneseText: japanese,
        timestamp: Date.now(),
      };

      room.lastAction = {
        type: 'question',
        text: `${player.name} asked: "${question}"`,
        japaneseText: `${player.name} が「${japanese}」とたずねました。`,
        timestamp: Date.now(),
      };
      break;
    }

    case 'answer_supply': {
      if (!room.pendingQuestion || room.pendingQuestion.fromRole === role) {
        return res.status(400).json({ error: 'No question to answer' });
      }
      const { hasSupply } = payload;
      const supplyId = room.pendingQuestion.supplyId!;
      const supply = SUPPLY_MAP.get(supplyId);

      // Asking player gets animals eliminated based on the answer
      const askingPlayer = opponent!;
      const newEliminations: string[] = [];
      ANIMAL_CHARACTERS.forEach((animal) => {
        const hasIt = animal.supplies.includes(supplyId);
        if (hasSupply && !hasIt) {
          newEliminations.push(animal.id);
        } else if (!hasSupply && hasIt) {
          newEliminations.push(animal.id);
        }
      });

      askingPlayer.eliminatedIds = Array.from(
        new Set([...askingPlayer.eliminatedIds, ...newEliminations])
      );
      if (!askingPlayer.askedSupplies.includes(supplyId)) {
        askingPlayer.askedSupplies.push(supplyId);
      }

      const answerText = hasSupply ? 'Yes, I do!' : "No, I don't.";
      const answerJp = hasSupply ? 'はい、もっています。' : 'いいえ、もっていません。';

      room.pendingQuestion = null;
      room.turn = role; // Now it is the answering player's turn to ask!
      room.turnCount += 1;

      room.lastAction = {
        type: 'answer',
        text: `${player.name} answered: "${answerText}"`,
        japaneseText: `${player.name} は「${answerJp}」と答えました。`,
        timestamp: Date.now(),
      };
      break;
    }

    case 'guess_animal': {
      if (room.turn !== role) {
        return res.status(400).json({ error: 'Not your turn' });
      }
      const targetAnimal = ANIMAL_CHARACTERS.find((a) => a.id === payload.targetAnimalId);
      if (!targetAnimal) {
        return res.status(400).json({ error: 'Invalid animal' });
      }

      const { question, japanese } = getAnimalQuestion(targetAnimal);
      room.pendingQuestion = {
        fromRole: role,
        fromName: player.name,
        type: 'identity',
        targetAnimalId: targetAnimal.id,
        questionText: question,
        japaneseText: japanese,
        timestamp: Date.now(),
      };

      room.lastAction = {
        type: 'guess',
        text: `${player.name} asked: "${question}"`,
        japaneseText: `${player.name} が「${japanese}」と正体を推理しました！`,
        timestamp: Date.now(),
      };
      break;
    }

    case 'answer_guess': {
      if (!room.pendingQuestion || room.pendingQuestion.fromRole === role) {
        return res.status(400).json({ error: 'No guess to answer' });
      }
      const { isCorrect } = payload;
      const targetAnimalId = room.pendingQuestion.targetAnimalId!;
      const askingPlayer = opponent!;

      if (isCorrect) {
        room.status = 'game_over';
        room.winner = {
          winnerRole: askingPlayer.role,
          winnerName: askingPlayer.name,
          secretAnimal: player.secretAnimal,
          turnCount: room.turnCount + 1,
        };
        room.pendingQuestion = null;
        room.lastAction = {
          type: 'win',
          text: `🎉 ${askingPlayer.name} correctly guessed ${player.secretAnimal.name} and won the game!`,
          japaneseText: `🎉 ${askingPlayer.name} が ${player.secretAnimal.japaneseName} を当てて勝利しました！`,
          timestamp: Date.now(),
        };
      } else {
        // Wrong guess: eliminate that animal from asking player's board
        askingPlayer.eliminatedIds = Array.from(
          new Set([...askingPlayer.eliminatedIds, targetAnimalId])
        );
        room.pendingQuestion = null;
        room.turn = role; // Shift turn
        room.turnCount += 1;
        room.lastAction = {
          type: 'guess_wrong',
          text: `${player.name} answered: "No, I'm not!" Turn passes to ${player.name}.`,
          japaneseText: `${player.name} は「いいえ、ちがいます」と答えました。次は ${player.name} のターンです。`,
          timestamp: Date.now(),
        };
      }
      break;
    }

    case 'toggle_eliminate': {
      const { animalId } = payload;
      if (player.eliminatedIds.includes(animalId)) {
        player.eliminatedIds = player.eliminatedIds.filter((id) => id !== animalId);
      } else {
        player.eliminatedIds.push(animalId);
      }
      break;
    }

    case 'restart_game': {
      const [p1Animal, p2Animal] = getRandomAnimals();
      room.player1.secretAnimal = p1Animal;
      room.player1.eliminatedIds = [];
      room.player1.askedSupplies = [];

      if (room.player2) {
        room.player2.secretAnimal = p2Animal;
        room.player2.eliminatedIds = [];
        room.player2.askedSupplies = [];
      }

      room.status = room.player2 ? 'playing' : 'waiting';
      room.turn = 'player1';
      room.turnCount = 0;
      room.pendingQuestion = null;
      room.winner = null;
      room.lastAction = {
        type: 'restart',
        text: 'A new game has started! Player 1 goes first.',
        japaneseText: '新しいゲームが始まりました！Player 1 からスタートです。',
        timestamp: Date.now(),
      };
      break;
    }
  }

  room.updatedAt = Date.now();
  broadcastRoom(roomId);
  res.json({ room });
});

// ==================== HTTP & WebSocket Setup ====================

async function startServer() {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    let currentRoomId: string | null = null;

    ws.on('message', (msgStr: string) => {
      try {
        const msg = JSON.parse(msgStr.toString());
        if (msg.type === 'subscribe' && msg.roomId) {
          const roomId = msg.roomId.trim().toUpperCase();
          currentRoomId = roomId;

          if (!roomSockets.has(roomId)) {
            roomSockets.set(roomId, new Set());
          }
          roomSockets.get(roomId)!.add(ws);

          // Send immediate state
          const room = rooms.get(roomId);
          if (room) {
            ws.send(JSON.stringify({ type: 'room_state', room }));
          }
        }
      } catch (err) {
        // Ignore malformed JSON
      }
    });

    ws.on('close', () => {
      if (currentRoomId && roomSockets.has(currentRoomId)) {
        roomSockets.get(currentRoomId)!.delete(ws);
      }
    });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
