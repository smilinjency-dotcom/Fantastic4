import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { ForestiaScene } from './scenes/ForestiaScene';
import { AquariaScene } from './scenes/AquariaScene';
import { UIScene } from './scenes/UIScene';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export function createGame(parent: string): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent,
    backgroundColor: '#0a0f1a',
    scene: [BootScene, PreloadScene, ForestiaScene, AquariaScene, UIScene],
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
        gravity: { x: 0, y: 0 },
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      pixelArt: true,
      antialias: false,
    },
  });
}
