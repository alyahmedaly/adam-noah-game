// @ts-nocheck

import { getTextScale } from './scale.ts';

export const GAME_PHASES = Object.freeze({
  CALM: 'calm',
  HEAT: 'heat',
  DANGER: 'danger',
  CHAOS: 'chaos',
});

export const CHAOS_MODIFIERS = Object.freeze({
  SPIKE_SURGE: 'spikeSurge',
  HEART_DROUGHT: 'heartDrought',
  LUCKY_RUSH: 'luckyRush',
  BOSS_RAGE: 'bossRage',
});

const PHASE_SETTINGS = Object.freeze({
  [GAME_PHASES.CALM]: Object.freeze({
    label: 'CALM',
    announcement: null,
    accentColor: '#9bd4ff',
    overlayColor: 0x203650,
    overlayAlpha: 0.02,
    ribbonAlpha: 0.06,
    ribbonDrift: 10,
    particleColor: 0xffffff,
    particleAlpha: 0.08,
    particleScale: 0.14,
    playerTilt: 2,
    airStretch: 0.04,
    spikePulse: 0.02,
    spikeGlow: 0.08,
    damageShake: 0.0018,
    spikeDelayMultiplier: 1.05,
    heartDelayMultiplier: 1.08,
    luckyDelayMultiplier: 1.02,
    modifierLeadIn: Number.POSITIVE_INFINITY,
    modifierDuration: 0,
    modifierCooldown: Number.POSITIVE_INFINITY,
  }),
  [GAME_PHASES.HEAT]: Object.freeze({
    label: 'HEAT',
    announcement: '⚠ HEAT RISING!',
    accentColor: '#ffbd59',
    overlayColor: 0xff6b21,
    overlayAlpha: 0.07,
    ribbonAlpha: 0.1,
    ribbonDrift: 18,
    particleColor: 0xffd37a,
    particleAlpha: 0.14,
    particleScale: 0.2,
    playerTilt: 4,
    airStretch: 0.08,
    spikePulse: 0.05,
    spikeGlow: 0.12,
    damageShake: 0.0028,
    spikeDelayMultiplier: 0.94,
    heartDelayMultiplier: 1,
    luckyDelayMultiplier: 0.94,
    modifierLeadIn: Number.POSITIVE_INFINITY,
    modifierDuration: 0,
    modifierCooldown: Number.POSITIVE_INFINITY,
  }),
  [GAME_PHASES.DANGER]: Object.freeze({
    label: 'DANGER',
    announcement: '☠ DANGER PHASE!',
    accentColor: '#ff5d73',
    overlayColor: 0xff2255,
    overlayAlpha: 0.12,
    ribbonAlpha: 0.14,
    ribbonDrift: 28,
    particleColor: 0xff8844,
    particleAlpha: 0.2,
    particleScale: 0.28,
    playerTilt: 6,
    airStretch: 0.11,
    spikePulse: 0.09,
    spikeGlow: 0.2,
    damageShake: 0.0038,
    spikeDelayMultiplier: 0.82,
    heartDelayMultiplier: 0.95,
    luckyDelayMultiplier: 0.88,
    modifierLeadIn: 1200,
    modifierDuration: 6000,
    modifierCooldown: 9000,
  }),
  [GAME_PHASES.CHAOS]: Object.freeze({
    label: 'CHAOS',
    announcement: '🔥 CHAOS PHASE!',
    accentColor: '#ffd166',
    overlayColor: 0xa2184f,
    overlayAlpha: 0.18,
    ribbonAlpha: 0.19,
    ribbonDrift: 38,
    particleColor: 0xffdd55,
    particleAlpha: 0.28,
    particleScale: 0.38,
    playerTilt: 8,
    airStretch: 0.15,
    spikePulse: 0.14,
    spikeGlow: 0.3,
    damageShake: 0.005,
    spikeDelayMultiplier: 0.7,
    heartDelayMultiplier: 0.9,
    luckyDelayMultiplier: 0.72,
    modifierLeadIn: 800,
    modifierDuration: 7500,
    modifierCooldown: 8000,
  }),
});

const CHAOS_MODIFIER_POOLS = Object.freeze({
  [GAME_PHASES.CALM]: Object.freeze([]),
  [GAME_PHASES.HEAT]: Object.freeze([]),
  [GAME_PHASES.DANGER]: Object.freeze([
    CHAOS_MODIFIERS.SPIKE_SURGE,
    CHAOS_MODIFIERS.HEART_DROUGHT,
  ]),
  [GAME_PHASES.CHAOS]: Object.freeze([
    CHAOS_MODIFIERS.SPIKE_SURGE,
    CHAOS_MODIFIERS.LUCKY_RUSH,
    CHAOS_MODIFIERS.BOSS_RAGE,
  ]),
});

const MODIFIER_PRESENTATION = Object.freeze({
  [CHAOS_MODIFIERS.SPIKE_SURGE]: Object.freeze({
    text: '⚡ SPIKE SURGE',
    color: '#ff6b6b',
  }),
  [CHAOS_MODIFIERS.HEART_DROUGHT]: Object.freeze({
    text: '🖤 HEART DROUGHT',
    color: '#ff8fab',
  }),
  [CHAOS_MODIFIERS.LUCKY_RUSH]: Object.freeze({
    text: '✨ LUCKY RUSH',
    color: '#ffe066',
  }),
  [CHAOS_MODIFIERS.BOSS_RAGE]: Object.freeze({
    text: '👹 BOSS RAGE',
    color: '#ff9f1c',
  }),
});

export function getPhaseForScore(score) {
  if (score >= 50) return GAME_PHASES.CHAOS;
  if (score >= 30) return GAME_PHASES.DANGER;
  if (score >= 15) return GAME_PHASES.HEAT;
  return GAME_PHASES.CALM;
}

export function getPhaseSettings(phase) {
  return PHASE_SETTINGS[phase] ?? PHASE_SETTINGS[GAME_PHASES.CALM];
}

export function getChaosModifierPool(phase) {
  return CHAOS_MODIFIER_POOLS[phase] ?? CHAOS_MODIFIER_POOLS[GAME_PHASES.CALM];
}

export function createIntensityController(scene) {
  const phase = getPhaseForScore(scene.score ?? 0);
  const settings = getPhaseSettings(phase);

  scene.intensity = {
    phase,
    settings,
    activeModifier: null,
    modifierEndsAt: 0,
    nextModifierAt: scene.time.now + settings.modifierLeadIn,
    modifierIndex: 0,
  };

  return scene.intensity;
}

export function updateIntensityController(scene) {
  const controller = scene.intensity ?? createIntensityController(scene);
  const now = scene.time.now;
  const nextPhase = getPhaseForScore(scene.score ?? 0);

  if (nextPhase !== controller.phase) {
    controller.phase = nextPhase;
    controller.settings = getPhaseSettings(nextPhase);
    controller.activeModifier = null;
    controller.modifierEndsAt = 0;
    controller.nextModifierAt = now + controller.settings.modifierLeadIn;

    if (controller.settings.announcement) {
      showEscalationBanner(scene, controller.settings.announcement, controller.settings.accentColor);
    }
  }

  if (controller.activeModifier && now >= controller.modifierEndsAt) {
    controller.activeModifier = null;
    controller.nextModifierAt = now + controller.settings.modifierCooldown;
  }

  const pool = getChaosModifierPool(controller.phase);
  if (!controller.activeModifier && pool.length > 0 && now >= controller.nextModifierAt) {
    const modifier = pool[controller.modifierIndex % pool.length];
    controller.modifierIndex += 1;
    controller.activeModifier = modifier;
    controller.modifierEndsAt = now + controller.settings.modifierDuration;

    const presentation = MODIFIER_PRESENTATION[modifier];
    showEscalationBanner(scene, presentation.text, presentation.color, 136);
  }

  return controller;
}

export function isChaosModifierActive(scene, modifier) {
  return scene.intensity?.activeModifier === modifier;
}

export function getSpikeDelayMultiplier(scene) {
  const phaseMultiplier = scene.intensity?.settings?.spikeDelayMultiplier ?? 1;
  const modifierMultiplier = isChaosModifierActive(scene, CHAOS_MODIFIERS.SPIKE_SURGE) ? 0.55 : 1;
  return phaseMultiplier * modifierMultiplier;
}

export function getHeartDelayMultiplier(scene) {
  return scene.intensity?.settings?.heartDelayMultiplier ?? 1;
}

export function getLuckyDelayMultiplier(scene) {
  const phaseMultiplier = scene.intensity?.settings?.luckyDelayMultiplier ?? 1;
  const modifierMultiplier = isChaosModifierActive(scene, CHAOS_MODIFIERS.LUCKY_RUSH) ? 0.55 : 1;
  return phaseMultiplier * modifierMultiplier;
}

export function isHeartSpawnBlocked(scene) {
  return isChaosModifierActive(scene, CHAOS_MODIFIERS.HEART_DROUGHT);
}

export function getBossRageMultiplier(scene) {
  return isChaosModifierActive(scene, CHAOS_MODIFIERS.BOSS_RAGE) ? 1.35 : 1;
}

function showEscalationBanner(scene, text, color, y = 110) {
  const textScale = getTextScale(scene);
  const banner = scene.add.text(scene.scale.width / 2, y, text, {
    fontSize: `${Math.round(22 * textScale)}px`,
    color,
    fontFamily: 'monospace',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 4,
  }).setOrigin(0.5).setDepth(7);

  scene.cameras.main.flash(180, 255, 255, 255, false);
  scene.cameras.main.shake(120, scene.intensity?.settings?.damageShake ?? 0.0025);

  scene.tweens.add({
    targets: banner,
    y: y - 26,
    alpha: 0,
    duration: 1800,
    ease: 'Cubic.easeOut',
    onComplete: () => banner.destroy(),
  });
}
