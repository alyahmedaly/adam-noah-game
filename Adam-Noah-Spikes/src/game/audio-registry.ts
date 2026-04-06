// @ts-nocheck
export const PLAYER_SOUND_EVENTS = Object.freeze({
  DIES: 'dies',
  HURT: 'hurt',
  LUCKY_BLOCK: 'luckyBlock',
  HEART_ADDED: 'heartAdded',
  BUMP: 'bump',
  JUMP: 'jump',
  WIN: 'win',
});

const PLAYER_NAMES_BY_NUMBER = Object.freeze({
  1: 'adam',
  2: 'noah',
});

const PLAYER_SOUND_FILES = Object.freeze({
  adam: Object.freeze({
    [PLAYER_SOUND_EVENTS.DIES]: 'sounds/adam/dies.wav',
    [PLAYER_SOUND_EVENTS.HURT]: 'sounds/adam/spike-hit.wav',
    [PLAYER_SOUND_EVENTS.LUCKY_BLOCK]: 'sounds/adam/lucky-block.wav',
    [PLAYER_SOUND_EVENTS.HEART_ADDED]: 'sounds/adam/heart-added.wav',
    [PLAYER_SOUND_EVENTS.BUMP]: 'sounds/adam/adam-touch-noah.wav',
    [PLAYER_SOUND_EVENTS.JUMP]: null,
    [PLAYER_SOUND_EVENTS.WIN]: 'sounds/adam/win.wav',
  }),
  noah: Object.freeze({
    [PLAYER_SOUND_EVENTS.DIES]: 'sounds/noah/dies.wav',
    [PLAYER_SOUND_EVENTS.HURT]: 'sounds/noah/spike-hit.wav',
    [PLAYER_SOUND_EVENTS.LUCKY_BLOCK]: 'sounds/noah/lucky-block.wav',
    [PLAYER_SOUND_EVENTS.HEART_ADDED]: 'sounds/noah/heart-added.wav',
    [PLAYER_SOUND_EVENTS.BUMP]: 'sounds/noah/noah-touch-adam.wav',
    [PLAYER_SOUND_EVENTS.JUMP]: null,
    [PLAYER_SOUND_EVENTS.WIN]: 'sounds/noah/win.wav',
  }),
});

export const PLAYER_SOUND_REGISTRY = Object.freeze(
  Object.fromEntries(
    Object.entries(PLAYER_SOUND_FILES).map(([playerName, events]) => [
      playerName,
      Object.freeze(
        Object.fromEntries(
          Object.entries(events).map(([eventName, path]) => [
            eventName,
            path ? { key: `${playerName}.${eventName}`, path } : null,
          ])
        )
      ),
    ])
  )
);

export function getPlayerName(playerNum) {
  return PLAYER_NAMES_BY_NUMBER[playerNum] ?? null;
}

export function getWinnerName(adamScore, noahScore) {
  if (adamScore > noahScore) return 'adam';
  if (noahScore > adamScore) return 'noah';
  return null;
}

export function getPlayerSoundDefinition(playerName, eventName) {
  return PLAYER_SOUND_REGISTRY[playerName]?.[eventName] ?? null;
}

export function getRegisteredPlayerSounds() {
  return Object.values(PLAYER_SOUND_REGISTRY).flatMap((events) =>
    Object.values(events).filter(Boolean)
  );
}
