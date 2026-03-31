import { COLORS, SCREEN_W, SCREEN_H } from '../constants.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UI', active: false });
  }

  create() {
    this.cameras.main.setBackgroundColor(0x000000);
    this.cameras.main.setAlpha(0);
  }
}
