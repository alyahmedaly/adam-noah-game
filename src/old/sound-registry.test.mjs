import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PLAYER_SOUND_EVENTS,
  getPlayerName,
  getPlayerSoundDefinition,
  getRegisteredPlayerSounds,
  getWinnerName,
} from './audio-registry.js';

test('maps player numbers to stable player names', () => {
  assert.equal(getPlayerName(1), 'adam');
  assert.equal(getPlayerName(2), 'noah');
  assert.equal(getPlayerName(999), null);
});

test('reports the winner name from final scores', () => {
  assert.equal(getWinnerName(9, 3), 'adam');
  assert.equal(getWinnerName(2, 7), 'noah');
  assert.equal(getWinnerName(5, 5), null);
});

test('returns only registered wav-backed sounds', () => {
  const registered = getRegisteredPlayerSounds();

  assert.ok(registered.length >= 12);
  assert.deepEqual(
    getPlayerSoundDefinition('adam', PLAYER_SOUND_EVENTS.WIN),
    {
      key: 'adam.win',
      path: 'sounds/adam/win.wav',
    }
  );
  assert.deepEqual(
    getPlayerSoundDefinition('adam', PLAYER_SOUND_EVENTS.BUMP),
    {
      key: 'adam.bump',
      path: 'sounds/adam/adam-touch-noah.wav',
    }
  );
  assert.equal(getPlayerSoundDefinition('adam', PLAYER_SOUND_EVENTS.JUMP), null);
  assert.ok(registered.every((sound) => sound.path.endsWith('.wav')));
});
