export type WorldId = "greenhaven" | "forestia" | "aquaria";
export type WorldHealth = "damaged" | "recovering" | "thriving";
export type CrystalId = "life" | "water" | "renewal" | "energy" | "climate";

export const CRYSTALS: { id: CrystalId; name: string; region: string; available: boolean }[] = [
  { id: "life", name: "Life", region: "Forestia", available: true },
  { id: "water", name: "Water", region: "Aquaria", available: true },
  { id: "renewal", name: "Renewal", region: "Wasteland", available: false },
  { id: "energy", name: "Energy", region: "Energia", available: false },
  { id: "climate", name: "Climate", region: "Climatierra", available: false },
];

export const WORLDS: Record<WorldId, { name: string; tagline: string; mapKey: string }> = {
  greenhaven: { name: "Greenhaven", tagline: "The hub of the Earth Core", mapKey: "greenhaven" },
  forestia: { name: "Forestia", tagline: "Forests, biodiversity, waste", mapKey: "forestia" },
  aquaria: { name: "Aquaria", tagline: "Rivers, pollution, treatment", mapKey: "aquaria" },
};

export interface Quest {
  id: string;
  name: string;
  world: WorldId;
  description: string;
  steps: number;
}

export const QUESTS: Record<string, Quest> = {
  recycling_rookie: {
    id: "recycling_rookie",
    name: "Recycling Rookie",
    world: "forestia",
    description: "Sort the dump, learn what the forest can and can't absorb, and restock the station.",
    steps: 3,
  },
  water_watcher: {
    id: "water_watcher",
    name: "Water Watcher",
    world: "aquaria",
    description: "Trace the river from outflow to source and find where the damage begins.",
    steps: 3,
  },
  core_keeper: {
    id: "core_keeper",
    name: "Core Keeper",
    world: "greenhaven",
    description: "Awaken the Life and Water crystals and return them to the Earth Core.",
    steps: 2,
  },
};

export const BADGES: Record<string, { name: string; description: string }> = {
  tree_hugger: { name: "Tree Hugger", description: "Learned why old forests can't be replanted overnight." },
  eco_warrior: { name: "Eco Warrior", description: "Restored an ecosystem without shifting the harm elsewhere." },
  sorted: { name: "Sorted", description: "Sorted a whole dump without a single contaminated bin." },
  web_weaver: { name: "Web Weaver", description: "Rebuilt a forest food web from memory." },
  droplet: { name: "Droplet", description: "Followed a single drop through the entire water cycle." },
  clean_current: { name: "Clean Current", description: "Balanced people, nature and resources at Crystal Lake." },
};

export interface DialogueLine {
  speaker: string;
  text: string;
}

export interface Dialogue {
  id: string;
  title: string;
  lines: DialogueLine[];
  xp?: number;
  startQuest?: string;
  then?: { kind: "interaction" | "minigame" | "capstone"; id: string };
  actionLabel?: string;
}

export const DIALOGUES: Record<string, Dialogue> = {
  eco_intro: {
    id: "eco_intro",
    title: "ECO",
    lines: [
      { speaker: "ECO", text: "You're awake, Guardian. Good. The Earth Core has five sockets and only silence in all of them." },
      { speaker: "ECO", text: "Nobody broke it. That's the hard part. It went dark from a thousand small neglects." },
      { speaker: "ECO", text: "Two crystals are still reachable: Life, west in Forestia. Water, east in Aquaria. Go learn something worth carrying back." },
    ],
    xp: 15,
    startQuest: "core_keeper",
    actionLabel: "Let's go",
  },
  ranger_hollis: {
    id: "ranger_hollis",
    title: "Ranger Hollis",
    lines: [
      { speaker: "Hollis", text: "New Guardian? Careful where you step, half this clearing is somebody's discarded weekend." },
      { speaker: "Hollis", text: "Waste isn't evil, it's just misplaced. Every item here belongs somewhere — the trick is knowing where." },
      { speaker: "Hollis", text: "Sort a load at the station and I'll mark you down as a Recycling Rookie." },
    ],
    xp: 10,
    startQuest: "recycling_rookie",
    then: { kind: "interaction", id: "sort_station" },
    actionLabel: "Sort a load",
  },
  biologist_nyla: {
    id: "biologist_nyla",
    title: "Dr. Nyla",
    lines: [
      { speaker: "Nyla", text: "Count the owls and you learn nothing. Count what the owls eat and you learn everything." },
      { speaker: "Nyla", text: "This pond's web lost a link last season. Rebuild it for me and we'll see which one." },
    ],
    xp: 10,
    then: { kind: "minigame", id: "food_web" },
    actionLabel: "Rebuild the web",
  },
  hydrologist_mara: {
    id: "hydrologist_mara",
    title: "Mara of the Locks",
    lines: [
      { speaker: "Mara", text: "The river doesn't start here and it doesn't end here. That's the first thing people forget." },
      { speaker: "Mara", text: "Walk it. Outflow, treatment, lake. Tell me where the damage actually begins." },
    ],
    xp: 10,
    startQuest: "water_watcher",
    then: { kind: "interaction", id: "water_cycle" },
    actionLabel: "Trace the river",
  },
  ancient_tree_intro: {
    id: "ancient_tree_intro",
    title: "The Ancient Tree",
    lines: [
      { speaker: "Ancient Tree", text: "You come with a plan, Guardian. They always come with a plan." },
      { speaker: "Ancient Tree", text: "Restore this grove — but every choice takes something from somewhere. Choose so the ledger balances." },
    ],
    then: { kind: "capstone", id: "ancient_tree" },
    actionLabel: "Face the challenge",
  },
  crystal_lake_intro: {
    id: "crystal_lake_intro",
    title: "Crystal Lake",
    lines: [
      { speaker: "ECO", text: "The lake feeds a town, a wetland and a mill. All three have a claim on it." },
      { speaker: "ECO", text: "Starve any one of them and the water crystal stays dark. Balance it." },
    ],
    then: { kind: "capstone", id: "crystal_lake" },
    actionLabel: "Balance the lake",
  },
};

export interface Interaction {
  id: string;
  title: string;
  speaker: string;
  prompt: string;
  options: { label: string; correct: boolean; feedback: string }[];
  xp: number;
  questProgress?: string;
  badge?: string;
  world: WorldId;
}

export const INTERACTIONS: Record<string, Interaction> = {
  sort_station: {
    id: "sort_station",
    title: "Recycling Station",
    speaker: "Station terminal",
    world: "forestia",
    prompt:
      "A crate arrives: a greasy pizza box, a rinsed can, and a snapped plastic chair. One of these ruins a whole recycling batch if you put it in the paper bin. Which?",
    options: [
      { label: "The greasy pizza box", correct: true, feedback: "Right. Food oil contaminates paper pulp — that box goes to compost, not paper." },
      { label: "The rinsed can", correct: false, feedback: "A rinsed can is one of the best things you can recycle — aluminium recycles almost endlessly." },
      { label: "The plastic chair", correct: false, feedback: "Bulky plastic is a problem, but it's a sorting problem, not a contamination one." },
    ],
    xp: 25,
    questProgress: "recycling_rookie",
    badge: "sorted",
  },
  clearcut: {
    id: "clearcut",
    title: "The Clear-Cut",
    speaker: "ECO",
    world: "forestia",
    prompt:
      "Twelve hectares felled, saplings already planted in neat rows. The rangers call it restored. Do you agree?",
    options: [
      { label: "Not yet — young trees aren't old habitat", correct: true, feedback: "Exactly. Deadwood, canopy layers and soil fungi take decades. Planting starts recovery; it doesn't finish it." },
      { label: "Yes, the tree count matches", correct: false, feedback: "Tree count is the easiest number to hit and the least useful one. Structure and species mix matter more." },
      { label: "Yes, carbon is what counts", correct: false, feedback: "Carbon matters, but a monoculture stores less and shelters almost nothing." },
    ],
    xp: 30,
    questProgress: "recycling_rookie",
    badge: "tree_hugger",
  },
  water_cycle: {
    id: "water_cycle",
    title: "Reading the River",
    speaker: "Mara",
    world: "aquaria",
    prompt:
      "The lower river runs green and warm. The mill upstream swears its discharge is clean water only — no chemicals. Can clean warm water still harm the river?",
    options: [
      { label: "Yes — warm water holds less oxygen", correct: true, feedback: "Thermal pollution is real. Warmer water carries less dissolved oxygen, and fish suffocate in perfectly 'clean' water." },
      { label: "No, if there are no chemicals it's fine", correct: false, feedback: "Temperature alone changes what the water can hold and who can live in it." },
      { label: "Only if it's salty", correct: false, feedback: "Salinity matters elsewhere, but here the giveaway is the temperature and the algae bloom." },
    ],
    xp: 30,
    questProgress: "water_watcher",
    badge: "droplet",
  },
  treatment: {
    id: "treatment",
    title: "Treatment Works",
    speaker: "Plant operator",
    world: "aquaria",
    prompt:
      "Our plant runs screening, settling, biological digestion and disinfection. Budget cuts force us to drop one stage for a month. Which loss does the river survive best?",
    options: [
      { label: "Disinfection — with a swimming ban downstream", correct: true, feedback: "Grim but true: pathogens threaten people more than the river, so you protect the biology and warn the town." },
      { label: "Biological digestion", correct: false, feedback: "Drop that and organic load hits the river, oxygen crashes, and fish die within days." },
      { label: "Screening", correct: false, feedback: "Skip screening and rags and grit wreck the pumps — the whole plant fails, not just one stage." },
    ],
    xp: 30,
    questProgress: "water_watcher",
  },
  earth_core: {
    id: "earth_core",
    title: "The Earth Core",
    speaker: "ECO",
    world: "greenhaven",
    prompt:
      "Five sockets, five crystals. What actually lights one of them?",
    options: [
      { label: "Understanding turned into an action that holds", correct: true, feedback: "That's the whole rule. No relics, no chosen ones — repair that survives contact with real trade-offs." },
      { label: "Defeating whoever broke the world", correct: false, feedback: "There's no one to defeat. Neglect did this, and neglect has no boss fight." },
      { label: "Collecting rare artifacts", correct: false, feedback: "The crystals aren't loot. They respond to restored systems." },
    ],
    xp: 20,
  },
};

export type InteractableKind =
  | "dialogue"
  | "interaction"
  | "minigame"
  | "capstone"
  | "travel"
  | "core"
  | "ai_chat"
  | "eco_lens";

export interface Interactable {
  id: string;
  kind: InteractableKind;
  target: string;
  tx: number;
  ty: number;
  label: string;
}

export const INTERACTABLES: Record<WorldId, Interactable[]> = {
  greenhaven: [
    { id: "gh_eco", kind: "ai_chat", target: "gh_eco", tx: 16, ty: 16, label: "ECO" },
    { id: "gh_lens", kind: "eco_lens", target: "eco_lens", tx: 22, ty: 15, label: "Eco-Lens Terminal" },
    { id: "gh_core", kind: "core", target: "earth_core", tx: 20, ty: 15, label: "Earth Core" },
    { id: "gh_west", kind: "travel", target: "forestia", tx: 3, ty: 13, label: "West gate — Forestia" },
    { id: "gh_east", kind: "travel", target: "aquaria", tx: 36, ty: 13, label: "East gate — Aquaria" },
  ],
  forestia: [
    { id: "fo_ranger", kind: "ai_chat", target: "fo_ranger", tx: 33, ty: 23, label: "Ranger Hollis" },
    { id: "fo_station", kind: "interaction", target: "sort_station", tx: 31, ty: 22, label: "Recycling station" },
    { id: "fo_clearcut", kind: "interaction", target: "clearcut", tx: 5, ty: 23, label: "The clear-cut" },
    { id: "fo_nyla", kind: "ai_chat", target: "fo_nyla", tx: 36, ty: 32, label: "Dr. Nyla" },
    { id: "fo_tree", kind: "dialogue", target: "ancient_tree_intro", tx: 25, ty: 9, label: "Ancient Tree" },
    { id: "fo_home", kind: "travel", target: "greenhaven", tx: 25, ty: 42, label: "Road home" },
  ],
  aquaria: [
    { id: "aq_mara", kind: "ai_chat", target: "aq_mara", tx: 10, ty: 30, label: "Mara of the Locks" },
    { id: "aq_treatment", kind: "interaction", target: "treatment", tx: 9, ty: 29, label: "Treatment works" },
    { id: "aq_outflow", kind: "interaction", target: "water_cycle", tx: 38, ty: 33, label: "Industrial outflow" },
    { id: "aq_lake", kind: "dialogue", target: "crystal_lake_intro", tx: 25, ty: 13, label: "Crystal Lake" },
    { id: "aq_home", kind: "travel", target: "greenhaven", tx: 25, ty: 42, label: "Road home" },
  ],
};

export const SPAWNS: Record<WorldId, { tx: number; ty: number }> = {
  greenhaven: { tx: 20, ty: 17 },
  forestia: { tx: 25, ty: 40 },
  aquaria: { tx: 25, ty: 40 },
};
