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
  const delay = Phaser.Math.Between(1500, 2500);
  scene.time.delayedCall(delay, () => {
    spawnSpike(scene);
    scheduleSpike(scene);
  });
}

function spawnSpike(scene) {
  if (scene.spikes.getLength() >= 12) {
    scene.spikes.getFirst()?.destroy();
  }

  const exclusion = 60;
  let x;
  do {
    x = Phaser.Math.Between(40, 760);
  } while (
    Math.abs(x - scene.player1.x) < exclusion ||
    Math.abs(x - scene.player2.x) < exclusion
  );

  const spike = scene.spikes.create(x, scene.groundY - 22, 'spike');
  spike.setSize(20, 38);
  spike.setOffset(6, 4);
  spike.refreshBody();
  scene.time.delayedCall(20000, () => { if (spike?.active) spike.destroy(); });
}
