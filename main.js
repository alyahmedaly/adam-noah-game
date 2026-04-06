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
