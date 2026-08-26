import { create } from 'zustand';

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  world: 'forestia' | 'aquaria';
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
  world: 'forestia' | 'aquaria' | 'global';
}

export interface GameState {
  // Player
  playerName: string;
  level: number;
  xp: number;
  xpToNext: number;
  understanding: number;
  restoration: number;

  // World
  currentWorld: 'greenhaven' | 'forestia' | 'aquaria';
  forestiaState: 'damaged' | 'recovering' | 'thriving';
  aquariaState:  'damaged' | 'recovering' | 'thriving';
  crystals: {
    forestia: boolean;
    aquaria: boolean;
  };

  // Progress
  quests: Quest[];
  badges: Badge[];
  completedLessons: string[];

  // UI
  activeModal: null | { type: 'lesson' | 'quest' | 'minigame' | 'dialogue'; id: string };

  // Actions
  addXP: (amount: number) => void;
  addUnderstanding: (amount: number) => void;
  addRestoration: (amount: number) => void;
  completeQuest: (id: string) => void;
  unlockBadge: (id: string) => void;
  openModal: (type: 'lesson' | 'quest' | 'minigame' | 'dialogue', id: string) => void;
  closeModal: () => void;
  setWorld: (world: 'greenhaven' | 'forestia' | 'aquaria') => void;
  completeLesson: (id: string) => void;
  awakenCrystal: (world: 'forestia' | 'aquaria') => void;
}

const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q_forest_01', world: 'forestia',
    title: 'First Steps in the Forest',
    description: 'Talk to the Ranger at the Ranger Station.',
    xpReward: 50, completed: false,
  },
  {
    id: 'q_forest_02', world: 'forestia',
    title: 'Recycling Rookie',
    description: 'Complete the recycling mini-game.',
    xpReward: 100, completed: false,
  },
  {
    id: 'q_aquaria_01', world: 'aquaria',
    title: 'Water Watcher',
    description: 'Inspect the water treatment plant.',
    xpReward: 75, completed: false,
  },
];

const INITIAL_BADGES: Badge[] = [
  { id: 'b_explorer',     world: 'global',   icon: '🧭', name: 'Explorer',         description: 'Entered your first world',      unlocked: false },
  { id: 'b_tree_hugger',  world: 'forestia', icon: '🌳', name: 'Tree Hugger',       description: 'Inspected 5 trees',             unlocked: false },
  { id: 'b_eco_warrior',  world: 'forestia', icon: '♻️', name: 'Eco Warrior',       description: 'Completed the recycling quest', unlocked: false },
  { id: 'b_water_keeper', world: 'aquaria',  icon: '💧', name: 'Water Keeper',      description: 'Cleaned the polluted river',    unlocked: false },
  { id: 'b_scholar',      world: 'global',   icon: '📚', name: 'Environmental Scholar', description: 'Completed 5 lessons',       unlocked: false },
];

export const useGameStore = create<GameState>((set, get) => ({
  playerName: 'EcoHero',
  level: 1,
  xp: 0,
  xpToNext: 200,
  understanding: 0,
  restoration: 0,

  currentWorld: 'greenhaven',
  forestiaState: 'damaged',
  aquariaState:  'damaged',
  crystals: {
    forestia: false,
    aquaria: false,
  },

  quests: INITIAL_QUESTS,
  badges: INITIAL_BADGES,
  completedLessons: [],
  activeModal: null,

  addXP: (amount) => {
    const { xp, xpToNext, level } = get();
    const newXP = xp + amount;
    if (newXP >= xpToNext) {
      set({ xp: newXP - xpToNext, xpToNext: Math.round(xpToNext * 1.4), level: level + 1 });
    } else {
      set({ xp: newXP });
    }
  },

  addUnderstanding: (amount) => set((state) => ({ understanding: Math.min(100, state.understanding + amount) })),
  addRestoration: (amount) => set((state) => ({ restoration: Math.min(100, state.restoration + amount) })),

  awakenCrystal: (world) => set((state) => ({
    crystals: { ...state.crystals, [world]: true }
  })),

  completeQuest: (id) => {
    const quest = get().quests.find(q => q.id === id);
    if (!quest || quest.completed) return;
    get().addXP(quest.xpReward);
    set(state => ({
      quests: state.quests.map(q => q.id === id ? { ...q, completed: true } : q),
    }));
  },

  unlockBadge: (id) => {
    set(state => ({
      badges: state.badges.map(b => b.id === id ? { ...b, unlocked: true } : b),
    }));
  },

  openModal: (type, id) => set({ activeModal: { type, id } }),
  closeModal: () => set({ activeModal: null }),

  setWorld: (world) => set({ currentWorld: world }),

  completeLesson: (id) => {
    if (get().completedLessons.includes(id)) return;
    get().addXP(30);
    set(state => ({ completedLessons: [...state.completedLessons, id] }));
  },
}));
