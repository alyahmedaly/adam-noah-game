import test from 'node:test';
import assert from 'node:assert/strict';

import { getLivingPlayers } from './participants.ts';
import { updatePistol } from './pistol.ts';
import { createLivesHUD } from './ui.ts';

globalThis.Phaser = {
  Geom: {
    Intersects: {
      RectangleToRectangle() {
        return false;
      },
    },
  },
  Input: {
    Keyboard: {
      KeyCodes: {
        R: 82,
        L: 76,
      },
    },
  },
} as never;

test('living player helpers ignore missing single-player slots', () => {
  const scene = {
    mobilePlayer: 'adam',
    player1: { x: 120 },
    player2: null,
    player1Dead: false,
    player2Dead: false,
  };

  assert.deepEqual(
    getLivingPlayers(scene).map(({ num, player }) => [num, player.x]),
    [[1, 120]]
  );
});

test('createLivesHUD reflects the configured max lives immediately', () => {
  const scene = createUiScene({ maxLives: 5, lives1: 5, lives2: 5 });

  createLivesHUD(scene);

  assert.equal(scene.livesTexts.adam.text, '❤️❤️❤️❤️❤️ Adam');
  assert.equal(scene.livesTexts.noah.text, 'Noah ❤️❤️❤️❤️❤️');
});

test('updatePistol lets the mobile player shoot with touch controls', () => {
  const bullets = [];
  const scene = {
    time: { now: 500 },
    mobilePlayer: 'adam',
    hasPistol1: true,
    hasPistol2: false,
    lastShot1: 0,
    player1Dead: false,
    player2Dead: true,
    player1: { x: 50, y: 80 },
    boss: {
      active: true,
      x: 120,
      getBounds() {
        return {};
      },
    },
    bullets: {
      create(x, y, key) {
        const bullet = createBulletStub(x, y, key);
        bullets.push(bullet);
        return bullet;
      },
      getChildren() {
        return bullets;
      },
    },
    scale: { width: 800, height: 400 },
    input: {
      keyboard: {
        addKey() {
          return { isDown: false };
        },
      },
    },
  };

  updatePistol(scene, null, null, {
    justShoot() {
      return true;
    },
  }, 'adam');

  assert.equal(bullets.length, 1);
  assert.equal(bullets[0].velocityX > 0, true);
});

function createUiScene({ maxLives, lives1, lives2 }) {
  return {
    maxLives,
    lives1,
    lives2,
    groundY: 360,
    scale: { width: 800, height: 400 },
    add: {
      text(_x, _y, text) {
        return createTextStub(text);
      },
    },
  };
}

function createTextStub(text) {
  return {
    text,
    setDepth() {
      return this;
    },
    setOrigin() {
      return this;
    },
    setText(nextText) {
      this.text = nextText;
      return this;
    },
  };
}

function createBulletStub(x, y, key) {
  return {
    x,
    y,
    key,
    active: true,
    velocityX: 0,
    velocityY: 0,
    setScale() {
      return this;
    },
    setGravityY() {
      return this;
    },
    setDepth() {
      return this;
    },
    setVelocityX(nextVelocityX) {
      this.velocityX = nextVelocityX;
      return this;
    },
    setVelocityY(nextVelocityY) {
      this.velocityY = nextVelocityY;
      return this;
    },
    setFlipX() {
      return this;
    },
    getBounds() {
      return {};
    },
    destroy() {
      this.active = false;
    },
  };
}
