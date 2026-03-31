import { COLORS, SCREEN_W, SCREEN_H } from '../constants.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload() {
    this.cameras.main.setBackgroundColor(COLORS.BG);
  }

  create() {
    this.scene.start('Preload');
  }
}
