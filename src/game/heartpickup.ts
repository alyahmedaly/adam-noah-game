// @ts-nocheck

import { PLAYER_SOUND_EVENTS } from './audio.ts';
import { getHeartDelayMultiplier, isHeartSpawnBlocked } from './intensity.ts';
import { getContentScale, getTextScale } from './scale.ts';

const HEART_SIZE = 24;

export function createHeartTexture(scene) {
  const gfx = scene.make.graphics({ x: 0, y: 0, add: false });

  // Two circles for the top lobes
  gfx.fillStyle(0xff2255, 1);
  gfx.fillCircle(7, 8, 7);
  gfx.fillCircle(17, 8, 7);

  // Triangle for the bottom point
  gfx.fillTriangle(0, 10, 24, 10, 12, 23);

  // Small highlight
  gfx.fillStyle(0xff88aa, 1);
  gfx.fillCircle(8, 6, 3);

  gfx.generateTexture('heart', HEART_SIZE, HEART_SIZE);
  gfx.destroy();
}

export function scheduleHeartSpawns(scene) {
  // Spawn a heart every 12-20 seconds, but only if at least one player has lost a life
  const delayMultiplier = getHeartDelayMultiplier(scene);
  scene.time.addEvent({
    delay: Phaser.Math.Between(
      Math.round(12000 * delayMultiplier),
      Math.round(20000 * delayMultiplier)
    ),
    loop: false,
    callback: () => {
      if (!scene.gameOver) {
        if (!isHeartSpawnBlocked(scene) && (scene.lives1 < scene.maxLives || scene.lives2 < scene.maxLives)) {
          spawnHeart(scene);
        }
        scheduleHeartSpawns(scene); // re-schedule
      }
    }
  });
}

function spawnHeart(scene) {
  const contentScale = getContentScale(scene);
  const x = Phaser.Math.Between(60, Math.max(61, scene.scale.width - 60));
  const pickupLaneOffset = Math.max(HEART_SIZE * contentScale * 2.2, scene.scale.height * 0.16);
  const y = scene.groundY - pickupLaneOffset;

  const heart = scene.physics.add.staticImage(x, y, 'heart');
  heart.setScale(contentScale);
  heart.setSize(HEART_SIZE, HEART_SIZE);
  heart.refreshBody();
  heart.collected = false;

  // Gentle bob animation
  scene.tweens.add({
    targets: heart,
    y: y - 6,
    duration: 700,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
  scene.tweens.add({
    targets: heart,
    scaleX: 1.08,
    scaleY: 1.08,
    duration: 550,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

  scene.physics.add.overlap(scene.player1, heart, () => collectHeart(scene, heart, 1));
  scene.physics.add.overlap(scene.player2, heart, () => collectHeart(scene, heart, 2));
}

function collectHeart(scene, heart, playerNum) {
  const contentScale = getContentScale(scene);
  const textScale = getTextScale(scene);
  if (heart.collected) return;
  const lives = playerNum === 1 ? scene.lives1 : scene.lives2;
  if (lives >= scene.maxLives) return; // already full

  heart.collected = true;
  scene.tweens.killTweensOf(heart);
  heart.destroy();

  // Restore one life
  if (playerNum === 1) {
    scene.lives1 = Math.min(scene.maxLives, scene.lives1 + 1);
  } else {
    scene.lives2 = Math.min(scene.maxLives, scene.lives2 + 1);
  }

  // Update HUD
  scene.updateLivesHUD();
  scene.audio.playForPlayer(playerNum, PLAYER_SOUND_EVENTS.HEART_ADDED);
  scene.cameras.main.shake(120, scene.intensity?.settings?.damageShake ?? 0.0025);

  // Floating text
  const player = playerNum === 1 ? scene.player1 : scene.player2;
  const txt = scene.add.text(player.x, player.y - 40, '❤️ +1', {
    fontSize: `${Math.round(16 * textScale)}px`, color: '#ff2255', fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(4);

  scene.tweens.add({
    targets: txt,
    y: txt.y - 30,
    alpha: 0,
    duration: 1000,
    onComplete: () => txt.destroy()
  });
}
