import { BootScene }    from './scenes/BootScene.js';
import { TitleScene }   from './scenes/TitleScene.js';
import { GameScene }    from './scenes/GameScene.js';
import { UIScene }      from './scenes/UIScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#0a0a1a',
  parent: 'game-container',
  scene: [BootScene, TitleScene, GameScene, UIScene, GameOverScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
  },
};

window.game = new Phaser.Game(config);
