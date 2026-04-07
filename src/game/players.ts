// @ts-nocheck

import { PLAYER_SOUND_EVENTS } from './audio.ts';
import { getContentScale, getTextScale } from './scale.ts';

const PLAYER_H = 48;
const GAMEPAD_AXIS_DEADZONE = 0.35;
const GAMEPAD_JUMP_AXIS_THRESHOLD = -0.6;
const PLAYER_BUMP_SPEED_THRESHOLD = 80;
const PLAYER_BUMP_PUSH_X = 165;
const PLAYER_BUMP_PUSH_Y = -120;
const PLAYER_BUMP_RECOIL_X = 35;
const PLAYER_BUMP_COOLDOWN_MS = 320;
const DEFAULT_PLAYER_GROWTH_SCALE = 1;

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
  const contentScale = getContentScale(scene);
  const player = scene.physics.add.sprite(x, groundY - PLAYER_H / 2, textureKey);
  player.baseScale = contentScale;
  player.growthScale = DEFAULT_PLAYER_GROWTH_SCALE;
  player.setScale(contentScale);
  player.setBounce(0);
  player.setCollideWorldBounds(true);
  scene.physics.add.collider(player, ground);
  return player;
}

export function createPlayers(scene, groundY, ground, spawnAdam = true, spawnNoah = true) {
  const stageWidth = scene.scale.width;
  const contentScale = getContentScale(scene);
  const textScale = getTextScale(scene);
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

  const player1X = stageWidth * 0.125;
  const player2X = stageWidth * 0.875;
  const player1 = spawnAdam ? spawnPlayer(scene, player1X, groundY, 'player1', ground) : null;
  const player2 = spawnNoah ? spawnPlayer(scene, player2X, groundY, 'player2', ground) : null;

  if (spawnAdam) {
    scene.add.text(player1X, groundY - PLAYER_H - 18, 'Adam', {
      fontSize: `${Math.round(12 * textScale)}px`, color: colors.label1, fontFamily: 'monospace'
    }).setOrigin(0.5);
  }
  if (spawnNoah) {
    scene.add.text(player2X, groundY - PLAYER_H - 18, 'Noah', {
      fontSize: `${Math.round(12 * textScale)}px`, color: colors.label2, fontFamily: 'monospace'
    }).setOrigin(0.5);
  }

  const wasd = scene.input.keyboard.addKeys({
    left:  Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
    up:    Phaser.Input.Keyboard.KeyCodes.W
  });
  const cursors = scene.input.keyboard.createCursorKeys();

  return { player1, player2, wasd, cursors };
}

export function updatePlayers(scene, player1, player2, wasd, cursors, touchInput = null, mobilePlayer = null) {
  if (mobilePlayer === 'adam') {
    if (player1) movePlayer(scene, player1, touchInput.left, touchInput.right, touchInput.justJump());
  } else if (mobilePlayer === 'noah') {
    if (player2) movePlayer(scene, player2, touchInput.left, touchInput.right, touchInput.justJump());
  } else {
    const adamInput = getAdamInput(scene, wasd);
    if (player1) movePlayer(scene, player1, adamInput.left, adamInput.right, adamInput.jump);
    if (player2) movePlayer(scene, player2, cursors.left.isDown, cursors.right.isDown,
      isFreshKeyJump(scene, '_noahKeyJumpPressed', Boolean(cursors.up?.isDown)));
  }
}

export function handlePlayerBump(scene) {
  const outcome = getPlayerBumpOutcome(scene, scene?.player1, scene?.player2);
  if (!outcome) return;

  scene._lastPlayerBumpAt = scene.time.now;

  const { attacker, defender, direction } = outcome;
  const attackerNum = attacker === scene.player1 ? 1 : 2;
  defender.setVelocityX(direction * PLAYER_BUMP_PUSH_X);
  defender.setVelocityY(PLAYER_BUMP_PUSH_Y);
  attacker.setVelocityX(-direction * PLAYER_BUMP_RECOIL_X);

  attacker.juiceX = 1.08;
  attacker.juiceY = 0.92;
  defender.juiceX = 0.82;
  defender.juiceY = 1.18;

  scene.cameras?.main?.shake(90, 0.0025);
  scene.audio?.playForPlayer(attackerNum, PLAYER_SOUND_EVENTS.BUMP);
  showBumpEffect(scene, attacker, defender);
}

export function getPlayerBumpOutcome(scene, player1, player2) {
  if (!player1?.body || !player2?.body) return null;
  if (scene?.player1Dead || scene?.player2Dead || scene?.gameOver) return null;

  const now = scene?.time?.now ?? 0;
  const lastBumpAt = scene?._lastPlayerBumpAt ?? -Infinity;
  if (now - lastBumpAt < PLAYER_BUMP_COOLDOWN_MS) return null;

  if (!isGrounded(player1) || !isGrounded(player2)) return null;

  const p1VelocityX = player1.body.velocity?.x ?? 0;
  const p2VelocityX = player2.body.velocity?.x ?? 0;
  const p1MovingRight = p1VelocityX > PLAYER_BUMP_SPEED_THRESHOLD;
  const p1MovingLeft = p1VelocityX < -PLAYER_BUMP_SPEED_THRESHOLD;
  const p2MovingRight = p2VelocityX > PLAYER_BUMP_SPEED_THRESHOLD;
  const p2MovingLeft = p2VelocityX < -PLAYER_BUMP_SPEED_THRESHOLD;

  if ((p1MovingRight && p2MovingLeft) || (p1MovingLeft && p2MovingRight)) {
    return null;
  }

  const p1OnLeft = player1.x <= player2.x;
  if (p1OnLeft && p1MovingRight) {
    return { attacker: player1, defender: player2, direction: 1 };
  }

  if (!p1OnLeft && p1MovingLeft) {
    return { attacker: player1, defender: player2, direction: -1 };
  }

  if (p1OnLeft && p2MovingLeft) {
    return { attacker: player2, defender: player1, direction: -1 };
  }

  if (!p1OnLeft && p2MovingRight) {
    return { attacker: player2, defender: player1, direction: 1 };
  }

  return null;
}

export function getAdamInput(scene, wasd) {
  const keyboardLeft = Boolean(wasd?.left?.isDown);
  const keyboardRight = Boolean(wasd?.right?.isDown);
  const keyboardUpDown = Boolean(wasd?.up?.isDown);
  const keyboardJump = isFreshKeyJump(scene, '_adamKeyJumpPressed', keyboardUpDown);

  const gamepad = getPrimaryGamepad(scene);
  const axisX = getGamepadAxis(gamepad, 0, 'x');
  const axisY = getGamepadAxis(gamepad, 1, 'y');
  const buttonJump = Boolean(gamepad?.A) || isGamepadButtonPressed(gamepad, 0);
  const axisJump = axisY <= GAMEPAD_JUMP_AXIS_THRESHOLD;

  return {
    left: keyboardLeft || isDirectionalPressed(gamepad, 'left') || axisX <= -GAMEPAD_AXIS_DEADZONE,
    right: keyboardRight || isDirectionalPressed(gamepad, 'right') || axisX >= GAMEPAD_AXIS_DEADZONE,
    jump: keyboardJump || isFreshGamepadJump(scene, buttonJump || isDirectionalPressed(gamepad, 'up') || axisJump),
  };
}

export function getPlayerRenderScale(player) {
  return (player?.baseScale ?? 1) * (player?.growthScale ?? DEFAULT_PLAYER_GROWTH_SCALE);
}

function getPrimaryGamepad(scene) {
  const manager = scene?.input?.gamepad;
  if (!manager || manager.enabled === false) return null;

  const pads = [];
  const primaryPad = manager.getPad?.(0) ?? manager.pad1;

  if (primaryPad) pads.push(primaryPad);

  if (typeof manager.getAll === 'function') {
    pads.push(...manager.getAll());
  }

  if (Array.isArray(manager.gamepads)) {
    pads.push(...manager.gamepads);
  }

  const connectedPad = pads.find((pad) => pad && pad.connected !== false);
  return connectedPad ?? getBrowserGamepad();
}

function getBrowserGamepad() {
  if (typeof navigator?.getGamepads !== 'function') return null;
  const gamepads = navigator.getGamepads();
  return Array.from(gamepads ?? []).find((pad) => pad && pad.connected !== false) ?? null;
}

function normalizeAxis(value) {
  return typeof value === 'number' ? value : 0;
}

function getGamepadAxis(gamepad, axisIndex, stickAxis) {
  const stickValue = gamepad?.leftStick?.[stickAxis];
  const axis = gamepad?.axes?.[axisIndex];
  return normalizeAxis(typeof stickValue === 'number' ? stickValue : axis?.getValue?.() ?? axis);
}

function isGamepadButtonPressed(gamepad, index) {
  if (typeof gamepad?.isButtonDown === 'function') {
    return gamepad.isButtonDown(index);
  }

  const button = gamepad?.buttons?.[index];
  return Boolean(button?.pressed || button?.value > 0.5);
}

function isDirectionalPressed(gamepad, direction) {
  if (!gamepad) return false;

  if (Boolean(gamepad[direction])) return true;

  const directionButtonIndex = {
    up: 12,
    left: 14,
    right: 15,
  }[direction];

  return typeof directionButtonIndex === 'number'
    ? isGamepadButtonPressed(gamepad, directionButtonIndex)
    : false;
}

function isFreshGamepadJump(scene, isPressed) {
  const wasPressed = scene._adamGamepadJumpPressed ?? false;
  scene._adamGamepadJumpPressed = isPressed;
  return isPressed && !wasPressed;
}

function isFreshKeyJump(scene, stateKey, isDown) {
  const wasDown = scene[stateKey] ?? false;
  scene[stateKey] = isDown;
  return isDown && !wasDown;
}

function isGrounded(player) {
  return Boolean(player?.body?.blocked?.down || player?.body?.touching?.down);
}

function showBumpEffect(scene, attacker, defender) {
  const textScale = getTextScale(scene);
  const midX = (attacker.x + defender.x) / 2;
  const midY = Math.min(attacker.y, defender.y) - 26;
  const text = scene.add.text(midX, midY, 'BONK!', {
    fontFamily: 'monospace',
    fontSize: `${Math.round(14 * textScale)}px`,
    color: '#fff7b2',
    stroke: '#3a1f5d',
    strokeThickness: 4,
  }).setOrigin(0.5).setRotation(Phaser.Math.FloatBetween(-0.18, 0.18));

  scene.tweens.add({
    targets: text,
    y: midY - 18,
    alpha: 0,
    scaleX: 1.12,
    scaleY: 1.12,
    duration: 260,
    ease: 'Quad.easeOut',
    onComplete: () => text.destroy(),
  });
}

function movePlayer(scene, player, goLeft, goRight, jump) {
  if (!player?.body) return;
  const onGround = player.body.blocked.down;
  const settings = scene.intensity?.settings;
  const wasOnGround = player.wasOnGround ?? true;

  if (goLeft) {
    player.setVelocityX(-220);
  } else if (goRight) {
    player.setVelocityX(220);
  } else {
    player.setVelocityX(0);
  }
  if (jump && onGround) {
    player.setVelocityY(-520);
    player.juiceX = 1.12;
    player.juiceY = 0.86;
  }

  if (!wasOnGround && onGround) {
    player.juiceX = 0.84;
    player.juiceY = 1.16;
  }

  player.juiceX = Phaser.Math.Linear(player.juiceX ?? 1, 1, 0.18);
  player.juiceY = Phaser.Math.Linear(player.juiceY ?? 1, 1, 0.18);

  const airStretch = onGround
    ? 1
    : 1 + Math.min(settings?.airStretch ?? 0.04, Math.abs(player.body.velocity.y) * 0.00025);
  const targetScaleX = onGround ? player.juiceX : Math.min(player.juiceX, 2 - airStretch);
  const targetScaleY = onGround ? player.juiceY : Math.max(player.juiceY, airStretch);
  const renderScale = getPlayerRenderScale(player);
  player.scaleX = Phaser.Math.Linear(player.scaleX ?? renderScale, renderScale * targetScaleX, 0.22);
  player.scaleY = Phaser.Math.Linear(player.scaleY ?? renderScale, renderScale * targetScaleY, 0.22);

  const tilt = goLeft ? -(settings?.playerTilt ?? 2) : goRight ? (settings?.playerTilt ?? 2) : 0;
  player.angle = Phaser.Math.Linear(player.angle ?? 0, tilt, 0.25);
  player.wasOnGround = onGround;
}
