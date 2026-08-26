import Phaser from 'phaser';

export type InteractionType = 'lesson' | 'quest' | 'minigame';

interface InteractableConfig {
  id: string;
  type: InteractionType;
  label: string;
}

const GLOW_COLORS: Record<InteractionType, number> = {
  lesson:   0x22c55e,
  quest:    0xf59e0b,
  minigame: 0x38bdf8,
};

/** A game-world object the player walks near to interact with [E] */
export class InteractableObject extends Phaser.GameObjects.Container {
  public readonly interactionId: string;
  public readonly interactionType: InteractionType;
  public readonly label: string;

  private glowCircle!: Phaser.GameObjects.Arc;
  private icon!: Phaser.GameObjects.Image;

  constructor(
    scene: Phaser.Scene,
    x: number, y: number,
    texture: string,
    config: InteractableConfig,
  ) {
    super(scene, x, y);
    this.interactionId   = config.id;
    this.interactionType = config.type;
    this.label           = config.label;

    this.buildSprite(scene, texture);
    this.setSize(14, 14);
  }

  private buildSprite(scene: Phaser.Scene, texture: string) {
    const color = GLOW_COLORS[this.interactionType];

    // Pulsing glow circle underneath
    this.glowCircle = scene.add.circle(0, 2, 8, color, 0.3);
    this.add(this.glowCircle);

    // The actual Kenney tile image (scaled up 2x since tiles are 16px and zoom is 3x)
    const hasTexture = scene.textures.exists(texture);
    if (hasTexture) {
      this.icon = scene.add.image(0, 0, texture).setScale(1);
    } else {
      // Fallback drawn marker if texture missing
      const g = scene.add.graphics();
      g.fillStyle(color, 0.9);
      g.fillCircle(0, 0, 6);
      this.add(g);
      // dummy image ref
      this.icon = scene.add.image(0, 0, '__DEFAULT').setVisible(false);
    }
    this.add(this.icon);

    // Pulsing tween on the glow
    scene.tweens.add({
      targets: this.glowCircle,
      alpha: { from: 0.2, to: 0.6 },
      scaleX: { from: 0.8, to: 1.2 },
      scaleY: { from: 0.8, to: 1.2 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
