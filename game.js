import { createBackground, createGround } from './background.js';
import { createPlayers, updatePlayers } from './players.js';
import { createSpikeTexture, scheduleSpike } from './spikes.js';
import { createTitle, createScore, showGameOver } from './ui.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {}

  create() {
    this.groundY = 360;
    const groundHeight = 40;

    createBackground(this);
    this.ground = createGround(this, this.groundY, groundHeight);

    const { player1, player2, wasd, cursors } = createPlayers(this, this.groundY, this.ground);
    this.player1 = player1;
    this.player2 = player2;
    this.wasd = wasd;
    this.cursors = cursors;

    createSpikeTexture(this);
    this.spikes = this.physics.add.staticGroup();
    this.gameOver = false;

    this.spike1Overlap = this.physics.add.overlap(this.player1, this.spikes, () => this.triggerGameOver('Noah wins!'), null, this);
    this.spike2Overlap = this.physics.add.overlap(this.player2, this.spikes, () => this.triggerGameOver('Adam wins!'), null, this);

    createTitle(this);
    createScore(this);
    scheduleSpike(this);
  }

  update() {
    if (this.gameOver) return;
    updatePlayers(this.player1, this.player2, this.wasd, this.cursors);
  }

  triggerGameOver(winnerText) {
    if (this.gameOver) return;
    this.gameOver = true;

    this.spike1Overlap.destroy();
    this.spike2Overlap.destroy();
    this.time.removeAllEvents();

    [this.player1, this.player2].forEach(p => {
      if (p?.body) {
        p.setTint(0xff0000);
        p.setVelocity(0, 0);
        p.body.setAllowGravity(false);
      }
    });

    showGameOver(this, winnerText);
  }
}
