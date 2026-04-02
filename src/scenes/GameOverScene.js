export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.victory = data.victory || false;
    this.score   = data.score   || 0;
  }

  create() {
    this._buildBackground();
    this._buildResult();
    this._buildScore();
    this._buildButtons();
    this._buildAtmosphere();
  }

  _buildBackground() {
    const g = this.add.graphics();
    const color = this.victory ? 0x0a1a0a : 0x1a0a0a;
    g.fillStyle(color, 1);
    g.fillRect(0, 0, 1280, 720);

    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, 1280);
      const y = Phaser.Math.Between(0, 720);
      g.fillStyle(this.victory ? 0x224422 : 0x220000, 0.5);
      g.fillCircle(x, y, Phaser.Math.Between(5, 20));
    }
    g.setDepth(0);
  }

  _buildResult() {
    if (this.victory) {
      this.add.text(640, 160, 'O VÉIU FOI SELADO', {
        fontSize: '48px',
        color: '#44ff88',
        fontStyle: 'bold',
        stroke: '#004422',
        strokeThickness: 8,
        shadow: { offsetX: 0, offsetY: 0, color: '#00ff44', blur: 20, fill: true },
      }).setOrigin(0.5).setDepth(10);

      this.add.text(640, 225, 'Os Marcados cumpriram seu destino.', {
        fontSize: '16px',
        color: '#88ffaa',
        fontStyle: 'italic',
        stroke: '#000',
        strokeThickness: 3,
      }).setOrigin(0.5).setDepth(10);

      this.add.text(640, 255, '"O mundo ainda se desfaz — mas não mais tão depressa."', {
        fontSize: '13px',
        color: '#446644',
        fontStyle: 'italic',
      }).setOrigin(0.5).setDepth(10);
    } else {
      this.add.text(640, 160, 'OS MARCADOS CAÍRAM', {
        fontSize: '46px',
        color: '#ff4444',
        fontStyle: 'bold',
        stroke: '#440000',
        strokeThickness: 8,
        shadow: { offsetX: 0, offsetY: 0, color: '#ff0000', blur: 20, fill: true },
      }).setOrigin(0.5).setDepth(10);

      this.add.text(640, 225, 'A entropia avança. O Véu se rompe mais.', {
        fontSize: '16px',
        color: '#ff8888',
        fontStyle: 'italic',
        stroke: '#000',
        strokeThickness: 3,
      }).setOrigin(0.5).setDepth(10);

      const phrases = [
        '"Não havia razão para eles se conhecerem. Agora não há mais."',
        '"O Estilhaço não perdoa os fracos."',
        '"O mundo se desfaz — e eles com ele."',
      ];
      this.add.text(640, 260, phrases[Phaser.Math.Between(0, 2)], {
        fontSize: '13px',
        color: '#442222',
        fontStyle: 'italic',
      }).setOrigin(0.5).setDepth(10);
    }
  }

  _buildScore() {
    const scorePanel = this.add.graphics();
    scorePanel.fillStyle(0x000000, 0.6);
    scorePanel.fillRoundedRect(440, 305, 400, 80, 10);
    scorePanel.lineStyle(2, this.victory ? 0x44ff88 : 0xff4444, 0.8);
    scorePanel.strokeRoundedRect(440, 305, 400, 80, 10);
    scorePanel.setDepth(9);

    this.add.text(640, 320, 'PONTUAÇÃO TOTAL', {
      fontSize: '14px',
      color: '#888888',
      letterSpacing: 3,
    }).setOrigin(0.5).setDepth(10);

    const scoreText = this.add.text(640, 355, '0', {
      fontSize: '36px',
      color: this.victory ? '#44ff88' : '#ff6644',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(10);

    this.tweens.addCounter({
      from: 0,
      to: this.score,
      duration: 1500,
      ease: 'Power2',
      onUpdate: (tween) => {
        scoreText.setText(Math.floor(tween.getValue()).toString());
      }
    });
  }

  _buildButtons() {
    const buttons = [
      { label: 'JOGAR NOVAMENTE', x: 480, action: () => this._restart() },
      { label: 'MENU PRINCIPAL',  x: 760, action: () => this._menu() },
    ];

    buttons.forEach(btn => {
      const bg = this.add.graphics();
      bg.fillStyle(0x000000, 0.6);
      bg.fillRoundedRect(btn.x - 120, 430, 240, 48, 8);
      bg.lineStyle(2, 0x7744aa, 0.8);
      bg.strokeRoundedRect(btn.x - 120, 430, 240, 48, 8);
      bg.setDepth(9);

      const t = this.add.text(btn.x, 454, btn.label, {
        fontSize: '18px',
        color: '#ccaaff',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 3,
      }).setOrigin(0.5).setDepth(10);

      const zone = this.add.zone(btn.x, 454, 240, 48).setInteractive().setDepth(11);
      zone.on('pointerover', () => {
        t.setStyle({ color: '#ffffff' });
        bg.clear();
        bg.fillStyle(0x6633aa, 0.7);
        bg.fillRoundedRect(btn.x - 120, 430, 240, 48, 8);
        bg.lineStyle(2, 0xcc88ff, 1);
        bg.strokeRoundedRect(btn.x - 120, 430, 240, 48, 8);
      });
      zone.on('pointerout', () => {
        t.setStyle({ color: '#ccaaff' });
        bg.clear();
        bg.fillStyle(0x000000, 0.6);
        bg.fillRoundedRect(btn.x - 120, 430, 240, 48, 8);
        bg.lineStyle(2, 0x7744aa, 0.8);
        bg.strokeRoundedRect(btn.x - 120, 430, 240, 48, 8);
      });
      zone.on('pointerdown', btn.action);
    });
  }

  _buildAtmosphere() {
    if (this.victory) {
      this.time.addEvent({
        delay: 150,
        loop: true,
        callback: () => {
          const x = Phaser.Math.Between(0, 1280);
          const y = Phaser.Math.Between(0, 720);
          const g = this.add.graphics();
          g.fillStyle(0x44ff88, 0.5);
          g.fillStar(x, y, 5, 3, 6);
          g.setDepth(5);
          this.tweens.add({
            targets: g,
            y: y - 60,
            alpha: 0,
            angle: 180,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => g.destroy(),
          });
        }
      });
    } else {
      this.time.addEvent({
        delay: 300,
        loop: true,
        callback: () => {
          const x = Phaser.Math.Between(0, 1280);
          const y = Phaser.Math.Between(-20, 720);
          const g = this.add.graphics();
          g.fillStyle(0xff2222, 0.4);
          g.fillRect(x, y, 2, Phaser.Math.Between(10, 30));
          g.setDepth(5);
          this.tweens.add({
            targets: g,
            y: y + 80,
            alpha: 0,
            duration: 2500,
            onComplete: () => g.destroy(),
          });
        }
      });
    }
  }

  _restart() {
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0);
    overlay.fillRect(0, 0, 1280, 720);
    overlay.setDepth(1000);
    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 500,
      onComplete: () => this.scene.start('GameScene', { levelIndex: 0 }),
    });
  }

  _menu() {
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0);
    overlay.fillRect(0, 0, 1280, 720);
    overlay.setDepth(1000);
    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 500,
      onComplete: () => this.scene.start('TitleScene'),
    });
  }
}
