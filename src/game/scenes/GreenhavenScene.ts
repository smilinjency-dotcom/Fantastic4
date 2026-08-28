import * as Phaser from "phaser";
import { BaseWorldScene } from "./BaseWorldScene";

export class GreenhavenScene extends BaseWorldScene {
  constructor() {
    super("GreenhavenScene", "greenhaven");
  }

  protected override decorate(map: Phaser.Tilemaps.Tilemap) {
    this.add
      .text(20 * 32, 9 * 32, "THE EARTH CORE", {
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#bff2dc",
      })
      .setOrigin(0.5)
      .setDepth(8);
    this.add
      .text(3 * 32, 11.4 * 32, "← Forestia", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#e8f7d4",
      })
      .setOrigin(0.5)
      .setDepth(8);
    this.add
      .text(36 * 32, 11.4 * 32, "Aquaria →", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#e8f7d4",
      })
      .setOrigin(0.5)
      .setDepth(8);
    this.lights?.disable();
    void map;
  }
}
