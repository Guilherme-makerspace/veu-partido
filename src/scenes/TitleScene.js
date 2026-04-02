export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
    this._stars = [];
    this._bgGfx = null;
  }

  create() {
    this._buildBackground();
    this._buildStars();
    this._buildLogo();
    this._buildMenu();
    this._buildLore();
    this._buildCredits();
    this._buildParticles();
  }

  _buildBackground() {
    this._bgGfx = this.add.graphics();
    for (let y = 0; y <= 720; y += 2) {
      const ratio = y / 720;
      const r = Math.floor(Phaser.Math.Linear(0x1a, 0x0a, ratio));
      const g = Math.floor(Phaser.Math.Linear(0x0a, 0x05, ratio));
      const b = Math.floor(Phaser.Math.Linear(0x2e, 0x15, ratio));
      this._bgGfx.fillStyle((r << 16) | (g << 8) | b, 1);
      this._bgGfx.fillRect(0, y, 1280, 2);
    }
    this._bgGfx.setDepth(0);
  }

  _buildStars() {
    for (let i = 0; i < 120; i++) {
      const x = Phaser.Math.Between(0, 1280);
      const y = Phaser.Math.Between(0, 500);
      const r = Math.random() * 1.5 + 0.3;
      const a = Math.random() * 0.8 + 0.2;
      const g = this.add.graphics();
      g.fillStyle(0xffffff, a);
      g.fillCircle(x, y, r);
      g.setDepth(1);
      this._stars.push({ g, x, y, r, phase: Math.random() * Math.PI * 2 });
    }
  }

  _buildLogo() {
    const shardGfx = this.add.graphics();
    shardGfx.setDepth(5);
    const shards = [
      { x: 640, y: 130, pts: [0, -40, 18, 10, -18, 10] },
      { x: 616, y: 155, pts: [0, -30, 15, 15, -15, 15], a: 0.7 },
      { x: 664, y: 155, pts: [0, -30, 15, 15, -15, 15], a: 0.7 },
    ];
    shards.forEach(s => {
      shardGfx.fillStyle(0x8844cc, s.a || 1);
      shardGfx.fillTriangle(
        s.x + s.pts[0], s.y + s.pts[1],
        s.x + s.pts[2], s.y + s.pts[3],
        s.x + s.pts[4], s.y + s.pts[5]
      );
    });

    const title = this.add.text(640, 200, 'VÉU PARTIDO', {
      fontSize: '58px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#4400aa',
      strokeThickness: 8,
      shadow: { offsetX: 2, offsetY: 4, color: '#220055', blur: 10, fill: true },
    }).setOrigin(0.5).setDepth(6).setAlpha(0);

    const tagline = this.add.text(640, 262, 'O Véu rasgou. O mundo se desfaz.', {
      fontSize: '15px',
      color: '#9966cc',
      stroke: '#000',
      strokeThickness: 3,
      fontStyle: 'italic',
    }).setOrigin(0.5).setDepth(6).setAlpha(0);

    this.tweens.add({
      targets: title,
      alpha: 1,
      y: 195,
      duration: 1200,
      ease: 'Power3',
    });
    this.tweens.add({
      targets: tagline,
      alpha: 1,
      delay: 600,
      duration: 900,
      ease: 'Power2',
    });

    this.tweens.add({
      targets: shardGfx,
      angle: 8,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  _buildMenu() {
    const menuItems = [
      { label: 'COMEÇAR JOGO', action: () => this._startGame() },
      { label: 'COMO JOGAR',   action: () => this._showControls() },
      { label: 'SAIR',         action: () => this._exitGame() },
    ];

    menuItems.forEach((item, i) => {
      const y = 345 + i * 55;
      const bg = this.add.graphics();
      bg.fillStyle(0x000000, 0.5);
      bg.fillRoundedRect(490, y - 20, 300, 42, 8);
      bg.lineStyle(1, 0x7744aa, 0.8);
      bg.strokeRoundedRect(490, y - 20, 300, 42, 8);
      bg.setDepth(7).setAlpha(0);

      const text = this.add.text(640, y, item.label, {
        fontSize: '22px',
        color: '#ccaaff',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 3,
      }).setOrigin(0.5).setDepth(8).setAlpha(0);

      this.tweens.add({
        targets: [bg, text],
        alpha: 1,
        delay: 800 + i * 150,
        duration: 500,
      });

      const zone = this.add.zone(640, y, 300, 42).setInteractive();
      zone.on('pointerover', () => {
        text.setStyle({ color: '#ffffff' });
        bg.clear();
        bg.fillStyle(0x6633aa, 0.7);
        bg.fillRoundedRect(490, y - 20, 300, 42, 8);
        bg.lineStyle(2, 0xcc88ff, 1);
        bg.strokeRoundedRect(490, y - 20, 300, 42, 8);
      });
      zone.on('pointerout', () => {
        text.setStyle({ color: '#ccaaff' });
        bg.clear();
        bg.fillStyle(0x000000, 0.5);
        bg.fillRoundedRect(490, y - 20, 300, 42, 8);
        bg.lineStyle(1, 0x7744aa, 0.8);
        bg.strokeRoundedRect(490, y - 20, 300, 42, 8);
      });
      zone.on('pointerdown', item.action);
    });
  }

  _buildLore() {
    const loreText = [
      '"O Véu rasgou. A entropia começou a vazar',
      'pelo mundo como veneno em água parada."',
    ].join('\n');

    this.add.text(640, 530, loreText, {
      fontSize: '13px',
      color: '#6655aa',
      fontStyle: 'italic',
      stroke: '#000',
      strokeThickness: 2,
      align: 'center',
    }).setOrigin(0.5).setDepth(7).setAlpha(0.8);

    const chars = this.add.text(640, 580, 'Dit  •  Dullant  •  Sura  •  Dren', {
      fontSize: '12px',
      color: '#554488',
    }).setOrigin(0.5).setDepth(7);

    this.tweens.add({
      targets: chars,
      alpha: 0.3,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  _buildCredits() {
    this.add.text(640, 700, '2 Jogadores | Phaser 3 | RPG 2D', {
      fontSize: '10px',
      color: '#333355',
    }).setOrigin(0.5).setDepth(7);
  }

  _buildParticles() {
    this.time.addEvent({
      delay: 300,
      loop: true,
      callback: () => {
        if (Math.random() > 0.5) return;
        const x = Phaser.Math.Between(200, 1080);
        const y = Phaser.Math.Between(60, 450);
        const g = this.add.graphics();
        g.fillStyle(0x7744cc, 0.6);
        g.fillTriangle(x, y, x - 4, y + 8, x + 4, y + 8);
        g.setDepth(4);
        this.tweens.add({
          targets: g,
          y: y - 30,
          alpha: 0,
          duration: 1800,
          ease: 'Power2',
          onComplete: () => g.destroy(),
        });
      }
    });
  }

  update(time) {
    this._stars.forEach(s => {
      const a = 0.3 + 0.5 * Math.sin(time * 0.001 + s.phase);
      s.g.clear();
      s.g.fillStyle(0xffffff, a);
      s.g.fillCircle(s.x, s.y, s.r);
    });
  }

  _startGame() {
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0);
    overlay.fillRect(0, 0, 1280, 720);
    overlay.setDepth(1000);

    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        this.scene.start('GameScene', { levelIndex: 0 });
      }
    });
  }

  _showControls() {
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRoundedRect(240, 120, 800, 480, 12);
    overlay.lineStyle(2, 0x7744aa, 1);
    overlay.strokeRoundedRect(240, 120, 800, 480, 12);
    overlay.setDepth(900);

    const lines = [
      'CONTROLES',
      '',
      'Jogador 1 (Dit — Metamorfo)',
      '  Movimento: W A S D',
      '  Ataque: E',
      '  Habilidade: Q',
      '',
      'Jogador 2 (Dullant — Duelista)',
      '  Movimento: ↑ ↓ ← →',
      '  Ataque: K',
      '  Habilidade: L',
      '',
      'Dica: Os dois jogadores devem cooperar!',
      'Mana se regenera com o tempo.',
      'Habilidades causam dano em área.',
      '',
      '[ Clique para fechar ]',
    ];

    const t = this.add.text(640, 160, lines.join('\n'), {
      fontSize: '16px',
      color: '#ccaaff',
      stroke: '#000',
      strokeThickness: 2,
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5, 0).setDepth(901);

    const close = this.add.zone(640, 360, 800, 480).setInteractive().setDepth(902);
    close.on('pointerdown', () => {
      overlay.destroy();
      t.destroy();
      close.destroy();
    });
  }

  _exitGame() {
    const t = this.add.text(640, 360, 'Obrigado por jogar Véu Partido!', {
      fontSize: '24px',
      color: '#9966cc',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(1000);

    this.tweens.add({
      targets: t,
      alpha: 0,
      delay: 2000,
      duration: 500,
    });
  }
}
