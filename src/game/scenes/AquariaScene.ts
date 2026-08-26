import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { InteractableObject } from '../objects/InteractableObject';
import type { GameEventBus } from '../EventBus';

export class AquariaScene extends Phaser.Scene {
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

  constructor() {
    super({ key: 'AquariaScene' });
  }

  create() {
    this.setupMap();
    this.setupPlayer();
    this.setupInputs();
    this.setupInteractables();
    this.setupCamera();
    this.setupPromptText();
  }

  private setupMap() {
    const graphics = this.add.graphics();
    const tileW = 64;
    const tileH = 32;
    const cols = 30;
    const rows = 30;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = (col - row) * (tileW / 2) + 640;
        const y = (col + row) * (tileH / 2) + 100;

        const isRiver  = col >= 12 && col <= 16;
        const isPolluted = isRiver && row >= 8 && row <= 18;
        const baseColor = isPolluted ? 0x5b3800 : isRiver ? 0x0c4a6e : 0x1e3a5f;
        const lightColor = isPolluted ? 0x7a4d00 : isRiver ? 0x0d6b9b : 0x1e5080;

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

    this.physics.world.setBounds(-200, -200, 3000, 2500);
  }

  private setupPlayer() {
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
    const objects = [
      { x: 580, y: 380, texture: 'factory',     id: 'pollution_water_01', type: 'lesson' as const, label: '🏭 Industrial Zone\n[E] Learn More' },
      { x: 720, y: 430, texture: 'water-pump',  id: 'water_cycle_01',     type: 'lesson' as const, label: '💧 Water Pump\n[E] Inspect' },
      { x: 820, y: 360, texture: 'water-plant', id: 'water_treat_01',     type: 'quest' as const,  label: '🚰 Water Treatment\n[E] Start Quest' },
    ];

    for (const data of objects) {
      const obj = new InteractableObject(this, data.x, data.y, data.texture, {
        id: data.id, type: data.type, label: data.label,
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

  update() {
    const speed = 200;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown)   vx -= speed;
    if (this.cursors.right.isDown || this.wasd.right.isDown)  vx += speed;
    if (this.cursors.up.isDown || this.wasd.up.isDown)        vy -= speed;
    if (this.cursors.down.isDown || this.wasd.down.isDown)    vy += speed;

    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
    body.setVelocity(vx, vy);
    this.player.update(vx, vy);

    this.player.setDepth(this.player.y);
    for (const obj of this.interactables) obj.setDepth(obj.y);

    this.nearbyObject = null;
    let closest = 80;
    for (const obj of this.interactables) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y);
      if (dist < closest) { closest = dist; this.nearbyObject = obj; }
    }

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

    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this.nearbyObject) {
      const eventBus: GameEventBus = (this.game as any).eventBus;
      if (eventBus) {
        eventBus.emit('interaction', {
          type: this.nearbyObject.interactionType,
          id: this.nearbyObject.interactionId,
        });
      }
    }
  }
}
