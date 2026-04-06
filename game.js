import { createBackground, createGround } from './background.js';
import { createPlayers, updatePlayers } from './players.js';
import { createSpikeTexture, scheduleSpike } from './spikes.js';
import { createTitle, createScore, createLivesHUD, updateLivesHUD, showPlayerDead, showGameOver } from './ui.js';
import { createLuckyBlockTexture, spawnLuckyBlock, scheduleLuckyBlockRespawns } from './luckyblock.js';
import { createHeartTexture, scheduleHeartSpawns } from './heartpickup.js';

const DIFFICULTY = {
  noob:   { maxLives: 5 },
  normal: { maxLives: 3 },
  ninja:  { maxLives: 2 },
};

const RESPAWN_INVINCIBILITY_MS = 2000;

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {}

  create() {
    const diff = this.scene.settings.data?.difficulty || 'normal';
    this.difficulty = diff;
    this.maxLives = DIFFICULTY[diff]?.maxLives ?? 3;

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
    this.lives1 = this.maxLives;
    this.lives2 = this.maxLives;

    this.spike1Overlap = this.physics.add.overlap(
      this.player1, this.spikes, () => this.loseLife(1), null, this
    );
    this.spike2Overlap = this.physics.add.overlap(
      this.player2, this.spikes, () => this.loseLife(2), null, this
    );

    createLuckyBlockTexture(this);
    spawnLuckyBlock(this);
    scheduleLuckyBlockRespawns(this);

    createHeartTexture(this);
    scheduleHeartSpawns(this);

    createTitle(this);
    createScore(this);
    createLivesHUD(this);
    scheduleSpike(this);

    // Expose lives HUD updater for pickups
    this.updateLivesHUD = () => updateLivesHUD(this, this.lives1, this.lives2);
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

  loseLife(num) {
    const isDead = num === 1 ? this.player1Dead : this.player2Dead;
    if (isDead) return;

    // Deduct a life
    if (num === 1) {
      this.lives1--;
      updateLivesHUD(this, this.lives1, this.lives2);
      if (this.lives1 <= 0) return this.eliminatePlayer(1);
      respawnInvincible(this, this.player1, this.spike1Overlap, 0x00aaff);
    } else {
      this.lives2--;
      updateLivesHUD(this, this.lives1, this.lives2);
      if (this.lives2 <= 0) return this.eliminatePlayer(2);
      respawnInvincible(this, this.player2, this.spike2Overlap, 0x00cc44);
    }
  }

  eliminatePlayer(num) {
    if (num === 1) {
      this.player1Dead = true;
      this.score1 = this.score;
      this.spike1Overlap.destroy();
      freezePlayer(this.player1);
      showPlayerDead(this, 'Adam', '#00aaff', this.score1, this.player1.x);
    } else {
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

function respawnInvincible(scene, player, overlap, color) {
  // Flash red briefly, then gold during invincibility
  player.setTint(0xff0000);
  if (overlap) overlap.active = false;

  scene.time.delayedCall(300, () => {
    player.setTint(0xffd700);
  });

  scene.time.delayedCall(RESPAWN_INVINCIBILITY_MS, () => {
    if (!scene.gameOver) {
      player.setTint(color);
      if (overlap) overlap.active = true;
    }
  });
}

function freezePlayer(player) {
  if (!player?.body) return;
  player.setTint(0xff0000);
  player.setVelocity(0, 0);
  player.body.setAllowGravity(false);
}
