import { getBest, saveBestIfBeaten } from './records.js';
import { getWinnerName } from './audio-registry.js';

export function createTitle(scene) {
  scene.add.text(400, 18, 'SPIKE GAME', {
    fontSize: '20px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold'
  }).setOrigin(0.5, 0).setAlpha(0.7);

  scene.add.text(400, 42, 'by Adam & Noah', {
    fontSize: '13px', color: '#aaaaaa', fontFamily: 'monospace'
  }).setOrigin(0.5, 0).setAlpha(0.6);
}

export function createScore(scene) {
  scene.score = 0;
  scene.score1 = 0;
  scene.score2 = 0;

  // Live score (top center, below title)
  scene.scoreText = scene.add.text(400, 62, 'Score: 0', {
    fontSize: '18px', color: '#ffffff', fontFamily: 'monospace'
  }).setOrigin(0.5, 0).setDepth(1);

  // Best score labels (corners)
  scene.add.text(12, 12, 'Adam best: ' + getBest('adam'), {
    fontSize: '13px', color: scene.nameColor1 ?? '#00aaff', fontFamily: 'monospace'
  }).setDepth(1);

  scene.add.text(788, 12, 'Noah best: ' + getBest('noah'), {
    fontSize: '13px', color: scene.nameColor2 ?? '#00cc44', fontFamily: 'monospace'
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
  // Adam lives (bottom-left)
  scene.livesTexts = {
    adam: scene.add.text(12, scene.groundY + 8, '❤️❤️❤️ Adam', {
      fontSize: '14px', color: scene.nameColor1 ?? '#00aaff', fontFamily: 'monospace'
    }).setDepth(2),
    noah: scene.add.text(788, scene.groundY + 8, 'Noah ❤️❤️❤️', {
      fontSize: '14px', color: scene.nameColor2 ?? '#00cc44', fontFamily: 'monospace'
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
  scene.add.text(x, scene.groundY - 90, `${playerName} died`, {
    fontSize: '14px', color: nameColor, fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(2);

  scene.add.text(x, scene.groundY - 72, `Score: ${score}s`, {
    fontSize: '12px', color: '#ffffff', fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(2);
}

export function showGameOver(scene) {
  const cx = scene.scale.width / 2;
  const cy = scene.scale.height / 2;

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
    fontSize: '48px', color: '#ff4444', fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(3);

  scene.add.text(cx, cy - 35, winnerText, {
    fontSize: '32px', color: '#ffff00', fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(3);

  // Adam score + optional new record badge
  scene.add.text(cx - 130, cy + 15, `Adam: ${adamScore}s`, {
    fontSize: '20px', color: '#00aaff', fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(3);
  if (adamNewBest) {
    scene.add.text(cx - 130, cy + 35, '★ New best!', {
      fontSize: '13px', color: '#ffd700', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(3);
  } else {
    scene.add.text(cx - 130, cy + 35, `Best: ${getBest('adam')}s`, {
      fontSize: '13px', color: '#aaaaaa', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(3);
  }

  // Noah score + optional new record badge
  scene.add.text(cx + 130, cy + 15, `Noah: ${noahScore}s`, {
    fontSize: '20px', color: '#00cc44', fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(3);
  if (noahNewBest) {
    scene.add.text(cx + 130, cy + 35, '★ New best!', {
      fontSize: '13px', color: '#ffd700', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(3);
  } else {
    scene.add.text(cx + 130, cy + 35, `Best: ${getBest('noah')}s`, {
      fontSize: '13px', color: '#aaaaaa', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(3);
  }

  scene.add.text(cx, cy + 70, 'Press R to restart', {
    fontSize: '20px', color: '#aaaaaa', fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(3);

  scene.input.keyboard.once('keydown-R', () => {
    scene.scene.restart();
  });
}
