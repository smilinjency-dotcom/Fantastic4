import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import {
  BADGES,
  CRYSTALS,
  QUESTS,
  type CrystalId,
  type WorldHealth,
  type WorldId,
} from "@/game/content";

export interface ActiveModal {
  kind: "dialogue" | "interaction" | "minigame" | "capstone" | "ending";
  id: string;
}

export function xpToNext(level: number) {
  return 100 + (level - 1) * 75;
}

interface GameState {
  hydrated: boolean;
  userId: string | null;
  displayName: string;
  role: string;
  xp: number;
  level: number;
  crystals: CrystalId[];
  badges: string[];
  lessons: string[];
  quests: Record<string, number>;
  worldHealth: Record<WorldId, WorldHealth>;
  currentWorld: WorldId;
  activeModal: ActiveModal | null;
  toast: { id: number; text: string } | null;
  endingSeen: boolean;

  hydrate: (row: unknown, userId: string, displayName: string, role: string) => void;
  reset: () => void;
  setWorld: (world: WorldId) => void;
  openModal: (modal: ActiveModal) => void;
  closeModal: () => void;
  notify: (text: string) => void;
  grantXp: (amount: number) => void;
  completeLesson: (id: string, xp: number) => boolean;
  startQuest: (id: string) => void;
  progressQuest: (id: string) => void;
  awardBadge: (id: string) => void;
  awardCrystal: (id: CrystalId) => void;
}

const initialHealth: Record<WorldId, WorldHealth> = {
  greenhaven: "recovering",
  forestia: "damaged",
  aquaria: "damaged",
};

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(get: () => GameState) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const s = get();
    if (!s.userId) return;
    void supabase
      .from("player_progress")
      .upsert(
        {
          user_id: s.userId,
          xp: s.xp,
          level: s.level,
          crystals: s.crystals,
          badges: s.badges,
          lessons: s.lessons,
          quests: s.quests,
          world_health: s.worldHealth,
          current_world: s.currentWorld,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .then(({ error }) => {
        if (error) console.error("progress save failed", error.message);
      });
  }, 700);
}

function recomputeHealth(state: GameState): Record<WorldId, WorldHealth> {
  const forestLessons = state.lessons.filter((l) => ["sort_station", "clearcut", "food_web"].includes(l)).length;
  const waterLessons = state.lessons.filter((l) => ["water_cycle", "treatment"].includes(l)).length;
  const forestia: WorldHealth = state.crystals.includes("life")
    ? "thriving"
    : forestLessons > 0
      ? "recovering"
      : "damaged";
  const aquaria: WorldHealth = state.crystals.includes("water")
    ? "thriving"
    : waterLessons > 0
      ? "recovering"
      : "damaged";
  const greenhaven: WorldHealth =
    state.crystals.length >= 2 ? "thriving" : state.crystals.length === 1 ? "recovering" : "recovering";
  return { greenhaven, forestia, aquaria };
}

export const useGameStore = create<GameState>((set, get) => ({
  hydrated: false,
  userId: null,
  displayName: "Eco Guardian",
  role: "student",
  xp: 0,
  level: 1,
  crystals: [],
  badges: [],
  lessons: [],
  quests: {},
  worldHealth: initialHealth,
  currentWorld: "greenhaven",
  activeModal: null,
  toast: null,
  endingSeen: false,

  hydrate: (row, userId, displayName, role) => {
    const r = (row ?? {}) as Record<string, unknown>;
    set({
      hydrated: true,
      userId,
      displayName,
      role,
      xp: (r["xp"] as number) ?? 0,
      level: (r["level"] as number) ?? 1,
      crystals: ((r["crystals"] as CrystalId[]) ?? []).filter(Boolean),
      badges: (r["badges"] as string[]) ?? [],
      lessons: (r["lessons"] as string[]) ?? [],
      quests: (r["quests"] as Record<string, number>) ?? {},
      worldHealth: (r["world_health"] as Record<WorldId, WorldHealth>) ?? initialHealth,
      currentWorld: ((r["current_world"] as WorldId) ?? "greenhaven") as WorldId,
    });
  },

  reset: () =>
    set({
      hydrated: false,
      userId: null,
      xp: 0,
      level: 1,
      crystals: [],
      badges: [],
      lessons: [],
      quests: {},
      worldHealth: initialHealth,
      currentWorld: "greenhaven",
      activeModal: null,
      endingSeen: false,
    }),

  setWorld: (world) => {
    set({ currentWorld: world, activeModal: null });
    scheduleSave(get);
  },

  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),

  notify: (text) => {
    set({ toast: { id: Date.now(), text } });
    setTimeout(() => {
      if (get().toast?.text === text) set({ toast: null });
    }, 3200);
  },

  grantXp: (amount) => {
    const state = get();
    let xp = state.xp + amount;
    let level = state.level;
    while (xp >= xpToNext(level)) {
      xp -= xpToNext(level);
      level += 1;
    }
    if (level > state.level) {
      set({ xp, level });
      get().notify(`Level ${level}! +${amount} XP`);
    } else {
      set({ xp, level });
      get().notify(`+${amount} XP`);
    }
    scheduleSave(get);
  },

  completeLesson: (id, xp) => {
    const state = get();
    if (state.lessons.includes(id)) return false;
    set({ lessons: [...state.lessons, id] });
    set((s) => ({ worldHealth: recomputeHealth({ ...s } as GameState) }));
    get().grantXp(xp);
    return true;
  },

  startQuest: (id) => {
    const state = get();
    if (state.quests[id] !== undefined) return;
    set({ quests: { ...state.quests, [id]: 0 } });
    get().notify(`New quest: ${QUESTS[id]?.name ?? id}`);
    scheduleSave(get);
  },

  progressQuest: (id) => {
    const state = get();
    const quest = QUESTS[id];
    if (!quest) return;
    const current = state.quests[id] ?? 0;
    if (current >= quest.steps) return;
    const next = current + 1;
    set({ quests: { ...state.quests, [id]: next } });
    if (next >= quest.steps) {
      get().notify(`Quest complete: ${quest.name}`);
      get().grantXp(40);
    }
    scheduleSave(get);
  },

  awardBadge: (id) => {
    const state = get();
    if (state.badges.includes(id)) return;
    set({ badges: [...state.badges, id] });
    get().notify(`Badge earned: ${BADGES[id]?.name ?? id}`);
    scheduleSave(get);
  },

  awardCrystal: (id) => {
    const state = get();
    if (state.crystals.includes(id)) return;
    const crystals = [...state.crystals, id];
    set({ crystals });
    set((s) => ({ worldHealth: recomputeHealth({ ...s } as GameState) }));
    const crystal = CRYSTALS.find((c) => c.id === id);
    get().notify(`${crystal?.name ?? id} Crystal awakened!`);
    get().grantXp(120);
    if (id === "life" || id === "water") get().progressQuest("core_keeper");
    scheduleSave(get);
  },
}));
