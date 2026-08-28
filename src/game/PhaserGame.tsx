import { useEffect, useRef } from "react";
import * as Phaser from "phaser";
import { PreloadScene } from "./scenes/PreloadScene";
import { GreenhavenScene } from "./scenes/GreenhavenScene";
import { ForestiaScene } from "./scenes/ForestiaScene";
import { AquariaScene } from "./scenes/AquariaScene";
import { useGameStore } from "@/stores/gameStore";
import type { WorldId } from "./content";

const SCENE_FOR: Record<WorldId, string> = {
  greenhaven: "GreenhavenScene",
  forestia: "ForestiaScene",
  aquaria: "AquariaScene",
};

export default function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      backgroundColor: "#0d160f",
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 }, debug: false } },
      scene: [PreloadScene, GreenhavenScene, ForestiaScene, AquariaScene],
    });
    gameRef.current = game;

    // Zustand -> Phaser bridge: world changes swap the active scene.
    let current = useGameStore.getState().currentWorld;
    const unsub = useGameStore.subscribe((state) => {
      if (state.currentWorld === current) return;
      current = state.currentWorld;
      const target = SCENE_FOR[current];
      const active = game.scene.getScenes(true)[0];
      if (active && active.scene.key !== "PreloadScene") {
        active.cameras.main.fadeOut(220, 8, 16, 12);
        active.time.delayedCall(230, () => active.scene.start(target));
      }
    });

    return () => {
      unsub();
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="eq-canvas" />;
}
