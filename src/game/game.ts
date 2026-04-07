// @ts-nocheck

import { createBackground, createGround, updateBackground } from './background.ts';
import { createPlayers, handlePlayerBump, updatePlayers } from './players.ts';
import { createTouchControls } from './touch-controls.ts';
import { isMobile } from './scale.ts';
import { createSpikeTexture, handleBombContact, scheduleBomb, scheduleSpike, updateSpikes } from './spikes.ts';
import { createTitle, createScore, createLivesHUD, updateLivesHUD, showPlayerDead, showGameOver } from './ui.ts';
import { createLuckyBlockTexture, handleLuckyBlockSpikeContact, spawnLuckyBlock, scheduleLuckyBlockRespawns } from './luckyblock.ts';
import { createHeartTexture, scheduleHeartSpawns } from './heartpickup.ts';
import { PLAYER_SOUND_EVENTS, attachSceneAudio, preloadSceneAudio } from './audio.ts';
import { createIntensityController, updateIntensityController } from './intensity.ts';
import { spawnBoss, updateBoss } from './boss.ts';
import { updatePistol } from './pistol.ts';

const DIFFICULTY = {
  noob:   { maxLives: 5, color1: 0xff8800, color2: 0xffcc00, nameColor1: '#ff8800', nameColor2: '#ffcc00' },
  normal: { maxLives: 3, color1: 0x00aaff, color2: 0x00cc44, nameColor1: '#00aaff', nameColor2: '#00cc44' },
  ninja:  { maxLives: 2, color1: 0x880088, color2: 0x440044, nameColor1: '#cc44cc', nameColor2: '#aa22aa' },
};

const RESPAWN_INVINCIBILITY_MS = 2000;

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    preloadSceneAudio(this);
  }

  create() {
    const diff = this.scene.settings.data?.difficulty || 'normal';
    const mobilePlayer = this.scene.settings.data?.mobilePlayer || null; // 'adam' | 'noah' | null
    const stageHeight = this.scale.height;
    this.difficulty = diff;
    this.mobilePlayer = mobilePlayer;
    const diffCfg = DIFFICULTY[diff] ?? DIFFICULTY.normal;
    this.maxLives  = diffCfg.maxLives;
    this.color1    = diffCfg.color1;
    this.color2    = diffCfg.color2;
    this.nameColor1 = diffCfg.nameColor1;
    this.nameColor2 = diffCfg.nameColor2;

    const groundHeight = Math.max(44, Math.round(stageHeight * 0.1));
    this.groundY = stageHeight - groundHeight;
    createIntensityController(this);

    createBackground(this);
    this.ground = createGround(this, this.groundY, groundHeight);

    const spawnAdam = !mobilePlayer || mobilePlayer === 'adam';
    const spawnNoah = !mobilePlayer || mobilePlayer === 'noah';

    const { player1, player2, wasd, cursors } = createPlayers(this, this.groundY, this.ground, spawnAdam, spawnNoah);
    this.player1 = player1;
    this.player2 = player2;
    this.wasd = wasd;
    this.cursors = cursors;

    // Touch controls for mobile single-player
    this.touchInput = null;
    if (mobilePlayer) {
      this.touchInput = createTouchControls(this);
    }

    attachSceneAudio(this);

    createSpikeTexture(this);
    this.spikes = this.physics.add.staticGroup();
    this.bombs = this.physics.add.group();
    this.gameOver = false;
    this.player1Dead = false;
    this.player2Dead = false;
    this.lives1 = this.maxLives;
    this.lives2 = this.maxLives;

    this.spike1Overlap = this.player1
      ? this.physics.add.overlap(this.player1, this.spikes, (_player, spike) => handleLuckyBlockSpikeContact(this, 1, spike), null, this)
      : null;
    this.spike2Overlap = this.player2
      ? this.physics.add.overlap(this.player2, this.spikes, (_player, spike) => handleLuckyBlockSpikeContact(this, 2, spike), null, this)
      : null;
    this.bomb1Overlap = this.player1
      ? this.physics.add.overlap(this.player1, this.bombs, (_player, bomb) => handleBombContact(this, 1, bomb), null, this)
      : null;
    this.bomb2Overlap = this.player2
      ? this.physics.add.overlap(this.player2, this.bombs, (_player, bomb) => handleBombContact(this, 2, bomb), null, this)
      : null;
    this.playerBumpCollider = (this.player1 && this.player2)
      ? this.physics.add.collider(this.player1, this.player2, () => handlePlayerBump(this), null, this)
      : null;

    createLuckyBlockTexture(this);
    spawnLuckyBlock(this);
    scheduleLuckyBlockRespawns(this);

    createHeartTexture(this);
    scheduleHeartSpawns(this);

    createTitle(this);
    createScore(this);
    createLivesHUD(this);
    scheduleSpike(this);
    scheduleBomb(this);

    // Expose lives HUD updater for pickups
    this.updateLivesHUD = () => updateLivesHUD(this, this.lives1, this.lives2);

    // Boss state (Ninja mode)
    this.boss = null;
    this.bossSpawned = false;
  }

  update() {
    if (this.gameOver) return;
    updateIntensityController(this);
    updateBackground(this);
    updatePlayers(
      this,
      this.player1Dead ? null : this.player1,
      this.player2Dead ? null : this.player2,
      this.wasd,
      this.cursors,
      this.touchInput,
      this.mobilePlayer
    );
    updateSpikes(this);

    // Spawn boss in Ninja mode when score hits 50
    if (this.difficulty === 'ninja' && !this.bossSpawned && this.score >= 50) {
      this.bossSpawned = true;
      spawnBoss(this);
    }

    updateBoss(this);
    updatePistol(this, this.wasd, this.cursors, this.touchInput, this.mobilePlayer);
  }

  loseLife(num) {
    const isDead = num === 1 ? this.player1Dead : this.player2Dead;
    if (isDead) return;

    // Deduct a life
    if (num === 1) {
      this.lives1--;
      updateLivesHUD(this, this.lives1, this.lives2);
      if (this.lives1 <= 0) return this.eliminatePlayer(1);
      this.audio.playForPlayer(1, PLAYER_SOUND_EVENTS.HURT);
      this.cameras.main.shake(120, this.intensity?.settings?.damageShake ?? 0.003);
      respawnInvincible(this, this.player1, this.spike1Overlap, this.color1);
    } else {
      this.lives2--;
      updateLivesHUD(this, this.lives1, this.lives2);
      if (this.lives2 <= 0) return this.eliminatePlayer(2);
      this.audio.playForPlayer(2, PLAYER_SOUND_EVENTS.HURT);
      this.cameras.main.shake(120, this.intensity?.settings?.damageShake ?? 0.003);
      respawnInvincible(this, this.player2, this.spike2Overlap, this.color2);
    }
  }

  eliminatePlayer(num) {
    if (num === 1) {
      this.player1Dead = true;
      this.score1 = this.score;
      this.spike1Overlap?.destroy();
      freezePlayer(this.player1);
      this.audio.playForPlayer(1, PLAYER_SOUND_EVENTS.DIES);
      if (this.player1) showPlayerDead(this, 'Adam', this.nameColor1, this.score1, this.player1.x);
    } else {
      this.player2Dead = true;
      this.score2 = this.score;
      this.spike2Overlap?.destroy();
      freezePlayer(this.player2);
      this.audio.playForPlayer(2, PLAYER_SOUND_EVENTS.DIES);
      if (this.player2) showPlayerDead(this, 'Noah', this.nameColor2, this.score2, this.player2.x);
    }

    const p1Counts = !this.mobilePlayer || this.mobilePlayer === 'adam';
    const p2Counts = !this.mobilePlayer || this.mobilePlayer === 'noah';
    const bothDone = (!p1Counts || this.player1Dead) && (!p2Counts || this.player2Dead);
    if (bothDone) {
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
