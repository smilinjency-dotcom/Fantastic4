import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tiny Dungeon Tile IDs
const T = {
  ECO: 131,
  GRASS: 0, GRASS_ALT: 1, DIRT: 12, STONE: 24,
  TREE_PINE_T: 4, TREE_PINE_M: 16, TREE_PINE_B: 28,
  CASTLE_WALL: 112, CASTLE_DOOR: 113, CASTLE_TOP: 100,
  HOUSE_WALL: 76, HOUSE_DOOR: 77, ROOF_RED: 55, ROOF_SLOPE: 67, HOUSE_FULL: 85,
  FENCE_L: 80, FENCE_M: 81, FENCE_R: 82, TARGET: 90, WELL: 91, PORTAL: 92,
};

function createEmptyMap(width, height) {
  return new Array(width * height).fill(0);
}

function setTile(mapArray, width, height, x, y, tileId) {
  if (x >= 0 && x < width && y >= 0 && y < height) {
    mapArray[y * width + x] = tileId + 1; // 1-indexed for JSON
  }
}

function generateGreenhaven() {
  const W = 30;
  const H = 30;
  const ground = createEmptyMap(W, H);
  const details = createEmptyMap(W, H);
  const objects = [];

  // Fill grass
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      setTile(ground, W, H, x, y, T.GRASS);
      if (Math.random() < 0.1) setTile(ground, W, H, x, y, T.GRASS_ALT);
    }
  }

  // Draw paths (village center)
  for (let y = 14; y <= 16; y++) {
    for (let x = 12; x <= 18; x++) {
      setTile(ground, W, H, x, y, T.DIRT);
    }
  }

  // Add Castle in bottom right (x:20, y:20)
  for(let x=20; x<=25; x++) {
    for(let y=20; y<=24; y++) {
      setTile(details, W, H, x, y, T.CASTLE_WALL);
    }
    // Top battlements
    setTile(details, W, H, x, 19, T.CASTLE_TOP);
  }
  setTile(details, W, H, 22, 24, T.CASTLE_DOOR);

  // Add Houses
  for(let x=4; x<=8; x++) {
    for(let y=4; y<=6; y++) {
      setTile(details, W, H, x, y, T.HOUSE_WALL);
    }
    // Roofs
    setTile(details, W, H, x, 3, T.ROOF_RED);
  }
  setTile(details, W, H, 6, 6, T.HOUSE_DOOR);

  // Add Fence
  setTile(details, W, H, 4, 10, T.FENCE_L);
  setTile(details, W, H, 5, 10, T.FENCE_M);
  setTile(details, W, H, 6, 10, T.FENCE_M);
  setTile(details, W, H, 7, 10, T.FENCE_R);

  // Add Trees
  for (let tx of [10, 2, 28, 15]) {
    setTile(details, W, H, tx, 8, T.TREE_PINE_T);
    setTile(details, W, H, tx, 9, T.TREE_PINE_M);
    setTile(details, W, H, tx, 10, T.TREE_PINE_B);
  }

  // Add objects
  objects.push({ id: 1, name: 'ECO Guide', type: 'dialogue', x: 15*16, y: 14*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'eco_guide_01'}, {name:'texture', type:'string', value:String(T.ECO)}, {name:'label', type:'string', value:'ECO\n[E] Talk'}]});
  objects.push({ id: 2, name: 'Forestia Portal', type: 'portal_f', x: 13*16, y: 15*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'portal_forest'}, {name:'texture', type:'string', value:String(T.PORTAL)}, {name:'label', type:'string', value:'Portal: Forestia\n[E] Enter'}]});
  objects.push({ id: 3, name: 'Aquaria Portal', type: 'portal_a', x: 17*16, y: 15*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'portal_aqua'}, {name:'texture', type:'string', value:String(T.PORTAL)}, {name:'label', type:'string', value:'Portal: Aquaria\n[E] Enter'}]});

  return { W, H, ground, details, objects };
}

function generateForestia() {
  const W = 30; const H = 30;
  const ground = createEmptyMap(W, H);
  const details = createEmptyMap(W, H);
  const objects = [];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) setTile(ground, W, H, x, y, T.GRASS);
  }
  
  objects.push({ id: 1, name: 'Hub Portal', type: 'portal_hub', x: 15*16, y: 20*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'portal_hub'}, {name:'texture', type:'string', value:String(T.PORTAL)}, {name:'label', type:'string', value:'Portal: Greenhaven\n[E] Return'}]});
  
  return { W, H, ground, details, objects };
}

function generateAquaria() {
  const W = 30; const H = 30;
  const ground = createEmptyMap(W, H);
  const details = createEmptyMap(W, H);
  const objects = [];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) setTile(ground, W, H, x, y, T.GRASS);
  }

  objects.push({ id: 1, name: 'Hub Portal', type: 'portal_hub', x: 5*16, y: 15*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'portal_hub'}, {name:'texture', type:'string', value:String(T.PORTAL)}, {name:'label', type:'string', value:'Portal: Greenhaven\n[E] Return'}]});

  return { W, H, ground, details, objects };
}

function createTiledJSON(data) {
  return {
    "compressionlevel": -1,
    "height": data.H,
    "infinite": false,
    "layers": [
      { "data": data.ground, "height": data.H, "id": 1, "name": "Ground", "opacity": 1, "type": "tilelayer", "visible": true, "width": data.W, "x": 0, "y": 0 },
      { "data": data.details, "height": data.H, "id": 2, "name": "Details", "opacity": 1, "type": "tilelayer", "visible": true, "width": data.W, "x": 0, "y": 0 },
      { "draworder": "topdown", "id": 3, "name": "Objects", "objects": data.objects, "opacity": 1, "type": "objectgroup", "visible": true, "x": 0, "y": 0 }
    ],
    "nextlayerid": 4, "nextobjectid": 100, "orientation": "orthogonal", "renderorder": "right-down", "tiledversion": "1.10.1", "tileheight": 16,
    "tilesets": [
      { "firstgid": 1, "image": "../assets/shared/tilemap_packed.png", "imageheight": 176, "imagewidth": 192, "margin": 0, "name": "tiny-dungeon", "spacing": 0, "tilecount": 132, "tileheight": 16, "tilewidth": 16 }
    ],
    "tilewidth": 16, "type": "map", "version": "1.10", "width": data.W
  };
}

const outDir = path.join(__dirname, '../public/maps');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'greenhaven.json'), JSON.stringify(createTiledJSON(generateGreenhaven()), null, 2));
fs.writeFileSync(path.join(outDir, 'forestia.json'), JSON.stringify(createTiledJSON(generateForestia()), null, 2));
fs.writeFileSync(path.join(outDir, 'aquaria.json'), JSON.stringify(createTiledJSON(generateAquaria()), null, 2));

console.log('Successfully generated Tiled JSON maps.');
