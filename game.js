export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {}

  create() {
    // Starfield background
    const starGfx = this.add.graphics();
    for (let i = 0; i < 80; i++) {
      starGfx.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.3, 1));
      starGfx.fillCircle(
        Phaser.Math.Between(0, 797),
        Phaser.Math.Between(0, 355),
        Phaser.Math.FloatBetween(1, 2.5)
      );
    }

    // Ground
    this.groundY = 360;
    const groundY = this.groundY;
    const groundHeight = 40;

    const groundGfx = this.add.graphics();
    groundGfx.fillStyle(0x4a4a6a, 1);
    groundGfx.fillRect(0, groundY, 800, groundHeight);

    this.ground = this.physics.add.staticGroup();
    const groundBody = this.ground.create(400, groundY + groundHeight / 2, null);
    groundBody.setSize(800, groundHeight);
    groundBody.refreshBody();

    const PLAYER_H = 48;

    // Player 1 texture — blue outfit
    const p1Gfx = this.make.graphics({ x: 0, y: 0, add: false });
    p1Gfx.fillStyle(0xffd700, 1);
    p1Gfx.fillCircle(12, 7, 7);
    p1Gfx.fillStyle(0x00aaff, 1);
    p1Gfx.fillRect(7, 14, 10, 16);
    p1Gfx.fillRect(1, 14, 6, 4);
    p1Gfx.fillRect(17, 14, 6, 4);
    p1Gfx.fillStyle(0x333333, 1);
    p1Gfx.fillRect(7, 30, 4, 18);
    p1Gfx.fillRect(13, 30, 4, 18);
    p1Gfx.generateTexture('player1', 24, PLAYER_H);
    p1Gfx.destroy();

    // Player 2 texture — green outfit
    const p2Gfx = this.make.graphics({ x: 0, y: 0, add: false });
    p2Gfx.fillStyle(0xffd700, 1);
    p2Gfx.fillCircle(12, 7, 7);
    p2Gfx.fillStyle(0x00cc44, 1);
    p2Gfx.fillRect(7, 14, 10, 16);
    p2Gfx.fillRect(1, 14, 6, 4);
    p2Gfx.fillRect(17, 14, 6, 4);
    p2Gfx.fillStyle(0x333333, 1);
    p2Gfx.fillRect(7, 30, 4, 18);
    p2Gfx.fillRect(13, 30, 4, 18);
    p2Gfx.generateTexture('player2', 24, PLAYER_H);
    p2Gfx.destroy();

    // Player 1 — WASD + W to jump (starts left)
    this.player1 = this.physics.add.sprite(100, groundY - PLAYER_H / 2, 'player1');
    this.player1.setBounce(0);
    this.player1.setCollideWorldBounds(true);
    this.physics.add.collider(this.player1, this.ground);

    // Player 2 — Arrow keys + Up to jump (starts right)
    this.player2 = this.physics.add.sprite(700, groundY - PLAYER_H / 2, 'player2');
    this.player2.setBounce(0);
    this.player2.setCollideWorldBounds(true);
    this.physics.add.collider(this.player2, this.ground);

    // Input
    this.wasd = this.input.keyboard.addKeys({
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up:    Phaser.Input.Keyboard.KeyCodes.W
    });
    this.cursors = this.input.keyboard.createCursorKeys();

    // Player labels
    this.add.text(100, groundY - PLAYER_H - 18, 'Adam', {
      fontSize: '12px', color: '#00aaff', fontFamily: 'monospace'
    }).setOrigin(0.5);
    this.add.text(700, groundY - PLAYER_H - 18, 'Noah', {
      fontSize: '12px', color: '#00cc44', fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Spike texture — pointing up
    const spikeGfx = this.make.graphics({ x: 0, y: 0, add: false });
    spikeGfx.fillStyle(0xff4444, 1);
    spikeGfx.fillTriangle(0, 32, 16, 0, 32, 32);
    spikeGfx.generateTexture('spike', 32, 32);
    spikeGfx.destroy();

    // Spike texture — pointing down
    const spikeDownGfx = this.make.graphics({ x: 0, y: 0, add: false });
    spikeDownGfx.fillStyle(0xff6666, 1);
    spikeDownGfx.fillTriangle(0, 0, 16, 32, 32, 0);
    spikeDownGfx.generateTexture('spike-down', 32, 32);
    spikeDownGfx.destroy();

    this.spikes = this.physics.add.staticGroup({ maxSize: 60 });
    this.gameOver = false;

    this.spike1Overlap = this.physics.add.overlap(this.player1, this.spikes, () => this.triggerGameOver('Noah wins!'), null, this);
    this.spike2Overlap = this.physics.add.overlap(this.player2, this.spikes, () => this.triggerGameOver('Adam wins!'), null, this);

    // Game title
    this.add.text(400, 18, 'SPIKE GAME', {
      fontSize: '20px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5, 0).setAlpha(0.7);

    this.add.text(400, 42, 'by Adam & Noah', {
      fontSize: '13px', color: '#aaaaaa', fontFamily: 'monospace'
    }).setOrigin(0.5, 0).setAlpha(0.6);

    // Score
    this.score = 0;
    this.scoreText = this.add.text(12, 12, 'Score: 0', {
      fontSize: '18px', color: '#ffffff', fontFamily: 'monospace'
    }).setDepth(1);

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (!this.gameOver) {
          this.score++;
          this.scoreText.setText('Score: ' + this.score);
        }
      }
    });

    this.scheduleSpike();
  }

  update() {
    if (this.gameOver) return;

    // Player 1 — WASD
    if (this.player1?.body) {
      const onGround = this.player1.body.blocked.down;
      if (this.wasd.left.isDown) {
        this.player1.setVelocityX(-220);
      } else if (this.wasd.right.isDown) {
        this.player1.setVelocityX(220);
      } else {
        this.player1.setVelocityX(0);
      }
      if (Phaser.Input.Keyboard.JustDown(this.wasd.up) && onGround) {
        this.player1.setVelocityY(-520);
      }
    }

    // Player 2 — Arrow keys
    if (this.player2?.body) {
      const onGround = this.player2.body.blocked.down;
      if (this.cursors.left.isDown) {
        this.player2.setVelocityX(-220);
      } else if (this.cursors.right.isDown) {
        this.player2.setVelocityX(220);
      } else {
        this.player2.setVelocityX(0);
      }
      if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && onGround) {
        this.player2.setVelocityY(-520);
      }
    }
  }

  triggerGameOver(winnerText) {
    if (this.gameOver) return;
    this.gameOver = true;

    this.spike1Overlap.destroy();
    this.spike2Overlap.destroy();
    this.time.removeAllEvents();

    // Freeze both players
    [this.player1, this.player2].forEach(p => {
      if (p?.body) {
        p.setTint(0xff0000);
        p.setVelocity(0, 0);
        p.body.setAllowGravity(false);
      }
    });

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    this.add.text(cx, cy - 70, 'GAME OVER', {
      fontSize: '48px', color: '#ff4444', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(cx, cy - 15, winnerText, {
      fontSize: '32px', color: '#ffff00', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(cx, cy + 25, 'Score: ' + this.score, {
      fontSize: '24px', color: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(cx, cy + 60, 'Press R to restart', {
      fontSize: '20px', color: '#aaaaaa', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });
  }

  scheduleSpike() {
    const delay = Phaser.Math.Between(1500, 2500);
    this.time.delayedCall(delay, () => {
      this.spawnSpike();
      this.scheduleSpike();
    });
  }

  spawnSpike() {
    // Pick a base x away from both players
    const exclusion = 80;
    let baseX;
    do {
      baseX = Phaser.Math.Between(80, 720);
    } while (
      Math.abs(baseX - this.player1.x) < exclusion ||
      Math.abs(baseX - this.player2.x) < exclusion
    );

    // Spawn 3 double-spike pairs side by side (spacing 36px)
    const spacing = 36;
    for (let i = 0; i < 3; i++) {
      const x = baseX + (i - 1) * spacing;

      // Bottom spike — pointing up, sitting on the ground
      const spikeUp = this.spikes.create(x, this.groundY - 16, 'spike');
      spikeUp.setSize(24, 28);
      spikeUp.setOffset(4, 4);
      spikeUp.refreshBody();

      // Top spike — pointing down, sitting just above the bottom spike
      const spikeDown = this.spikes.create(x, this.groundY - 48, 'spike-down');
      spikeDown.setSize(24, 28);
      spikeDown.setOffset(4, 0);
      spikeDown.refreshBody();

      this.time.delayedCall(20000, () => {
        if (spikeUp?.active) spikeUp.destroy();
        if (spikeDown?.active) spikeDown.destroy();
      });
    }
  }
}
