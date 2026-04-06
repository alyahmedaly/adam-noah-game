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

    // Player
    const PLAYER_H = 48;
    const playerGfx = this.make.graphics({ x: 0, y: 0, add: false });
    playerGfx.fillStyle(0x00d4ff, 1);
    playerGfx.fillRect(0, 0, 32, PLAYER_H);
    playerGfx.generateTexture('player', 32, PLAYER_H);
    playerGfx.destroy();

    this.player = this.physics.add.sprite(100, groundY - PLAYER_H / 2, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.ground);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.W
    });

    // Spike texture (triangle)
    const spikeGfx = this.make.graphics({ x: 0, y: 0, add: false });
    spikeGfx.fillStyle(0xff4444, 1);
    spikeGfx.fillTriangle(0, 32, 16, 0, 32, 32);
    spikeGfx.generateTexture('spike', 32, 32);
    spikeGfx.destroy();

    this.spikes = this.physics.add.staticGroup();
    this.gameOver = false;
    this.spikeOverlap = this.physics.add.overlap(this.player, this.spikes, this.triggerGameOver, null, this);

    // Score (time survived)
    this.score = 0;
    this.scoreText = this.add.text(12, 12, 'Score: 0', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace'
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
    if (!this.player || !this.player.body) return;
    const onGround = this.player.body.blocked.down;
    const goLeft = this.cursors.left.isDown || this.wasd.left.isDown;
    const goRight = this.cursors.right.isDown || this.wasd.right.isDown;
    const jump = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                 Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
                 Phaser.Input.Keyboard.JustDown(this.wasd.up);

    if (goLeft) {
      this.player.setVelocityX(-220);
    } else if (goRight) {
      this.player.setVelocityX(220);
    } else {
      this.player.setVelocityX(0);
    }

    if (jump && onGround) {
      this.player.setVelocityY(-520);
    }
  }

  triggerGameOver() {
    if (this.gameOver) return;
    this.gameOver = true;

    this.spikeOverlap.destroy();
    this.player.setTint(0xff0000);
    this.player.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);
    this.time.removeAllEvents();

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    this.add.text(cx, cy - 60, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff4444',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(cx, cy - 10, 'Score: ' + this.score, {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(cx, cy + 30, 'Press R to restart', {
      fontSize: '20px',
      color: '#aaaaaa',
      fontFamily: 'monospace'
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
    if (this.spikes.getLength() >= 12) {
      this.spikes.getFirst()?.destroy();
    }
    const exclusion = 60;
    let x;
    do {
      x = Phaser.Math.Between(40, 760);
    } while (Math.abs(x - this.player.x) < exclusion);
    const spike = this.spikes.create(x, this.groundY - 16, 'spike');
    spike.setSize(24, 28);
    spike.setOffset(4, 4);
    spike.refreshBody();
    this.time.delayedCall(20000, () => { if (spike?.active) spike.destroy(); });
  }
}
