# Escalation Chaos Visuals Design

## Goal

Make gameplay feel more alive by adding a score-driven escalation system that changes the world's mood, increases visual energy, and introduces controlled chaos as the match progresses.

## Desired Feel

- The match starts readable and calm.
- The world becomes visually hotter and less stable as the score rises.
- Characters, spikes, bullets, and the boss feel more expressive and reactive.
- Chaos ramps up in a way that feels intentional, not random or unfair.

## Core Decision

Use score as the only escalation driver.

Why:

- `scene.score` already exists and is updated continuously.
- Ninja mode already uses a score threshold for the boss.
- This avoids adding a second timing or event-director system.
- Tuning stays simple because all escalation comes from one axis.

## Escalation Phases

### Calm (`0-14`)

- Base game remains readable.
- Add only subtle background drift and low-intensity idle motion.
- No gameplay chaos modifiers yet.

### Heat (`15-29`)

- Background colors start shifting more noticeably.
- Spikes gain pulse or glow behavior.
- Players get jump, landing, and hit juice such as squash/stretch and stronger tint feedback.
- Small camera shake on damage is introduced.

### Danger (`30-49`)

- World mood becomes visibly unstable.
- Ambient particles and stronger sky movement appear.
- Pickup interactions become more energetic.
- Short chaos windows can begin, such as brief spike surges or reduced healing opportunities.

### Chaos (`50+`)

- Peak visual intensity.
- Existing boss phase presentation in Ninja mode becomes more dramatic.
- Projectiles, bullets, and boss feedback become more animated.
- Strongest chaos modifiers are allowed here, but should still be short-lived and legible.

## Visual Systems

### World Mood Shifts

The background should react to phase rather than stay static for the entire round.

Examples:

- palette transitions
- stronger parallax motion
- moving haze, particles, or floating embers
- subtle lighting/tint changes in later phases

### Character Juice

Players should feel more alive through motion and reaction, not just through raw movement speed.

Examples:

- squash/stretch on jump and landing
- stronger damage flash
- more expressive pickup feedback
- boss hit flash and projectile trails

### Feedback Bursts

Short-lived visual bursts should make important moments feel stronger.

Examples:

- hit shake
- pickup burst
- phase transition announcement
- boss arrival and boss defeat polish

## Chaos Modifiers

Chaos should be tied to escalation phases, not a separate random-event system.

Initial modifier set:

- `Spike Surge`: spike spawn pressure increases briefly
- `Heart Drought`: heart spawns pause for a short time
- `Lucky Rush`: lucky block respawn pressure increases briefly
- `Boss Rage`: boss visuals and pressure intensify during high-chaos boss play

Rules:

- modifiers are temporary
- modifiers are phase-gated
- modifiers should be visually announced
- only one small modifier should usually be active at a time in the first implementation

## Architecture

### Intensity Controller

Create a dedicated module that computes the current phase from score and exposes:

- current phase
- phase threshold helpers
- whether a phase just changed
- optional temporary modifier state

This module is the single source of truth for escalation.

### Visual Response Layer

Existing systems read the current phase and update their presentation accordingly.

Likely consumers:

- background
- players
- spikes
- lucky blocks and hearts
- boss
- bullets and boss projectiles
- camera feedback

### Chaos Hooks

Gameplay modules opt into small, explicit phase-based adjustments rather than hardcoding their own escalation logic.

Examples:

- spike scheduler checks for surge state
- heart scheduler checks for drought state
- lucky block timing checks for rush state
- boss logic checks for rage state

## Data Flow

1. Score increases during gameplay.
2. Intensity controller derives the current phase.
3. Phase transitions trigger brief visual announcements.
4. Visual systems update presentation from current phase.
5. Gameplay hooks optionally apply a temporary modifier tied to that phase.

## Error Handling

- Missing phase-specific visuals should fall back to lower-intensity behavior instead of breaking the scene.
- If a modifier fails to activate, core gameplay should continue normally.
- Visual intensity should never hide critical hazards or reduce readability below acceptable playability.

## Verification

- Confirm score thresholds switch phases at the expected values.
- Confirm all existing systems still work: hearts, lucky blocks, boss, pistol, deaths, and game over.
- Confirm chaos windows expire correctly.
- Confirm higher-intensity visuals remain readable on desktop game resolution.

## Scope Boundaries

Included:

- score-based escalation phases
- mood-shift visuals during active gameplay
- more expressive character and hazard feedback
- limited phase-based chaos modifiers

Excluded:

- fully random event director behavior
- permanent rules mutation every round
- major control changes or intentionally confusing mechanics
