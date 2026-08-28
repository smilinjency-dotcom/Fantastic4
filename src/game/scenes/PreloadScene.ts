import * as Phaser from "phaser";
import { createAllTextures } from "../textures";
import { useGameStore } from "@/stores/gameStore";

const SCENE_FOR: Record<string, string> = {
  greenhaven: "GreenhavenScene",
  forestia: "ForestiaScene",
  aquaria: "AquariaScene",
};

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    const width = this.scale.width;
    const height = this.scale.height;
    const label = this.add
      .text(width / 2, height / 2 - 20, "Waking the world…", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#d8f3c8",
      })
      .setOrigin(0.5);
    const bar = this.add.rectangle(width / 2, height / 2 + 14, 0, 8, 0x7de3c3).setOrigin(0.5);
    this.load.on("progress", (p: number) => bar.setSize(240 * p, 8));
    this.load.on("complete", () => {
      label.destroy();
      bar.destroy();
    });

    this.load.tilemapTiledJSON("greenhaven", "/maps/greenhaven.json");
    this.load.tilemapTiledJSON("forestia", "/maps/forestia-01.json");
    this.load.tilemapTiledJSON("aquaria", "/maps/aquaria-01.json");
  }

  create() {
    createAllTextures(this);

    const dirs: Array<["down" | "left" | "right" | "up", number]> = [
      ["down", 0],
      ["left", 1],
      ["right", 2],
      ["up", 3],
    ];
    for (const [name, row] of dirs) {
      const base = row * 4;
      if (!this.anims.exists(`walk-${name}`)) {
        this.anims.create({
          key: `walk-${name}`,
          frames: [0, 1, 2, 3].map((f) => ({ key: "guardian", frame: base + f })),
          frameRate: 8,
          repeat: -1,
        });
      }
      if (!this.anims.exists(`idle-${name}`)) {
        this.anims.create({
          key: `idle-${name}`,
          frames: [{ key: "guardian", frame: base }],
          frameRate: 1,
        });
      }
    }

    const world = useGameStore.getState().currentWorld;
    this.scene.start(SCENE_FOR[world] ?? "GreenhavenScene");
  }
}
