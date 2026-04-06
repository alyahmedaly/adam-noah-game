import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAOS_MODIFIERS,
  GAME_PHASES,
  getChaosModifierPool,
  getPhaseForScore,
  getPhaseSettings,
} from './intensity.js';

test('maps score thresholds to escalation phases', () => {
  assert.equal(getPhaseForScore(0), GAME_PHASES.CALM);
  assert.equal(getPhaseForScore(14), GAME_PHASES.CALM);
  assert.equal(getPhaseForScore(15), GAME_PHASES.HEAT);
  assert.equal(getPhaseForScore(29), GAME_PHASES.HEAT);
  assert.equal(getPhaseForScore(30), GAME_PHASES.DANGER);
  assert.equal(getPhaseForScore(49), GAME_PHASES.DANGER);
  assert.equal(getPhaseForScore(50), GAME_PHASES.CHAOS);
  assert.equal(getPhaseForScore(999), GAME_PHASES.CHAOS);
});

test('exposes stable settings for each phase', () => {
  const heat = getPhaseSettings(GAME_PHASES.HEAT);
  const chaos = getPhaseSettings(GAME_PHASES.CHAOS);

  assert.equal(heat.label, 'HEAT');
  assert.equal(chaos.label, 'CHAOS');
  assert.ok(chaos.overlayAlpha > heat.overlayAlpha);
  assert.ok(chaos.spikePulse > heat.spikePulse);
});

test('uses deterministic chaos modifier pools by phase', () => {
  assert.deepEqual(getChaosModifierPool(GAME_PHASES.CALM), []);
  assert.deepEqual(getChaosModifierPool(GAME_PHASES.HEAT), []);
  assert.deepEqual(getChaosModifierPool(GAME_PHASES.DANGER), [
    CHAOS_MODIFIERS.SPIKE_SURGE,
    CHAOS_MODIFIERS.HEART_DROUGHT,
  ]);
  assert.deepEqual(getChaosModifierPool(GAME_PHASES.CHAOS), [
    CHAOS_MODIFIERS.SPIKE_SURGE,
    CHAOS_MODIFIERS.LUCKY_RUSH,
    CHAOS_MODIFIERS.BOSS_RAGE,
  ]);
});
