import Phaser from 'phaser';

export type InteractionType = 'lesson' | 'quest' | 'minigame';

interface InteractableConfig {
  id: string;
  type: InteractionType;
  label: string;
}

/** A game-world object the player can walk up to and press [E] to interact with */
export class InteractableObject extends Phaser.GameObjects.Container {
  public readonly interactionId: string;
  public readonly interactionType: InteractionType;
  public readonly label: string;

  private gfx!: Phaser.GameObjects.Graphics;
  private glowRing!: Phaser.GameObjects.Graphics;
  private glowTween!: Phaser.Tweens.Tween;

  constructor(
    scene: Phaser.Scene,
    x: number, y: number,
    _texture: string,   // reserved for when real sprites are loaded
    config: InteractableConfig,
  ) {
    super(scene, x, y);
    this.interactionId   = config.id;
    this.interactionType = config.type;
    this.label           = config.label;

    this.drawObject();
    this.setupGlow(scene);
    this.setSize(40, 40);
  }

  private drawObject() {
    this.gfx = this.scene.add.graphics();

    // Glow ring
    this.glowRing = this.scene.add.graphics();

    switch (this.interactionType) {
      case 'lesson':    this.drawTree(); break;
      case 'quest':     this.drawBuilding(); break;
      case 'minigame':  this.drawStation(); break;
    }

    this.add([this.glowRing, this.gfx]);
  }

  private drawTree() {
    // Trunk
    this.gfx.fillStyle(0x92400e, 1);
    this.gfx.fillRect(-4, 4, 8, 16);
    // Canopy
    this.gfx.fillStyle(0x15803d, 1);
    this.gfx.fillCircle(0, -8, 20);
    this.gfx.fillStyle(0x16a34a, 1);
    this.gfx.fillCircle(-6, -12, 14);
    this.gfx.fillCircle( 8, -14, 12);
    // Shadow
    this.gfx.fillStyle(0x000000, 0.15);
    this.gfx.fillEllipse(4, 22, 30, 10);
  }

  private drawBuilding() {
    // Isometric-style building
    this.gfx.fillStyle(0x78716c, 1);
    this.gfx.fillRect(-18, -10, 36, 30);  // front
    this.gfx.fillStyle(0xa8a29e, 1);
    this.gfx.fillRect(-18, -10, 36, 5);   // roof edge
    this.gfx.fillStyle(0x57534e, 1);
    this.gfx.fillRect(-18, -24, 36, 16);  // roof
    // Door
    this.gfx.fillStyle(0x44403c, 1);
    this.gfx.fillRect(-5, 4, 10, 16);
    // Window
    this.gfx.fillStyle(0x7dd3fc, 0.8);
    this.gfx.fillRect(-13, -5, 8, 8);
    this.gfx.fillRect( 5, -5, 8, 8);
  }

  private drawStation() {
    // Recycling station
    this.gfx.fillStyle(0x0891b2, 1);
    this.gfx.fillRect(-14, -4, 28, 22);
    this.gfx.fillStyle(0x0e7490, 1);
    this.gfx.fillRect(-14, -12, 28, 10);
    // Recycling symbol
    this.gfx.fillStyle(0x22c55e, 1);
    this.gfx.fillCircle(0, 6, 8);
    this.gfx.fillStyle(0x0891b2, 1);
    this.gfx.fillCircle(0, 6, 5);
  }

  private setupGlow(scene: Phaser.Scene) {
    // Pulsing glow behind the object
    const color = this.interactionType === 'lesson'   ? 0x22c55e
                : this.interactionType === 'quest'    ? 0xf59e0b
                : 0x38bdf8;

    this.glowTween = scene.tweens.add({
      targets: this,
      alpha: { from: 0.7, to: 1.0 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
