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

    // Tileset spritesheets (16x16 or 32x32 tiles)
    this.load.image('tiles-forestia', 'assets/forestia/tileset.png');
    this.load.image('tiles-aquaria',  'assets/aquaria/tileset.png');

    // Player sprite (animated)
    this.load.spritesheet('player', 'assets/shared/player.png', {
      frameWidth: 32,
      frameHeight: 48,
    });

    // Tiled maps
    this.load.tilemapTiledJSON('map-forestia', 'maps/forestia.json');
    this.load.tilemapTiledJSON('map-aquaria',  'maps/aquaria.json');

    // Environment objects
    this.load.image('tree-healthy',   'assets/forestia/tree_healthy.png');
    this.load.image('tree-damaged',   'assets/forestia/tree_damaged.png');
    this.load.image('tree-dead',      'assets/forestia/tree_dead.png');
    this.load.image('ranger-station', 'assets/forestia/ranger_station.png');
    this.load.image('recycling',      'assets/forestia/recycling_station.png');
    this.load.image('water-pump',     'assets/aquaria/water_pump.png');
    this.load.image('factory',        'assets/aquaria/factory.png');
    this.load.image('water-plant',    'assets/aquaria/water_treatment.png');

    // NPCs
    this.load.spritesheet('npc-ranger', 'assets/shared/npc_ranger.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('npc-fisher', 'assets/shared/npc_fisher.png', { frameWidth: 32, frameHeight: 48 });

    // Particles / FX
    this.load.image('particle-leaf',  'assets/shared/particle_leaf.png');
    this.load.image('particle-water', 'assets/shared/particle_water.png');
    this.load.image('particle-star',  'assets/shared/particle_star.png');
  }

  create() {
    // Small delay so player sees 100%
    this.time.delayedCall(300, () => {
      this.scene.start('ForestiaScene');
      this.scene.start('UIScene');
    });
  }
}
