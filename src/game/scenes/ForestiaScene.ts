import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { InteractableObject } from '../objects/InteractableObject';
import type { GameEventBus } from '../EventBus';

// Forestia areas and their health state
export type WorldState = 'damaged' | 'recovering' | 'thriving';

export class ForestiaScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private interactKey!: Phaser.Input.Keyboard.Key;
  private interactables: InteractableObject[] = [];
  private nearbyObject: InteractableObject | null = null;
  private promptText!: Phaser.GameObjects.Text;
  private map!: Phaser.Tilemaps.Tilemap;
  private worldState: WorldState = 'damaged';

  constructor() {
    super({ key: 'ForestiaScene' });
  }

  create() {
    this.setupMap();
    this.setupPlayer();
    this.setupInputs();
    this.setupInteractables();
    this.setupCamera();
    this.setupPromptText();
    this.setupDepthSort();
  }

  private setupMap() {
    // Create a placeholder isometric-style ground using graphics
    // (Will be replaced with Tiled map when assets are ready)
    const graphics = this.add.graphics();

    // Draw isometric ground tiles
    const tileW = 64;
    const tileH = 32;
    const cols = 30;
    const rows = 30;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = (col - row) * (tileW / 2) + 640;
        const y = (col + row) * (tileH / 2) + 100;

        // Alternate colors for natural look
        const isDamaged = row > 10 && row < 20 && col > 5 && col < 15;
        const isWater   = col > 20 || row < 3;
        const baseColor = isDamaged ? 0x5c3d11 : isWater ? 0x164e63 : 0x1a5c2a;
        const lightColor = isDamaged ? 0x7c5121 : isWater ? 0x1e6b83 : 0x22742e;

        graphics.fillStyle(lightColor, 1);
        graphics.fillPoints([
          { x, y: y - tileH / 2 },
          { x: x + tileW / 2, y },
          { x, y: y + tileH / 2 },
          { x: x - tileW / 2, y },
        ], true);

        graphics.lineStyle(1, baseColor, 0.5);
        graphics.strokePoints([
          { x, y: y - tileH / 2 },
          { x: x + tileW / 2, y },
          { x, y: y + tileH / 2 },
          { x: x - tileW / 2, y },
        ], true);
      }
    }

    // Set world bounds
    this.physics.world.setBounds(-200, -200, 3000, 2500);
  }

  private setupPlayer() {
    // Place player in isometric center
    this.player = new Player(this, 640, 500);
    this.add.existing(this.player);
    this.physics.add.existing(this.player);
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
    const lessonData = [
      {
        x: 580, y: 380, texture: 'tree-healthy',
        id: 'biodiversity_01', type: 'lesson' as const,
        label: '🌲 Ancient Oak\n[E] Inspect',
      },
      {
        x: 720, y: 430, texture: 'tree-damaged',
        id: 'pollution_01', type: 'lesson' as const,
        label: '🥀 Damaged Tree\n[E] Learn More',
      },
      {
        x: 800, y: 350, texture: 'ranger-station',
        id: 'deforestation_01', type: 'quest' as const,
        label: '🏕️ Ranger Station\n[E] Talk to Ranger',
      },
      {
        x: 500, y: 480, texture: 'recycling',
        id: 'recycling_01', type: 'minigame' as const,
        label: '♻️ Recycling Station\n[E] Play Mini-Game',
      },
    ];

    for (const data of lessonData) {
      const obj = new InteractableObject(this, data.x, data.y, data.texture, {
        id: data.id,
        type: data.type,
        label: data.label,
      });
      this.interactables.push(obj);
      this.add.existing(obj);
    }
  }

  private setupCamera() {
    this.cameras.main.setZoom(1.2);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(-200, -200, 3000, 2500);
  }

  private setupPromptText() {
    this.promptText = this.add.text(0, 0, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      color: '#ffffff',
      backgroundColor: '#00000099',
      padding: { x: 8, y: 6 },
      align: 'center',
    }).setScrollFactor(0).setDepth(100).setVisible(false);
  }

  private setupDepthSort() {
    // Depth sort is updated every frame in update()
  }

  update() {
    const speed = 200;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    let vx = 0;
    let vy = 0;

    // Movement input
    if (this.cursors.left.isDown || this.wasd.left.isDown)  vx -= speed;
    if (this.cursors.right.isDown || this.wasd.right.isDown) vx += speed;
    if (this.cursors.up.isDown || this.wasd.up.isDown)       vy -= speed;
    if (this.cursors.down.isDown || this.wasd.down.isDown)   vy += speed;

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    body.setVelocity(vx, vy);
    this.player.update(vx, vy);

    // Depth sort player and interactables
    this.player.setDepth(this.player.y);
    for (const obj of this.interactables) {
      obj.setDepth(obj.y);
    }

    // Check for nearby interactable
    this.nearbyObject = null;
    let closest = 80; // pixels threshold
    for (const obj of this.interactables) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        obj.x, obj.y
      );
      if (dist < closest) {
        closest = dist;
        this.nearbyObject = obj;
      }
    }

    // Show/hide prompt
    if (this.nearbyObject) {
      const cam = this.cameras.main;
      const sx = (this.nearbyObject.x - cam.scrollX) * cam.zoom;
      const sy = (this.nearbyObject.y - cam.scrollY) * cam.zoom - 60;
      this.promptText.setPosition(sx - this.promptText.width / 2, sy);
      this.promptText.setText(this.nearbyObject.label);
      this.promptText.setVisible(true);
    } else {
      this.promptText.setVisible(false);
    }

    // Interaction
    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this.nearbyObject) {
      this.triggerInteraction(this.nearbyObject);
    }
  }

  private triggerInteraction(obj: InteractableObject) {
    // Emit event to React via EventBus
    const eventBus: GameEventBus = (this.game as any).eventBus;
    if (eventBus) {
      eventBus.emit('interaction', {
        type: obj.interactionType,
        id: obj.interactionId,
        worldState: this.worldState,
      });
    }
  }

  /** Called from React to update the world visual state */
  public setWorldState(state: WorldState) {
    this.worldState = state;
    // TODO: swap tile layers / object textures
  }
}
