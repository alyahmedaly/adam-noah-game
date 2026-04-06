# Spike Game — Design Spec

**Date:** 2026-04-06

## Overview

A browser-based game built with Phaser 3. The player controls a character on a fixed arena. Spikes appear randomly on the ground. Walking into a spike kills the player; jumping over them is the core challenge. No score — survival is the goal.

## Architecture

- Single `index.html` file
- Phaser 3 loaded via CDN (no build step)
- One Phaser `Scene` class handles all game logic: preload, create, update

## Player

- Rectangular sprite rendered at the start
- Controls: left/right arrow keys (or A/D) for movement; up arrow or spacebar to jump
- Single jump only — no double jump
- Gravity and collision handled by Phaser Arcade Physics
- Collides with the ground static body

## Spikes

- Triangle shapes drawn programmatically onto a Phaser texture at scene creation
- Spawned at random X positions along the ground at randomized intervals (1.5–2.5 seconds)
- Static physics bodies — they do not move
- Overlap with player triggers game over

## Game Over

- On overlap: player movement stops, "Game Over" text displayed in center of screen
- "Press R to restart" prompt shown beneath
- R key calls `scene.restart()`

## World

- Fixed canvas: 800 × 400 pixels
- Flat ground rendered as a filled rectangle across the full width
- No camera scrolling — entire arena visible at all times
- No score display

## Out of Scope

- Double jump
- Moving spikes or enemies
- Score/leaderboard
- Sound effects
- Mobile/touch controls
