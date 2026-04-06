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
  scene.score1 = 0; // Adam's final score (set when he dies)
  scene.score2 = 0; // Noah's final score (set when he dies)

  scene.scoreText = scene.add.text(12, 12, 'Score: 0', {
    fontSize: '18px', color: '#ffffff', fontFamily: 'monospace'
  }).setDepth(1);

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

export function showPlayerDead(scene, playerName, nameColor, score, x) {
  const groundY = scene.groundY;
  scene.add.text(x, groundY - 90, `${playerName} died`, {
    fontSize: '14px', color: nameColor, fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(2);

  scene.add.text(x, groundY - 72, `Score: ${score}`, {
    fontSize: '12px', color: '#ffffff', fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(2);
}

export function showGameOver(scene) {
  const cx = scene.scale.width / 2;
  const cy = scene.scale.height / 2;

  const adamScore = scene.score1;
  const noahScore = scene.score2;
  let winnerText;
  if (adamScore > noahScore) {
    winnerText = 'Adam wins!';
  } else if (noahScore > adamScore) {
    winnerText = 'Noah wins!';
  } else {
    winnerText = "It's a tie!";
  }

  scene.add.text(cx, cy - 80, 'GAME OVER', {
    fontSize: '48px', color: '#ff4444', fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(3);

  scene.add.text(cx, cy - 25, winnerText, {
    fontSize: '32px', color: '#ffff00', fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(3);

  scene.add.text(cx - 120, cy + 20, `Adam: ${adamScore}s`, {
    fontSize: '20px', color: '#00aaff', fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(3);

  scene.add.text(cx + 120, cy + 20, `Noah: ${noahScore}s`, {
    fontSize: '20px', color: '#00cc44', fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(3);

  scene.add.text(cx, cy + 60, 'Press R to restart', {
    fontSize: '20px', color: '#aaaaaa', fontFamily: 'monospace'
  }).setOrigin(0.5).setDepth(3);

  scene.input.keyboard.once('keydown-R', () => {
    scene.scene.restart();
  });
}
