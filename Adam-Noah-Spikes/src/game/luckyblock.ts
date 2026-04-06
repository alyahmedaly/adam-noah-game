// @ts-nocheck

import { PLAYER_SOUND_EVENTS } from './audio.ts';
import { getLuckyDelayMultiplier } from './intensity.ts';
import { givePistol } from './pistol.ts';
import { getContentScale, getTextScale } from './scale.ts';

const BLOCK_SIZE = 32;
const FLOAT_Y_OFFSET = 120;
const SPIKE_CLEAR_CHANCE = 0.6;
const GROW_EFFECT_CHANCE = 0.2;
const GROW_EFFECT_SCALE = 1.35;
const GROW_EFFECT_DURATION_MS = 6000;
const STAR_EFFECT_DURATION_MS = 5500;

export const LUCKY_BLOCK_EFFECTS = Object.freeze({
  PISTOL: 'pistol',
  SPIKE_CLEAR: 'spikeClear',
  GROW: 'grow',
  STAR: 'star',
});

export function pickLuckyBlockEffect({ difficulty, bossActive, randomValue = Math.random() }) {
  if (difficulty === 'ninja' && bossActive) {
    return LUCKY_BLOCK_EFFECTS.PISTOL;
  }

  if (randomValue < SPIKE_CLEAR_CHANCE) return LUCKY_BLOCK_EFFECTS.SPIKE_CLEAR;
  if (randomValue < SPIKE_CLEAR_CHANCE + GROW_EFFECT_CHANCE) return LUCKY_BLOCK_EFFECTS.GROW;
  return LUCKY_BLOCK_EFFECTS.STAR;
}

export function handleLuckyBlockSpikeContact(scene, playerNum, spike) {
  const player = playerNum === 1 ? scene.player1 : scene.player2;
  if (player?.starModeActive) {
    spike?.destroy?.();
    scene.cameras?.main?.shake?.(70, 0.0018);
    return;
  }

  scene.loseLife(playerNum);
}

export function createLuckyBlockTexture(scene) {
  const gfx = scene.make.graphics({ x: 0, y: 0, add: false });

  // Gold background
  gfx.fillStyle(0xf5a800, 1);
  gfx.fillRect(0, 0, BLOCK_SIZE, BLOCK_SIZE);

  // Dark border
  gfx.lineStyle(2, 0x8b6000, 1);
  gfx.strokeRect(1, 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

  // Inner shine
  gfx.fillStyle(0xffe066, 1);
  gfx.fillRect(3, 3, BLOCK_SIZE - 6, 5);
  gfx.fillRect(3, 3, 5, BLOCK_SIZE - 6);

  // "?" mark
  gfx.fillStyle(0xffffff, 1);
  gfx.fillRect(11, 6, 10, 3);
  gfx.fillRect(19, 9, 3, 5);
  gfx.fillRect(13, 14, 6, 3);
  gfx.fillRect(13, 19, 3, 3);
  gfx.fillRect(13, 24, 3, 3);

  gfx.generateTexture('luckyblock', BLOCK_SIZE, BLOCK_SIZE);
  gfx.destroy();
}

export function spawnLuckyBlock(scene) {
  const contentScale = getContentScale(scene);
  const x = Phaser.Math.Between(80, Math.max(81, scene.scale.width - 80));
  const y = scene.groundY - FLOAT_Y_OFFSET;

  const block = scene.physics.add.staticImage(x, y, 'luckyblock');
  block.setScale(contentScale);
  block.setSize(BLOCK_SIZE, BLOCK_SIZE);
  block.refreshBody();
  block.used = false;
  scene.tweens.add({
    targets: block,
    scaleX: 1.08,
    scaleY: 1.08,
    duration: 650,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

  // Any contact from any side triggers it
  scene.physics.add.overlap(scene.player1, block, () => hitBlock(scene, block, 1));
  scene.physics.add.overlap(scene.player2, block, () => hitBlock(scene, block, 2));
}

export function scheduleLuckyBlockRespawns(scene) {
  // Always ensure a lucky block appears every 20-30s regardless of collection
  const delayMultiplier = getLuckyDelayMultiplier(scene);
  scene.time.delayedCall(Phaser.Math.Between(
    Math.round(20000 * delayMultiplier),
    Math.round(30000 * delayMultiplier)
  ), () => {
    if (!scene.gameOver) {
      spawnLuckyBlock(scene);
      scheduleLuckyBlockRespawns(scene);
    }
  });
}

function hitBlock(scene, block, playerNum) {
  if (block.used) return;
  block.used = true;
  block.destroy();
  activateSuperpower(scene, playerNum);
}

function activateSuperpower(scene, playerNum) {
  const contentScale = getContentScale(scene);
  const textScale = getTextScale(scene);
  const player = playerNum === 1 ? scene.player1 : scene.player2;
  const color  = playerNum === 1 ? (scene.color1 ?? 0x00aaff) : (scene.color2 ?? 0x00cc44);
  const effect = pickLuckyBlockEffect({
    difficulty: scene.difficulty,
    bossActive: Boolean(scene.boss?.active),
  });

  scene.audio.playForPlayer(playerNum, PLAYER_SOUND_EVENTS.LUCKY_BLOCK);

  if (effect === LUCKY_BLOCK_EFFECTS.PISTOL) {
    givePistol(scene, playerNum);
    player.setTint(0xffd700);
    const txt = scene.add.text(player.x, player.y - 40, '🔫 PISTOL!', {
      fontSize: `${Math.round(14 * textScale)}px`, color: '#ffee00', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(4);
    scene.tweens.add({
      targets: txt, y: txt.y - 30, alpha: 0, duration: 1200,
      onComplete: () => txt.destroy()
    });
    const delayMultiplier = getLuckyDelayMultiplier(scene);
    scene.time.delayedCall(Phaser.Math.Between(
      Math.round(8000 * delayMultiplier),
      Math.round(15000 * delayMultiplier)
    ), () => {
      if (!scene.gameOver) spawnLuckyBlock(scene);
    });
    return;
  }

  if (effect === LUCKY_BLOCK_EFFECTS.GROW) {
    applyGrowEffect(scene, player, color, textScale);
  } else if (effect === LUCKY_BLOCK_EFFECTS.STAR) {
    applyStarEffect(scene, player, color, textScale);
  } else {
    // Clear all current spikes
    scene.spikes.clear(true, true);

    // Flash player gold
    player.setTint(0xffd700);

    // Floating text
    const txt = scene.add.text(player.x, player.y - 40, '💥 SPIKE CLEAR!', {
      fontSize: `${Math.round(14 * textScale)}px`, color: '#ffd700', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(4);

    scene.tweens.add({
      targets: txt,
      y: txt.y - 30,
      alpha: 0,
      duration: 1200,
      onComplete: () => txt.destroy()
    });

    // 3s invincibility
    const spikeOverlap = playerNum === 1 ? scene.spike1Overlap : scene.spike2Overlap;
    if (spikeOverlap) spikeOverlap.active = false;

    scene.time.delayedCall(3000, () => {
      if (!scene.gameOver) {
        if (spikeOverlap) spikeOverlap.active = true;
        player.setTint(color);
      }
    });
  }

  // Respawn block after a delay
  const delayMultiplier = getLuckyDelayMultiplier(scene);
  scene.time.delayedCall(Phaser.Math.Between(
    Math.round(8000 * delayMultiplier),
    Math.round(15000 * delayMultiplier)
  ), () => {
    if (!scene.gameOver) spawnLuckyBlock(scene);
  });
}

function applyGrowEffect(scene, player, baseColor, textScale) {
  clearLuckyPlayerEffect(scene, player, baseColor);
  player.growthScale = GROW_EFFECT_SCALE;
  player.setTint(0xff88ff);

  const txt = scene.add.text(player.x, player.y - 40, '🐘 TOO BIG!', {
    fontSize: `${Math.round(14 * textScale)}px`,
    color: '#ff88ff',
    fontFamily: 'monospace',
    fontStyle: 'bold',
  }).setOrigin(0.5).setDepth(4);

  scene.tweens.add({
    targets: txt,
    y: txt.y - 30,
    alpha: 0,
    duration: 1200,
    onComplete: () => txt.destroy()
  });

  scene.time.delayedCall(GROW_EFFECT_DURATION_MS, () => {
    if (!player?.active) return;
    clearLuckyPlayerEffect(scene, player, baseColor);
  });
}

function applyStarEffect(scene, player, baseColor, textScale) {
  clearLuckyPlayerEffect(scene, player, baseColor);
  player.starModeActive = true;
  player.setTint(0xfff27a);
  player.starTween = scene.tweens.add({
    targets: player,
    alpha: 0.55,
    duration: 140,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });

  const txt = scene.add.text(player.x, player.y - 40, '⭐ STAR MODE!', {
    fontSize: `${Math.round(14 * textScale)}px`,
    color: '#fff27a',
    fontFamily: 'monospace',
    fontStyle: 'bold',
  }).setOrigin(0.5).setDepth(4);

  scene.tweens.add({
    targets: txt,
    y: txt.y - 30,
    alpha: 0,
    duration: 1200,
    onComplete: () => txt.destroy()
  });

  player.effectTimer = scene.time.delayedCall(STAR_EFFECT_DURATION_MS, () => {
    if (!player?.active) return;
    clearLuckyPlayerEffect(scene, player, baseColor);
  });
}

function clearLuckyPlayerEffect(scene, player, baseColor) {
  player.effectTimer?.remove?.();
  player.effectTimer = null;
  player.starTween?.remove?.();
  player.starTween = null;
  player.growthScale = 1;
  player.starModeActive = false;
  player.alpha = 1;
  if (!scene.gameOver) {
    player.setTint(baseColor);
  }
}
