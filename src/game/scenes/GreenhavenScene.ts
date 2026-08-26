import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { InteractableObject } from '../objects/InteractableObject';
import type { GameEventBus } from '../EventBus';
import { useGameStore } from '../../stores/gameStore';

const T = {
  GRASS:        1,
  PATH:         42,  // crossroads
  PORTAL_F:     54,  // tree/forest symbol
  PORTAL_A:     65,  // water symbol
  ECO:          78,  // npc symbol
};

function buildGreenhavenGround(): number[] {
  const W = 20;
  const H = 20;
  const map: number[] = new Array(W * H).fill(T.GRASS);

  const set = (x: number, y: number, id: number) => {
    if (x >= 0 && x < W && y >= 0 && y < H) map[y * W + x] = id;
  };

  // Center platform
  for (let y = 8; y <= 11; y++) {
    for (let x = 8; x <= 11; x++) {
      set(x, y, T.PATH);
    }
  }

  return map;
}

export class GreenhavenScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
  private interactKey!: Phaser.Input.Keyboard.Key;
  private interactables: InteractableObject[] = [];
  private nearbyObject: InteractableObject | null = null;
  private promptText!: Phaser.GameObjects.Text;
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;

  static readonly TILE = 16;

  constructor() {
    super({ key: 'GreenhavenScene' });
  }

  preload() {
    if (!this.textures.exists('tilemap-packed')) {
      this.load.image('tilemap-packed', 'assets/shared/tilemap_packed.png');
    }
    // We can use single tiles for objects
    if (!this.textures.exists('obj-eco'))      this.load.image('obj-eco',      'assets/tiles/tile_0078.png');
    if (!this.textures.exists('obj-portal-f')) this.load.image('obj-portal-f', 'assets/tiles/tile_0054.png');
    if (!this.textures.exists('obj-portal-a')) this.load.image('obj-portal-a', 'assets/tiles/tile_0065.png');
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
    const TILE = GreenhavenScene.TILE;
    const W = 20, H = 20;

    const map = this.make.tilemap({ tileWidth: TILE, tileHeight: TILE, width: W, height: H });
    const tileset = map.addTilesetImage('tiny-town', 'tilemap-packed', TILE, TILE, 0, 0)!;

    this.groundLayer = map.createBlankLayer('Ground', tileset, 0, 0)!;
    const groundData = buildGreenhavenGround();
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const tileId = groundData[y * W + x];
        this.groundLayer.putTileAt(tileId - 1, x, y);
      }
    }

    this.physics.world.setBounds(0, 0, W * TILE, H * TILE);
  }

  private setupPlayer() {
    const TILE = GreenhavenScene.TILE;
    this.player = new Player(this, 10 * TILE, 14 * TILE);
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
    const TILE = GreenhavenScene.TILE;
    
    // Check crystal states
    const crystals = useGameStore.getState().crystals;
    
    const items = [
      { tx: 10, ty: 8,  texture: 'obj-eco',      id: 'eco_guide_01', type: 'dialogue' as const, label: 'ECO\n[E] Talk' },
      { tx: 8,  ty: 9,  texture: 'obj-portal-f', id: 'portal_forest',type: 'portal_f' as const, label: 'Portal: Forestia\n[E] Enter' },
      { tx: 12, ty: 9,  texture: 'obj-portal-a', id: 'portal_aqua',  type: 'portal_a' as const, label: 'Portal: Aquaria\n[E] Enter' },
    ];

    for (const item of items) {
      const obj = new InteractableObject(
        this,
        item.tx * TILE + 8,
        item.ty * TILE + 8,
        item.texture,
        { id: item.id, type: item.type as any, label: item.label },
      );
      
      if (item.type === 'portal_f' && crystals.forestia) obj.setTint(0x00ff00);
      if (item.type === 'portal_a' && crystals.aquaria) obj.setTint(0x0088ff);
      
      this.interactables.push(obj);
      this.add.existing(obj);
    }
  }

  private setupCamera() {
    const TILE = GreenhavenScene.TILE;
    this.cameras.main.setZoom(4);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 20 * TILE, 20 * TILE);
    this.cameras.main.setBackgroundColor('#1a2f2b');
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
      const type = this.nearbyObject.interactionType;
      if (type === 'portal_f') {
        useGameStore.getState().setWorld('forestia');
      } else if (type === 'portal_a') {
        useGameStore.getState().setWorld('aquaria');
      } else {
        const eventBus: GameEventBus = (this.game as any).eventBus;
        eventBus?.emit('interaction', { type: type as any, id: this.nearbyObject.interactionId });
      }
    }
  }
}
