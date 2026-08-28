import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Nothing to load in Boot — all assets are loaded in PreloadScene
  }

  create() {
    this.scene.start('PreloadScene');
  }
}
