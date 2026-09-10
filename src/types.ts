export type SupplyId =
  | 'pencil'
  | 'pen'
  | 'pencil_sharpener'
  | 'marker'
  | 'magnet'
  | 'glue_stick'
  | 'ruler'
  | 'eraser'
  | 'pencil_case'
  | 'calendar'
  | 'notebook'
  | 'stapler';

export interface SchoolSupply {
  id: SupplyId;
  name: string;
  article: 'a' | 'an';
  japaneseName: string;
  romaji: string;
  category: string;
  color: string;
  iconName: string;
}

export interface AnimalIdentity {
  id: string;
  name: string;
  article: 'a' | 'an';
  japaneseName: string;
  romaji: string;
  emoji: string;
  colorBg: string;
  colorBorder: string;
  supplies: SupplyId[];
}

export type GameMode = 'vs_computer' | 'two_player' | 'two_device' | 'practice';

export interface RoomPlayer {
  id: string;
  name: string;
  role: 'player1' | 'player2';
  secretAnimal: AnimalIdentity;
  eliminatedIds: string[];
  askedSupplies: SupplyId[];
  connected: boolean;
}

export interface RoomQuestion {
  fromRole: 'player1' | 'player2';
  fromName: string;
  type: 'supply' | 'identity';
  supplyId?: SupplyId;
  targetAnimalId?: string;
  questionText: string;
  japaneseText: string;
  timestamp: number;
}

export interface RoomState {
  roomId: string;
  player1: RoomPlayer;
  player2: RoomPlayer | null;
  turn: 'player1' | 'player2';
  status: 'waiting' | 'playing' | 'game_over';
  pendingQuestion: RoomQuestion | null;
  lastAction: {
    type: string;
    text: string;
    japaneseText?: string;
    timestamp: number;
  } | null;
  winner: {
    winnerRole: 'player1' | 'player2';
    winnerName: string;
    secretAnimal: AnimalIdentity;
    turnCount: number;
  } | null;
  turnCount: number;
  updatedAt: number;
}

export interface PlayerState {
  name: string;
  secretAnimal: AnimalIdentity;
  eliminatedAnimalIds: string[];
  askedSupplyIds: SupplyId[];
  wrongGuesses: string[];
  turnCount: number;
}

