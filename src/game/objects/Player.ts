import Phaser from 'phaser';

export class Player extends Phaser.GameObjects.Container {
  private shadow!: Phaser.GameObjects.Ellipse;
  private body_sprite!: Phaser.GameObjects.Graphics;
  private facing: 'down' | 'up' | 'left' | 'right' = 'down';
  private isMoving = false;
  private walkFrame = 0;
  private walkTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // Shadow
    this.shadow = scene.add.ellipse(0, 12, 24, 10, 0x000000, 0.3);
    this.add(this.shadow);

    // Body (placeholder pixel-art character)
    this.body_sprite = scene.add.graphics();
    this.drawCharacter('down', 0);
    this.add(this.body_sprite);

    this.setSize(20, 28);
  }

  private drawCharacter(dir: string, frame: number) {
    this.body_sprite.clear();

    // Pixel art player
    const bobY = frame === 1 ? 1 : 0;

    // Body
    this.body_sprite.fillStyle(0x22c55e, 1);
    this.body_sprite.fillRect(-6, -4 + bobY, 12, 14);

    // Head
    this.body_sprite.fillStyle(0xfde68a, 1);
    this.body_sprite.fillRect(-7, -18 + bobY, 14, 14);

    // Eyes
    this.body_sprite.fillStyle(0x1e293b, 1);
    if (dir === 'down') {
      this.body_sprite.fillRect(-3, -12 + bobY, 3, 3);
      this.body_sprite.fillRect( 2, -12 + bobY, 3, 3);
    } else if (dir === 'up') {
      // No eyes visible from back
    } else if (dir === 'left') {
      this.body_sprite.fillRect(-4, -12 + bobY, 3, 3);
    } else {
      this.body_sprite.fillRect( 2, -12 + bobY, 3, 3);
    }

    // Legs
    this.body_sprite.fillStyle(0x166534, 1);
    if (frame === 0) {
      this.body_sprite.fillRect(-5,  8 + bobY, 4, 8);
      this.body_sprite.fillRect( 1,  8 + bobY, 4, 8);
    } else {
      this.body_sprite.fillRect(-5,  6 + bobY, 4, 10);
      this.body_sprite.fillRect( 1,  10 + bobY, 4, 6);
    }

    // Arms
    this.body_sprite.fillStyle(0xfde68a, 1);
    this.body_sprite.fillRect(-10, -2 + bobY, 4, 10);
    this.body_sprite.fillRect( 6,  -2 + bobY, 4, 10);

    // Hat
    this.body_sprite.fillStyle(0x854d0e, 1);
    this.body_sprite.fillRect(-8, -22 + bobY, 16, 5);
    this.body_sprite.fillRect(-5, -28 + bobY, 10, 7);
  }

  update(vx: number, vy: number) {
    this.isMoving = vx !== 0 || vy !== 0;

    if (this.isMoving) {
      if (Math.abs(vx) > Math.abs(vy)) {
        this.facing = vx > 0 ? 'right' : 'left';
      } else {
        this.facing = vy > 0 ? 'down' : 'up';
      }

      this.walkTimer += 16;
      if (this.walkTimer > 200) {
        this.walkFrame = this.walkFrame === 0 ? 1 : 0;
        this.walkTimer = 0;
      }
    } else {
      this.walkFrame = 0;
      this.walkTimer = 0;
    }

    this.drawCharacter(this.facing, this.isMoving ? this.walkFrame : 0);

    // Flip for left
    this.setScale(this.facing === 'left' ? -1 : 1, 1);
  }
}
