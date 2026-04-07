/// <reference types="vite/client" />

import Phaser from 'phaser';
import { getGameViewportSize } from './viewport.ts';

declare global {
    interface Window {
        Phaser: typeof Phaser;
        __adamGameDebug?: Phaser.Game;
    }
}

window.Phaser = Phaser;
let gameInstance: Phaser.Game | null = null;

const StartGame = async (parent: string): Promise<Phaser.Game> => {
    if (gameInstance) {
        return gameInstance;
    }

    const [{ GameScene }, { MenuScene }, { PlayerSelectScene }] = await Promise.all([
        import('./game.ts'),
        import('./menu.ts'),
        import('./player-select.ts'),
    ]);

    const { width: viewportWidth, height: viewportHeight } = getGameViewportSize(window.innerWidth, window.innerHeight);

    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: viewportWidth,
        height: viewportHeight,
        parent,
        backgroundColor: '#1a1a2e',
        autoRound: false,
        input: {
            gamepad: true,
            activePointers: 3,
            touch: {
                capture: true,
            },
        },
        render: {
            antialias: true,
            antialiasGL: true,
            pixelArt: false,
            roundPixels: false,
        },
        scale: {
            mode: Phaser.Scale.NONE,
            autoCenter: Phaser.Scale.NO_CENTER,
            width: viewportWidth,
            height: viewportHeight,
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { x: 0, y: 600 },
                debug: false,
            },
        },
        scene: [MenuScene, PlayerSelectScene, GameScene],
    };

    gameInstance = new Phaser.Game(config);
    Phaser.Display.Canvas.TouchAction(gameInstance.canvas, 'none');
    Phaser.Display.Canvas.UserSelect(gameInstance.canvas, 'none');

    if (import.meta.env.DEV) {
        window.__adamGameDebug = gameInstance;
    }

    const refreshBounds = () => {
        if (!gameInstance) {
            return;
        }

        gameInstance.scale.updateBounds();
    };

    const resizeGame = () => {
        if (!gameInstance) {
            return;
        }

        gameInstance.scale.resize(window.innerWidth, window.innerHeight);
        refreshBounds();
    };

    requestAnimationFrame(refreshBounds);
    window.addEventListener('resize', () => {
        resizeGame();
    });

    window.visualViewport?.addEventListener('resize', resizeGame);
    return gameInstance;
};

export default StartGame;
