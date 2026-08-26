import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Load only the loading screen assets here
    this.load.image('logo', 'assets/shared/logo.png');
  }

  create() {
    this.scene.start('PreloadScene');
  }
}
