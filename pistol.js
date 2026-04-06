import { hitBoss } from './boss.js';

const BULLET_SPEED = 600;
const SHOOT_COOLDOWN = 400; // ms between shots

export function createBulletTexture(scene) {
  const gfx = scene.make.graphics({ x: 0, y: 0, add: false });
  gfx.fillStyle(0xffee00, 1);
  gfx.fillRect(0, 2, 10, 4);
  gfx.fillStyle(0xff8800, 1);
  gfx.fillRect(8, 0, 4, 8);
  gfx.generateTexture('bullet', 12, 8);
  gfx.destroy();
}

export function givePistol(scene, playerNum) {
  createBulletTexture(scene);

  if (playerNum === 1) {
    scene.hasPistol1 = true;
    scene.lastShot1  = 0;
    _showPistolHUD(scene, 1);
  } else {
    scene.hasPistol2 = true;
    scene.lastShot2  = 0;
    _showPistolHUD(scene, 2);
  }

  if (!scene.bullets) {
    scene.bullets = scene.physics.add.group();
  }

  // Wire bullet → boss overlap once (idempotent via flag)
  if (!scene.bulletBossOverlapRegistered) {
    scene.bulletBossOverlapRegistered = true;
    // Checked each frame in updatePistol since boss may not exist yet
  }
}

export function updatePistol(scene, wasd, cursors) {
  const now = scene.time.now;

  // Player 1 shoots with R
  if (scene.hasPistol1 && !scene.player1Dead) {
    const rKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    if (rKey.isDown && now - (scene.lastShot1 || 0) > SHOOT_COOLDOWN) {
      scene.lastShot1 = now;
      _fireBullet(scene, scene.player1);
    }
  }

  // Player 2 shoots with L
  if (scene.hasPistol2 && !scene.player2Dead) {
    const lKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    if (lKey.isDown && now - (scene.lastShot2 || 0) > SHOOT_COOLDOWN) {
      scene.lastShot2 = now;
      _fireBullet(scene, scene.player2);
    }
  }

  // Check bullet hits boss
  if (scene.boss?.active && scene.bullets) {
    scene.bullets.getChildren().forEach(bullet => {
      if (!bullet.active) return;
      const boss = scene.boss;
      if (boss && Phaser.Geom.Intersects.RectangleToRectangle(
        bullet.getBounds(), boss.getBounds()
      )) {
        bullet.destroy();
        hitBoss(scene);
      }
    });

    // Clean up off-screen bullets
    scene.bullets.getChildren().forEach(b => {
      if (b.x < -20 || b.x > 820 || b.y < -20 || b.y > 420) b.destroy();
    });
  }
}

// ── Private ──────────────────────────────────────────────────────────────────

function _fireBullet(scene, player) {
  if (!scene.boss?.active) return; // no target

  const bullet = scene.bullets.create(player.x, player.y - 10, 'bullet');
  bullet.setGravityY(-600); // float horizontally
  bullet.setDepth(4);

  // Aim at boss X
  const dir = scene.boss.x > player.x ? 1 : -1;
  bullet.setVelocityX(dir * BULLET_SPEED);
  bullet.setVelocityY(-60); // slight upward arc toward boss height

  // Flip sprite if shooting left
  if (dir < 0) bullet.setFlipX(true);
}

function _showPistolHUD(scene, playerNum) {
  const x = playerNum === 1 ? 12 : 788;
  const origin = playerNum === 1 ? 0 : 1;
  const key = playerNum === 1 ? 'adam' : 'noah';
  const shootKey = playerNum === 1 ? 'R' : 'L';

  const txt = scene.add.text(x, scene.groundY + 26, `🔫 [${shootKey}]`, {
    fontSize: '12px', color: '#ffee00', fontFamily: 'monospace'
  }).setOrigin(origin, 0).setDepth(3);

  // Store so we can remove it later if needed
  if (playerNum === 1) scene.pistolHud1 = txt;
  else scene.pistolHud2 = txt;
}
