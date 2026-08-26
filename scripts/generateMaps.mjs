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

function generateF01() {
  const W = 30; const H = 30;
  const ground = createEmptyMap(W, H);
  const details = createEmptyMap(W, H);
  const objects = [];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) setTile(ground, W, H, x, y, T.GRASS);
  }

  // Draw some trees
  for (let tx of [4, 7, 10, 12, 5, 9]) {
    setTile(details, W, H, tx, 5, T.TREE_PINE_T);
    setTile(details, W, H, tx, 6, T.TREE_PINE_M);
    setTile(details, W, H, tx, 7, T.TREE_PINE_B);
  }

  // Cleared patch
  for (let y = 10; y <= 18; y++) {
    for (let x = 14; x <= 23; x++) setTile(ground, W, H, x, y, T.DIRT);
  }

  objects.push({ id: 1, name: 'Hub Portal', type: 'portal_hub', x: 15*16, y: 25*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'portal_hub'}, {name:'texture', type:'string', value:String(T.PORTAL)}, {name:'label', type:'string', value:'Portal: Greenhaven\n[E] Return'}]});
  objects.push({ id: 2, name: 'Clue 1', type: 'lesson', x: 17*16, y: 12*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'f01_clue1'}, {name:'texture', type:'string', value:String(T.WELL)}, {name:'label', type:'string', value:'Fallen Tree\n[E] Inspect'}]});
  objects.push({ id: 3, name: 'Clue 2', type: 'lesson', x: 18*16, y: 10*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'f01_clue2'}, {name:'texture', type:'string', value:String(T.WELL)}, {name:'label', type:'string', value:'Empty Nest\n[E] Inspect'}]});
  objects.push({ id: 4, name: 'Clue 3', type: 'lesson', x: 16*16, y: 17*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'f01_clue3'}, {name:'texture', type:'string', value:String(T.WELL)}, {name:'label', type:'string', value:'Struggling Plant\n[E] Inspect'}]});
  objects.push({ id: 5, name: 'Ranger', type: 'dialogue', x: 25*16, y: 12*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'f01_ranger'}, {name:'texture', type:'string', value:String(T.ECO)}, {name:'label', type:'string', value:'Ranger\n[E] Talk'}]});
  objects.push({ id: 6, name: 'Path to F-02', type: 'portal_f02', x: 15*16, y: 2*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'portal_f02'}, {name:'texture', type:'string', value:String(T.PORTAL)}, {name:'label', type:'string', value:'Living Forest\n[E] Enter'}]});

  return { W, H, ground, details, objects };
}

function generateF02() {
  const W = 30; const H = 30;
  const ground = createEmptyMap(W, H);
  const details = createEmptyMap(W, H);
  const objects = [];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) setTile(ground, W, H, x, y, T.GRASS);
  }

  objects.push({ id: 1, name: 'Path to F-01', type: 'portal_f01', x: 15*16, y: 28*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'portal_f01'}, {name:'texture', type:'string', value:String(T.PORTAL)}, {name:'label', type:'string', value:'Forest Entrance\n[E] Return'}]});
  objects.push({ id: 2, name: 'Researcher', type: 'dialogue', x: 21*16, y: 13*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'f02_researcher'}, {name:'texture', type:'string', value:String(T.ECO)}, {name:'label', type:'string', value:'Researcher\n[E] Talk'}]});
  objects.push({ id: 3, name: 'Path to F-03', type: 'portal_f03', x: 15*16, y: 2*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'portal_f03'}, {name:'texture', type:'string', value:String(T.PORTAL)}, {name:'label', type:'string', value:'Broken Habitat\n[E] Enter'}]});
  
  return { W, H, ground, details, objects };
}

function generateF03() {
  const W = 30; const H = 30;
  const ground = createEmptyMap(W, H);
  const details = createEmptyMap(W, H);
  const objects = [];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) setTile(ground, W, H, x, y, T.GRASS);
  }

  objects.push({ id: 1, name: 'Path to F-02', type: 'portal_f02', x: 15*16, y: 28*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'portal_f02'}, {name:'texture', type:'string', value:String(T.PORTAL)}, {name:'label', type:'string', value:'Living Forest\n[E] Return'}]});
  objects.push({ id: 2, name: 'Villager', type: 'dialogue', x: 25*16, y: 17*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'f03_villager'}, {name:'texture', type:'string', value:String(T.ECO)}, {name:'label', type:'string', value:'Villager\n[E] Talk'}]});
  objects.push({ id: 3, name: 'Path to F-04', type: 'portal_f04', x: 15*16, y: 2*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'portal_f04'}, {name:'texture', type:'string', value:String(T.PORTAL)}, {name:'label', type:'string', value:'Wildlife Sanctuary\n[E] Enter'}]});
  
  return { W, H, ground, details, objects };
}

function generateF04() {
  const W = 30; const H = 30;
  const ground = createEmptyMap(W, H);
  const details = createEmptyMap(W, H);
  const objects = [];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) setTile(ground, W, H, x, y, T.GRASS);
  }

  objects.push({ id: 1, name: 'Path to F-03', type: 'portal_f03', x: 15*16, y: 28*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'portal_f03'}, {name:'texture', type:'string', value:String(T.PORTAL)}, {name:'label', type:'string', value:'Broken Habitat\n[E] Return'}]});
  objects.push({ id: 2, name: 'Researcher', type: 'dialogue', x: 20*16, y: 6*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'f04_researcher'}, {name:'texture', type:'string', value:String(T.ECO)}, {name:'label', type:'string', value:'Researcher\n[E] Talk'}]});
  objects.push({ id: 3, name: 'Path to F-05', type: 'portal_f05', x: 15*16, y: 2*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'portal_f05'}, {name:'texture', type:'string', value:String(T.PORTAL)}, {name:'label', type:'string', value:'Ancient Tree\n[E] Enter'}]});
  
  return { W, H, ground, details, objects };
}

function generateF05() {
  const W = 30; const H = 30;
  const ground = createEmptyMap(W, H);
  const details = createEmptyMap(W, H);
  const objects = [];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) setTile(ground, W, H, x, y, T.GRASS);
  }

  // Ancient Tree
  setTile(details, W, H, 15, 13, T.TREE_PINE_T);
  setTile(details, W, H, 15, 14, T.TREE_PINE_M);
  setTile(details, W, H, 15, 15, T.TREE_PINE_B);

  objects.push({ id: 1, name: 'Path to F-04', type: 'portal_f04', x: 15*16, y: 28*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'portal_f04'}, {name:'texture', type:'string', value:String(T.PORTAL)}, {name:'label', type:'string', value:'Wildlife Sanctuary\n[E] Return'}]});
  objects.push({ id: 2, name: 'Ancient Tree', type: 'quest', x: 15*16, y: 16*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'f05_capstone'}, {name:'texture', type:'string', value:String(T.TARGET)}, {name:'label', type:'string', value:'Capstone\n[E] Start'}]});
  
  return { W, H, ground, details, objects };
}

function generateAquaria() {
  const W = 30; const H = 30;
  const ground = createEmptyMap(W, H);
  const details = createEmptyMap(W, H);
  const objects = [];

  // Base grass
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) setTile(ground, W, H, x, y, T.GRASS);
  }

  // Large stone paved area (City/Aquaria)
  for (let y = 10; y <= 25; y++) {
    for (let x = 8; x <= 22; x++) setTile(ground, W, H, x, y, T.STONE);
  }

  // Water canals
  for (let y = 0; y < H; y++) {
    setTile(ground, W, H, 12, y, T.WATER || 26); // assuming 26 is water if T.WATER is missing
    setTile(ground, W, H, 18, y, T.WATER || 26);
  }

  // Add some Houses along the canal
  for (let x of [9, 20]) {
    for (let y of [12, 18]) {
      setTile(details, W, H, x, y, T.HOUSE_WALL);
      setTile(details, W, H, x, y-1, T.ROOF_RED);
    }
  }

  objects.push({ id: 1, name: 'Hub Portal', type: 'portal_hub', x: 15*16, y: 15*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'portal_hub'}, {name:'texture', type:'string', value:String(T.PORTAL)}, {name:'label', type:'string', value:'Portal: Greenhaven\n[E] Return'}]});
  objects.push({ id: 2, name: 'Water Filter', type: 'quest', x: 12*16, y: 15*16, width: 16, height: 16, properties: [{name:'interactionId', type:'string', value:'water_treat_01'}, {name:'texture', type:'string', value:String(T.WELL)}, {name:'label', type:'string', value:'Water Filter\n[E] Inspect'}]});

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
fs.writeFileSync(path.join(outDir, 'forestia-01.json'), JSON.stringify(createTiledJSON(generateF01()), null, 2));
fs.writeFileSync(path.join(outDir, 'forestia-02.json'), JSON.stringify(createTiledJSON(generateF02()), null, 2));
fs.writeFileSync(path.join(outDir, 'forestia-03.json'), JSON.stringify(createTiledJSON(generateF03()), null, 2));
fs.writeFileSync(path.join(outDir, 'forestia-04.json'), JSON.stringify(createTiledJSON(generateF04()), null, 2));
fs.writeFileSync(path.join(outDir, 'forestia-05.json'), JSON.stringify(createTiledJSON(generateF05()), null, 2));
fs.writeFileSync(path.join(outDir, 'aquaria.json'), JSON.stringify(createTiledJSON(generateAquaria()), null, 2));

console.log('Successfully generated Tiled JSON maps.');
