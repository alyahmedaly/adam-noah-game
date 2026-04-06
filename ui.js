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

export function showGameOver(scene, winnerText) {
  const cx = scene.scale.width / 2;
  const cy = scene.scale.height / 2;

  scene.add.text(cx, cy - 70, 'GAME OVER', {
    fontSize: '48px', color: '#ff4444', fontFamily: 'monospace'
  }).setOrigin(0.5);

  scene.add.text(cx, cy - 15, winnerText, {
    fontSize: '32px', color: '#ffff00', fontFamily: 'monospace'
  }).setOrigin(0.5);

  scene.add.text(cx, cy + 25, 'Score: ' + scene.score, {
    fontSize: '24px', color: '#ffffff', fontFamily: 'monospace'
  }).setOrigin(0.5);

  scene.add.text(cx, cy + 60, 'Press R to restart', {
    fontSize: '20px', color: '#aaaaaa', fontFamily: 'monospace'
  }).setOrigin(0.5);

  scene.input.keyboard.once('keydown-R', () => {
    scene.scene.restart();
  });
}
