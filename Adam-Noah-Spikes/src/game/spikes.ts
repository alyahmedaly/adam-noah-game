// @ts-nocheck

import { getSpikeDelayMultiplier } from './intensity.ts';
import { getContentScale } from './scale.ts';

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
}

function spawnSpike(scene) {
  if (scene.spikes.getLength() >= 12) {
    scene.spikes.getFirst()?.destroy();
  }

  const diff = scene.difficulty || 'normal';
  const s = SPIKE_SHAPE[diff] ?? SPIKE_SHAPE.normal;

  const stageWidth = scene.scale.width;
  // Only exclude living players from the spawn zone
  const exclusion = 60;
  let x;
  let attempts = 0;
  do {
    x = Phaser.Math.Between(40, Math.max(41, stageWidth - 40));
    attempts++;
  } while (
    attempts < 20 && (
      (!scene.player1Dead && Math.abs(x - scene.player1.x) < exclusion) ||
      (!scene.player2Dead && Math.abs(x - scene.player2.x) < exclusion)
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
