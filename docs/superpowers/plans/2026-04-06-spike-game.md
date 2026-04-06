# Spike Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-file browser game where a player walks and jumps to avoid randomly-spawning spikes on a fixed arena.

**Architecture:** Single `index.html` with Phaser 3 loaded via CDN. One `GameScene` class contains all game logic (preload, create, update). Arcade Physics handles gravity, jumping, and collision. Spikes are spawned on a timer at random X positions and share a static physics group.

**Tech Stack:** HTML5, Phaser 3 (CDN), Arcade Physics, vanilla JS (no build step)

---

## File Structure

| File | Responsibility |
|------|---------------|
| `index.html` | Entry point — Phaser config, `GameScene` class, all game logic |

That's it. One file, zero dependencies to install.

---

### Task 1: Scaffold the HTML file and render a blank Phaser canvas

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create `index.html` with Phaser 3 from CDN and a blank scene**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Spike Game</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #1a1a2e; display: flex; justify-content: center; align-items: center; height: 100vh; }
  </style>
</head>
<body>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
  <script>
    class GameScene extends Phaser.Scene {
      constructor() {
        super({ key: 'GameScene' });
      }

      preload() {}

      create() {}

      update() {}
    }

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 400,
      backgroundColor: '#1a1a2e',
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 600 }, debug: false }
      },
      scene: GameScene
    };

    new Phaser.Game(config);
  </script>
</body>
</html>
```

- [ ] **Step 2: Open in browser and verify**

Open `index.html` directly in a browser (file:// works). Expected: dark blue canvas 800×400 renders with no console errors.

- [ ] **Step 3: Commit**

```bash
git init
git add index.html
git commit -m "feat: scaffold blank Phaser 3 canvas"
```

---

### Task 2: Draw the ground

**Files:**
- Modify: `index.html` — `create()` method

- [ ] **Step 1: Add ground graphics and static physics body inside `create()`**

Replace the empty `create()` with:

```js
create() {
  // Ground
  const groundY = 360;
  const groundHeight = 40;

  const groundGfx = this.add.graphics();
  groundGfx.fillStyle(0x4a4a6a, 1);
  groundGfx.fillRect(0, groundY, 800, groundHeight);

  this.ground = this.physics.add.staticGroup();
  const groundBody = this.ground.create(400, groundY + groundHeight / 2, null);
  groundBody.setVisible(false);
  groundBody.setSize(800, groundHeight);
  groundBody.refreshBody();
}
```

- [ ] **Step 2: Open in browser and verify**

Expected: a purple-gray ground bar appears at the bottom of the canvas.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add ground with static physics body"
```

---

### Task 3: Add the player with movement and jumping

**Files:**
- Modify: `index.html` — `create()` and `update()` methods

- [ ] **Step 1: Create the player sprite and set up keyboard input in `create()`**

Add after the ground code in `create()`:

```js
  // Player
  const playerGfx = this.make.graphics({ x: 0, y: 0, add: false });
  playerGfx.fillStyle(0x00d4ff, 1);
  playerGfx.fillRect(0, 0, 32, 48);
  playerGfx.generateTexture('player', 32, 48);
  playerGfx.destroy();

  this.player = this.physics.add.sprite(100, groundY - 24, 'player');
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
```

- [ ] **Step 2: Add movement logic in `update()`**

Replace the empty `update()` with:

```js
update() {
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
```

- [ ] **Step 3: Open in browser and verify**

Expected: cyan rectangle sits on the ground. Arrow keys / WASD move it left and right. Up/W/Space makes it jump. It cannot jump again mid-air.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add player movement and single jump"
```

---

### Task 4: Spawn spikes at random positions

**Files:**
- Modify: `index.html` — `create()` method, new `spawnSpike()` method

- [ ] **Step 1: Generate a spike texture and create a spike static group in `create()`**

Add after the player code in `create()`:

```js
  // Spike texture (triangle)
  const spikeGfx = this.make.graphics({ x: 0, y: 0, add: false });
  spikeGfx.fillStyle(0xff4444, 1);
  spikeGfx.fillTriangle(0, 32, 16, 0, 32, 32);
  spikeGfx.generateTexture('spike', 32, 32);
  spikeGfx.destroy();

  this.spikes = this.physics.add.staticGroup();

  // Spawn on a random interval
  this.scheduleSpike();
```

- [ ] **Step 2: Add `scheduleSpike()` and `spawnSpike()` methods to the class**

Add these methods inside the `GameScene` class, after `update()`:

```js
scheduleSpike() {
  const delay = Phaser.Math.Between(1500, 2500);
  this.time.delayedCall(delay, () => {
    this.spawnSpike();
    this.scheduleSpike();
  });
}

spawnSpike() {
  const x = Phaser.Math.Between(40, 760);
  const groundY = 360;
  const spike = this.spikes.create(x, groundY - 16, 'spike');
  spike.setSize(24, 28);
  spike.setOffset(4, 4);
  spike.refreshBody();
}
```

- [ ] **Step 3: Open in browser and verify**

Expected: red triangles appear at random positions on the ground every 1.5–2.5 seconds. Player passes through them (no collision logic yet).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: spawn spikes at random ground positions"
```

---

### Task 5: Game over on spike collision

**Files:**
- Modify: `index.html` — `create()`, `update()`, new `triggerGameOver()` method

- [ ] **Step 1: Add overlap detection and `gameOver` flag in `create()`**

Add after the spike group setup in `create()`:

```js
  this.gameOver = false;

  this.physics.add.overlap(this.player, this.spikes, () => {
    this.triggerGameOver();
  });
```

- [ ] **Step 2: Add `triggerGameOver()` method to the class**

```js
triggerGameOver() {
  if (this.gameOver) return;
  this.gameOver = true;

  this.player.setVelocity(0, 0);
  this.player.body.setAllowGravity(false);
  this.time.removeAllEvents();

  const cx = this.scale.width / 2;
  const cy = this.scale.height / 2;

  this.add.text(cx, cy - 30, 'GAME OVER', {
    fontSize: '48px',
    color: '#ff4444',
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
```

- [ ] **Step 3: Guard movement in `update()` so the player can't move after game over**

Wrap the entire body of `update()`:

```js
update() {
  if (this.gameOver) return;

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
```

- [ ] **Step 4: Open in browser and verify**

Expected: walking into a spike freezes the player, shows "GAME OVER" in red and "Press R to restart" in gray. Pressing R restarts the game cleanly. Jumping over a spike does not trigger game over.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: game over on spike collision with restart"
```

---

### Task 6: Polish — background, player color tint on death

**Files:**
- Modify: `index.html` — `create()`, `triggerGameOver()`

- [ ] **Step 1: Add a starfield background in `create()` before all other code**

Add at the very start of `create()`:

```js
  // Starfield background
  for (let i = 0; i < 80; i++) {
    const x = Phaser.Math.Between(0, 800);
    const y = Phaser.Math.Between(0, 360);
    const r = Phaser.Math.FloatBetween(1, 2.5);
    const alpha = Phaser.Math.FloatBetween(0.3, 1);
    const star = this.add.graphics();
    star.fillStyle(0xffffff, alpha);
    star.fillCircle(x, y, r);
  }
```

- [ ] **Step 2: Tint player red on death in `triggerGameOver()`**

Add as the first line inside `triggerGameOver()`, after the `if (this.gameOver) return;` guard:

```js
  this.player.setTint(0xff0000);
```

- [ ] **Step 3: Open in browser and verify**

Expected: subtle white stars in the background. Player turns red when it hits a spike.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: polish — starfield background and death tint"
```

---

## Self-Review Checklist

- [x] Player left/right movement — Task 3
- [x] Single jump — Task 3
- [x] Spikes at random positions — Task 4
- [x] Spike spawning on random interval — Task 4
- [x] Walking into spike = game over — Task 5
- [x] Game over text + restart — Task 5
- [x] No score display — no score UI added anywhere
- [x] Fixed 800×400 canvas — Task 1
- [x] No camera scroll — no camera code added
- [x] Phaser 3 via CDN — Task 1
