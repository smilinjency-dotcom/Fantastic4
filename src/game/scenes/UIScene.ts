import Phaser from 'phaser';

/** Overlay HUD rendered as a Phaser scene on top of the game world */
export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene', active: false });
  }

  create() {
    // Minimal Phaser HUD — main UI is handled by React
    // This scene is reserved for in-game overlays like XP popups, damage numbers etc.
  }
}
