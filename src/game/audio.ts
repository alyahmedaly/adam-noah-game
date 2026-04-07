// @ts-nocheck
import {
  PLAYER_SOUND_EVENTS,
  getPlayerName,
  getPlayerSoundDefinition,
  getRegisteredPlayerSounds,
} from './audio-registry.ts';

function playHandle(sound) {
  if (!sound) return;

  if (sound.isPlaying) {
    sound.stop();
  }

  sound.play();
}

export function preloadSceneAudio(scene) {
  for (const sound of getRegisteredPlayerSounds()) {
    scene.load.audio(sound.key, sound.path);
  }
}

export function attachSceneAudio(scene) {
  const handles = new Map();

  for (const sound of getRegisteredPlayerSounds()) {
    handles.set(sound.key, scene.sound.add(sound.key));
  }

  scene.audio = {
    playForPlayer(playerNum, eventName) {
      const playerName = getPlayerName(playerNum);
      if (!playerName) return;

      this.playForName(playerName, eventName);
    },
    playForName(playerName, eventName) {
      const definition = getPlayerSoundDefinition(playerName, eventName);
      if (!definition) return;

      playHandle(handles.get(definition.key));
    },
    playForWinner(winnerName) {
      if (!winnerName) return;

      this.playForName(winnerName, PLAYER_SOUND_EVENTS.WIN);
    },
  };

  return scene.audio;
}

export { PLAYER_SOUND_EVENTS };
