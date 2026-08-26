import { useEffect, useRef } from 'react';
import { createGame } from '../game/game';
import { eventBus } from '../game/EventBus';
import { useGameStore } from '../stores/gameStore';
import type Phaser from 'phaser';

interface Props {
  world: 'greenhaven' | 'forestia' | 'aquaria';
}

export function PhaserGame({ world }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const openModal = useGameStore(s => s.openModal);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const game = createGame('phaser-container');
    (game as any).eventBus = eventBus;
    gameRef.current = game;

    // Listen for Phaser → React events
    const handleInteraction = (data: { type: 'lesson' | 'quest' | 'minigame' | 'dialogue'; id: string }) => {
      openModal(data.type, data.id);
    };
    eventBus.on('interaction', handleInteraction);

    return () => {
      eventBus.off('interaction', handleInteraction);
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  // Switch scene when world changes
  useEffect(() => {
    if (!gameRef.current) return;
    const game = gameRef.current;
    
    const scenes = {
      greenhaven: 'GreenhavenScene',
      forestia: 'ForestiaScene',
      aquaria: 'AquariaScene'
    };
    
    const targetScene = scenes[world];
    
    // Stop all scenes except the target
    Object.values(scenes).forEach(scene => {
      if (scene !== targetScene) {
        game.scene.stop(scene);
      }
    });

    if (!game.scene.isActive(targetScene)) {
      game.scene.start(targetScene);
    }
  }, [world]);

  return (
    <div
      id="phaser-container"
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
