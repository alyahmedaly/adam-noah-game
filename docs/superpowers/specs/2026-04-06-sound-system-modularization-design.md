# Sound System Modularization Design

## Goal

Make the game audio system easier to extend so new sounds can be added with minimal code changes, and add an `npm` script that batch-converts `sounds/**/*.m4a` files into matching `.wav` files.

## Current Problems

- Sound definitions live in one file, but playback calls are scattered across multiple gameplay modules.
- Callers need to know player names and event names directly.
- There is no project-level script for regenerating `.wav` files after adding new voice memo recordings.
- Adding a new sound currently means touching both audio config and gameplay logic.

## Chosen Approach

Use an explicit registry-backed sound manager rather than filesystem auto-discovery.

Why this approach:

- Explicit registration is more reliable in a browser game than guessing from filenames.
- The registry becomes the single source of truth for supported player events and asset paths.
- Gameplay files can call a scene-level audio API without knowing Phaser audio keys or player-name mappings.
- The conversion workflow can stay deterministic and easy to rerun from `npm`.

## Architecture

### Sound Registry

Create one registry that defines sound events per player:

- `dies`
- `hurt`
- `luckyBlock`
- `heartAdded`
- `win`
- `jump` remains optional for future use

Each entry stores:

- logical event name
- generated Phaser key
- `.wav` asset path

This registry is the only file that should need edits when adding a new sound event.

### Sound Manager

Expose a small scene-facing API:

- `preloadSceneAudio(scene)`
- `attachSceneAudio(scene)`
- `scene.audio.playForPlayer(playerNum, eventName)`
- `scene.audio.playForWinner(winnerName)`

Responsibilities:

- preload registered assets
- create Phaser sound handles
- map `playerNum` to player identity
- no-op safely when an event is not registered
- stop/restart a sound if the same clip is triggered while already playing

### Gameplay Integration

Gameplay modules should not import low-level sound-bank data.

Instead:

- `game.js` uses `scene.audio.playForPlayer(...)` for hurt and death
- `luckyblock.js` uses `scene.audio.playForPlayer(...)`
- `heartpickup.js` uses `scene.audio.playForPlayer(...)`
- `ui.js` uses `scene.audio.playForWinner(...)`

This keeps gameplay logic decoupled from asset naming.

## Conversion Script

Add a minimal `package.json` with:

- `"sounds:convert": "node scripts/convert-sounds.mjs"`

Add `scripts/convert-sounds.mjs` that:

- scans `sounds/` recursively for `.m4a`
- converts each file to a sibling `.wav`
- uses `ffmpeg -y -i <input> -ac 1 -ar 44100 <output>`
- exits nonzero if any conversion fails

No external npm dependencies are required.

## Error Handling

- Missing registered sound entries should not crash the game; playback should no-op.
- Conversion script should print the file being converted and surface `ffmpeg` failures clearly.
- If `ffmpeg` is missing, the script should fail with a clear message from the spawned process.

## Verification

- Load the game in a browser and confirm no new asset-load errors appear.
- Confirm the existing runtime still works with the scene audio wrapper in place.
- Run `npm run sounds:convert` and confirm it regenerates `.wav` files from the current `.m4a` sources.

## Scope Boundaries

Included:

- sound system modularization
- centralized scene audio API
- npm conversion script

Excluded:

- automatic filesystem-driven runtime sound registration
- new gameplay sound events beyond the current set
- trimming, normalization, or audio mastering improvements
