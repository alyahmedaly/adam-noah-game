import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { getGameViewportSize } from './viewport.ts';

test('portrait phone viewports keep their native dimensions', () => {
  assert.deepEqual(getGameViewportSize(390, 844), { width: 390, height: 844 });
});

test('mobile stylesheet no longer rotates the entire page in portrait', () => {
  const css = readFileSync(new URL('../../public/style.css', import.meta.url), 'utf8');

  assert.equal(css.includes('transform: rotate(90deg)'), false);
});
