import { COLORS, SCREEN_W, SCREEN_H } from '../constants.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOver' });
  }

  init(data) {
    this.score = data.score;
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.BG);
    this.cameras.main.fadeIn(800, 0, 0, 0);

    const bg = this.add.graphics();
    bg.fillStyle(COLORS.BG, 1);
    bg.fillRect(0, 0, SCREEN_W, SCREEN_H);

    for (let i = 0; i < 20; i++) {
      const x = Math.random() * SCREEN_W;
      const g = this.add.graphics();
      g.lineStyle(1, COLORS.RED, 0.2);
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + 20, SCREEN_H);
      g.strokePath();
    }

    this.add.text(SCREEN_W / 2, SCREEN_H * 0.3, 'GAME OVER', {
      fontFamily: 'Georgia, serif',
      fontSize: '72px',
      color: '#e05c6a',
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0);

    const totalScore = this.score ? this.score.getTotal() : 0;
    this.add.text(SCREEN_W / 2, SCREEN_H * 0.52, `Score Final: ${totalScore}`, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#c47afe',
    }).setOrigin(0.5).setAlpha(0);

    this.add.text(SCREEN_W / 2, SCREEN_H * 0.62, 'O Véu se fechou sobre vocês.', {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#8a86a0',
    }).setOrigin(0.5).setAlpha(0);

    const restart = this.add.text(SCREEN_W / 2, SCREEN_H * 0.76, '[ Pressione ENTER para tentar novamente ]', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#7c6af7',
    }).setOrigin(0.5).setAlpha(0);

    this.children.list.forEach((child, i) => {
      if (child.type === 'Text' || (child.alpha === 0 && i > 0)) {
        this.tweens.add({ targets: child, alpha: 1, duration: 600, delay: i * 200 });
      }
    });

    this.tweens.add({ targets: restart, alpha: 0.3, duration: 700, yoyo: true, repeat: -1, delay: 1200 });

    this.input.keyboard.on('keydown-ENTER', () => this.restart());
    this.input.keyboard.on('keydown-SPACE', () => this.restart());
    this.input.keyboard.on('keydown-F', () => this.restart());
    this.input.once('pointerdown', () => this.restart());
  }

  restart() {
    this.cameras.main.fadeOut(500, 0, 0, 0, (cam, p) => {
      if (p === 1) this.scene.start('CharSelect');
    });
  }
}
