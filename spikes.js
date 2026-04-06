const SPIKE_CONFIG = {
  noob:   { base: 2000, baseDecrement: 10, jitter: 1200, jitterDecrement: 5,  minBase: 600, minJitter: 300 },
  normal: { base: 1500, baseDecrement: 20, jitter: 1000, jitterDecrement: 10, minBase: 400, minJitter: 200 },
  ninja:  { base: 900,  baseDecrement: 35, jitter: 600,  jitterDecrement: 20, minBase: 200, minJitter: 100 },
};

export function createSpikeTexture(scene) {
  const gfx = scene.make.graphics({ x: 0, y: 0, add: false });
  gfx.fillStyle(0x880000, 1);
  gfx.fillTriangle(4, 40, 16, 0, 28, 40);
  gfx.fillStyle(0xdd2222, 1);
  gfx.fillTriangle(6, 40, 16, 2, 26, 40);
  gfx.fillStyle(0xff6666, 1);
  gfx.fillTriangle(6, 40, 16, 2, 14, 40);
  gfx.fillStyle(0x555555, 1);
  gfx.fillRect(4, 38, 24, 4);
  gfx.generateTexture('spike', 32, 44);
  gfx.destroy();
}

export function scheduleSpike(scene) {
  const cfg = SPIKE_CONFIG[scene.difficulty] ?? SPIKE_CONFIG.normal;
  const base   = Math.max(cfg.minBase,   cfg.base   - scene.score * cfg.baseDecrement);
  const jitter = Math.max(cfg.minJitter, cfg.jitter  - scene.score * cfg.jitterDecrement);
  const delay  = Phaser.Math.Between(base, base + jitter);

  scene.time.delayedCall(delay, () => {
    if (!scene.gameOver) spawnSpike(scene);
    scheduleSpike(scene);
  });
}

function spawnSpike(scene) {
  if (scene.spikes.getLength() >= 12) {
    scene.spikes.getFirst()?.destroy();
  }

  // Only exclude living players from the spawn zone
  const exclusion = 60;
  let x;
  let attempts = 0;
  do {
    x = Phaser.Math.Between(40, 760);
    attempts++;
  } while (
    attempts < 20 && (
      (!scene.player1Dead && Math.abs(x - scene.player1.x) < exclusion) ||
      (!scene.player2Dead && Math.abs(x - scene.player2.x) < exclusion)
    )
  );

  const spike = scene.spikes.create(x, scene.groundY - 22, 'spike');
  spike.setSize(20, 38);
  spike.setOffset(6, 4);
  spike.refreshBody();
  scene.time.delayedCall(20000, () => { if (spike?.active) spike.destroy(); });
}
