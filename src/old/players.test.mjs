import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.Phaser = {
  Input: {
    Keyboard: {
      JustDown(key) {
        return Boolean(key?.justDown);
      },
    },
  },
};

const { getAdamInput, getPlayerBumpOutcome } = await import('./players.js');

function createScene({ axisX = 0, axisY = 0, buttonPressed = false, connected = true } = {}) {
  const pad = connected ? {
    connected: true,
    leftStick: { x: axisX, y: axisY },
    axes: [{ getValue: () => axisX }, { getValue: () => axisY }],
    buttons: [{ pressed: buttonPressed, value: buttonPressed ? 1 : 0 }],
    A: buttonPressed,
    isButtonDown(index) {
      return index === 0 ? buttonPressed : false;
    },
  } : null;

  return {
    input: {
      gamepad: {
        enabled: true,
        getPad(index) {
          return index === 0 ? pad : null;
        },
        getAll() {
          return pad ? [pad] : [];
        },
        gamepads: pad ? [pad] : [],
      },
    },
  };
}

function createWasd({ left = false, right = false, justDown = false } = {}) {
  return {
    left: { isDown: left },
    right: { isDown: right },
    up: { justDown },
  };
}

test('uses keyboard movement when no gamepad is connected', () => {
  const input = getAdamInput(createScene({ connected: false }), createWasd({ left: true, justDown: true }));
  assert.deepEqual(input, { left: true, right: false, jump: true });
});

test('uses left stick horizontal axis for Adam movement', () => {
  const input = getAdamInput(createScene({ axisX: 0.8 }), createWasd());
  assert.deepEqual(input, { left: false, right: true, jump: false });
});

test('merges keyboard and joystick movement sources', () => {
  const input = getAdamInput(createScene({ axisX: 0.8 }), createWasd({ left: true }));
  assert.deepEqual(input, { left: true, right: true, jump: false });
});

test('treats A button and stick-up as jump with fresh press detection', () => {
  const scene = createScene({ buttonPressed: true });

  assert.equal(getAdamInput(scene, createWasd()).jump, true);
  assert.equal(getAdamInput(scene, createWasd()).jump, false);

  const stickScene = createScene({ axisY: -0.9 });
  assert.equal(getAdamInput(stickScene, createWasd()).jump, true);
  assert.equal(getAdamInput(stickScene, createWasd()).jump, false);
});

test('falls back to the browser gamepad API when Phaser has no connected pad', () => {
  const originalNavigator = globalThis.navigator;
  const nativePad = {
    connected: true,
    axes: [0.9, -0.9],
    buttons: [
      { pressed: true, value: 1 },
      {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
      { pressed: false, value: 0 },
      { pressed: false, value: 0 },
      { pressed: false, value: 0 },
      { pressed: false, value: 0 },
    ],
  };

  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      getGamepads() {
        return [nativePad];
      },
    },
  });

  try {
    const scene = createScene({ connected: false });

    assert.deepEqual(getAdamInput(scene, createWasd()), { left: false, right: true, jump: true });
    assert.equal(getAdamInput(scene, createWasd()).jump, false);
  } finally {
    if (originalNavigator === undefined) {
      delete globalThis.navigator;
    } else {
      Object.defineProperty(globalThis, 'navigator', {
        configurable: true,
        value: originalNavigator,
      });
    }
  }
});

function createPlayerStub({ x, velocityX = 0, grounded = true } = {}) {
  return {
    x,
    body: {
      velocity: { x: velocityX },
      blocked: { down: grounded },
      touching: { down: grounded },
    },
  };
}

function createBumpScene({ now = 1000, lastBumpAt = -Infinity, gameOver = false, player1Dead = false, player2Dead = false } = {}) {
  return {
    time: { now },
    _lastPlayerBumpAt: lastBumpAt,
    gameOver,
    player1Dead,
    player2Dead,
  };
}

test('side hit on the ground shoves the defender', () => {
  const scene = createBumpScene();
  const player1 = createPlayerStub({ x: 100, velocityX: 220 });
  const player2 = createPlayerStub({ x: 124, velocityX: 0 });

  const outcome = getPlayerBumpOutcome(scene, player1, player2);

  assert.equal(outcome?.attacker, player1);
  assert.equal(outcome?.defender, player2);
  assert.equal(outcome?.direction, 1);
});

test('head-on collisions do not trigger a shove', () => {
  const scene = createBumpScene();
  const player1 = createPlayerStub({ x: 100, velocityX: 220 });
  const player2 = createPlayerStub({ x: 124, velocityX: -220 });

  assert.equal(getPlayerBumpOutcome(scene, player1, player2), null);
});

test('airborne collisions do not trigger a shove', () => {
  const scene = createBumpScene();
  const player1 = createPlayerStub({ x: 100, velocityX: 220, grounded: false });
  const player2 = createPlayerStub({ x: 124, velocityX: 0, grounded: true });

  assert.equal(getPlayerBumpOutcome(scene, player1, player2), null);
});

test('bump cooldown prevents repeated shove spam', () => {
  const scene = createBumpScene({ now: 1000, lastBumpAt: 900 });
  const player1 = createPlayerStub({ x: 100, velocityX: 220 });
  const player2 = createPlayerStub({ x: 124, velocityX: 0 });

  assert.equal(getPlayerBumpOutcome(scene, player1, player2), null);
});
