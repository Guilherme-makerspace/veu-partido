import { COLORS, SCREEN_W, SCREEN_H } from '../constants.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Preload' });
  }

  preload() {
    this.cameras.main.setBackgroundColor(COLORS.BG);

    const bar = this.add.graphics();
    const barBg = this.add.graphics();
    const title = this.add.text(SCREEN_W / 2, SCREEN_H / 2 - 60, 'VÉU PARTIDO', {
      fontFamily: 'Georgia, serif',
      fontSize: '36px',
      color: '#c47afe',
    }).setOrigin(0.5);
    const sub = this.add.text(SCREEN_W / 2, SCREEN_H / 2 - 20, 'Carregando...', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#8a86a0',
    }).setOrigin(0.5);

    barBg.fillStyle(COLORS.SURFACE, 1);
    barBg.fillRect(SCREEN_W / 2 - 200, SCREEN_H / 2 + 20, 400, 12);

    this.load.on('progress', (value) => {
      bar.clear();
      bar.fillStyle(COLORS.ACCENT2, 1);
      bar.fillRect(SCREEN_W / 2 - 200, SCREEN_H / 2 + 20, 400 * value, 12);
      sub.setText(`Carregando... ${Math.floor(value * 100)}%`);
    });

    this.load.on('complete', () => {
      sub.setText('Carregado!');
    });
  }

  create() {
    this.time.delayedCall(300, () => {
      this.scene.start('Title');
    });
  }
}
