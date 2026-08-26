import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { InteractableObject } from '../objects/InteractableObject';
import type { GameEventBus } from '../EventBus';
import { useGameStore } from '../../stores/gameStore';

export type WorldState = 'damaged' | 'recovering' | 'thriving';

// Kenney Tiny Town tile indices (0-based in spritesheet, 12 cols × 11 rows)
// Tile IDs in Phaser tilemap are 1-indexed (0 = empty)
const T = {
  GRASS:        1,   // plain green grass (tile_0000)
  GRASS2:       2,   // grass variant (tile_0001)
  GRASS3:       3,   // grass variant (tile_0002)
  DIRT:         14,  // bare dirt / deforested (tile_0013)
  WATER:        109, // light blue-grey stone tile (tile_0108)
  WATER2:       110,
  PATH_H:       40,  // horizontal dirt road (tile_0039)
  PATH_V:       41,  // vertical dirt road (tile_0040)
  PATH_X:       42,  // crossroads dirt road (tile_0041)
  TREE_T:       5,   // green pine top (tile_0004)
  TREE_B:       17,  // green pine trunk (tile_0016)
  DEAD_TREE_T:  4,   // yellow/damaged pine top (tile_0003)
  DEAD_TREE_B:  16,  // yellow/damaged pine trunk (tile_0015)
  STUMP:        10,  // yellow bush/stump (tile_0009)
  BUSH:         6,   // green round bush (tile_0005)
  FLOWER:       48,  // red mushrooms/flowers (tile_0047)
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

  // River/stream through right side (canal)
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
  // Intersection
  set(14, 18, T.PATH_X);
  set(15, 18, T.PATH_X);

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
    [1,1],[2,1],[4,1],[5,1],[7,2],[1,3],[3,3],[6,3],[8,3],
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
    // 1×2 pine tree
    set(x, y,     T.TREE_T);
    set(x, y + 1, T.TREE_B);
  }

  // Damaged / dead trees in deforested area
  const deadTrees = [[9,8],[11,8],[13,8],[10,9],[12,9],[14,8]];
  for (const [x, y] of deadTrees) {
    set(x, y,     T.DEAD_TREE_T);
    set(x, y + 1, T.DEAD_TREE_B);
  }

  // Stumps in deforested area
  const stumps = [[10,11],[12,11],[11,12],[13,12],[9,13],[14,12]];
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
    set(x, y,     T.TREE_T);
    set(x, y + 1, T.TREE_B);
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
      { tx: 15, ty: 20, texture: 'obj-station',   id: 'portal_hub',       type: 'portal_hub' as const, label: 'Portal: Greenhaven\n[E] Return' },
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
      if (this.nearbyObject.interactionType === 'portal_hub') {
        useGameStore.getState().setWorld('greenhaven');
      } else {
        const eventBus: GameEventBus = (this.game as any).eventBus;
        eventBus?.emit('interaction', { type: this.nearbyObject.interactionType, id: this.nearbyObject.interactionId });
      }
    }
  }

  public setWorldState(state: WorldState) { this.worldState = state; }
}
