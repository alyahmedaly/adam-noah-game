import test from 'node:test';
import assert from 'node:assert/strict';

import { createTouchState } from './touch-state.ts';

test('movement touch tracks left and right as the pointer moves', () => {
  const touch = createTouchState({ movementCenterX: 100 });

  touch.startMovementPointer(1, 60);
  assert.equal(touch.left, true);
  assert.equal(touch.right, false);

  touch.moveMovementPointer(1, 140);
  assert.equal(touch.left, false);
  assert.equal(touch.right, true);

  touch.releasePointer(1);
  assert.equal(touch.left, false);
  assert.equal(touch.right, false);
});

test('button touches are one-shot but remain held until the final pointer releases', () => {
  const touch = createTouchState({ movementCenterX: 100 });

  touch.pressAction('jump', 2);
  assert.equal(touch.jump, true);
  assert.equal(touch.consumeAction('jump'), true);
  assert.equal(touch.consumeAction('jump'), false);

  touch.pressAction('jump', 3);
  touch.releasePointer(2);
  assert.equal(touch.jump, true);

  touch.releasePointer(3);
  assert.equal(touch.jump, false);
});

test('shoot presses stay independent from movement touches', () => {
  const touch = createTouchState({ movementCenterX: 100 });

  touch.startMovementPointer(1, 50);
  touch.pressAction('shoot', 4);

  assert.equal(touch.left, true);
  assert.equal(touch.shoot, true);
  assert.equal(touch.consumeAction('shoot'), true);

  touch.releasePointer(4);
  assert.equal(touch.left, true);
  assert.equal(touch.shoot, false);
});

test('clear releases every active touch state at once', () => {
  const touch = createTouchState({ movementCenterX: 100 });

  touch.startMovementPointer(1, 60);
  touch.pressAction('jump', 2);
  touch.pressAction('shoot', 3);

  touch.clear();

  assert.equal(touch.left, false);
  assert.equal(touch.right, false);
  assert.equal(touch.jump, false);
  assert.equal(touch.shoot, false);
  assert.equal(touch.consumeAction('jump'), false);
  assert.equal(touch.consumeAction('shoot'), false);
});
