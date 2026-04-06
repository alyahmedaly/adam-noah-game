export const PLAYER_SOUND_BANKS = {
  adam: {
    dies: {
      key: 'adam.dies',
      path: 'sounds/adam/dies.wav',
    },
    hurt: {
      key: 'adam.hurt',
      path: 'sounds/adam/spike-hit.wav',
    },
    luckyBlock: {
      key: 'adam.luckyBlock',
      path: 'sounds/adam/lucky-block.wav',
    },
    heartAdded: {
      key: 'adam.heartAdded',
      path: 'sounds/adam/heart-added.wav',
    },
    jump: null,
    win: {
      key: 'adam.win',
      path: 'sounds/adam/win.wav',
    },
  },
  noah: {
    dies: {
      key: 'noah.dies',
      path: 'sounds/noah/dies.wav',
    },
    hurt: {
      key: 'noah.hurt',
      path: 'sounds/noah/spike-hit.wav',
    },
    luckyBlock: {
      key: 'noah.luckyBlock',
      path: 'sounds/noah/lucky-block.wav',
    },
    heartAdded: {
      key: 'noah.heartAdded',
      path: 'sounds/noah/heart-added.wav',
    },
    jump: null,
    win: {
      key: 'noah.win',
      path: 'sounds/noah/win.wav',
    },
  },
};

export function preloadPlayerSounds(scene) {
  for (const bank of Object.values(PLAYER_SOUND_BANKS)) {
    for (const sound of Object.values(bank)) {
      if (!sound) continue;
      scene.load.audio(sound.key, sound.path);
    }
  }
}

export function createPlayerSoundHandles(scene) {
  const handles = {};

  for (const [playerName, bank] of Object.entries(PLAYER_SOUND_BANKS)) {
    handles[playerName] = {};

    for (const [eventName, sound] of Object.entries(bank)) {
      handles[playerName][eventName] = sound ? scene.sound.add(sound.key) : null;
    }
  }

  return handles;
}

export function playPlayerSound(scene, playerName, eventName) {
  const sound = scene.playerSounds?.[playerName]?.[eventName];
  if (!sound) return;

  if (sound.isPlaying) {
    sound.stop();
  }

  sound.play();
}
