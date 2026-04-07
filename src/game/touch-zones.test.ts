import test from 'node:test';
import assert from 'node:assert/strict';

import { getTouchLayout, getTouchRegionAtPoint } from './touch-zones.ts';

test('movement touches split left and right inside the move zone', () => {
  const layout = getTouchLayout(390, 844);

  assert.equal(
    getTouchRegionAtPoint(390, 844, layout.leftPad.x, layout.leftPad.y),
    'left'
  );
  assert.equal(
    getTouchRegionAtPoint(390, 844, layout.rightPad.x, layout.rightPad.y),
    'right'
  );
});

test('action touches map to jump and shoot buttons', () => {
  const layout = getTouchLayout(390, 844);

  assert.equal(
    getTouchRegionAtPoint(390, 844, layout.jumpButton.x, layout.jumpButton.y),
    'jump'
  );
  assert.equal(
    getTouchRegionAtPoint(390, 844, layout.shootButton.x, layout.shootButton.y),
    'shoot'
  );
});

test('touches outside the control regions do not trigger actions', () => {
  assert.equal(getTouchRegionAtPoint(390, 844, 195, 120), null);
});
