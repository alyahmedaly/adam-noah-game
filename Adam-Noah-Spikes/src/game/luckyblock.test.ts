import test from 'node:test';
import assert from 'node:assert/strict';

import { LUCKY_BLOCK_EFFECTS, pickLuckyBlockEffect, handleLuckyBlockSpikeContact } from './luckyblock.ts';

test('boss-active ninja lucky blocks always give the pistol effect', () => {
  assert.equal(
    pickLuckyBlockEffect({ difficulty: 'ninja', bossActive: true, randomValue: 0.99 }),
    LUCKY_BLOCK_EFFECTS.PISTOL
  );
});

test('non-boss lucky blocks usually clear spikes', () => {
  assert.equal(
    pickLuckyBlockEffect({ difficulty: 'normal', bossActive: false, randomValue: 0.2 }),
    LUCKY_BLOCK_EFFECTS.SPIKE_CLEAR
  );
});

test('non-boss lucky blocks can temporarily grow the player', () => {
  assert.equal(
    pickLuckyBlockEffect({ difficulty: 'normal', bossActive: false, randomValue: 0.7 }),
    LUCKY_BLOCK_EFFECTS.GROW
  );
});

test('non-boss lucky blocks can trigger star mode', () => {
  assert.equal(
    pickLuckyBlockEffect({ difficulty: 'normal', bossActive: false, randomValue: 0.9 }),
    LUCKY_BLOCK_EFFECTS.STAR
  );
});

test('star mode destroys spikes instead of damaging the player', () => {
  let lostLife = false;
  let destroyed = false;
  const scene = {
    player1: { starModeActive: true },
    player2: { starModeActive: false },
    loseLife(playerNum: number) {
      lostLife = playerNum === 1;
    },
  };
  const spike = {
    destroy() {
      destroyed = true;
    },
  };

  handleLuckyBlockSpikeContact(scene, 1, spike);

  assert.equal(destroyed, true);
  assert.equal(lostLife, false);
});

test('without star mode spike contact still damages the player', () => {
  let lostLife = false;
  const scene = {
    player1: { starModeActive: false },
    player2: { starModeActive: false },
    loseLife(playerNum: number) {
      lostLife = playerNum === 2;
    },
  };

  handleLuckyBlockSpikeContact(scene, 2, { destroy() {} });

  assert.equal(lostLife, true);
});
