import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { InteractableObject } from '../objects/InteractableObject';
import type { GameEventBus } from '../EventBus';

// Tile constants (1-indexed for our map arrays, converted to 0-indexed for putTileAt)
const T = {
  GRASS:        1,   // plain green grass (tile_0000)
  GRASS2:       2,   // grass variant (tile_0001)
  GRASS3:       3,   // grass variant (tile_0002)
  SAND:         14,  // bare mud/dirt representing polluted dry riverbed (tile_0013)
  WATER:        109, // light blue-grey stone tile for clean restored water canal (tile_0108)
  WATER2:       110,
  WATER3:       109,
  PATH_H:       40,  // horizontal dirt road (tile_0039)
  PATH_V:       41,  // vertical dirt road (tile_0040)
  PATH_TL:      40,
  PATH_TR:      40,
  PATH_BL:      40,
  PATH_BR:      40,
  PATH_X:       42,  // crossroads (tile_0041)
  TREE_T:       5,   // green pine top (tile_0004)
  TREE_B:       17,  // green pine trunk (tile_0016)
  BUSH:         6,   // green round bush (tile_0005)
  FLOWER:       48,  // red mushrooms/flowers (tile_0047)
  STUMP:        10,  // yellow bush/stump (tile_0009)
};

function buildAquariaGround(): number[] {
  const W = 30, H = 30;
  const map: number[] = new Array(W * H).fill(T.GRASS);

  const set = (x: number, y: number, id: number) => {
    if (x >= 0 && x < W && y >= 0 && y < H) map[y * W + x] = id;
  };

  // Wide river down the center
  for (let y = 0; y < H; y++) {
    for (let x = 12; x <= 17; x++) {
      // Polluted in middle section (dry/muddy sand), clean at top and bottom (clean canal)
      const polluted = y >= 8 && y <= 22;
      set(x, y, polluted ? T.SAND : T.WATER);
    }
    // River edges (clean canal tiles)
    set(11, y, T.WATER3);
    set(18, y, T.WATER3);
  }

  // Sandy river banks
  for (let y = 0; y < H; y++) {
    set(10, y, T.SAND);
    set(19, y, T.SAND);
  }

  // Main road (left bank)
  for (let x = 0; x < 10; x++) {
    set(x, 15, T.PATH_H);
  }
  set(10, 15, T.PATH_TR);
  // Main road (right bank)
  for (let x = 20; x < W; x++) {
    set(x, 15, T.PATH_H);
  }
  set(19, 15, T.PATH_TL);

  // Vertical road on left bank
  for (let y = 0; y <= 15; y++) {
    set(5, y, T.PATH_V);
  }
  for (let y = 15; y < H; y++) {
    set(5, y, T.PATH_V);
  }
  set(5, 15, T.PATH_X);

  // Vertical road on right bank
  for (let y = 0; y < H; y++) {
    set(24, y, T.PATH_V);
  }
  set(24, 15, T.PATH_X);

  // Grass variation
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (map[y * W + x] === T.GRASS && Math.random() < 0.12) {
        map[y * W + x] = Math.random() < 0.5 ? T.GRASS2 : T.GRASS3;
      }
    }
  }

  return map;
}

function buildAquariaDetails(): number[] {
  const W = 30, H = 30;
  const map: number[] = new Array(W * H).fill(0);

  const set = (x: number, y: number, id: number) => {
    if (x >= 0 && x < W && y >= 0 && y < H) map[y * W + x] = id;
  };
  const tree = (x: number, y: number) => {
    set(x, y,     T.TREE_T);
    set(x, y + 1, T.TREE_B);
  };

  // Left bank vegetation (residential / wetlands area)
  tree(1, 1); tree(3, 1); tree(7, 1); tree(1, 4); tree(7, 4);
  tree(1, 8); tree(3, 9); tree(7, 8);
  tree(1, 18); tree(3, 19); tree(7, 18); tree(1, 22); tree(6, 22);
  tree(1, 26); tree(3, 27); tree(7, 26);

  // Bushes near river bank (wetland)
  const wetlandBushes = [[8,3],[8,6],[8,9],[8,12],[8,18],[8,21],[8,24],[8,27]];
  for (const [x, y] of wetlandBushes) set(x, y, T.BUSH);

  // Right bank (industrial side)
  tree(21, 1); tree(26, 1); tree(28, 2);
  tree(21, 5); tree(26, 5);
  tree(21, 20); tree(26, 20); tree(28, 21);
  tree(21, 25); tree(26, 25);

  // Flowers in clean water zone (top)
  const cleanFlowers = [[1,2],[3,2],[6,2],[1,6],[3,6],[6,6],[21,3],[23,3],[27,3]];
  for (const [x, y] of cleanFlowers) set(x, y, T.FLOWER);

  // Dead vegetation near polluted zone
  const deadArea = [[8,14],[8,16],[8,18],[8,20]];
  for (const [x, y] of deadArea) set(x, y, T.STUMP);

  return map;
}

export class AquariaScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
  private interactKey!: Phaser.Input.Keyboard.Key;
  private interactables: InteractableObject[] = [];
  private nearbyObject: InteractableObject | null = null;
  private promptText!: Phaser.GameObjects.Text;

  static readonly TILE = 16;

  constructor() {
    super({ key: 'AquariaScene' });
  }

  preload() {
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
    const TILE = AquariaScene.TILE;
    const W = 30, H = 30;

    const map = this.make.tilemap({ tileWidth: TILE, tileHeight: TILE, width: W, height: H });
    const tileset = map.addTilesetImage('tiny-town', 'tilemap-packed', TILE, TILE, 0, 0)!;

    const groundLayer = map.createBlankLayer('Ground', tileset, 0, 0)!;
    const groundData = buildAquariaGround();
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const id = groundData[y * W + x];
        groundLayer.putTileAt(id - 1, x, y);
      }
    }

    const detailLayer = map.createBlankLayer('Details', tileset, 0, 0)!;
    const detailData = buildAquariaDetails();
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const id = detailData[y * W + x];
        if (id > 0) detailLayer.putTileAt(id - 1, x, y);
      }
    }

    this.physics.world.setBounds(0, 0, W * TILE, H * TILE);
  }

  private setupPlayer() {
    const TILE = AquariaScene.TILE;
    this.player = new Player(this, 3 * TILE, 17 * TILE);
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
    const TILE = AquariaScene.TILE;
    const items = [
      { tx: 22, ty: 8,  texture: 'obj-tree',    id: 'pollution_water_01', type: 'lesson'   as const, label: '🏭 Industrial Zone\n[E] Learn More' },
      { tx: 3,  ty: 12, texture: 'obj-station', id: 'water_cycle_01',     type: 'lesson'   as const, label: '💧 Water Pump\n[E] Inspect' },
      { tx: 22, ty: 18, texture: 'obj-recycle', id: 'water_treat_01',     type: 'quest'    as const, label: '🚰 Water Treatment\n[E] Start Quest' },
      { tx: 3,  ty: 22, texture: 'obj-tree',    id: 'biodiversity_01',    type: 'lesson'   as const, label: '🌿 Wetland\n[E] Learn' },
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
    const TILE = AquariaScene.TILE;
    this.cameras.main.setZoom(3);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 30 * TILE, 30 * TILE);
    this.cameras.main.setBackgroundColor('#1a3a5c');
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
    let vx = 0, vy = 0;

    if (this.cursors.left.isDown  || this.wasd.left.isDown)  vx -= speed;
    if (this.cursors.right.isDown || this.wasd.right.isDown) vx += speed;
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    vy -= speed;
    if (this.cursors.down.isDown  || this.wasd.down.isDown)  vy += speed;
    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }

    body.setVelocity(vx, vy);
    this.player.update(vx, vy);

    this.player.setDepth(this.player.y + 100);
    for (const obj of this.interactables) obj.setDepth(obj.y + 100);

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
}
