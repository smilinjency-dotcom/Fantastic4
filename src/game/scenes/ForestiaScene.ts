import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { InteractableObject } from '../objects/InteractableObject';
import type { GameEventBus } from '../EventBus';

export type WorldState = 'damaged' | 'recovering' | 'thriving';

// Kenney Tiny Town tile indices (0-based in spritesheet, 12 cols × 11 rows)
// Tile IDs in Phaser tilemap are 1-indexed (0 = empty)
const T = {
  GRASS:       1,   // plain green grass
  GRASS2:      2,   // slightly different grass
  GRASS3:      3,   // another grass variant
  DIRT:        4,   // bare dirt / deforested
  DIRT2:       5,
  SAND:        7,
  WATER:       109, // blue water tile
  WATER2:      110,
  WATER3:      111,
  PATH_H:      37,  // horizontal path
  PATH_V:      49,  // vertical path  
  PATH_TL:     36,  // path corner top-left
  PATH_TR:     38,  // path corner top-right
  PATH_BL:     48,  // path corner bottom-left
  PATH_BR:     50,  // path corner bottom-right
  TREE_TL:     11,  // tree top-left
  TREE_TR:     12,  // tree top-right  
  TREE_BL:     23,  // tree bottom-left
  TREE_BR:     24,  // tree bottom-right
  DEAD_TREE_T: 21,  // dead/damaged tree top
  DEAD_TREE_B: 33,  // dead/damaged tree bottom
  STUMP:       9,   // tree stump (deforested)
  BUSH:        10,  // small bush
  FLOWER:      8,   // flower patch
  STONE_WALL:  61,  // stone wall for ranger station
  BUILDING_TL: 49,
  ROOF_R:      52,
  FENCE_H:     97,  // horizontal fence
  FENCE_V:     109,
};

/** 
 * Builds a 30×30 tile data array for Forestia.
 * Tile IDs are 1-indexed (Phaser convention: 0 = no tile).
 */
function buildForestiaGround(): number[] {
  const W = 30;
  const H = 30;
  const map: number[] = new Array(W * H).fill(T.GRASS);

  const set = (x: number, y: number, id: number) => {
    if (x >= 0 && x < W && y >= 0 && y < H) map[y * W + x] = id;
  };

  // Central deforested patch (damaged area)
  for (let y = 8; y <= 14; y++) {
    for (let x = 8; x <= 16; x++) {
      set(x, y, T.DIRT);
    }
  }

  // River/stream through right side
  for (let y = 0; y < H; y++) {
    set(22, y, T.WATER);
    set(23, y, T.WATER2);
  }

  // Path from bottom to station
  for (let y = 18; y <= 28; y++) {
    set(14, y, T.PATH_V);
    set(15, y, T.PATH_V);
  }
  // Path connector across the map (horizontal)
  for (let x = 5; x <= 20; x++) {
    set(x, 18, T.PATH_H);
  }

  // Grass variation sprinkles
  const grassVariants = [T.GRASS2, T.GRASS3];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (map[y * W + x] === T.GRASS && Math.random() < 0.15) {
        map[y * W + x] = grassVariants[Math.floor(Math.random() * 2)];
      }
    }
  }

  return map;
}

function buildForestiaDetails(): number[] {
  const W = 30;
  const H = 30;
  const map: number[] = new Array(W * H).fill(0);

  const set = (x: number, y: number, id: number) => {
    if (x >= 0 && x < W && y >= 0 && y < H) map[y * W + x] = id;
  };

  // Dense forest — healthy trees (top-left area)
  const healthyForest = [
    [1,1],[2,1],[4,1],[5,1],[7,2],[1,3],[3,3],[6,3],
    [1,5],[4,5],[7,5],[2,6],[5,6],[1,7],[3,7],[6,7],
    [2,9],[4,9],[6,9],[1,10],[3,10],[5,10],
    [1,12],[2,12],[4,12],[6,12],[7,12],
    [1,14],[3,14],[5,14],[7,14],
    [1,16],[2,16],[4,16],[6,16],[7,16],
    [1,20],[3,20],[5,20],[7,20],
    [2,22],[4,22],[6,22],[7,22],
    [1,24],[3,24],[5,24],
    [1,26],[2,26],[4,26],[6,26],
  ];
  for (const [x, y] of healthyForest) {
    // 2×2 tree sprite
    set(x, y,   T.TREE_TL); set(x+1, y,   T.TREE_TR);
    set(x, y+1, T.TREE_BL); set(x+1, y+1, T.TREE_BR);
  }

  // Damaged / dead trees in deforested area
  const deadTrees = [[9,7],[11,7],[13,7],[10,9],[12,9],[14,6]];
  for (const [x, y] of deadTrees) {
    set(x, y,   T.DEAD_TREE_T);
    set(x, y+1, T.DEAD_TREE_B);
  }

  // Stumps in deforested area
  const stumps = [[10,10],[12,10],[11,11],[13,11],[9,12],[14,11]];
  for (const [x, y] of stumps) {
    set(x, y, T.STUMP);
  }

  // Flowers in restoration area (bottom)
  const flowers = [[9,21],[11,21],[13,21],[10,23],[12,23],[8,23],[14,23]];
  for (const [x, y] of flowers) {
    set(x, y, T.FLOWER);
  }

  // Trees on right side (beyond river area — distant forest)
  const rightForest = [
    [25,1],[27,1],[25,4],[27,4],[26,7],[25,10],[27,10],
    [25,13],[27,13],[26,16],[25,19],[27,19],[26,22],[25,25],[27,25],[26,28],
  ];
  for (const [x, y] of rightForest) {
    set(x, y,   T.TREE_TL); set(x+1, y,   T.TREE_TR);
    set(x, y+1, T.TREE_BL); set(x+1, y+1, T.TREE_BR);
  }

  // Bushes scattered
  const bushes = [[3,18],[5,19],[8,19],[16,20],[18,16],[19,12],[17,8]];
  for (const [x, y] of bushes) {
    set(x, y, T.BUSH);
  }

  return map;
}

export class ForestiaScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
  private interactKey!: Phaser.Input.Keyboard.Key;
  private interactables: InteractableObject[] = [];
  private nearbyObject: InteractableObject | null = null;
  private promptText!: Phaser.GameObjects.Text;
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;
  private detailLayer!: Phaser.Tilemaps.TilemapLayer;
  private worldState: WorldState = 'damaged';

  // Tile size in pixels
  static readonly TILE = 16;

  constructor() {
    super({ key: 'ForestiaScene' });
  }

  preload() {
    // Safety net: load tileset here too in case PreloadScene was bypassed (e.g. HMR dev)
    if (!this.textures.exists('tilemap-packed')) {
      this.load.image('tilemap-packed', 'assets/shared/tilemap_packed.png');
    }
    if (!this.textures.exists('obj-tree'))    this.load.image('obj-tree',    'assets/tiles/tile_0010.png');
    if (!this.textures.exists('obj-stump'))   this.load.image('obj-stump',   'assets/tiles/tile_0008.png');
    if (!this.textures.exists('obj-station')) this.load.image('obj-station', 'assets/tiles/tile_0060.png');
    if (!this.textures.exists('obj-recycle')) this.load.image('obj-recycle', 'assets/tiles/tile_0096.png');
  }

  create() {
    this.setupTilemap();
    this.setupPlayer();
    this.setupInputs();
    this.setupInteractables();
    this.setupCamera();
    this.setupPromptText();
  }

  private setupTilemap() {
    const TILE = ForestiaScene.TILE;
    const W = 30, H = 30;

    // Create tilemap from scratch (no JSON file needed)
    const map = this.make.tilemap({ tileWidth: TILE, tileHeight: TILE, width: W, height: H });
    const tileset = map.addTilesetImage('tiny-town', 'tilemap-packed', TILE, TILE, 0, 0)!;

    // Ground layer
    this.groundLayer = map.createBlankLayer('Ground', tileset, 0, 0)!;
    const groundData = buildForestiaGround();
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const tileId = groundData[y * W + x];
        this.groundLayer.putTileAt(tileId - 1, x, y); // putTileAt uses 0-based index
      }
    }

    // Detail layer (trees, stumps, flowers)
    this.detailLayer = map.createBlankLayer('Details', tileset, 0, 0)!;
    const detailData = buildForestiaDetails();
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const tileId = detailData[y * W + x];
        if (tileId > 0) {
          this.detailLayer.putTileAt(tileId - 1, x, y);
        }
      }
    }

    this.physics.world.setBounds(0, 0, W * TILE, H * TILE);
  }

  private setupPlayer() {
    // Start player in the open grassy area (tile 14,22)
    const TILE = ForestiaScene.TILE;
    this.player = new Player(this, 14 * TILE + 8, 22 * TILE + 8);
    this.add.existing(this.player);
    this.physics.add.existing(this.player);
    (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
  }

  private setupInputs() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up:    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  private setupInteractables() {
    const TILE = ForestiaScene.TILE;
    const items = [
      { tx: 10, ty: 5,  texture: 'obj-tree',     id: 'biodiversity_01',  type: 'lesson'   as const, label: '🌲 Ancient Oak\n[E] Inspect' },
      { tx: 11, ty: 10, texture: 'obj-stump',     id: 'pollution_01',     type: 'lesson'   as const, label: '🥀 Damaged Tree\n[E] Learn More' },
      { tx: 17, ty: 15, texture: 'obj-station',   id: 'deforestation_01', type: 'quest'    as const, label: '🏕️ Ranger Station\n[E] Talk to Ranger' },
      { tx: 12, ty: 24, texture: 'obj-recycle',   id: 'recycling_01',     type: 'minigame' as const, label: '♻️ Recycling Station\n[E] Play Mini-Game' },
    ];

    for (const item of items) {
      const obj = new InteractableObject(
        this,
        item.tx * TILE + 8,
        item.ty * TILE + 8,
        item.texture,
        { id: item.id, type: item.type, label: item.label },
      );
      this.interactables.push(obj);
      this.add.existing(obj);
    }
  }

  private setupCamera() {
    const TILE = ForestiaScene.TILE;
    this.cameras.main.setZoom(3);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 30 * TILE, 30 * TILE);
    this.cameras.main.setBackgroundColor('#2d5a27');
  }

  private setupPromptText() {
    this.promptText = this.add.text(0, 0, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '4px',
      color: '#ffffff',
      backgroundColor: '#000000cc',
      padding: { x: 4, y: 3 },
      align: 'center',
    }).setScrollFactor(0).setDepth(200).setVisible(false);
  }

  update() {
    const speed = 80;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown  || this.wasd.left.isDown)  vx -= speed;
    if (this.cursors.right.isDown || this.wasd.right.isDown) vx += speed;
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    vy -= speed;
    if (this.cursors.down.isDown  || this.wasd.down.isDown)  vy += speed;
    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

    body.setVelocity(vx, vy);
    this.player.update(vx, vy);

    // Depth sort
    this.player.setDepth(this.player.y + 100);
    for (const obj of this.interactables) obj.setDepth(obj.y + 100);

    // Nearby check
    this.nearbyObject = null;
    let closest = 24;
    for (const obj of this.interactables) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y);
      if (dist < closest) { closest = dist; this.nearbyObject = obj; }
    }

    if (this.nearbyObject) {
      const cam = this.cameras.main;
      const sx = (this.nearbyObject.x - cam.scrollX) * cam.zoom;
      const sy = (this.nearbyObject.y - cam.scrollY) * cam.zoom - 20;
      this.promptText.setPosition(sx - this.promptText.width / 2, sy);
      this.promptText.setText(this.nearbyObject.label);
      this.promptText.setVisible(true);
    } else {
      this.promptText.setVisible(false);
    }

    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this.nearbyObject) {
      const eventBus: GameEventBus = (this.game as any).eventBus;
      eventBus?.emit('interaction', { type: this.nearbyObject.interactionType, id: this.nearbyObject.interactionId });
    }
  }

  public setWorldState(state: WorldState) { this.worldState = state; }
}
