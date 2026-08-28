import * as Phaser from "phaser";
import { BaseWorldScene } from "./BaseWorldScene";

export class ForestiaScene extends BaseWorldScene {
  constructor() {
    super("ForestiaScene", "forestia");
  }

  protected override decorate(map: Phaser.Tilemaps.Tilemap) {
    // drifting motes of pollen for a living forest feel
    for (let i = 0; i < 40; i++) {
      const mote = this.add
        .rectangle(
          Phaser.Math.Between(0, map.widthInPixels),
          Phaser.Math.Between(0, map.heightInPixels),
          2,
          2,
          0xf2f6c8,
          0.6,
        )
        .setDepth(11);
      this.tweens.add({
        targets: mote,
        y: mote.y - Phaser.Math.Between(20, 60),
        x: mote.x + Phaser.Math.Between(-30, 30),
        alpha: 0,
        duration: Phaser.Math.Between(4000, 9000),
        repeat: -1,
        yoyo: false,
      });
    }
    this.add
      .text(25 * 32, 2 * 32, "ANCIENT TREE GROVE", {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#d7f0b8",
      })
      .setOrigin(0.5)
      .setDepth(8);
  }
}
