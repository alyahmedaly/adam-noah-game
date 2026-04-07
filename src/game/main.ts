import Phaser from 'phaser';

declare global {
    interface Window {
        Phaser: typeof Phaser;
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

    // On mobile, swap dimensions if portrait so the game is always landscape
    const rawW = window.innerWidth;
    const rawH = window.innerHeight;
    const viewportWidth = rawW < rawH ? rawH : rawW;
    const viewportHeight = rawW < rawH ? rawW : rawH;

    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: viewportWidth,
        height: viewportHeight,
        parent,
        backgroundColor: '#1a1a2e',
        autoRound: false,
        input: {
            gamepad: true,
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
    window.addEventListener('resize', () => {
        if (!gameInstance) {
            return;
        }

        gameInstance.scale.resize(window.innerWidth, window.innerHeight);
    });
    return gameInstance;
};

export default StartGame;
