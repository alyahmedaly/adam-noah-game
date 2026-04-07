import test from 'node:test';
import assert from 'node:assert/strict';

import { bombsEnabledForDifficulty, handleBombContact } from './spikes.ts';

test('bombs spawn only in normal and ninja difficulties', () => {
  assert.equal(bombsEnabledForDifficulty('noob'), false);
  assert.equal(bombsEnabledForDifficulty('normal'), true);
  assert.equal(bombsEnabledForDifficulty('ninja'), true);
});

function createBombScene({ starModeActive = false } = {}) {
  let damagedPlayer = null;
  return {
    player1: {
      starModeActive,
      body: { velocity: { y: -180 } },
    },
    player2: {
      starModeActive: false,
      body: { velocity: { y: 0 } },
    },
    loseLife(playerNum: number) {
      damagedPlayer = playerNum;
    },
    getDamagedPlayer() {
      return damagedPlayer;
    },
    cameras: {
      main: {
        shake() {},
      },
    },
  };
}

test('jumping upward into a bomb destroys it', () => {
  let destroyed = false;
  const scene = createBombScene();
  const bomb = {
    destroy() {
      destroyed = true;
    },
  };

  handleBombContact(scene, 1, bomb);

  assert.equal(destroyed, true);
  assert.equal(scene.getDamagedPlayer(), null);
});

test('non-jump bomb contact damages the player', () => {
  let destroyed = false;
  const scene = createBombScene();
  scene.player2.body.velocity.y = 40;
  const bomb = {
    destroy() {
      destroyed = true;
    },
  };

  handleBombContact(scene, 2, bomb);

  assert.equal(destroyed, true);
  assert.equal(scene.getDamagedPlayer(), 2);
});

test('star mode destroys bombs safely on contact', () => {
  let destroyed = false;
  const scene = createBombScene({ starModeActive: true });
  scene.player1.body.velocity.y = 30;
  const bomb = {
    destroy() {
      destroyed = true;
    },
  };

  handleBombContact(scene, 1, bomb);

  assert.equal(destroyed, true);
  assert.equal(scene.getDamagedPlayer(), null);
});
