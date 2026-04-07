// @ts-nocheck

import { getBest, saveBestIfBeaten } from './records.ts';
import { getWinnerName } from './audio-registry.ts';
import { getContentScale, getTextScale } from './scale.ts';

export function createTitle(scene) {
  const centerX = scene.scale.width / 2;
  const textScale = getTextScale(scene);
  scene.add.text(centerX, 18, 'SPIKE GAME', {
    fontSize: `${Math.round(20 * textScale)}px`, color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold'
  }).setOrigin(0.5, 0).setAlpha(0.7);

  scene.add.text(centerX, 42, 'by Adam & Noah', {
    fontSize: `${Math.round(13 * textScale)}px`, color: '#aaaaaa', fontFamily: 'monospace'
  }).setOrigin(0.5, 0).setAlpha(0.6);
}

export function createScore(scene) {
  const centerX = scene.scale.width / 2;
  const textScale = getTextScale(scene);
  scene.score = 0;
  scene.score1 = 0;
  scene.score2 = 0;

  // Live score (top center, below title)
  scene.scoreText = scene.add.text(centerX, 62, 'Score: 0', {
    fontSize: `${Math.round(18 * textScale)}px`, color: '#ffffff', fontFamily: 'monospace'
  }).setOrigin(0.5, 0).setDepth(1);

  // Best score labels (corners)
  scene.add.text(12, 12, 'Adam best: ' + getBest('adam'), {
    fontSize: `${Math.round(13 * textScale)}px`, color: scene.nameColor1 ?? '#00aaff', fontFamily: 'monospace'
  }).setDepth(1);

  scene.add.text(scene.scale.width - 12, 12, 'Noah best: ' + getBest('noah'), {
    fontSize: `${Math.round(13 * textScale)}px`, color: scene.nameColor2 ?? '#00cc44', fontFamily: 'monospace'
  }).setOrigin(1, 0).setDepth(1);

  scene.time.addEvent({
    delay: 1000,
    loop: true,
    callback: () => {
      if (!scene.gameOver) {
        scene.score++;
        scene.scoreText.setText('Score: ' + scene.score);
      }
    }
  });
}

export function createLivesHUD(scene) {
  const textScale = getTextScale(scene);
  // Adam lives (bottom-left)
  scene.livesTexts = {
    adam: scene.add.text(12, scene.groundY + 8, '❤️❤️❤️ Adam', {
      fontSize: `${Math.round(14 * textScale)}px`, color: scene.nameColor1 ?? '#00aaff', fontFamily: 'monospace'
    }).setDepth(2),
    noah: scene.add.text(scene.scale.width - 12, scene.groundY + 8, 'Noah ❤️❤️❤️', {
      fontSize: `${Math.round(14 * textScale)}px`, color: scene.nameColor2 ?? '#00cc44', fontFamily: 'monospace'
    }).setOrigin(1, 0).setDepth(2)
  };
}

export function updateLivesHUD(scene, adamLives, noahLives) {
  const max = scene.maxLives ?? 3;
  const hearts = n => '❤️'.repeat(Math.max(0, n)) + '🖤'.repeat(Math.max(0, max - n));
  scene.livesTexts.adam.setText(hearts(adamLives) + ' Adam');
  scene.livesTexts.noah.setText('Noah ' + hearts(noahLives));
}

export function showPlayerDead(scene, playerName, nameColor, score, x) {
  const textScale = getTextScale(scene);
  scene.add.text(x, scene.groundY - 90, `${playerName} died`, {
    fontSize: `${Math.round(14 * textScale)}px`, color: nameColor, fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(2);

  scene.add.text(x, scene.groundY - 72, `Score: ${score}s`, {
    fontSize: `${Math.round(12 * textScale)}px`, color: '#ffffff', fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(2);
}

export function showGameOver(scene) {
  const cx = scene.scale.width / 2;
  const cy = scene.scale.height / 2;
  const contentScale = getContentScale(scene);
  const textScale = getTextScale(scene);
  const statOffsetX = 130 * Math.min(contentScale, 1.25);
  const statLineGap = 24 * Math.min(textScale, 1.25);

  const adamScore = scene.score1;
  const noahScore = scene.score2;
  const adamNewBest = saveBestIfBeaten('adam', adamScore);
  const noahNewBest = saveBestIfBeaten('noah', noahScore);
  const winnerName = getWinnerName(adamScore, noahScore);

  let winnerText;
  if (winnerName === 'adam') {
    winnerText = 'Adam wins!';
  } else if (winnerName === 'noah') {
    winnerText = 'Noah wins!';
  } else {
    winnerText = "It's a tie!";
  }

  scene.audio.playForWinner(winnerName);

  scene.add.text(cx, cy - 90, 'GAME OVER', {
    fontSize: `${Math.round(48 * textScale)}px`, color: '#ff4444', fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(3);

  scene.add.text(cx, cy - 35, winnerText, {
    fontSize: `${Math.round(32 * textScale)}px`, color: '#ffff00', fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(3);

  // Adam score + optional new record badge
  scene.add.text(cx - statOffsetX, cy + 15, `Adam: ${adamScore}s`, {
    fontSize: `${Math.round(20 * textScale)}px`, color: '#00aaff', fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(3);
  if (adamNewBest) {
    scene.add.text(cx - statOffsetX, cy + 15 + statLineGap, '★ New best!', {
      fontSize: `${Math.round(13 * textScale)}px`, color: '#ffd700', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(3);
  } else {
    scene.add.text(cx - statOffsetX, cy + 15 + statLineGap, `Best: ${getBest('adam')}s`, {
      fontSize: `${Math.round(13 * textScale)}px`, color: '#aaaaaa', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(3);
  }

  // Noah score + optional new record badge
  scene.add.text(cx + statOffsetX, cy + 15, `Noah: ${noahScore}s`, {
    fontSize: `${Math.round(20 * textScale)}px`, color: '#00cc44', fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(3);
  if (noahNewBest) {
    scene.add.text(cx + statOffsetX, cy + 15 + statLineGap, '★ New best!', {
      fontSize: `${Math.round(13 * textScale)}px`, color: '#ffd700', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(3);
  } else {
    scene.add.text(cx + statOffsetX, cy + 15 + statLineGap, `Best: ${getBest('noah')}s`, {
      fontSize: `${Math.round(13 * textScale)}px`, color: '#aaaaaa', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(3);
  }

  scene.add.text(cx, cy + 70, 'Press R to restart', {
    fontSize: `${Math.round(20 * textScale)}px`, color: '#aaaaaa', fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(3);

  scene.input.keyboard.once('keydown-R', () => {
    scene.scene.restart();
  });
}
