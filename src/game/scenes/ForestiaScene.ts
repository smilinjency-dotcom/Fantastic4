import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { InteractableObject } from '../objects/InteractableObject';
import type { GameEventBus } from '../EventBus';
import { useGameStore } from '../../stores/gameStore';

export class ForestiaScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
  private interactKey!: Phaser.Input.Keyboard.Key;
  private interactables: InteractableObject[] = [];
  private nearbyObject: InteractableObject | null = null;
  private promptText!: Phaser.GameObjects.Text;

  static readonly TILE = 16;

  constructor() {
    super({ key: 'ForestiaScene' });
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
    const map = this.make.tilemap({ key: 'map-forestia' });
    const tileset = map.addTilesetImage('tiny-dungeon', 'tilemap-packed')!;
    
    map.createLayer('Ground', tileset, 0, 0);
    map.createLayer('Details', tileset, 0, 0);
    
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.registry.set('currentMap', map);
  }

  private setupPlayer() {
    const TILE = ForestiaScene.TILE;
    this.player = new Player(this, 15 * TILE, 17 * TILE); // Centered
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
    const map: Phaser.Tilemaps.Tilemap = this.registry.get('currentMap');
    const objectLayer = map.getObjectLayer('Objects');
    if (!objectLayer) return;

    for (const objData of objectLayer.objects) {
      const props = objData.properties || [];
      const getProp = (name: string) => props.find((p: any) => p.name === name)?.value;

      const type = objData.type as any;
      const id = getProp('interactionId') || '';
      const texture = getProp('texture') || 'obj-eco'; // fallback
      const label = getProp('label') || '';

      const obj = new InteractableObject(
        this,
        (objData.x || 0) + 8, // Center of 16x16
        (objData.y || 0) + 8, // Center
        texture,
        { id, type, label }
      );

      this.interactables.push(obj);
      this.add.existing(obj);
    }
  }

  private setupCamera() {
    const map = this.registry.get('currentMap');
    this.cameras.main.setZoom(3);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
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
    let vx = 0; let vy = 0;

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
      if (type === 'portal_hub') {
        useGameStore.getState().setWorld('greenhaven');
      } else {
        const eventBus: GameEventBus = (this.game as any).eventBus;
        eventBus?.emit('interaction', { type: type as any, id: this.nearbyObject.interactionId });
      }
    }
  }
}
