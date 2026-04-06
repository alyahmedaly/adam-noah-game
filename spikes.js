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
  // Interval shrinks as score grows: starts 1500-2500ms, floors at 400-800ms
  const base = Math.max(400, 1500 - scene.score * 20);
  const jitter = Math.max(200, 1000 - scene.score * 10);
  const delay = Phaser.Math.Between(base, base + jitter);

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
