const PLAYER_H = 48;

// ── Texture generators ───────────────────────────────────────────────────────

function generateNoobTexture(scene, key, bodyColor) {
  // Chubby body + hat
  const gfx = scene.make.graphics({ x: 0, y: 0, add: false });

  // Hat brim
  gfx.fillStyle(0x8B4513, 1);
  gfx.fillRect(1, 10, 22, 3);
  // Hat top
  gfx.fillRect(5, 2, 14, 9);

  // Head (bigger / rounder)
  gfx.fillStyle(0xffd700, 1);
  gfx.fillCircle(12, 17, 9);

  // Chubby body
  gfx.fillStyle(bodyColor, 1);
  gfx.fillRect(4, 26, 16, 14);

  // Short stubby arms
  gfx.fillRect(0, 27, 4, 4);
  gfx.fillRect(20, 27, 4, 4);

  // Legs
  gfx.fillStyle(0x333333, 1);
  gfx.fillRect(5, 40, 5, 8);
  gfx.fillRect(14, 40, 5, 8);

  gfx.generateTexture(key, 24, PLAYER_H);
  gfx.destroy();
}

function generateNormalTexture(scene, key, bodyColor) {
  // Original human shape
  const gfx = scene.make.graphics({ x: 0, y: 0, add: false });
  gfx.fillStyle(0xffd700, 1);
  gfx.fillCircle(12, 7, 7);
  gfx.fillStyle(bodyColor, 1);
  gfx.fillRect(7, 14, 10, 16);
  gfx.fillRect(1, 14, 6, 4);
  gfx.fillRect(17, 14, 6, 4);
  gfx.fillStyle(0x333333, 1);
  gfx.fillRect(7, 30, 4, 18);
  gfx.fillRect(13, 30, 4, 18);
  gfx.generateTexture(key, 24, PLAYER_H);
  gfx.destroy();
}

function generateNinjaTexture(scene, key, bodyColor) {
  // Slim + mask
  const gfx = scene.make.graphics({ x: 0, y: 0, add: false });

  // Head
  gfx.fillStyle(bodyColor, 1);
  gfx.fillCircle(12, 7, 6);

  // Mask strip across eyes
  gfx.fillStyle(0x111111, 1);
  gfx.fillRect(6, 4, 12, 4);

  // Eye slits
  gfx.fillStyle(0xff2200, 1);
  gfx.fillRect(7, 5, 3, 2);
  gfx.fillRect(14, 5, 3, 2);

  // Slim body
  gfx.fillStyle(bodyColor, 1);
  gfx.fillRect(9, 13, 6, 18);

  // Long arms
  gfx.fillRect(2, 13, 7, 3);
  gfx.fillRect(15, 13, 7, 3);

  // Slim legs
  gfx.fillStyle(0x111111, 1);
  gfx.fillRect(8, 31, 3, 17);
  gfx.fillRect(13, 31, 3, 17);

  gfx.generateTexture(key, 24, PLAYER_H);
  gfx.destroy();
}

// ── Color palettes per mode ──────────────────────────────────────────────────

const PLAYER_COLORS = {
  noob:   { p1: 0xff8800, p2: 0xffcc00, label1: '#ff8800', label2: '#ffcc00' },
  normal: { p1: 0x00aaff, p2: 0x00cc44, label1: '#00aaff', label2: '#00cc44' },
  ninja:  { p1: 0x880088, p2: 0x440044, label1: '#cc44cc', label2: '#aa22aa' },
};

// ── Public API ───────────────────────────────────────────────────────────────

function spawnPlayer(scene, x, groundY, textureKey, ground) {
  const player = scene.physics.add.sprite(x, groundY - PLAYER_H / 2, textureKey);
  player.setBounce(0);
  player.setCollideWorldBounds(true);
  scene.physics.add.collider(player, ground);
  return player;
}

export function createPlayers(scene, groundY, ground) {
  const diff = scene.difficulty || 'normal';
  const colors = PLAYER_COLORS[diff] ?? PLAYER_COLORS.normal;

  if (diff === 'noob') {
    generateNoobTexture(scene, 'player1', colors.p1);
    generateNoobTexture(scene, 'player2', colors.p2);
  } else if (diff === 'ninja') {
    generateNinjaTexture(scene, 'player1', colors.p1);
    generateNinjaTexture(scene, 'player2', colors.p2);
  } else {
    generateNormalTexture(scene, 'player1', colors.p1);
    generateNormalTexture(scene, 'player2', colors.p2);
  }

  const player1 = spawnPlayer(scene, 100, groundY, 'player1', ground);
  const player2 = spawnPlayer(scene, 700, groundY, 'player2', ground);

  scene.add.text(100, groundY - PLAYER_H - 18, 'Adam', {
    fontSize: '12px', color: colors.label1, fontFamily: 'monospace'
  }).setOrigin(0.5);
  scene.add.text(700, groundY - PLAYER_H - 18, 'Noah', {
    fontSize: '12px', color: colors.label2, fontFamily: 'monospace'
  }).setOrigin(0.5);

  const wasd = scene.input.keyboard.addKeys({
    left:  Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
    up:    Phaser.Input.Keyboard.KeyCodes.W
  });
  const cursors = scene.input.keyboard.createCursorKeys();

  return { player1, player2, wasd, cursors };
}

export function updatePlayers(player1, player2, wasd, cursors) {
  movePlayer(player1, wasd.left.isDown, wasd.right.isDown,
    Phaser.Input.Keyboard.JustDown(wasd.up));

  movePlayer(player2, cursors.left.isDown, cursors.right.isDown,
    Phaser.Input.Keyboard.JustDown(cursors.up));
}

function movePlayer(player, goLeft, goRight, jump) {
  if (!player?.body) return;
  const onGround = player.body.blocked.down;
  if (goLeft) {
    player.setVelocityX(-220);
  } else if (goRight) {
    player.setVelocityX(220);
  } else {
    player.setVelocityX(0);
  }
  if (jump && onGround) {
    player.setVelocityY(-520);
  }
}
