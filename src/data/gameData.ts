import { SchoolSupply, AnimalIdentity, SupplyId } from '../types';

export const SCHOOL_SUPPLIES: SchoolSupply[] = [
  {
    id: 'pencil',
    name: 'pencil',
    article: 'a',
    japaneseName: 'えんぴつ',
    romaji: 'enpitsu',
    category: 'writing',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    iconName: 'Pencil',
  },
  {
    id: 'pen',
    name: 'pen',
    article: 'a',
    japaneseName: 'ペン',
    romaji: 'pen',
    category: 'writing',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    iconName: 'PenLine',
  },
  {
    id: 'pencil_sharpener',
    name: 'pencil sharpener',
    article: 'a',
    japaneseName: 'えんぴつけずり',
    romaji: 'enpitsu kezuri',
    category: 'tools',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    iconName: 'Sparkles',
  },
  {
    id: 'marker',
    name: 'marker',
    article: 'a',
    japaneseName: 'マーカー',
    romaji: 'maakaa',
    category: 'writing',
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    iconName: 'Highlighter',
  },
  {
    id: 'magnet',
    name: 'magnet',
    article: 'a',
    japaneseName: 'じしゃく',
    romaji: 'jishaku',
    category: 'tools',
    color: 'bg-red-100 text-red-800 border-red-300',
    iconName: 'Magnet',
  },
  {
    id: 'glue_stick',
    name: 'glue stick',
    article: 'a',
    japaneseName: 'スティックのり',
    romaji: 'sutikku nori',
    category: 'craft',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    iconName: 'Layers',
  },
  {
    id: 'ruler',
    name: 'ruler',
    article: 'a',
    japaneseName: 'じょうぎ',
    romaji: 'jougi',
    category: 'tools',
    color: 'bg-teal-100 text-teal-800 border-teal-300',
    iconName: 'Ruler',
  },
  {
    id: 'eraser',
    name: 'eraser',
    article: 'an',
    japaneseName: 'けしゴム',
    romaji: 'keshigomu',
    category: 'correction',
    color: 'bg-pink-100 text-pink-800 border-pink-300',
    iconName: 'Eraser',
  },
  {
    id: 'pencil_case',
    name: 'pencil case',
    article: 'a',
    japaneseName: 'ふでばこ',
    romaji: 'fudebako',
    category: 'storage',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    iconName: 'Briefcase',
  },
  {
    id: 'calendar',
    name: 'calendar',
    article: 'a',
    japaneseName: 'カレンダー',
    romaji: 'karendaa',
    category: 'desk',
    color: 'bg-sky-100 text-sky-800 border-sky-300',
    iconName: 'Calendar',
  },
  {
    id: 'notebook',
    name: 'notebook',
    article: 'a',
    japaneseName: 'ノート',
    romaji: 'nooto',
    category: 'paper',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    iconName: 'BookOpen',
  },
  {
    id: 'stapler',
    name: 'stapler',
    article: 'a',
    japaneseName: 'ホッチキス',
    romaji: 'hotchikisu',
    category: 'tools',
    color: 'bg-violet-100 text-violet-800 border-violet-300',
    iconName: 'Paperclip',
  },
];

export const SUPPLY_MAP = new Map<SupplyId, SchoolSupply>(
  SCHOOL_SUPPLIES.map((item) => [item.id, item])
);

// Define raw animal character profiles
interface RawAnimal {
  id: string;
  name: string;
  article: 'a' | 'an';
  japaneseName: string;
  romaji: string;
  emoji: string;
  colorBg: string;
  colorBorder: string;
}

const RAW_ANIMALS: RawAnimal[] = [
  { id: 'dog', name: 'Dog', article: 'a', japaneseName: 'いぬ', romaji: 'inu', emoji: '🐶', colorBg: 'from-amber-100 to-amber-50', colorBorder: 'border-amber-300' },
  { id: 'cat', name: 'Cat', article: 'a', japaneseName: 'ねこ', romaji: 'neko', emoji: '🐱', colorBg: 'from-orange-100 to-orange-50', colorBorder: 'border-orange-300' },
  { id: 'bear', name: 'Bear', article: 'a', japaneseName: 'くま', romaji: 'kuma', emoji: '🐻', colorBg: 'from-amber-200/60 to-amber-100/40', colorBorder: 'border-amber-400' },
  { id: 'rabbit', name: 'Rabbit', article: 'a', japaneseName: 'うさぎ', romaji: 'usagi', emoji: '🐰', colorBg: 'from-pink-100 to-pink-50', colorBorder: 'border-pink-300' },
  { id: 'panda', name: 'Panda', article: 'a', japaneseName: 'パンダ', romaji: 'panda', emoji: '🐼', colorBg: 'from-slate-100 to-slate-50', colorBorder: 'border-slate-300' },
  { id: 'koala', name: 'Koala', article: 'a', japaneseName: 'コアラ', romaji: 'koara', emoji: '🐨', colorBg: 'from-emerald-100 to-emerald-50', colorBorder: 'border-emerald-300' },
  { id: 'tiger', name: 'Tiger', article: 'a', japaneseName: 'とら', romaji: 'tora', emoji: '🐯', colorBg: 'from-yellow-100 to-amber-50', colorBorder: 'border-yellow-400' },
  { id: 'lion', name: 'Lion', article: 'a', japaneseName: 'ライオン', romaji: 'raion', emoji: '🦁', colorBg: 'from-amber-100 to-yellow-50', colorBorder: 'border-amber-400' },
  { id: 'elephant', name: 'Elephant', article: 'an', japaneseName: 'ぞう', romaji: 'zou', emoji: '🐘', colorBg: 'from-cyan-100 to-cyan-50', colorBorder: 'border-cyan-300' },
  { id: 'monkey', name: 'Monkey', article: 'a', japaneseName: 'さる', romaji: 'saru', emoji: '🐵', colorBg: 'from-orange-100 to-yellow-50', colorBorder: 'border-orange-300' },
  { id: 'fox', name: 'Fox', article: 'a', japaneseName: 'きつね', romaji: 'kitsune', emoji: '🦊', colorBg: 'from-red-100 to-orange-50', colorBorder: 'border-red-300' },
  { id: 'giraffe', name: 'Giraffe', article: 'a', japaneseName: 'きりん', romaji: 'kirin', emoji: '🦒', colorBg: 'from-yellow-100 to-amber-50', colorBorder: 'border-yellow-300' },
  { id: 'penguin', name: 'Penguin', article: 'a', japaneseName: 'ペンギン', romaji: 'pengin', emoji: '🐧', colorBg: 'from-sky-100 to-blue-50', colorBorder: 'border-sky-300' },
  { id: 'pig', name: 'Pig', article: 'a', japaneseName: 'ぶた', romaji: 'buta', emoji: '🐷', colorBg: 'from-rose-100 to-pink-50', colorBorder: 'border-rose-300' },
  { id: 'frog', name: 'Frog', article: 'a', japaneseName: 'かえる', romaji: 'kaeru', emoji: '🐸', colorBg: 'from-green-100 to-emerald-50', colorBorder: 'border-green-300' },
  { id: 'hamster', name: 'Hamster', article: 'a', japaneseName: 'ハムスター', romaji: 'hamasutaa', emoji: '🐹', colorBg: 'from-amber-100 to-orange-50', colorBorder: 'border-amber-300' },
  { id: 'zebra', name: 'Zebra', article: 'a', japaneseName: 'しまうま', romaji: 'shimauma', emoji: '🦓', colorBg: 'from-slate-100 to-zinc-50', colorBorder: 'border-slate-400' },
  { id: 'kangaroo', name: 'Kangaroo', article: 'a', japaneseName: 'カンガルー', romaji: 'kangaruu', emoji: '🦘', colorBg: 'from-orange-100 to-amber-50', colorBorder: 'border-orange-400' },
  { id: 'hippo', name: 'Hippo', article: 'a', japaneseName: 'かば', romaji: 'kaba', emoji: '🦛', colorBg: 'from-indigo-100 to-blue-50', colorBorder: 'border-indigo-300' },
  { id: 'deer', name: 'Deer', article: 'a', japaneseName: 'しか', romaji: 'shika', emoji: '🦌', colorBg: 'from-amber-100 to-amber-50', colorBorder: 'border-amber-300' },
  { id: 'sheep', name: 'Sheep', article: 'a', japaneseName: 'ひつじ', romaji: 'hitsuji', emoji: '🐑', colorBg: 'from-teal-100 to-emerald-50', colorBorder: 'border-teal-300' },
  { id: 'duck', name: 'Duck', article: 'a', japaneseName: 'あひる', romaji: 'ahiru', emoji: '🦆', colorBg: 'from-lime-100 to-emerald-50', colorBorder: 'border-lime-300' },
  { id: 'owl', name: 'Owl', article: 'an', japaneseName: 'ふくろう', romaji: 'fukurou', emoji: '🦉', colorBg: 'from-purple-100 to-indigo-50', colorBorder: 'border-purple-300' },
  { id: 'dolphin', name: 'Dolphin', article: 'a', japaneseName: 'いるか', romaji: 'iruka', emoji: '🐬', colorBg: 'from-cyan-100 to-blue-50', colorBorder: 'border-cyan-400' },
];

const SUPPLY_KEYS: SupplyId[] = [
  'pencil',
  'pen',
  'pencil_sharpener',
  'marker',
  'magnet',
  'glue_stick',
  'ruler',
  'eraser',
  'pencil_case',
  'calendar',
  'notebook',
  'stapler',
];

// Balanced combinatorial generation:
// Each of the 24 animals gets exactly 4 unique school supplies.
// By mathematical group construction, every single item appears on EXACTLY 8 animals.
// (8 / 24 = 33.3%, ensuring no item immediately eliminates half or more of the board).
export const ANIMAL_CHARACTERS: AnimalIdentity[] = RAW_ANIMALS.map((animal, idx) => {
  let supplyIndices: number[];

  if (idx < 12) {
    // First 12 animals: consecutive stride 1
    supplyIndices = [idx, (idx + 1) % 12, (idx + 2) % 12, (idx + 3) % 12];
  } else {
    // Next 12 animals: stride offsets {0, 2, 5, 7}
    const j = idx - 12;
    supplyIndices = [
      j,
      (j + 2) % 12,
      (j + 5) % 12,
      (j + 7) % 12,
    ];
  }

  const supplies = supplyIndices.map((i) => SUPPLY_KEYS[i]);

  return {
    ...animal,
    supplies,
  };
});

export const ANIMAL_MAP = new Map<string, AnimalIdentity>(
  ANIMAL_CHARACTERS.map((a) => [a.id, a])
);

// Helper function to get question prompt string
export function getSupplyQuestion(supply: SchoolSupply): {
  question: string;
  japanese: string;
  yesResponse: string;
  noResponse: string;
} {
  return {
    question: `Do you have ${supply.article} ${supply.name}?`,
    japanese: `${supply.japaneseName}をもっていますか？`,
    yesResponse: 'Yes, I do.',
    noResponse: "No, I don't.",
  };
}

export function getAnimalQuestion(animal: AnimalIdentity): {
  question: string;
  japanese: string;
  yesResponse: string;
  noResponse: string;
} {
  return {
    question: `Are you ${animal.article} ${animal.name}?`,
    japanese: `${animal.japaneseName}ですか？`,
    yesResponse: 'Yes, I am!',
    noResponse: "No, I'm not.",
  };
}
