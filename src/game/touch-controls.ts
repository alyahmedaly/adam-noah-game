// @ts-nocheck
import { createTouchState } from './touch-state.ts';
import { getTouchLayout, getTouchRegionAtPoint } from './touch-zones.ts';

const ALPHA_IDLE = 0.35;
const ALPHA_ACTIVE = 0.7;

export interface TouchInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  shoot: boolean;
  justJump: () => boolean;
  justShoot: () => boolean;
}

export function createTouchControls(scene: Phaser.Scene): TouchInput {
  const W = scene.scale.width;
  const H = scene.scale.height;
  const layout = getTouchLayout(W, H);
  const touch = createTouchState({ movementCenterX: layout.moveZone.centerX });
  const getPointerId = (pointer) => pointer?.id ?? pointer?.pointerId ?? 0;
  const syncMovementVisuals = () => {
    leftPad.setAlpha(touch.left ? ALPHA_ACTIVE : ALPHA_IDLE);
    rightPad.setAlpha(touch.right ? ALPHA_ACTIVE : ALPHA_IDLE);
  };
  const syncActionVisuals = () => {
    jumpCircle.setAlpha(touch.jump ? ALPHA_ACTIVE : ALPHA_IDLE);
    shootCircle.setAlpha(touch.shoot ? ALPHA_ACTIVE : ALPHA_IDLE);
  };

  const leftPad = scene.add.circle(layout.leftPad.x, layout.leftPad.y, layout.leftPad.radius, 0xffffff, ALPHA_IDLE)
    .setScrollFactor(0)
    .setDepth(100);
  const rightPad = scene.add.circle(layout.rightPad.x, layout.rightPad.y, layout.rightPad.radius, 0xffffff, ALPHA_IDLE)
    .setScrollFactor(0)
    .setDepth(101);
  scene.add.text(leftPad.x, leftPad.y, '◀', {
    fontSize: '20px', color: '#ffffff', fontFamily: 'monospace'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(103);
  scene.add.text(rightPad.x, rightPad.y, '▶', {
    fontSize: '20px', color: '#ffffff', fontFamily: 'monospace'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(103);

  // Jump button (right side)
  const jumpCircle = scene.add.circle(
    layout.jumpButton.x,
    layout.jumpButton.y,
    layout.jumpButton.radius,
    0x4c6ef5,
    ALPHA_IDLE
  )
    .setScrollFactor(0)
    .setDepth(100);

  scene.add.text(layout.jumpButton.x, layout.jumpButton.y, '▲', {
    fontSize: '22px', color: '#ffffff', fontFamily: 'monospace'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

  const shootCircle = scene.add.circle(
    layout.shootButton.x,
    layout.shootButton.y,
    layout.shootButton.radius,
    0xff6b6b,
    ALPHA_IDLE
  )
    .setScrollFactor(0)
    .setDepth(100);

  scene.add.text(layout.shootButton.x, layout.shootButton.y, 'F', {
    fontSize: '20px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold'
  }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

  const handlePointerDown = (pointer) => {
    const region = getTouchRegionAtPoint(W, H, pointer.x, pointer.y);
    const pointerId = getPointerId(pointer);

    if (region === 'left' || region === 'right') {
      touch.startMovementPointer(pointerId, pointer.x);
    } else if (region === 'jump' || region === 'shoot') {
      touch.pressAction(region, pointerId);
    }

    syncMovementVisuals();
    syncActionVisuals();
  };

  const handlePointerUp = (pointer) => {
    touch.releasePointer(getPointerId(pointer));
    syncMovementVisuals();
    syncActionVisuals();
  };

  scene.input.on('pointerdown', handlePointerDown);
  scene.input.on('pointermove', (pointer) => {
    touch.moveMovementPointer(getPointerId(pointer), pointer.x);
    syncMovementVisuals();
  });
  scene.input.on('pointerup', handlePointerUp);
  scene.input.on('pointerupoutside', handlePointerUp);
  scene.input.on('gameout', () => {
    touch.clear();
    syncMovementVisuals();
    syncActionVisuals();
  });

  return {
    get left() { return touch.left; },
    get right() { return touch.right; },
    get jump() { return touch.jump; },
    get shoot() { return touch.shoot; },
    justJump() {
      return touch.consumeAction('jump');
    },
    justShoot() {
      return touch.consumeAction('shoot');
    },
  };
}
