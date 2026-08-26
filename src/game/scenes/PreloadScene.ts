import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private percentText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    // === Loading UI ===
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x1a2335, 0.9);
    this.progressBox.fillRoundedRect(cx - 200, cy - 14, 400, 28, 8);

    this.progressBar = this.add.graphics();

    this.loadingText = this.add.text(cx, cy - 40, 'LOADING ECOQUEST...', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#22c55e',
    }).setOrigin(0.5);

    this.percentText = this.add.text(cx, cy + 50, '0%', {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      color: '#94a3b8',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0x22c55e, 1);
      this.progressBar.fillRoundedRect(cx - 196, cy - 10, 392 * value, 20, 6);
      this.percentText.setText(`${Math.floor(value * 100)}%`);
    });

    this.load.on('complete', () => {
      this.progressBar.destroy();
      this.progressBox.destroy();
      this.loadingText.destroy();
      this.percentText.destroy();
    });

    // ===== LOAD ALL GAME ASSETS =====

    // Kenney Tiny Dungeon tileset
    this.load.image('tilemap-packed', 'assets/shared/tilemap_packed.png');
    this.load.spritesheet('tilemap-sprites', 'assets/shared/tilemap_packed.png', { frameWidth: 16, frameHeight: 16 });

    // Load Tiled JSON maps
    this.load.tilemapTiledJSON('map-greenhaven', 'maps/greenhaven.json');
    this.load.tilemapTiledJSON('map-forestia', 'maps/forestia.json');
    this.load.tilemapTiledJSON('map-aquaria', 'maps/aquaria.json');

    // Player sprite (we use procedural drawing, but still need a key)
    // Individual tiles are no longer needed, using spritesheet frames directly
    this.load.spritesheet('obj-sprites', 'assets/shared/tilemap_packed.png', { frameWidth: 16, frameHeight: 16 });

  }

  create() {
    // Small delay so player sees 100%
    this.time.delayedCall(300, () => {
      this.scene.start('ForestiaScene');
      this.scene.start('UIScene');
    });
  }
}
