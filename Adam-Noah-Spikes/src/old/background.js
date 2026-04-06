export function createBackground(scene) {
  const diff = scene.difficulty || 'normal';
  if (diff === 'noob') {
    _drawDaytime(scene);
  } else if (diff === 'ninja') {
    _drawLava(scene);
  } else {
    _drawNight(scene);
  }

  const overlay = scene.add.rectangle(0, 0, 800, 400, 0x203650, 0).setOrigin(0).setDepth(-29);
  const ribbons = scene.add.graphics().setDepth(-28);
  const particles = Array.from({ length: 18 }, (_, index) => {
    const particle = scene.add.circle(0, 0, 3, 0xffffff, 0).setDepth(-27);
    particle.phaseSeed = (index + 1) * 37;
    return particle;
  });

  scene.backgroundFx = { overlay, ribbons, particles };
}

export function updateBackground(scene) {
  const settings = scene.intensity?.settings;
  const fx = scene.backgroundFx;
  if (!settings || !fx) return;

  const now = scene.time.now;
  fx.overlay.setFillStyle(
    settings.overlayColor,
    settings.overlayAlpha + Math.sin(now / 1200) * 0.02
  );

  fx.ribbons.clear();
  for (let index = 0; index < 3; index++) {
    const y = 70 + index * 90 + Math.sin(now / 850 + index * 0.8) * settings.ribbonDrift;
    const x = 400 + Math.cos(now / 1200 + index) * 60;
    fx.ribbons.fillStyle(settings.overlayColor, settings.ribbonAlpha * (0.6 + index * 0.15));
    fx.ribbons.fillEllipse(x, y, 520 + index * 70, 46 + index * 18);
  }

  for (const particle of fx.particles) {
    const x = ((now * 0.018) + particle.phaseSeed * 17) % 860 - 30;
    const y = 360 - (((now * 0.032) + particle.phaseSeed * 29) % 330);
    const wave = 0.65 + 0.35 * Math.sin(now / 500 + particle.phaseSeed);
    const radius = 1.5 + settings.particleScale * 6 * wave;
    particle.x = x;
    particle.y = y;
    particle.setRadius(radius);
    particle.setFillStyle(settings.particleColor, settings.particleAlpha * wave);
  }
}

export function createGround(scene, groundY, groundHeight) {
  const diff = scene.difficulty || 'normal';
  const gfx = scene.add.graphics();

  if (diff === 'noob') {
    // Green grass ground
    gfx.fillStyle(0x4a8c3f, 1);
    gfx.fillRect(0, groundY, 800, groundHeight);
    // Grass blades on top
    gfx.fillStyle(0x5db356, 1);
    for (let x = 4; x < 800; x += 12) {
      gfx.fillTriangle(x, groundY, x + 5, groundY, x + 2, groundY - 8);
    }
  } else if (diff === 'ninja') {
    // Dark rocky lava ground
    gfx.fillStyle(0x1a0a00, 1);
    gfx.fillRect(0, groundY, 800, groundHeight);
    // Lava cracks
    gfx.lineStyle(2, 0xff4400, 0.8);
    for (let x = 20; x < 800; x += 60) {
      gfx.strokeLineShape(new Phaser.Geom.Line(x, groundY, x + 20, groundY + groundHeight));
    }
    // Glow line at top of ground
    gfx.fillStyle(0xff6600, 0.6);
    gfx.fillRect(0, groundY, 800, 3);
  } else {
    // Normal: grey stone ground
    gfx.fillStyle(0x4a4a6a, 1);
    gfx.fillRect(0, groundY, 800, groundHeight);
  }

  const group = scene.physics.add.staticGroup();
  const body = group.create(400, groundY + groundHeight / 2, null);
  body.setSize(800, groundHeight);
  body.refreshBody();
  return group;
}

// ── Background themes ────────────────────────────────────────────────────────

function _drawDaytime(scene) {
  const gfx = scene.add.graphics().setDepth(-30);

  // Sky gradient: light blue top to pale bottom
  gfx.fillStyle(0x87ceeb, 1);
  gfx.fillRect(0, 0, 800, 400);
  gfx.fillStyle(0xb0e2ff, 1);
  gfx.fillRect(0, 200, 800, 200);

  // Sun
  gfx.fillStyle(0xffd700, 1);
  gfx.fillCircle(680, 60, 40);
  gfx.fillStyle(0xffec6e, 0.5);
  gfx.fillCircle(680, 60, 55);

  // Clouds
  _drawCloud(gfx, 120, 70);
  _drawCloud(gfx, 340, 45);
  _drawCloud(gfx, 560, 85);
  _drawCloud(gfx, 210, 120);
}

function _drawCloud(gfx, x, y) {
  gfx.fillStyle(0xffffff, 0.9);
  gfx.fillCircle(x,      y,      22);
  gfx.fillCircle(x + 28, y,      18);
  gfx.fillCircle(x + 14, y - 14, 18);
  gfx.fillCircle(x - 14, y,      14);
}

function _drawNight(scene) {
  // Same starfield as before
  const gfx = scene.add.graphics().setDepth(-30);
  for (let i = 0; i < 80; i++) {
    gfx.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.3, 1));
    gfx.fillCircle(
      Phaser.Math.Between(0, 797),
      Phaser.Math.Between(0, 355),
      Phaser.Math.FloatBetween(1, 2.5)
    );
  }
}

function _drawLava(scene) {
  const gfx = scene.add.graphics().setDepth(-30);

  // Dark red sky
  gfx.fillStyle(0x1a0000, 1);
  gfx.fillRect(0, 0, 800, 400);

  // Distant lava glow on horizon
  gfx.fillStyle(0xff2200, 0.15);
  gfx.fillRect(0, 280, 800, 80);

  // Floating embers (small dots)
  for (let i = 0; i < 50; i++) {
    const alpha = Phaser.Math.FloatBetween(0.3, 0.9);
    gfx.fillStyle(0xff4400, alpha);
    gfx.fillCircle(
      Phaser.Math.Between(0, 800),
      Phaser.Math.Between(0, 350),
      Phaser.Math.FloatBetween(1, 3)
    );
  }

  // Stalactites hanging from top
  gfx.fillStyle(0x2a0a00, 1);
  for (let x = 30; x < 800; x += 70) {
    const h = Phaser.Math.Between(20, 60);
    gfx.fillTriangle(x - 14, 0, x + 14, 0, x, h);
  }
}
