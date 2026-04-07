// @ts-nocheck

import { getSpikeDelayMultiplier } from './intensity.ts';
import { getLivingPlayers } from './participants.ts';
import { getContentScale } from './scale.ts';

const BOMB_SPAWN_MIN_MS = 8500;
const BOMB_SPAWN_MAX_MS = 11500;
const BOMB_SPEED_X = 180;
const BOMB_FLOAT_AMPLITUDE = 18;
const BOMB_FLOAT_SPEED = 0.0035;
const BOMB_HIT_UPWARD_THRESHOLD = -90;
const MAX_BOMBS = 2;

const SPIKE_CONFIG = {
  noob:   { base: 2000, baseDecrement: 10, jitter: 1200, jitterDecrement: 5,  minBase: 600, minJitter: 300 },
  normal: { base: 1500, baseDecrement: 20, jitter: 1000, jitterDecrement: 10, minBase: 400, minJitter: 200 },
  ninja:  { base: 900,  baseDecrement: 35, jitter: 600,  jitterDecrement: 20, minBase: 200, minJitter: 100 },
};

// Per-mode spike geometry: [outerColor, innerColor, highlightColor, baseColor, width, height]
const SPIKE_SHAPE = {
  noob:   { w: 32, h: 30, outer: 0x888888, inner: 0xaaaaaa, shine: 0xdddddd, base: 0x666666 },
  normal: { w: 32, h: 44, outer: 0x880000, inner: 0xdd2222, shine: 0xff6666, base: 0x555555 },
  ninja:  { w: 28, h: 56, outer: 0x220033, inner: 0x660099, shine: 0xcc44ff, base: 0x111111 },
};

const BOMB_CONFIG = Object.freeze({
  size: 26,
  bodyRadius: 11,
  fuseColor: 0xffe08a,
  shellColor: 0x2a2a46,
  glowColor: 0xff8844,
});

export function createSpikeTexture(scene) {
  const diff = scene.difficulty || 'normal';
  const s = SPIKE_SHAPE[diff] ?? SPIKE_SHAPE.normal;
  const { w, h, outer, inner, shine, base } = s;

  const gfx = scene.make.graphics({ x: 0, y: 0, add: false });

  // Outer dark triangle
  gfx.fillStyle(outer, 1);
  gfx.fillTriangle(2, h - 4, w / 2, 0, w - 2, h - 4);

  // Inner main triangle
  gfx.fillStyle(inner, 1);
  gfx.fillTriangle(4, h - 4, w / 2, 2, w - 4, h - 4);

  // Highlight stripe (left face)
  gfx.fillStyle(shine, 1);
  gfx.fillTriangle(4, h - 4, w / 2, 2, Math.floor(w / 2) - 2, h - 4);

  // Base bar
  gfx.fillStyle(base, 1);
  gfx.fillRect(2, h - 6, w - 4, 6);

  // Ninja gets a glow outline effect
  if (diff === 'ninja') {
    gfx.lineStyle(1, 0xee88ff, 0.7);
    gfx.strokeTriangle(2, h - 4, w / 2, 0, w - 2, h - 4);
  }

  gfx.generateTexture('spike', w, h);
  gfx.destroy();

  createBombTexture(scene);
}

export function bombsEnabledForDifficulty(difficulty) {
  return difficulty === 'normal' || difficulty === 'ninja';
}

export function handleBombContact(scene, playerNum, bomb) {
  const player = playerNum === 1 ? scene.player1 : scene.player2;
  const upwardVelocity = player?.body?.velocity?.y ?? 0;

  bomb?.destroy?.();

  if (player?.starModeActive || upwardVelocity <= BOMB_HIT_UPWARD_THRESHOLD) {
    scene.cameras?.main?.shake?.(80, 0.0018);
    return;
  }

  scene.loseLife(playerNum);
}

export function scheduleSpike(scene) {
  const cfg = SPIKE_CONFIG[scene.difficulty] ?? SPIKE_CONFIG.normal;
  const multiplier = getSpikeDelayMultiplier(scene);
  const base = Math.max(
    cfg.minBase,
    Math.round((cfg.base - scene.score * cfg.baseDecrement) * multiplier)
  );
  const jitter = Math.max(
    cfg.minJitter,
    Math.round((cfg.jitter - scene.score * cfg.jitterDecrement) * multiplier)
  );
  const delay  = Phaser.Math.Between(base, base + jitter);

  scene.time.delayedCall(delay, () => {
    if (!scene.gameOver) spawnSpike(scene);
    scheduleSpike(scene);
  });
}

export function scheduleBomb(scene) {
  if (!bombsEnabledForDifficulty(scene.difficulty)) return;

  const delay = Phaser.Math.Between(BOMB_SPAWN_MIN_MS, BOMB_SPAWN_MAX_MS);
  scene.time.delayedCall(delay, () => {
    if (!scene.gameOver) {
      spawnBomb(scene);
      scheduleBomb(scene);
    }
  });
}

export function updateSpikes(scene) {
  const settings = scene.intensity?.settings;
  if (!settings || !scene.spikes) return;

  const now = scene.time.now;
  scene.spikes.getChildren().forEach((spike, index) => {
    if (!spike?.active) return;

    const baseScale = spike.baseScale ?? 1;
    const wave = Math.sin(now / 190 + index * 0.65);
    spike.setScale(baseScale, baseScale * (1 + wave * settings.spikePulse));
    spike.setAlpha(Phaser.Math.Clamp(0.82 + settings.spikeGlow + wave * 0.08, 0.65, 1));
    spike.setAngle(wave * 2.5);
  });

  scene.bombs?.getChildren().forEach((bomb, index) => {
    if (!bomb?.active) return;

    const baseScale = bomb.baseScale ?? 1;
    const time = scene.time.now * BOMB_FLOAT_SPEED + index * 0.85;
    bomb.setScale(baseScale * (1 + Math.sin(time * 2.4) * 0.06));
    bomb.setY((bomb.baseY ?? bomb.y) + Math.sin(time) * BOMB_FLOAT_AMPLITUDE);
    bomb.setAngle(Math.sin(time * 1.8) * 8);
    bomb.setAlpha(0.88 + Math.sin(time * 3.2) * 0.08);

    if (bomb.x < -40 || bomb.x > scene.scale.width + 40) {
      bomb.destroy();
    }
  });
}

function spawnSpike(scene) {
  if (scene.spikes.getLength() >= 12) {
    scene.spikes.getFirst()?.destroy();
  }

  const diff = scene.difficulty || 'normal';
  const s = SPIKE_SHAPE[diff] ?? SPIKE_SHAPE.normal;

  const stageWidth = scene.scale.width;
  const livingPlayers = getLivingPlayers(scene);
  // Only exclude living players from the spawn zone
  const exclusion = 60;
  let x;
  let attempts = 0;
  do {
    x = Phaser.Math.Between(40, Math.max(41, stageWidth - 40));
    attempts++;
  } while (
    attempts < 20 && (
      livingPlayers.some(({ player }) => Math.abs(x - player.x) < exclusion)
    )
  );

  const halfH = Math.floor(s.h / 2);
  const contentScale = getContentScale(scene);
  const spike = scene.spikes.create(x, scene.groundY - halfH + 3, 'spike');
  spike.baseScale = contentScale;
  spike.setScale(contentScale);
  spike.setSize(s.w - 12, s.h - 8);
  spike.setOffset(6, 4);
  spike.refreshBody();
  scene.time.delayedCall(20000, () => { if (spike?.active) spike.destroy(); });
}

function createBombTexture(scene) {
  const { size, bodyRadius, fuseColor, shellColor, glowColor } = BOMB_CONFIG;
  const gfx = scene.make.graphics({ x: 0, y: 0, add: false });

  gfx.fillStyle(glowColor, 0.24);
  gfx.fillCircle(size / 2, size / 2, bodyRadius + 4);

  gfx.fillStyle(shellColor, 1);
  gfx.fillCircle(size / 2, size / 2 + 1, bodyRadius);

  gfx.fillStyle(0x555577, 1);
  gfx.fillCircle(size / 2 - 3, size / 2 - 2, 4);

  gfx.lineStyle(3, fuseColor, 1);
  gfx.beginPath();
  gfx.moveTo(size / 2 + 3, 5);
  gfx.lineTo(size / 2 + 7, 1);
  gfx.strokePath();

  gfx.fillStyle(0xffee88, 1);
  gfx.fillCircle(size / 2 + 8, 1, 2);

  gfx.generateTexture('bomb', size, size);
  gfx.destroy();
}

function spawnBomb(scene) {
  if (!scene.bombs) return;
  if (scene.bombs.getLength() >= MAX_BOMBS) {
    scene.bombs.getFirstAlive()?.destroy();
  }

  const contentScale = getContentScale(scene);
  const direction = Phaser.Math.Between(0, 1) === 0 ? 1 : -1;
  const startX = direction === 1 ? -20 : scene.scale.width + 20;
  const laneY = scene.groundY - Math.max(140, scene.scale.height * 0.34);
  const bomb = scene.bombs.create(startX, laneY, 'bomb');

  bomb.baseScale = contentScale;
  bomb.baseY = laneY;
  bomb.setScale(contentScale);
  bomb.setVelocityX(direction * BOMB_SPEED_X);
  bomb.setGravityY(0);
  bomb.setDepth(3);
  bomb.body.setAllowGravity(false);
  bomb.body.setCircle(BOMB_CONFIG.bodyRadius);
  bomb.body.setOffset(2, 2);

  scene.time.delayedCall(9000, () => {
    if (bomb?.active) bomb.destroy();
  });
}
