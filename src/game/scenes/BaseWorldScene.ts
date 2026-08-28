import * as Phaser from "phaser";
import { SOLID_GIDS, T, TILE_SIZE } from "../tiles";
import { INTERACTABLES, SPAWNS, WORLDS, type Interactable, type WorldId } from "../content";
import { useGameStore } from "@/stores/gameStore";

type Dir = "down" | "left" | "right" | "up";

/** Shared movement, camera, collision and interaction handling for every biome. */
export abstract class BaseWorldScene extends Phaser.Scene {
  protected worldId!: WorldId;
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private facing: Dir = "down";
  private interactables: (Interactable & { sprite: Phaser.GameObjects.Image })[] = [];
  private prompt!: Phaser.GameObjects.Text;
  private nearest: Interactable | null = null;
  private cooldown = 0;

  constructor(key: string, worldId: WorldId) {
    super(key);
    this.worldId = worldId;
  }

  /** Extra per-biome decoration hook. */
  protected decorate(_map: Phaser.Tilemaps.Tilemap) {}

  create() {
    const map = this.make.tilemap({ key: WORLDS[this.worldId].mapKey });
    const tileset = map.addTilesetImage("eco-tiles", "eco-tiles", TILE_SIZE, TILE_SIZE, 0, 0);
    if (!tileset) return;

    map.createLayer("ground", tileset, 0, 0);
    const objects = map.createLayer("objects", tileset, 0, 0);

    // Clear any decoration sitting on an interaction point so it stays reachable.
    for (const spot of INTERACTABLES[this.worldId]) {
      objects?.removeTileAt(spot.tx, spot.ty);
      objects?.removeTileAt(spot.tx, spot.ty + 1);
    }

    // Light up crystal sockets that the player has already awakened (Greenhaven).
    const crystals = useGameStore.getState().crystals;
    if (this.worldId === "greenhaven" && objects) {
      objects.forEachTile((tile) => {
        if (tile.index === T.SOCKET_DARK + 1) {
          const slot = tile.x - 18;
          if (slot === 0 && crystals.includes("life")) tile.index = T.SOCKET_LIT + 1;
          if (slot === 1 && crystals.includes("water")) tile.index = T.SOCKET_LIT + 1;
        }
      });
    }

    objects?.setCollision(SOLID_GIDS);

    const spawn = SPAWNS[this.worldId];
    this.player = this.physics.add.sprite(
      spawn.tx * TILE_SIZE + TILE_SIZE / 2,
      spawn.ty * TILE_SIZE + TILE_SIZE / 2,
      "guardian",
      0,
    );
    this.player.setSize(14, 12).setOffset(5, 19);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    if (objects) this.physics.add.collider(this.player, objects);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setZoom(2);
    this.cameras.main.roundPixels = true;

    // interaction markers
    this.interactables = INTERACTABLES[this.worldId].map((spot) => {
      const sprite = this.add
        .image(spot.tx * TILE_SIZE + TILE_SIZE / 2, spot.ty * TILE_SIZE + TILE_SIZE / 2 - 6, "marker")
        .setDepth(9);
      this.tweens.add({
        targets: sprite,
        y: sprite.y - 5,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      return { ...spot, sprite };
    });

    this.prompt = this.add
      .text(0, 0, "", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#132018",
        backgroundColor: "#e8f7d4",
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5, 1)
      .setDepth(20)
      .setVisible(false);

    const kb = this.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.keys = kb.addKeys("W,A,S,D,E") as Record<string, Phaser.Input.Keyboard.Key>;

    this.decorate(map);

    this.cameras.main.fadeIn(350, 8, 16, 12);
  }

  private triggerInteraction(spot: Interactable) {
    const store = useGameStore.getState();
    switch (spot.kind) {
      case "dialogue":
        store.openModal({ kind: "dialogue", id: spot.target });
        break;
      case "interaction":
      case "core":
        store.openModal({ kind: "interaction", id: spot.target });
        break;
      case "minigame":
        store.openModal({ kind: "minigame", id: spot.target });
        break;
      case "capstone":
        store.openModal({ kind: "capstone", id: spot.target });
        break;
      case "travel":
        store.setWorld(spot.target as WorldId);
        break;
    }
  }

  override update(_time: number, delta: number) {
    if (!this.player) return;
    const store = useGameStore.getState();
    const locked = store.activeModal !== null;
    const body = this.player.body;

    if (locked) {
      body.setVelocity(0, 0);
      this.player.anims.play(`idle-${this.facing}`, true);
      this.prompt.setVisible(false);
      return;
    }

    const speed = 130;
    let vx = 0;
    let vy = 0;
    if (this.cursors.left.isDown || this.keys["A"]?.isDown) vx = -speed;
    else if (this.cursors.right.isDown || this.keys["D"]?.isDown) vx = speed;
    if (this.cursors.up.isDown || this.keys["W"]?.isDown) vy = -speed;
    else if (this.cursors.down.isDown || this.keys["S"]?.isDown) vy = speed;
    if (vx !== 0 && vy !== 0) {
      vx *= Math.SQRT1_2;
      vy *= Math.SQRT1_2;
    }
    body.setVelocity(vx, vy);

    if (vx < 0) this.facing = "left";
    else if (vx > 0) this.facing = "right";
    else if (vy < 0) this.facing = "up";
    else if (vy > 0) this.facing = "down";

    this.player.anims.play(vx === 0 && vy === 0 ? `idle-${this.facing}` : `walk-${this.facing}`, true);

    // nearest interactable
    let nearest: (Interactable & { sprite: Phaser.GameObjects.Image }) | null = null;
    let best = 56;
    for (const spot of this.interactables) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, spot.sprite.x, spot.sprite.y);
      if (d < best) {
        best = d;
        nearest = spot;
      }
    }
    this.nearest = nearest;
    if (nearest) {
      this.prompt
        .setText(`E · ${nearest.label}`)
        .setPosition(nearest.sprite.x, nearest.sprite.y - 12)
        .setVisible(true);
    } else {
      this.prompt.setVisible(false);
    }

    this.cooldown = Math.max(0, this.cooldown - delta);
    const pressed =
      Phaser.Input.Keyboard.JustDown(this.keys["E"]!) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space);
    if (pressed && this.nearest && this.cooldown === 0) {
      this.cooldown = 350;
      this.triggerInteraction(this.nearest);
    }
  }
}
