type SceneLike = {
  mobilePlayer?: 'adam' | 'noah' | null;
  player1?: unknown;
  player2?: unknown;
  player1Dead?: boolean;
  player2Dead?: boolean;
};

type LivingPlayer = {
  num: 1 | 2;
  player: any;
};

const PLAYER_SLOTS = [
  { num: 1 as const, mobileKey: 'adam' as const, playerProp: 'player1' as const, deadProp: 'player1Dead' as const },
  { num: 2 as const, mobileKey: 'noah' as const, playerProp: 'player2' as const, deadProp: 'player2Dead' as const },
];

export function getLivingPlayers(scene: SceneLike): LivingPlayer[] {
  return PLAYER_SLOTS.flatMap((slot) => {
    const player = scene[slot.playerProp];

    if (!player) return [];
    if (scene.mobilePlayer && scene.mobilePlayer !== slot.mobileKey) return [];
    if (scene[slot.deadProp]) return [];

    return [{ num: slot.num, player }];
  });
}
