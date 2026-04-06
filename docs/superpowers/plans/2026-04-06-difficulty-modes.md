# Difficulty Modes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mode selection screen (Noob / Normal / Ninja) before the game starts, adjusting lives and spike speed per mode.

**Architecture:** New `MenuScene` (in `menu.js`) boots first, passes chosen difficulty to `GameScene` via scene data. `game.js` reads it to set lives; `spikes.js` reads it to pick timing constants.

**Tech Stack:** Phaser 3.60.0, ES modules, no build step.

---

### Task 1: Create `menu.js` with `MenuScene`

**Files:**
- Create: `menu.js`

- [ ] **Step 1: Create `menu.js` with this full content**

```js
import { createBackground } from './background.js';

const MODES = [
  {
    key: 'noob',
    label: 'NOOB',
    desc: '5 lives · slow spikes',
    color: '#00cc44',
    hover: 0x00cc44,
  },
  {
    key: 'normal',
    label: 'NORMAL',
    desc: '3 lives · medium spikes',
    color: '#ffd700',
    hover: 0xffd700,
  },
  {
    key: 'ninja',
    label: 'NINJA',
    desc: '2 lives · fast spikes',
    color: '#ff4444',
    hover: 0xff4444,
  },
];

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    createBackground(this);

    this.add.text(400, 60, 'SPIKE GAME', {
      fontSize: '36px', color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0.9);

    this.add.text(400, 105, 'by Adam & Noah', {
      fontSize: '14px', color: '#aaaaaa', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(400, 160, 'Choose your difficulty:', {
      fontSize: '18px', color: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5);

    const buttonY = [220, 280, 340];

    MODES.forEach((mode, i) => {
      const btn = this.add.text(400, buttonY[i], mode.label, {
        fontSize: '28px', color: mode.color, fontFamily: 'monospace', fontStyle: 'bold'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      this.add.text(400, buttonY[i] + 22, mode.desc, {
        fontSize: '12px', color: '#888888', fontFamily: 'monospace'
      }).setOrigin(0.5);

      btn.on('pointerover', () => btn.setAlpha(0.7));
      btn.on('pointerout', () => btn.setAlpha(1));
      btn.on('pointerdown', () => {
        this.scene.start('GameScene', { difficulty: mode.key });
      });
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add menu.js
git commit -m "feat: add MenuScene with difficulty mode selection"
```

---

### Task 2: Register `MenuScene` in `main.js`

**Files:**
- Modify: `main.js`

- [ ] **Step 1: Update `main.js` to import and register `MenuScene` as the first scene**

Replace the entire file with:

```js
import { MenuScene } from './menu.js';
import { GameScene } from './game.js';

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 400,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 400
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 600 }, debug: false }
  },
  scene: [MenuScene, GameScene]
});
```

- [ ] **Step 2: Commit**

```bash
git add main.js
git commit -m "feat: boot MenuScene first, register both scenes"
```

---

### Task 3: Read difficulty in `game.js` and set lives

**Files:**
- Modify: `game.js`

- [ ] **Step 1: Add difficulty config lookup at the top of `game.js`**

After the imports and before the class, add:

```js
const DIFFICULTY = {
  noob:   { maxLives: 5 },
  normal: { maxLives: 3 },
  ninja:  { maxLives: 2 },
};
```

- [ ] **Step 2: Replace the `MAX_LIVES` constant and read difficulty from scene data in `create()`**

Remove:
```js
const MAX_LIVES = 3;
```

In `create()`, add these two lines right after `super({ key: 'GameScene' })` is called (i.e., at the top of `create()`, before `this.groundY = 360`):

```js
const diff = (this.scene.settings.data?.difficulty) || 'normal';
this.difficulty = diff;
this.maxLives = DIFFICULTY[diff]?.maxLives ?? 3;
```

- [ ] **Step 3: Replace all references to `MAX_LIVES` with `this.maxLives`**

Change:
```js
this.lives1 = MAX_LIVES;
this.lives2 = MAX_LIVES;
```
To:
```js
this.lives1 = this.maxLives;
this.lives2 = this.maxLives;
```

Change:
```js
const lives = playerNum === 1 ? scene.lives1 : scene.lives2;
if (lives >= 3) return; // already full
```
in `heartpickup.js` to use `scene.maxLives`:
```js
const lives = playerNum === 1 ? scene.lives1 : scene.lives2;
if (lives >= scene.maxLives) return;
```

And:
```js
scene.lives1 = Math.min(3, scene.lives1 + 1);
...
scene.lives2 = Math.min(3, scene.lives2 + 1);
```
To:
```js
scene.lives1 = Math.min(scene.maxLives, scene.lives1 + 1);
...
scene.lives2 = Math.min(scene.maxLives, scene.lives2 + 1);
```

Also update the lives HUD hearts formula in `ui.js`:

Change:
```js
const hearts = n => '❤️'.repeat(Math.max(0, n)) + '🖤'.repeat(Math.max(0, 3 - n));
```
To:
```js
const hearts = (n, max) => '❤️'.repeat(Math.max(0, n)) + '🖤'.repeat(Math.max(0, max - n));
```

And update callers:
```js
scene.livesTexts.adam.setText(hearts(adamLives, scene.maxLives) + ' Adam');
scene.livesTexts.noah.setText('Noah ' + hearts(noahLives, scene.maxLives));
```

- [ ] **Step 4: Commit**

```bash
git add game.js heartpickup.js ui.js
git commit -m "feat: read difficulty from scene data, set lives per mode"
```

---

### Task 4: Apply difficulty timing in `spikes.js`

**Files:**
- Modify: `spikes.js`

- [ ] **Step 1: Add difficulty timing config at the top of `spikes.js`**

```js
const SPIKE_CONFIG = {
  noob:   { base: 2000, baseDecrement: 10, jitter: 1200, jitterDecrement: 5,  minBase: 600, minJitter: 300 },
  normal: { base: 1500, baseDecrement: 20, jitter: 1000, jitterDecrement: 10, minBase: 400, minJitter: 200 },
  ninja:  { base: 900,  baseDecrement: 35, jitter: 600,  jitterDecrement: 20, minBase: 200, minJitter: 100 },
};
```

- [ ] **Step 2: Update `scheduleSpike` to use difficulty config**

Replace:
```js
export function scheduleSpike(scene) {
  // Interval shrinks as score grows: starts 1500-2500ms, floors at 400-800ms
  const base = Math.max(400, 1500 - scene.score * 20);
  const jitter = Math.max(200, 1000 - scene.score * 10);
  const delay = Phaser.Math.Between(base, base + jitter);

  scene.time.delayedCall(delay, () => {
    if (!scene.gameOver) spawnSpike(scene);
    scheduleSpike(scene);
  });
}
```

With:
```js
export function scheduleSpike(scene) {
  const cfg = SPIKE_CONFIG[scene.difficulty] ?? SPIKE_CONFIG.normal;
  const base   = Math.max(cfg.minBase,   cfg.base   - scene.score * cfg.baseDecrement);
  const jitter = Math.max(cfg.minJitter, cfg.jitter  - scene.score * cfg.jitterDecrement);
  const delay  = Phaser.Math.Between(base, base + jitter);

  scene.time.delayedCall(delay, () => {
    if (!scene.gameOver) spawnSpike(scene);
    scheduleSpike(scene);
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add spikes.js
git commit -m "feat: apply per-difficulty spike timing config"
```

---

### Task 5: Manual smoke test

- [ ] Start a local server (`python3 -m http.server 8080`) and open `http://localhost:8080`
- [ ] Verify the menu screen appears with three buttons
- [ ] Click **Noob** — game starts, player has 5 hearts in the HUD, spikes spawn slowly
- [ ] Press R to restart — menu appears again
- [ ] Click **Ninja** — player has 2 hearts, spikes spawn fast
- [ ] Collect a heart pickup — lives cap at mode's max (5 for Noob, 2 for Ninja)
