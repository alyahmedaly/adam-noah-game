// @ts-nocheck

import { getBossRageMultiplier } from './intensity.ts';
import { getLivingPlayers } from './participants.ts';
import { getContentScale, getTextScale } from './scale.ts';

const BOSS_MAX_HP = 10;
const BOSS_FIRE_INTERVAL = 5000; // ms between boss shots
const BOSS_SPEED_X = 80;
const BOSS_SPEED_Y = 40;

export function createBossTexture(scene) {
  const gfx = scene.make.graphics({ x: 0, y: 0, add: false });

  // Body — dark hulking shape
  gfx.fillStyle(0x330022, 1);
  gfx.fillRect(8, 20, 44, 36);

  // Shoulders
  gfx.fillStyle(0x550033, 1);
  gfx.fillRect(2, 22, 12, 20);
  gfx.fillRect(46, 22, 12, 20);

  // Head
  gfx.fillStyle(0x220011, 1);
  gfx.fillCircle(30, 14, 14);

  // Horns
  gfx.fillStyle(0xff2200, 1);
  gfx.fillTriangle(18, 6,  22, 0,  26, 8);
  gfx.fillTriangle(34, 8,  38, 0,  42, 6);

  // Eyes — glowing red
  gfx.fillStyle(0xff0000, 1);
  gfx.fillCircle(23, 13, 5);
  gfx.fillCircle(37, 13, 5);
  gfx.fillStyle(0xff8800, 1);
  gfx.fillCircle(23, 13, 2);
  gfx.fillCircle(37, 13, 2);

  // Claws
  gfx.fillStyle(0xff2200, 1);
  gfx.fillTriangle(2, 40, 6, 36, 0, 34);
  gfx.fillTriangle(58, 40, 54, 36, 60, 34);

  gfx.generateTexture('boss', 60, 60);
  gfx.destroy();
}

export function createBossProjectileTexture(scene) {
  const gfx = scene.make.graphics({ x: 0, y: 0, add: false });
  gfx.fillStyle(0xff2200, 1);
  gfx.fillCircle(6, 6, 6);
  gfx.fillStyle(0xff8800, 0.6);
  gfx.fillCircle(6, 6, 3);
  gfx.generateTexture('bossProjectile', 12, 12);
  gfx.destroy();
}

export function spawnBoss(scene) {
  if (scene.boss || scene.difficulty !== 'ninja') return;

  createBossTexture(scene);
  createBossProjectileTexture(scene);

  const contentScale = getContentScale(scene);
  const textScale = getTextScale(scene);
  const boss = scene.physics.add.sprite(scene.scale.width / 2, Math.max(80, scene.scale.height * 0.2), 'boss');
  boss.baseScale = contentScale;
  boss.setScale(contentScale);
  boss.setCollideWorldBounds(true);
  boss.setBounceX(1);
  boss.setVelocity(BOSS_SPEED_X, BOSS_SPEED_Y);
  boss.setGravityY(-600); // cancel world gravity so it floats
  boss.hp = BOSS_MAX_HP;

  scene.boss = boss;
  scene.bossProjectiles = scene.physics.add.group();

  // Health bar background
  scene.bossHpBarBg = scene.add.graphics().setDepth(5);
  scene.bossHpBar   = scene.add.graphics().setDepth(5);

  _updateBossHpBar(scene);

  // Boss fires every 5s
  scene.bossFireTimer = scene.time.addEvent({
    delay: BOSS_FIRE_INTERVAL,
    loop: true,
    callback: () => _bossShoot(scene),
  });

  // Projectile overlaps with players
  scene.physics.add.overlap(scene.player1, scene.bossProjectiles, (p, proj) => {
    if (!scene.player1Dead) { proj.destroy(); scene.loseLife(1); }
  });
  scene.physics.add.overlap(scene.player2, scene.bossProjectiles, (p, proj) => {
    if (!scene.player2Dead) { proj.destroy(); scene.loseLife(2); }
  });

  // Announce
  const txt = scene.add.text(scene.scale.width / 2, scene.scale.height * 0.45, '👹 THE BOSS APPEARS!', {
    fontSize: `${Math.round(20 * textScale)}px`, color: '#ff2200', fontFamily: 'monospace', fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(6);
  scene.tweens.add({
    targets: txt, alpha: 0, y: txt.y - 40, duration: 2000,
    onComplete: () => txt.destroy()
  });
}

export function updateBoss(scene) {
  const boss = scene.boss;
  if (!boss?.active) return;
  const settings = scene.intensity?.settings;
  const rageMultiplier = getBossRageMultiplier(scene);

  // Bounce vertically between y=40 and y=160
  const minY = Math.max(40, scene.scale.height * 0.1);
  const maxY = Math.max(160, scene.scale.height * 0.4);
  if (boss.y < minY)  boss.setVelocityY(BOSS_SPEED_Y);
  if (boss.y > maxY) boss.setVelocityY(-BOSS_SPEED_Y);

  const wave = Math.sin(scene.time.now / 220);
  const baseScale = boss.baseScale ?? 1;
  boss.setScale(baseScale * (1 + (settings?.spikePulse ?? 0.03) * 0.35 + wave * 0.03 * rageMultiplier));
  boss.setAngle(Math.sin(scene.time.now / 300) * 4 * rageMultiplier);

  _updateBossHpBar(scene);

  // Clean up projectiles that left the screen
  scene.bossProjectiles.getChildren().forEach(p => {
    const pulse = 1 + Math.sin(scene.time.now / 160 + p.x * 0.01) * 0.12 * rageMultiplier;
    const baseScale = p.baseScale ?? 1;
    p.setScale(baseScale * pulse);
    p.setAlpha(0.75 + 0.15 * rageMultiplier);
    if (p.y > scene.groundY + 20) p.destroy();
  });
}

export function hitBoss(scene) {
  const boss = scene.boss;
  if (!boss?.active) return;

  boss.hp--;
  boss.setTint(0xffffff);
  scene.time.delayedCall(120, () => { if (boss.active) boss.clearTint(); });
  scene.cameras.main.shake(120, scene.intensity?.settings?.damageShake ?? 0.0035);

  _updateBossHpBar(scene);

  if (boss.hp <= 0) _killBoss(scene);
}

// ── Private ──────────────────────────────────────────────────────────────────

function _bossShoot(scene) {
  if (!scene.boss?.active || scene.gameOver) return;
  const rageMultiplier = getBossRageMultiplier(scene);

  // Pick a random living player to target
  const targets = getLivingPlayers(scene);
  if (targets.length === 0) return;

  const { player: target } = targets[Phaser.Math.Between(0, targets.length - 1)];
  const proj = scene.bossProjectiles.create(scene.boss.x, scene.boss.y + 30, 'bossProjectile');
  proj.baseScale = getContentScale(scene);
  proj.setScale(proj.baseScale);
  proj.setGravityY(-600); // cancel world gravity
  proj.setTint(rageMultiplier > 1 ? 0xffaa33 : 0xffffff);
  proj.setVelocity(
    (target.x - scene.boss.x) * 1.5 * rageMultiplier,
    200 * rageMultiplier
  );
  proj.setDepth(4);
}

function _killBoss(scene) {
  const boss = scene.boss;
  scene.bossFireTimer?.remove();
  scene.bossHpBarBg?.destroy();
  scene.bossHpBar?.destroy();

  // Fall off the map
  boss.setGravityY(0); // re-enable world gravity effect
  boss.setVelocity(Phaser.Math.Between(-60, 60), 200);
  boss.setCollideWorldBounds(false);

  scene.tweens.add({
    targets: boss, alpha: 0, duration: 1500,
    onComplete: () => { boss.destroy(); scene.boss = null; }
  });

  const txt = scene.add.text(scene.scale.width / 2, scene.scale.height * 0.4, '💀 BOSS DEFEATED!', {
    fontSize: `${Math.round(22 * getTextScale(scene))}px`, color: '#ffd700', fontFamily: 'monospace', fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(6);
  scene.tweens.add({
    targets: txt, alpha: 0, y: txt.y - 50, duration: 2500,
    onComplete: () => txt.destroy()
  });
}

function _updateBossHpBar(scene) {
  const boss = scene.boss;
  if (!boss?.active) return;

  const uiScale = getContentScale(scene);
  const bx = boss.x - 35 * uiScale;
  const by = boss.y - 42 * uiScale;
  const w  = 70 * uiScale;
  const h  = 8 * uiScale;

  scene.bossHpBarBg.clear();
  scene.bossHpBarBg.fillStyle(0x440000, 1);
  scene.bossHpBarBg.fillRect(bx, by, w, h);

  scene.bossHpBar.clear();
  scene.bossHpBar.fillStyle(0xff2200, 1);
  scene.bossHpBar.fillRect(bx, by, Math.max(0, w * (boss.hp / BOSS_MAX_HP)), h);
}
