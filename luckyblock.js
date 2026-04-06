import { PLAYER_SOUND_EVENTS } from './audio.js';
import { givePistol } from './pistol.js';

const BLOCK_SIZE = 32;
const FLOAT_Y_OFFSET = 120;

export function createLuckyBlockTexture(scene) {
  const gfx = scene.make.graphics({ x: 0, y: 0, add: false });

  // Gold background
  gfx.fillStyle(0xf5a800, 1);
  gfx.fillRect(0, 0, BLOCK_SIZE, BLOCK_SIZE);

  // Dark border
  gfx.lineStyle(2, 0x8b6000, 1);
  gfx.strokeRect(1, 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

  // Inner shine
  gfx.fillStyle(0xffe066, 1);
  gfx.fillRect(3, 3, BLOCK_SIZE - 6, 5);
  gfx.fillRect(3, 3, 5, BLOCK_SIZE - 6);

  // "?" mark
  gfx.fillStyle(0xffffff, 1);
  gfx.fillRect(11, 6, 10, 3);
  gfx.fillRect(19, 9, 3, 5);
  gfx.fillRect(13, 14, 6, 3);
  gfx.fillRect(13, 19, 3, 3);
  gfx.fillRect(13, 24, 3, 3);

  gfx.generateTexture('luckyblock', BLOCK_SIZE, BLOCK_SIZE);
  gfx.destroy();
}

export function spawnLuckyBlock(scene) {
  const x = Phaser.Math.Between(80, 720);
  const y = scene.groundY - FLOAT_Y_OFFSET;

  const block = scene.physics.add.staticImage(x, y, 'luckyblock');
  block.setSize(BLOCK_SIZE, BLOCK_SIZE);
  block.refreshBody();
  block.used = false;

  // Any contact from any side triggers it
  scene.physics.add.overlap(scene.player1, block, () => hitBlock(scene, block, 1));
  scene.physics.add.overlap(scene.player2, block, () => hitBlock(scene, block, 2));
}

export function scheduleLuckyBlockRespawns(scene) {
  // Always ensure a lucky block appears every 20-30s regardless of collection
  scene.time.delayedCall(Phaser.Math.Between(20000, 30000), () => {
    if (!scene.gameOver) {
      spawnLuckyBlock(scene);
      scheduleLuckyBlockRespawns(scene);
    }
  });
}

function hitBlock(scene, block, playerNum) {
  if (block.used) return;
  block.used = true;
  block.destroy();
  activateSuperpower(scene, playerNum);
}

function activateSuperpower(scene, playerNum) {
  const player = playerNum === 1 ? scene.player1 : scene.player2;
  const color  = playerNum === 1 ? (scene.color1 ?? 0x00aaff) : (scene.color2 ?? 0x00cc44);

  scene.audio.playForPlayer(playerNum, PLAYER_SOUND_EVENTS.LUCKY_BLOCK);

  // In Ninja mode: give pistol instead of spike-clear
  if (scene.difficulty === 'ninja' && scene.boss?.active) {
    givePistol(scene, playerNum);
    player.setTint(0xffd700);
    const txt = scene.add.text(player.x, player.y - 40, '🔫 PISTOL!', {
      fontSize: '14px', color: '#ffee00', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(4);
    scene.tweens.add({
      targets: txt, y: txt.y - 30, alpha: 0, duration: 1200,
      onComplete: () => txt.destroy()
    });
    scene.time.delayedCall(Phaser.Math.Between(8000, 15000), () => {
      if (!scene.gameOver) spawnLuckyBlock(scene);
    });
    return;
  }

  // Clear all current spikes
  scene.spikes.clear(true, true);

  // Flash player gold
  player.setTint(0xffd700);

  // Floating text
  const txt = scene.add.text(player.x, player.y - 40, '💥 SPIKE CLEAR!', {
    fontSize: '14px', color: '#ffd700', fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(4);

  scene.tweens.add({
    targets: txt,
    y: txt.y - 30,
    alpha: 0,
    duration: 1200,
    onComplete: () => txt.destroy()
  });

  // 3s invincibility
  const spikeOverlap = playerNum === 1 ? scene.spike1Overlap : scene.spike2Overlap;
  if (spikeOverlap) spikeOverlap.active = false;

  scene.time.delayedCall(3000, () => {
    if (!scene.gameOver) {
      if (spikeOverlap) spikeOverlap.active = true;
      player.setTint(color);
    }
  });

  // Respawn block after a delay
  scene.time.delayedCall(Phaser.Math.Between(8000, 15000), () => {
    if (!scene.gameOver) spawnLuckyBlock(scene);
  });
}
