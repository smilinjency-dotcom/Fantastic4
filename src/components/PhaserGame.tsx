import { useEffect, useRef } from 'react';
import { createGame } from '../game/game';
import { eventBus } from '../game/EventBus';
import { useGameStore } from '../stores/gameStore';
import type Phaser from 'phaser';

interface Props {
  world: 'forestia' | 'aquaria';
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
    const handleInteraction = (data: { type: 'lesson' | 'quest' | 'minigame'; id: string }) => {
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
    const sceneKey = world === 'forestia' ? 'ForestiaScene' : 'AquariaScene';
    const other    = world === 'forestia' ? 'AquariaScene'  : 'ForestiaScene';

    game.scene.stop(other);
    if (!game.scene.isActive(sceneKey)) {
      game.scene.start(sceneKey);
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
