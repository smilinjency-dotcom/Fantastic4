import * as Phaser from "phaser";
import { T, TILE_SIZE, TILESET_COLUMNS, TILE_COUNT } from "./tiles";

/** Deterministic pixel-art texture generation (32x32 tiles, 4-dir player sheet). */

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const P = {
  grass: ["#4a8a3c", "#57a044", "#3d7433"],
  grassDry: ["#7d8f3a", "#8fa044", "#6c7d31"],
  dirt: ["#8a6a41", "#9a7a4d", "#7a5c38"],
  stone: ["#9aa0a6", "#adb3b8", "#878d93"],
  sand: ["#d8c48c", "#e3d09b", "#c9b47c"],
  water: ["#3a7fbd", "#4b95d4", "#2f6ba3"],
  waterBad: ["#6b7a4a", "#7d8c58", "#59683c"],
  wood: ["#a9793f", "#bb8b4c", "#8f6432"],
  leaf: ["#2f6b2a", "#3d8534", "#245420"],
  leafSick: ["#6e6a2c", "#7f7a36", "#5a5624"],
};

function pick(rand: () => number, palette: string[]) {
  return palette[Math.floor(rand() * palette.length)]!;
}

type Ctx = CanvasRenderingContext2D;

function fillBase(ctx: Ctx, ox: number, oy: number, palette: string[], rand: () => number) {
  for (let y = 0; y < TILE_SIZE; y += 4) {
    for (let x = 0; x < TILE_SIZE; x += 4) {
      ctx.fillStyle = pick(rand, palette);
      ctx.fillRect(ox + x, oy + y, 4, 4);
    }
  }
}

function blob(ctx: Ctx, ox: number, oy: number, cx: number, cy: number, r: number, colors: string[], rand: () => number) {
  for (let y = -r; y <= r; y += 2) {
    for (let x = -r; x <= r; x += 2) {
      if (x * x + y * y > r * r + rand() * 6 - 3) continue;
      ctx.fillStyle = pick(rand, colors);
      ctx.fillRect(ox + cx + x, oy + cy + y, 2, 2);
    }
  }
}

function drawTile(ctx: Ctx, index: number, ox: number, oy: number) {
  const rand = mulberry(1000 + index * 977);
  switch (index) {
    case T.GRASS:
      fillBase(ctx, ox, oy, P.grass, rand);
      break;
    case T.GRASS_ALT:
      fillBase(ctx, ox, oy, P.grass, rand);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = "#68b654";
        ctx.fillRect(ox + Math.floor(rand() * 15) * 2, oy + Math.floor(rand() * 15) * 2, 2, 4);
      }
      break;
    case T.DIRT:
      fillBase(ctx, ox, oy, P.dirt, rand);
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = "#6d5230";
        ctx.fillRect(ox + Math.floor(rand() * 15) * 2, oy + Math.floor(rand() * 15) * 2, 2, 2);
      }
      break;
    case T.STONE:
      fillBase(ctx, ox, oy, P.stone, rand);
      ctx.strokeStyle = "#7c8288";
      ctx.strokeRect(ox + 0.5, oy + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
      break;
    case T.SAND:
      fillBase(ctx, ox, oy, P.sand, rand);
      break;
    case T.BANK:
      fillBase(ctx, ox, oy, P.sand, rand);
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = "#8fa04a";
        ctx.fillRect(ox + Math.floor(rand() * 15) * 2, oy + Math.floor(rand() * 15) * 2, 2, 2);
      }
      break;
    case T.FLOWERS:
      fillBase(ctx, ox, oy, P.grass, rand);
      for (let i = 0; i < 5; i++) {
        const x = ox + Math.floor(rand() * 14) * 2;
        const y = oy + Math.floor(rand() * 14) * 2;
        ctx.fillStyle = ["#f2d16b", "#e57ea8", "#e8e8e8"][i % 3]!;
        ctx.fillRect(x, y, 2, 2);
        ctx.fillStyle = "#3d7433";
        ctx.fillRect(x, y + 2, 2, 2);
      }
      break;
    case T.WOOD:
      fillBase(ctx, ox, oy, P.wood, rand);
      ctx.fillStyle = "#8f6432";
      for (let y = 0; y < TILE_SIZE; y += 8) ctx.fillRect(ox, oy + y, TILE_SIZE, 2);
      break;
    case T.TREE:
    case T.TREE_DAMAGED: {
      const sick = index === T.TREE_DAMAGED;
      fillBase(ctx, ox, oy, sick ? P.grassDry : P.grass, rand);
      ctx.fillStyle = sick ? "#6b543a" : "#7a5a33";
      ctx.fillRect(ox + 14, oy + 16, 4, 14);
      blob(ctx, ox, oy, 16, 13, sick ? 9 : 12, sick ? P.leafSick : P.leaf, rand);
      if (sick) {
        ctx.fillStyle = "#4a3c26";
        ctx.fillRect(ox + 10, oy + 20, 2, 6);
        ctx.fillRect(ox + 20, oy + 18, 2, 8);
      }
      break;
    }
    case T.HEDGE:
      fillBase(ctx, ox, oy, P.grass, rand);
      blob(ctx, ox, oy, 10, 18, 8, P.leaf, rand);
      blob(ctx, ox, oy, 22, 18, 8, P.leaf, rand);
      break;
    case T.WATER:
    case T.WATER_POLLUTED: {
      const bad = index === T.WATER_POLLUTED;
      fillBase(ctx, ox, oy, bad ? P.waterBad : P.water, rand);
      ctx.fillStyle = bad ? "#93a068" : "#8ec8f0";
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(ox + Math.floor(rand() * 12) * 2, oy + Math.floor(rand() * 15) * 2, 8, 2);
      }
      if (bad) {
        ctx.fillStyle = "#3d3a2a";
        ctx.fillRect(ox + 8, oy + 20, 6, 2);
        ctx.fillRect(ox + 18, oy + 8, 4, 2);
      }
      break;
    }
    case T.LILY:
      fillBase(ctx, ox, oy, P.water, rand);
      blob(ctx, ox, oy, 16, 16, 9, ["#3f8f3a", "#4fa544"], rand);
      ctx.fillStyle = "#f0e0f0";
      ctx.fillRect(ox + 14, oy + 14, 4, 4);
      break;
    case T.REEDS:
      fillBase(ctx, ox, oy, P.sand, rand);
      for (let i = 0; i < 6; i++) {
        const x = ox + 4 + i * 4;
        ctx.fillStyle = "#4f7a34";
        ctx.fillRect(x, oy + 8 + Math.floor(rand() * 6), 2, 20);
        ctx.fillStyle = "#8a6a41";
        ctx.fillRect(x, oy + 6, 2, 4);
      }
      break;
    case T.ROCK:
      fillBase(ctx, ox, oy, P.grass, rand);
      blob(ctx, ox, oy, 16, 18, 10, P.stone, rand);
      ctx.fillStyle = "#6f757a";
      ctx.fillRect(ox + 10, oy + 22, 12, 2);
      break;
    case T.WALL:
      fillBase(ctx, ox, oy, ["#c9b79a", "#d6c5a8", "#b8a68b"], rand);
      ctx.fillStyle = "#8a7a60";
      ctx.fillRect(ox, oy, TILE_SIZE, 2);
      ctx.fillStyle = "#5a86a8";
      ctx.fillRect(ox + 8, oy + 10, 16, 12);
      ctx.strokeStyle = "#8a7a60";
      ctx.strokeRect(ox + 8.5, oy + 10.5, 15, 11);
      break;
    case T.ROOF:
      fillBase(ctx, ox, oy, ["#a44a3f", "#b8564a", "#8e3e35"], rand);
      ctx.fillStyle = "#8e3e35";
      for (let y = 0; y < TILE_SIZE; y += 8) ctx.fillRect(ox, oy + y, TILE_SIZE, 2);
      break;
    case T.RECYCLE:
      fillBase(ctx, ox, oy, P.stone, rand);
      ctx.fillStyle = "#2f7d4f";
      ctx.fillRect(ox + 6, oy + 8, 20, 20);
      ctx.fillStyle = "#245e3c";
      ctx.fillRect(ox + 4, oy + 5, 24, 4);
      ctx.fillStyle = "#eaf6ea";
      ctx.fillRect(ox + 13, oy + 13, 6, 2);
      ctx.fillRect(ox + 13, oy + 19, 6, 2);
      ctx.fillRect(ox + 11, oy + 15, 2, 4);
      ctx.fillRect(ox + 19, oy + 15, 2, 4);
      break;
    case T.WASTE:
      fillBase(ctx, ox, oy, P.dirt, rand);
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = ["#7c7f86", "#4b6f8a", "#9a4a4a", "#c4b46a"][i % 4]!;
        ctx.fillRect(ox + Math.floor(rand() * 13) * 2, oy + 8 + Math.floor(rand() * 10) * 2, 4, 3);
      }
      break;
    case T.PIPE:
      fillBase(ctx, ox, oy, P.stone, rand);
      ctx.fillStyle = "#6b7076";
      ctx.fillRect(ox, oy + 10, TILE_SIZE, 12);
      ctx.fillStyle = "#565b60";
      ctx.fillRect(ox + 12, oy + 8, 6, 16);
      break;
    case T.CORE_BASE:
      fillBase(ctx, ox, oy, ["#4c5f6b", "#5a6f7c", "#3f505b"], rand);
      ctx.fillStyle = "#7de3c3";
      ctx.fillRect(ox + 4, oy + 12, 24, 4);
      ctx.fillStyle = "#2e3f49";
      ctx.fillRect(ox, oy + TILE_SIZE - 4, TILE_SIZE, 4);
      break;
    case T.SOCKET_LIT:
    case T.SOCKET_DARK: {
      const lit = index === T.SOCKET_LIT;
      fillBase(ctx, ox, oy, ["#3f505b", "#4c5f6b"], rand);
      ctx.fillStyle = lit ? "#8ef7c8" : "#28323a";
      ctx.beginPath();
      ctx.moveTo(ox + 16, oy + 5);
      ctx.lineTo(ox + 25, oy + 17);
      ctx.lineTo(ox + 16, oy + 28);
      ctx.lineTo(ox + 7, oy + 17);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = lit ? "#ffffff" : "#3d4a52";
      ctx.fillRect(ox + 14, oy + 12, 3, 8);
      break;
    }
    default:
      fillBase(ctx, ox, oy, P.grass, rand);
  }
}

export function createTileset(scene: Phaser.Scene) {
  if (scene.textures.exists("eco-tiles")) return;
  const rows = Math.ceil(TILE_COUNT / TILESET_COLUMNS);
  const canvas = scene.textures.createCanvas(
    "eco-tiles",
    TILESET_COLUMNS * TILE_SIZE,
    rows * TILE_SIZE,
  );
  if (!canvas) return;
  const ctx = canvas.getContext();
  ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < TILE_COUNT; i++) {
    const ox = (i % TILESET_COLUMNS) * TILE_SIZE;
    const oy = Math.floor(i / TILESET_COLUMNS) * TILE_SIZE;
    drawTile(ctx, i, ox, oy);
  }
  canvas.refresh();
}

const FRAME_W = 24;
const FRAME_H = 32;

function drawGuardian(ctx: Ctx, ox: number, oy: number, dir: number, step: number) {
  const skin = "#f0c39a";
  const cloak = "#2f8f6b";
  const cloakDark = "#236e52";
  const hair = "#3b2b1e";
  const boots = "#4a3524";
  const bob = step === 1 ? -1 : step === 3 ? 1 : 0;

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(ox + 5, oy + 29, 14, 3);
  // legs
  ctx.fillStyle = boots;
  const legOffset = step === 1 ? 2 : step === 3 ? -2 : 0;
  ctx.fillRect(ox + 8 + legOffset, oy + 24, 3, 5);
  ctx.fillRect(ox + 13 - legOffset, oy + 24, 3, 5);
  // body / cloak
  ctx.fillStyle = cloak;
  ctx.fillRect(ox + 6, oy + 14 + bob, 12, 11);
  ctx.fillStyle = cloakDark;
  ctx.fillRect(ox + 6, oy + 21 + bob, 12, 2);
  // leaf emblem
  if (dir === 0) {
    ctx.fillStyle = "#c9f5a0";
    ctx.fillRect(ox + 11, oy + 17 + bob, 2, 4);
  }
  // arms
  ctx.fillStyle = skin;
  ctx.fillRect(ox + 4, oy + 16 + bob, 2, 6);
  ctx.fillRect(ox + 18, oy + 16 + bob, 2, 6);
  // head
  ctx.fillStyle = skin;
  ctx.fillRect(ox + 7, oy + 5 + bob, 10, 10);
  ctx.fillStyle = hair;
  ctx.fillRect(ox + 6, oy + 3 + bob, 12, 5);
  if (dir === 1) ctx.fillRect(ox + 6, oy + 5 + bob, 4, 8);
  if (dir === 2) ctx.fillRect(ox + 14, oy + 5 + bob, 4, 8);
  if (dir === 3) ctx.fillRect(ox + 6, oy + 3 + bob, 12, 12);
  // eyes
  if (dir !== 3) {
    ctx.fillStyle = "#22303a";
    if (dir === 0) {
      ctx.fillRect(ox + 9, oy + 10 + bob, 2, 2);
      ctx.fillRect(ox + 14, oy + 10 + bob, 2, 2);
    } else if (dir === 1) {
      ctx.fillRect(ox + 8, oy + 10 + bob, 2, 2);
    } else {
      ctx.fillRect(ox + 15, oy + 10 + bob, 2, 2);
    }
  }
}

export function createPlayerSheet(scene: Phaser.Scene) {
  if (scene.textures.exists("guardian")) return;
  const canvas = scene.textures.createCanvas("guardian", FRAME_W * 4, FRAME_H * 4);
  if (!canvas) return;
  const ctx = canvas.getContext();
  ctx.imageSmoothingEnabled = false;
  for (let dir = 0; dir < 4; dir++) {
    for (let step = 0; step < 4; step++) {
      drawGuardian(ctx, step * FRAME_W, dir * FRAME_H, dir, step);
    }
  }
  canvas.refresh();
  scene.textures.get("guardian").add("__BASE", 0, 0, 0, FRAME_W * 4, FRAME_H * 4);
  let i = 0;
  for (let dir = 0; dir < 4; dir++) {
    for (let step = 0; step < 4; step++) {
      scene.textures
        .get("guardian")
        .add(i++, 0, step * FRAME_W, dir * FRAME_H, FRAME_W, FRAME_H);
    }
  }
}

export function createMarker(scene: Phaser.Scene) {
  if (scene.textures.exists("marker")) return;
  const canvas = scene.textures.createCanvas("marker", 20, 20);
  if (!canvas) return;
  const ctx = canvas.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "rgba(255, 236, 150, 0.85)";
  ctx.beginPath();
  ctx.arc(10, 10, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2b4a2b";
  ctx.fillRect(9, 4, 3, 8);
  ctx.fillRect(9, 14, 3, 3);
  canvas.refresh();
}

export function createAllTextures(scene: Phaser.Scene) {
  createTileset(scene);
  createPlayerSheet(scene);
  createMarker(scene);
}
