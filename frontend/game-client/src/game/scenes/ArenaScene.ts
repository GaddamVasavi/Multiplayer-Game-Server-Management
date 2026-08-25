import Phaser from 'phaser';

export interface PlayerData {
  userId: string;
  username: string;
  x: number;
  y: number;
  score: number;
  color: string;
}

export interface CollectibleData {
  id: string;
  x: number;
  y: number;
  points: number;
}

export class ArenaScene extends Phaser.Scene {
  private players: Map<string, { sprite: Phaser.GameObjects.Arc; label: Phaser.GameObjects.Text }> = new Map();
  private collectibles: Map<string, Phaser.GameObjects.Star> = new Map();
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private onMoveCallback?: (dx: number, dy: number) => void;

  constructor() {
    super({ key: 'ArenaScene' });
  }

  init(data: { onMove: (dx: number, dy: number) => void }) {
    this.onMoveCallback = data.onMove;
  }

  create() {
    // Grid Background
    this.add.grid(400, 300, 800, 600, 40, 40, 0x0f172a, 1, 0x1e293b, 1);

    // Set world bounds
    this.physics.world.setBounds(0, 0, 800, 600);

    // Keyboard Input setup
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }
  }

  update(_time: number, delta: number) {
    let dx = 0;
    let dy = 0;
    const speed = 250;

    if (this.cursors?.left.isDown || this.wasd?.A.isDown) dx -= speed * (delta / 1000);
    if (this.cursors?.right.isDown || this.wasd?.D.isDown) dx += speed * (delta / 1000);
    if (this.cursors?.up.isDown || this.wasd?.W.isDown) dy -= speed * (delta / 1000);
    if (this.cursors?.down.isDown || this.wasd?.S.isDown) dy += speed * (delta / 1000);

    if ((dx !== 0 || dy !== 0) && this.onMoveCallback) {
      this.onMoveCallback(dx, dy);
    }
  }

  updatePlayersState(serverPlayers: PlayerData[]) {
    const activeIds = new Set<string>();

    for (const p of serverPlayers) {
      activeIds.add(p.userId);
      let pObj = this.players.get(p.userId);

      if (!pObj) {
        const hexColor = parseInt(p.color.replace('#', '0x'), 16) || 0x06b6d4;
        const circle = this.add.circle(p.x, p.y, 16, hexColor);
        const label = this.add.text(p.x, p.y - 24, `${p.username} (${p.score})`, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '12px',
          color: '#ffffff',
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          padding: { x: 4, y: 2 },
        }).setOrigin(0.5);

        pObj = { sprite: circle, label };
        this.players.set(p.userId, pObj);
      } else {
        // Smooth position interpolation
        pObj.sprite.x = Phaser.Math.Linear(pObj.sprite.x, p.x, 0.4);
        pObj.sprite.y = Phaser.Math.Linear(pObj.sprite.y, p.y, 0.4);
        pObj.label.x = pObj.sprite.x;
        pObj.label.y = pObj.sprite.y - 24;
        pObj.label.setText(`${p.username} (${p.score})`);
      }
    }

    // Clean removed players
    for (const [id, pObj] of this.players.entries()) {
      if (!activeIds.has(id)) {
        pObj.sprite.destroy();
        pObj.label.destroy();
        this.players.delete(id);
      }
    }
  }

  updateCollectiblesState(serverCollectibles: CollectibleData[]) {
    const activeIds = new Set<string>();

    for (const c of serverCollectibles) {
      activeIds.add(c.id);
      if (!this.collectibles.has(c.id)) {
        const star = this.add.star(c.x, c.y, 5, 6, 12, c.points > 15 ? 0xf59e0b : 0x06b6d4);
        this.collectibles.set(c.id, star);
      }
    }

    for (const [id, star] of this.collectibles.entries()) {
      if (!activeIds.has(id)) {
        star.destroy();
        this.collectibles.delete(id);
      }
    }
  }
}
