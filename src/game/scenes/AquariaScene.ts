import * as Phaser from "phaser";
import { BaseWorldScene } from "./BaseWorldScene";

export class AquariaScene extends BaseWorldScene {
  constructor() {
    super("AquariaScene", "aquaria");
  }

  protected override decorate(map: Phaser.Tilemaps.Tilemap) {
    for (let i = 0; i < 26; i++) {
      const glint = this.add
        .rectangle(
          Phaser.Math.Between(0, map.widthInPixels),
          Phaser.Math.Between(0, map.heightInPixels),
          3,
          1,
          0xbfe6ff,
          0.7,
        )
        .setDepth(11);
      this.tweens.add({
        targets: glint,
        alpha: 0.05,
        duration: Phaser.Math.Between(900, 2200),
        yoyo: true,
        repeat: -1,
      });
    }
    this.add
      .text(25 * 32, 2 * 32, "CRYSTAL LAKE", {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#bfe6ff",
      })
      .setOrigin(0.5)
      .setDepth(8);
  }
}
