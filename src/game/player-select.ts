// @ts-nocheck

import { createBackground } from './background.ts';
import { getTextScale } from './scale.ts';

const PLAYERS = [
  { key: 'adam', label: 'Adam', color: '#00aaff', emoji: '🧒' },
  { key: 'noah', label: 'Noah', color: '#00cc44', emoji: '👦' },
];

export class PlayerSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlayerSelectScene' });
  }

  create() {
    const { difficulty } = this.scene.settings.data as { difficulty: string };
    const centerX = this.scale.width / 2;
    const H = this.scale.height;
    const textScale = getTextScale(this);

    createBackground(this);

    this.add.text(centerX, H * 0.2, 'Who are you?', {
      fontSize: `${Math.round(28 * textScale)}px`,
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const buttonY = [0.45, 0.7].map((r) => H * r);

    PLAYERS.forEach((p, i) => {
      const btn = this.add.text(centerX, buttonY[i], `${p.emoji}  ${p.label}`, {
        fontSize: `${Math.round(32 * textScale)}px`,
        color: p.color,
        fontFamily: 'monospace',
        fontStyle: 'bold',
        backgroundColor: 'rgba(255,255,255,0.06)',
        padding: { x: 24, y: 12 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerover', () => btn.setAlpha(0.75));
      btn.on('pointerout', () => btn.setAlpha(1));
      btn.on('pointerdown', () => {
        this.scene.start('GameScene', { difficulty, mobilePlayer: p.key });
      });
    });
  }
}
