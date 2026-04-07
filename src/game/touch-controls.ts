// @ts-nocheck
import VirtualJoyStick from 'phaser3-rex-plugins/plugins/input/virtualjoystick/VirtualJoyStick.js';

const JOYSTICK_RADIUS = 50;
const JUMP_BTN_RADIUS = 40;
const MARGIN = 24;
const ALPHA_IDLE = 0.35;
const ALPHA_ACTIVE = 0.7;

export interface TouchInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  justJump: () => boolean;
}

export function createTouchControls(scene: Phaser.Scene): TouchInput {
  const W = scene.scale.width;
  const H = scene.scale.height;

  const joyX = MARGIN + JOYSTICK_RADIUS + 20;
  const joyY = H - MARGIN - JOYSTICK_RADIUS - 20;

  const base = scene.add.circle(joyX, joyY, JOYSTICK_RADIUS, 0xffffff, 0.15)
    .setScrollFactor(0)
    .setDepth(100);
  const thumb = scene.add.circle(joyX, joyY, JOYSTICK_RADIUS * 0.5, 0xffffff, ALPHA_IDLE)
    .setScrollFactor(0)
    .setDepth(101);

  const joystick = new VirtualJoyStick(scene, {
    x: joyX,
    y: joyY,
    radius: JOYSTICK_RADIUS,
    base,
    thumb,
    dir: 'left&right',
    fixed: true,
    enable: true,
  });

  // Jump button (right side)
  const btnX = W - MARGIN - JUMP_BTN_RADIUS - 20;
  const btnY = H - MARGIN - JUMP_BTN_RADIUS - 20;

  const jumpCircle = scene.add.circle(btnX, btnY, JUMP_BTN_RADIUS, 0x4c6ef5, ALPHA_IDLE)
    .setScrollFactor(0)
    .setDepth(100)
    .setInteractive();

  scene.add.text(btnX, btnY, '▲', {
    fontSize: '22px', color: '#ffffff', fontFamily: 'monospace'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

  let _jumpDown = false;
  let _jumpConsumed = false;

  jumpCircle.on('pointerdown', () => {
    _jumpDown = true;
    _jumpConsumed = false;
    jumpCircle.setAlpha(ALPHA_ACTIVE);
  });
  jumpCircle.on('pointerup', () => {
    _jumpDown = false;
    jumpCircle.setAlpha(ALPHA_IDLE);
  });
  jumpCircle.on('pointerout', () => {
    _jumpDown = false;
    jumpCircle.setAlpha(ALPHA_IDLE);
  });

  joystick.on('update', () => {
    thumb.setAlpha(joystick.force > 0 ? ALPHA_ACTIVE : ALPHA_IDLE);
  });

  return {
    get left() { return joystick.left; },
    get right() { return joystick.right; },
    get jump() { return _jumpDown; },
    justJump() {
      if (_jumpDown && !_jumpConsumed) {
        _jumpConsumed = true;
        return true;
      }
      return false;
    },
  };
}
