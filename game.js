import { createBackground, createGround } from './background.js';
import { createPlayers, updatePlayers } from './players.js';
import { createSpikeTexture, scheduleSpike } from './spikes.js';
import { createTitle, createScore, showPlayerDead, showGameOver } from './ui.js';
import { createLuckyBlockTexture, spawnLuckyBlock } from './luckyblock.js';

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
    this.player1Dead = false;
    this.player2Dead = false;

    this.spike1Overlap = this.physics.add.overlap(
      this.player1, this.spikes, () => this.killPlayer(1), null, this
    );
    this.spike2Overlap = this.physics.add.overlap(
      this.player2, this.spikes, () => this.killPlayer(2), null, this
    );

    createLuckyBlockTexture(this);
    spawnLuckyBlock(this);

    createTitle(this);
    createScore(this);
    scheduleSpike(this);
  }

  update() {
    if (this.gameOver) return;
    updatePlayers(
      this.player1Dead ? null : this.player1,
      this.player2Dead ? null : this.player2,
      this.wasd,
      this.cursors
    );
  }

  killPlayer(num) {
    if (num === 1 && !this.player1Dead) {
      this.player1Dead = true;
      this.score1 = this.score;
      this.spike1Overlap.destroy();
      freezePlayer(this.player1);
      showPlayerDead(this, 'Adam', '#00aaff', this.score1, this.player1.x);
    } else if (num === 2 && !this.player2Dead) {
      this.player2Dead = true;
      this.score2 = this.score;
      this.spike2Overlap.destroy();
      freezePlayer(this.player2);
      showPlayerDead(this, 'Noah', '#00cc44', this.score2, this.player2.x);
    }

    if (this.player1Dead && this.player2Dead) {
      this.gameOver = true;
      this.time.removeAllEvents();
      showGameOver(this);
    }
  }
}

function freezePlayer(player) {
  if (!player?.body) return;
  player.setTint(0xff0000);
  player.setVelocity(0, 0);
  player.body.setAllowGravity(false);
}
