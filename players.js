const PLAYER_H = 48;

function generatePlayerTexture(scene, key, bodyColor) {
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

function spawnPlayer(scene, x, groundY, textureKey, ground) {
  const player = scene.physics.add.sprite(x, groundY - PLAYER_H / 2, textureKey);
  player.setBounce(0);
  player.setCollideWorldBounds(true);
  scene.physics.add.collider(player, ground);
  return player;
}

export function createPlayers(scene, groundY, ground) {
  generatePlayerTexture(scene, 'player1', 0x00aaff);
  generatePlayerTexture(scene, 'player2', 0x00cc44);

  const player1 = spawnPlayer(scene, 100, groundY, 'player1', ground);
  const player2 = spawnPlayer(scene, 700, groundY, 'player2', ground);

  scene.add.text(100, groundY - PLAYER_H - 18, 'Adam', {
    fontSize: '12px', color: '#00aaff', fontFamily: 'monospace'
  }).setOrigin(0.5);
  scene.add.text(700, groundY - PLAYER_H - 18, 'Noah', {
    fontSize: '12px', color: '#00cc44', fontFamily: 'monospace'
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
