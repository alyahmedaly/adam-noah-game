// @ts-nocheck

import { createBackground } from './background.ts';
import { getTextScale, isMobile } from './scale.ts';

const MODES = [
  {
    key: 'noob',
    label: 'NOOB',
    desc: '5 lives · slow spikes',
    color: '#00cc44',
  },
  {
    key: 'normal',
    label: 'NORMAL',
    desc: '3 lives · medium spikes',
    color: '#ffd700',
  },
  {
    key: 'ninja',
    label: 'NINJA',
    desc: '2 lives · fast spikes',
    color: '#ff4444',
  },
];

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const centerX = this.scale.width / 2;
    const stageHeight = this.scale.height;
    const textScale = getTextScale(this);
    createBackground(this);

    this.add.text(centerX, stageHeight * 0.15, 'SPIKE GAME', {
      fontSize: `${Math.round(36 * textScale)}px`, color: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0.9);

    this.add.text(centerX, stageHeight * 0.2625, 'by Adam & Noah', {
      fontSize: `${Math.round(14 * textScale)}px`, color: '#aaaaaa', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(centerX, stageHeight * 0.4, 'Choose your difficulty:', {
      fontSize: `${Math.round(18 * textScale)}px`, color: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5);

    const buttonY = [0.54, 0.68, 0.82].map((ratio) => stageHeight * ratio);

    MODES.forEach((mode, i) => {
      const btn = this.add.text(centerX, buttonY[i], mode.label, {
        fontSize: `${Math.round(28 * textScale)}px`, color: mode.color, fontFamily: 'monospace', fontStyle: 'bold'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      this.add.text(centerX, buttonY[i] + Math.round(22 * textScale), mode.desc, {
        fontSize: `${Math.round(12 * textScale)}px`, color: '#888888', fontFamily: 'monospace'
      }).setOrigin(0.5);

      btn.on('pointerover', () => btn.setAlpha(0.7));
      btn.on('pointerout', () => btn.setAlpha(1));
      btn.on('pointerdown', () => {
        if (isMobile()) {
          this.scene.start('PlayerSelectScene', { difficulty: mode.key });
        } else {
          this.scene.start('GameScene', { difficulty: mode.key });
        }
      });
    });
  }
}
