const KEYS = { adam: 'spikegame_best_adam', noah: 'spikegame_best_noah' };

export function getBest(player) {
  return parseInt(localStorage.getItem(KEYS[player]) || '0', 10);
}

export function saveBestIfBeaten(player, score) {
  const prev = getBest(player);
  if (score > prev) {
    localStorage.setItem(KEYS[player], score);
    return true; // new record
  }
  return false;
}
