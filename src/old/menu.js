import { createBackground } from './background.js';

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
