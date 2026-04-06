export function createBackground(scene) {
  const gfx = scene.add.graphics();
  for (let i = 0; i < 80; i++) {
    gfx.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.3, 1));
    gfx.fillCircle(
      Phaser.Math.Between(0, 797),
      Phaser.Math.Between(0, 355),
      Phaser.Math.FloatBetween(1, 2.5)
    );
  }
}

export function createGround(scene, groundY, groundHeight) {
  const gfx = scene.add.graphics();
  gfx.fillStyle(0x4a4a6a, 1);
  gfx.fillRect(0, groundY, 800, groundHeight);

  const group = scene.physics.add.staticGroup();
  const body = group.create(400, groundY + groundHeight / 2, null);
  body.setSize(800, groundHeight);
  body.refreshBody();
  return group;
}
