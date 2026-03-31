import Phaser from 'phaser';
import { SCREEN_W, SCREEN_H } from './constants.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import TitleScene from './scenes/TitleScene.js';
import MenuScene from './scenes/MenuScene.js';
import CharSelectScene from './scenes/CharSelectScene.js';
import ExploreScene from './scenes/ExploreScene.js';
import BattleScene from './scenes/BattleScene.js';
import DialogScene from './scenes/DialogScene.js';
import SkillTreeScene from './scenes/SkillTreeScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import UIScene from './scenes/UIScene.js';

const config = {
  type: Phaser.AUTO,
  width: SCREEN_W,
  height: SCREEN_H,
  backgroundColor: '#0d0c10',
  parent: 'phaser-game',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  input: {
    gamepad: true,
  },
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    MenuScene,
    CharSelectScene,
    ExploreScene,
    BattleScene,
    DialogScene,
    SkillTreeScene,
    UIScene,
    GameOverScene,
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
};

export function createGame(containerId) {
  const game = new Phaser.Game({ ...config, parent: containerId });
  return game;
}
