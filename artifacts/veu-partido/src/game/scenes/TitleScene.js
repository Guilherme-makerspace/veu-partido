import { COLORS, SCREEN_W, SCREEN_H } from '../constants.js';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Title' });
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.BG);

    const bg = this.add.graphics();
    bg.fillStyle(COLORS.BG, 1);
    bg.fillRect(0, 0, SCREEN_W, SCREEN_H);

    for (let i = 0; i < 60; i++) {
      const x = Math.random() * SCREEN_W;
      const y = Math.random() * SCREEN_H;
      const size = Math.random() * 1.5 + 0.3;
      const alpha = Math.random() * 0.6 + 0.1;
      const star = this.add.graphics();
      star.fillStyle(COLORS.ACCENT, alpha);
      star.fillCircle(x, y, size);
      this.tweens.add({
        targets: star,
        alpha: 0.05,
        duration: 1500 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000,
      });
    }

    const gradient = this.add.graphics();
    gradient.fillGradientStyle(COLORS.BG, COLORS.BG, COLORS.BG3, COLORS.BG3, 1);
    gradient.fillRect(0, SCREEN_H * 0.4, SCREEN_W, SCREEN_H * 0.6);

    const line = this.add.graphics();
    line.lineStyle(1, COLORS.ACCENT, 0.5);
    for (let i = 0; i < 3; i++) {
      line.beginPath();
      line.moveTo(0, SCREEN_H * 0.35 + i * 2);
      line.lineTo(SCREEN_W, SCREEN_H * 0.35 + i * 2);
      line.strokePath();
    }

    const tagline = this.add.text(SCREEN_W / 2, SCREEN_H * 0.28, 'GAME DESIGN DOCUMENT v1.0', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#7c6af7',
      letterSpacing: 4,
    }).setOrigin(0.5).setAlpha(0);

    const title = this.add.text(SCREEN_W / 2, SCREEN_H * 0.42, 'Véu Partido', {
      fontFamily: 'Georgia, serif',
      fontSize: '80px',
      color: '#e8e4f0',
      stroke: '#c47afe',
      strokeThickness: 1,
    }).setOrigin(0.5).setAlpha(0);

    const subtitle = this.add.text(SCREEN_W / 2, SCREEN_H * 0.56, 'RPG 2D · 2 Jogadores · Phaser.js', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#8a86a0',
      letterSpacing: 2,
    }).setOrigin(0.5).setAlpha(0);

    const anyKey = this.add.text(SCREEN_W / 2, SCREEN_H * 0.75, '[ Pressione qualquer tecla para começar ]', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#c47afe',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: tagline, alpha: 1, duration: 800, delay: 200 });
    this.tweens.add({ targets: title, alpha: 1, duration: 1200, delay: 600 });
    this.tweens.add({ targets: subtitle, alpha: 0.8, duration: 800, delay: 1200 });
    this.tweens.add({
      targets: anyKey, alpha: 1, duration: 600, delay: 1800,
      onComplete: () => {
        this.tweens.add({ targets: anyKey, alpha: 0.2, duration: 800, yoyo: true, repeat: -1 });
      },
    });

    const veilLine1 = this.add.graphics();
    veilLine1.lineStyle(1, COLORS.ACCENT2, 0.3);
    veilLine1.beginPath();
    veilLine1.moveTo(SCREEN_W * 0.3, 0);
    veilLine1.lineTo(SCREEN_W * 0.45, SCREEN_H);
    veilLine1.strokePath();

    const veilLine2 = this.add.graphics();
    veilLine2.lineStyle(1, COLORS.ACCENT, 0.2);
    veilLine2.beginPath();
    veilLine2.moveTo(SCREEN_W * 0.7, 0);
    veilLine2.lineTo(SCREEN_W * 0.6, SCREEN_H);
    veilLine2.strokePath();

    this.input.keyboard.once('keydown', () => this.goToMenu());
    this.input.once('pointerdown', () => this.goToMenu());
    this.input.gamepad.once('down', () => this.goToMenu());
  }

  goToMenu() {
    this.cameras.main.fadeOut(500, 0, 0, 0, (cam, progress) => {
      if (progress === 1) this.scene.start('Menu');
    });
  }
}
