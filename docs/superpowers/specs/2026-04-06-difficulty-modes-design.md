# Difficulty Mode Selection — Design Spec

## Overview

Add a mode selection screen that appears before the game starts, letting players choose between three difficulty levels: **Noob**, **Normal**, and **Ninja**. The chosen mode adjusts lives and spike spawning speed.

---

## Mode Selection Screen

A `MenuScene` is shown first (before `GameScene`). It displays:
- Game title ("SPIKE GAME")
- Subtitle ("by Adam & Noah")
- Three clickable buttons: Noob · Normal · Ninja
- Brief label under each button describing the mode

Clicking a button passes the difficulty key to `GameScene` via `scene.start('GameScene', { difficulty })`.

---

## Difficulty Parameters

| Parameter         | Noob   | Normal (current) | Ninja  |
|-------------------|--------|------------------|--------|
| Max lives         | 5      | 3                | 2      |
| Spike base delay  | 2000ms | 1500ms           | 900ms  |
| Delay decrement per score point | 10ms | 20ms | 35ms |
| Jitter base       | 1200ms | 1000ms           | 600ms  |
| Jitter decrement  | 5ms    | 10ms             | 20ms   |
| Min spike delay   | 600ms  | 400ms            | 200ms  |
| Min jitter        | 300ms  | 200ms            | 100ms  |

---

## Architecture

### New file: `menu.js`

Exports `MenuScene` — a `Phaser.Scene` with key `'MenuScene'`.

- Draws starfield background (reuses `createBackground` from `background.js`)
- Renders title and three styled buttons using Phaser Text objects
- Each button: hover highlight on pointer over, launches `GameScene` on click
- Passes `{ difficulty: 'noob' | 'normal' | 'ninja' }` as scene data

### Modified: `main.js`

- Adds `MenuScene` to the scene list
- Sets `MenuScene` as the first scene (boot scene)

### Modified: `game.js`

- Reads `this.data` (scene init data) for `difficulty`, defaults to `'normal'`
- Passes difficulty to `createPlayers` for lives count (`MAX_LIVES` per mode)
- Stores `this.difficulty` and `this.maxLives` on scene for use by `spikes.js`

### Modified: `spikes.js`

- `scheduleSpike(scene)` reads `scene.difficulty` to choose timing constants
- Uses a `DIFFICULTY_CONFIG` lookup table instead of hardcoded values

---

## Data Flow

```
MenuScene (button click)
  → scene.start('GameScene', { difficulty: 'ninja' })
    → game.js create() reads this.scene.settings.data.difficulty
    → stores scene.difficulty
    → passes maxLives to lives system
    → spikes.js reads scene.difficulty for timing formula
```

---

## Error Handling / Defaults

- If `GameScene` is launched without difficulty data (e.g. after restart via `scene.restart()`), default to `'normal'`.
- `scene.restart()` preserves scene data in Phaser 3, so difficulty is retained across restarts.

---

## Out of Scope

- Per-mode high score tracking (all modes share the same best score)
- AI difficulty adjustment mid-game
- Unlockable modes
