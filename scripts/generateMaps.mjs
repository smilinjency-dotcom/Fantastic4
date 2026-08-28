#!/usr/bin/env node
/**
 * EcoQuest map generator.
 * Procedurally builds Tiled-format JSON maps into public/maps/.
 * Run: node scripts/generateMaps.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../public/maps");
mkdirSync(OUT, { recursive: true });

const T = {
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
};

const TILE = 32;
const COLUMNS = 8;
const TILE_COUNT = 24;

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function grid(w, h, fill) {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => fill));
}

function rect(g, x, y, w, h, v) {
  for (let j = y; j < y + h; j++)
    for (let i = x; i < x + w; i++)
      if (g[j] && g[j][i] !== undefined) g[j][i] = v;
}

function flat(g, empty) {
  return g.flat().map((v) => (v === empty ? 0 : v + 1));
}

function mapJson(name, ground, objects, w, h) {
  return {
    compressionlevel: -1,
    width: w,
    height: h,
    tilewidth: TILE,
    tileheight: TILE,
    infinite: false,
    orientation: "orthogonal",
    renderorder: "right-down",
    type: "map",
    version: "1.10",
    tiledversion: "1.10.2",
    nextlayerid: 3,
    nextobjectid: 1,
    layers: [
      {
        id: 1,
        name: "ground",
        type: "tilelayer",
        visible: true,
        opacity: 1,
        x: 0,
        y: 0,
        width: w,
        height: h,
        data: flat(ground, -1),
      },
      {
        id: 2,
        name: "objects",
        type: "tilelayer",
        visible: true,
        opacity: 1,
        x: 0,
        y: 0,
        width: w,
        height: h,
        data: flat(objects, -1),
      },
    ],
    tilesets: [
      {
        firstgid: 1,
        name: "eco-tiles",
        image: "eco-tiles.png",
        imagewidth: COLUMNS * TILE,
        imageheight: Math.ceil(TILE_COUNT / COLUMNS) * TILE,
        tilewidth: TILE,
        tileheight: TILE,
        tilecount: TILE_COUNT,
        columns: COLUMNS,
        margin: 0,
        spacing: 0,
      },
    ],
    properties: [{ name: "biome", type: "string", value: name }],
  };
}

/* ---------------------------------------------------------------- Greenhaven */
function greenhaven() {
  const w = 40;
  const h = 30;
  const r = rng(1337);
  const ground = grid(w, h, T.GRASS);
  const obj = grid(w, h, -1);

  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (r() > 0.86) ground[y][x] = r() > 0.5 ? T.GRASS_ALT : T.FLOWERS;

  // central plaza + core platform
  rect(ground, 14, 9, 12, 10, T.STONE);
  rect(ground, 18, 2, 4, 8, T.DIRT); // north walk
  rect(ground, 0, 13, 14, 2, T.DIRT); // west road -> Forestia
  rect(ground, 26, 13, 14, 2, T.DIRT); // east road -> Aquaria
  rect(ground, 19, 19, 2, 10, T.DIRT); // south walk

  // Earth Core: base block with five sockets on top row
  rect(obj, 18, 12, 5, 2, T.CORE_BASE);
  const sockets = [T.SOCKET_DARK, T.SOCKET_DARK, T.SOCKET_DARK, T.SOCKET_DARK, T.SOCKET_DARK];
  sockets.forEach((s, i) => (obj[11][18 + i] = s));

  // settlement buildings
  const houses = [
    [4, 4],
    [10, 21],
    [30, 5],
    [32, 21],
    [6, 9],
  ];
  for (const [hx, hy] of houses) {
    rect(ground, hx - 1, hy + 3, 5, 1, T.DIRT);
    rect(obj, hx, hy, 4, 2, T.ROOF);
    rect(obj, hx, hy + 2, 4, 1, T.WALL);
    ground[hy + 3][hx + 1] = T.WOOD;
  }

  // tree line / hedges framing the hub
  for (let x = 0; x < w; x++) {
    if (x < 18 || x > 21) {
      obj[0][x] = T.TREE;
      obj[h - 1][x] = T.TREE;
    }
  }
  for (let y = 0; y < h; y++) {
    if (y < 13 || y > 14) {
      obj[y][0] = T.TREE;
      obj[y][w - 1] = T.TREE;
    }
  }
  for (let i = 0; i < 40; i++) {
    const x = 2 + Math.floor(r() * (w - 4));
    const y = 2 + Math.floor(r() * (h - 4));
    if (ground[y][x] === T.STONE || ground[y][x] === T.DIRT) continue;
    if (obj[y][x] !== -1) continue;
    obj[y][x] = r() > 0.7 ? T.HEDGE : T.TREE;
  }
  // keep spawn clear
  rect(obj, 17, 16, 7, 4, -1);
  return mapJson("greenhaven", ground, obj, w, h);
}

/* ------------------------------------------------------------------ Forestia */
function forestia() {
  const w = 50;
  const h = 44;
  const r = rng(90210);
  const ground = grid(w, h, T.GRASS);
  const obj = grid(w, h, -1);

  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const n = r();
      if (n > 0.9) ground[y][x] = T.FLOWERS;
      else if (n > 0.72) ground[y][x] = T.GRASS_ALT;
    }

  // winding dirt path from south entrance to the Ancient Tree grove
  let px = 25;
  for (let y = h - 2; y > 6; y--) {
    rect(ground, px - 1, y, 3, 1, T.DIRT);
    if (r() > 0.6) px += r() > 0.5 ? 1 : -1;
    px = Math.max(6, Math.min(w - 8, px));
  }

  // dense forest, thinning to a clear-cut scar on the west
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      if (ground[y][x] === T.DIRT) continue;
      const clearcut = x < 14 && y > 14 && y < 30;
      const density = clearcut ? 0.06 : 0.2;
      if (r() < density) obj[y][x] = clearcut || r() < 0.25 ? T.TREE_DAMAGED : T.TREE;
      else if (clearcut && r() < 0.05) obj[y][x] = T.WASTE;
    }
  for (let x = 0; x < w; x++) {
    obj[0][x] = T.TREE;
    if (x < 23 || x > 27) obj[h - 1][x] = T.TREE;
  }
  for (let y = 0; y < h; y++) {
    obj[y][0] = T.TREE;
    obj[y][w - 1] = T.TREE;
  }

  // small pond
  rect(ground, 36, 30, 7, 5, T.BANK);
  rect(obj, 37, 31, 5, 3, T.WATER);

  // recycling station clearing
  rect(ground, 30, 20, 6, 5, T.STONE);
  rect(obj, 30, 20, 6, 5, -1);
  obj[21][32] = T.RECYCLE;
  obj[21][33] = T.RECYCLE;
  obj[23][31] = T.WASTE;

  // waste dump near clear-cut
  rect(obj, 6, 22, 4, 3, T.WASTE);
  rect(ground, 5, 21, 6, 5, T.DIRT);

  // Ancient Tree grove at the north
  rect(ground, 20, 3, 11, 9, T.DIRT);
  rect(obj, 20, 3, 11, 9, -1);
  rect(obj, 23, 4, 4, 4, T.TREE);
  rect(obj, 22, 3, 1, 6, T.ROCK);
  rect(obj, 28, 3, 1, 6, T.ROCK);
  return mapJson("forestia", ground, obj, w, h);
}

/* ------------------------------------------------------------------- Aquaria */
function aquaria() {
  const w = 50;
  const h = 44;
  const r = rng(4242);
  const ground = grid(w, h, T.SAND);
  const obj = grid(w, h, -1);

  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) ground[y][x] = r() > 0.55 ? T.BANK : T.SAND;

  // river flowing north (Crystal Lake) to south (industrial outflow)
  let cx = 25;
  for (let y = h - 1; y >= 12; y--) {
    const width = 5 + Math.floor(r() * 3);
    rect(obj, cx - Math.floor(width / 2), y, width, 1, y > 28 ? T.WATER_POLLUTED : T.WATER);
    rect(ground, cx - Math.floor(width / 2) - 1, y, width + 2, 1, T.BANK);
    if (r() > 0.65) cx += r() > 0.5 ? 1 : -1;
    cx = Math.max(10, Math.min(w - 12, cx));
  }

  // Crystal Lake basin
  rect(ground, 16, 3, 20, 12, T.BANK);
  rect(obj, 18, 4, 16, 9, T.WATER);
  rect(obj, 20, 12, 3, 1, T.LILY);
  rect(obj, 29, 5, 2, 1, T.LILY);

  // grassy banks + reeds
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      if (obj[y][x] !== -1) continue;
      if (r() > 0.94) obj[y][x] = T.REEDS;
      else if (r() > 0.93) obj[y][x] = T.ROCK;
      else if (r() > 0.92) ground[y][x] = T.GRASS_ALT;
    }

  // water treatment facility (west bank)
  rect(ground, 4, 24, 10, 8, T.STONE);
  rect(obj, 4, 24, 10, 8, -1);
  rect(obj, 5, 25, 4, 2, T.ROOF);
  rect(obj, 5, 27, 4, 1, T.WALL);
  obj[29][10] = T.PIPE;
  obj[29][11] = T.PIPE;
  obj[26][11] = T.PIPE;

  // industrial outflow + waste in the polluted south
  rect(obj, 38, 30, 3, 2, T.WALL);
  obj[32][39] = T.PIPE;
  for (let i = 0; i < 18; i++) {
    const x = 30 + Math.floor(r() * 16);
    const y = 30 + Math.floor(r() * 12);
    if (obj[y] && obj[y][x] === -1) obj[y][x] = T.WASTE;
  }

  // borders
  for (let x = 0; x < w; x++) {
    obj[0][x] = T.ROCK;
    if (x < 23 || x > 27) obj[h - 1][x] = T.ROCK;
  }
  for (let y = 0; y < h; y++) {
    obj[y][0] = T.ROCK;
    obj[y][w - 1] = T.ROCK;
  }
  // clear the south entrance corridor
  rect(obj, 23, h - 4, 5, 3, -1);
  rect(ground, 23, h - 4, 5, 3, T.BANK);
  return mapJson("aquaria", ground, obj, w, h);
}

const maps = {
  "greenhaven.json": greenhaven(),
  "forestia-01.json": forestia(),
  "aquaria-01.json": aquaria(),
};

for (const [file, data] of Object.entries(maps)) {
  writeFileSync(resolve(OUT, file), JSON.stringify(data));
  console.log(`generated public/maps/${file} (${data.width}x${data.height})`);
}
