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
    this.shadow = scene.add.ellipse(0, 6, 10, 4, 0x000000, 0.3);
    this.add(this.shadow);

    // Body (placeholder pixel-art character — scaled for 16px tile world)
    this.body_sprite = scene.add.graphics();
    this.drawCharacter('down', 0);
    this.add(this.body_sprite);

    this.setSize(8, 12);
  }

  private drawCharacter(dir: string, frame: number) {
    this.body_sprite.clear();

    const bobY = frame === 1 ? 1 : 0;

    // Body (green shirt)
    this.body_sprite.fillStyle(0x22c55e, 1);
    this.body_sprite.fillRect(-3, -2 + bobY, 6, 7);

    // Head
    this.body_sprite.fillStyle(0xfde68a, 1);
    this.body_sprite.fillRect(-3, -9 + bobY, 7, 7);

    // Eyes
    this.body_sprite.fillStyle(0x1e293b, 1);
    if (dir === 'down') {
      this.body_sprite.fillRect(-2, -6 + bobY, 1, 1);
      this.body_sprite.fillRect( 1, -6 + bobY, 1, 1);
    } else if (dir === 'left') {
      this.body_sprite.fillRect(-2, -6 + bobY, 1, 1);
    } else if (dir === 'right') {
      this.body_sprite.fillRect( 2, -6 + bobY, 1, 1);
    }

    // Legs
    this.body_sprite.fillStyle(0x166534, 1);
    if (frame === 0) {
      this.body_sprite.fillRect(-2, 4 + bobY, 2, 4);
      this.body_sprite.fillRect( 1, 4 + bobY, 2, 4);
    } else {
      this.body_sprite.fillRect(-2, 3 + bobY, 2, 5);
      this.body_sprite.fillRect( 1, 5 + bobY, 2, 3);
    }

    // Hat
    this.body_sprite.fillStyle(0x854d0e, 1);
    this.body_sprite.fillRect(-3, -11 + bobY, 7, 2);
    this.body_sprite.fillRect(-2, -13 + bobY, 5, 3);
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
