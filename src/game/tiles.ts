/** Shared tile indices — must stay in sync with scripts/generateMaps.mjs. */
export const T = {
  GRASS: 0,
  GRASS_ALT: 1,
  DIRT: 2,
  STONE: 3,
  TREE: 4,
  TREE_DAMAGED: 5,
  WATER: 6,
  WATER_POLLUTED: 7,
  BANK: 8,
  RECYCLE: 9,
  WALL: 10,
  ROOF: 11,
  FLOWERS: 12,
  ROCK: 13,
  SAND: 14,
  PIPE: 15,
  CORE_BASE: 16,
  SOCKET_LIT: 17,
  SOCKET_DARK: 18,
  REEDS: 19,
  WASTE: 20,
  WOOD: 21,
  LILY: 22,
  HEDGE: 23,
} as const;

export const TILE_SIZE = 32;
export const TILESET_COLUMNS = 8;
export const TILE_COUNT = 24;

/** Tiles the player cannot walk through (indices, not gids). */
export const SOLID_TILES = [
  T.TREE,
  T.TREE_DAMAGED,
  T.WATER,
  T.WATER_POLLUTED,
  T.RECYCLE,
  T.WALL,
  T.ROOF,
  T.ROCK,
  T.PIPE,
  T.CORE_BASE,
  T.SOCKET_LIT,
  T.SOCKET_DARK,
  T.REEDS,
  T.WASTE,
  T.LILY,
  T.HEDGE,
];

/** Solid gids (tiled data is 1-based). */
export const SOLID_GIDS = SOLID_TILES.map((t) => t + 1);
