import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createIntensityController,
  getBossRageMultiplier,
  updateIntensityController,
} from './intensity.ts';

function createScene(score = 0) {
  return {
    score,
    time: { now: 0 },
    scale: { width: 1280, height: 720 },
    add: {
      text() {
        return {
          setOrigin() { return this; },
          setDepth() { return this; },
          destroy() {},
        };
      },
    },
    cameras: {
      main: {
        flash() {},
        shake() {},
      },
    },
    tweens: {
      add() {},
    },
  };
}

test('maps score thresholds to escalation phases', () => {
  const calm = createScene(0);
  createIntensityController(calm);

  assert.equal(calm.intensity.phase, 'calm');

  const heat = createScene(15);
  createIntensityController(heat);
  updateIntensityController(heat);
  assert.equal(heat.intensity.phase, 'heat');

  const danger = createScene(30);
  createIntensityController(danger);
  updateIntensityController(danger);
  assert.equal(danger.intensity.phase, 'danger');

  const chaos = createScene(50);
  createIntensityController(chaos);
  updateIntensityController(chaos);
  assert.equal(chaos.intensity.phase, 'chaos');
});

test('exposes stable settings for each phase', () => {
  const scene = createScene(30);
  createIntensityController(scene);
  updateIntensityController(scene);

  assert.equal(typeof scene.intensity.settings.damageShake, 'number');
  assert.equal(typeof scene.intensity.settings.spikePulse, 'number');
  assert.equal(scene.intensity.settings.damageShake > 0, true);
});

test('uses deterministic chaos modifier pools by phase', () => {
  const scene = createScene(50);
  createIntensityController(scene);
  scene.time.now = 1000;
  updateIntensityController(scene);

  assert.ok(scene.intensity.activeModifier);
  assert.equal(typeof getBossRageMultiplier(scene), 'number');
  assert.equal(getBossRageMultiplier(scene) >= 1, true);
});
