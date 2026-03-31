import { COLORS, SCREEN_W, SCREEN_H } from '../constants.js';
import InputSNES from '../core/InputSNES.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu' });
    this.selected = 0;
    this.options = ['Começar Jogo', 'Como Jogar', 'Sair'];
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.BG);
    this.cameras.main.fadeIn(400, 0, 0, 0);

    const bg = this.add.graphics();
    bg.fillGradientStyle(COLORS.BG, COLORS.BG, COLORS.BG2, COLORS.BG2, 1);
    bg.fillRect(0, 0, SCREEN_W, SCREEN_H);

    for (let i = 0; i < 30; i++) {
      const g = this.add.graphics();
      g.fillStyle(COLORS.ACCENT, 0.06);
      g.fillRect(Math.random() * SCREEN_W, Math.random() * SCREEN_H, 1, Math.random() * 80 + 20);
    }

    this.add.text(SCREEN_W / 2, SCREEN_H * 0.2, 'Véu Partido', {
      fontFamily: 'Georgia, serif',
      fontSize: '52px',
      color: '#e8e4f0',
    }).setOrigin(0.5);

    this.add.text(SCREEN_W / 2, SCREEN_H * 0.3, 'MENU PRINCIPAL', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#7c6af7',
      letterSpacing: 4,
    }).setOrigin(0.5);

    this.menuItems = [];
    this.options.forEach((opt, i) => {
      const y = SCREEN_H * 0.48 + i * 50;
      const item = this.add.text(SCREEN_W / 2, y, opt, {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#8a86a0',
      }).setOrigin(0.5);
      this.menuItems.push(item);
    });

    this.cursor = this.add.text(SCREEN_W / 2 - 120, SCREEN_H * 0.48, '▶', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#c47afe',
    }).setOrigin(0.5);

    this.input2 = new InputSNES(this);

    this.input.keyboard.on('keydown-UP', () => this.moveSelection(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.moveSelection(1));
    this.input.keyboard.on('keydown-W', () => this.moveSelection(-1));
    this.input.keyboard.on('keydown-S', () => this.moveSelection(1));
    this.input.keyboard.on('keydown-ENTER', () => this.confirm());
    this.input.keyboard.on('keydown-F', () => this.confirm());
    this.input.keyboard.on('keydown-SPACE', () => this.confirm());

    this.updateSelection();

    this.add.text(SCREEN_W / 2, SCREEN_H - 30, 'W/S ou ↑↓ para navegar · ENTER ou F para confirmar · Controle SNES suportado', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#4a4760',
    }).setOrigin(0.5);
  }

  update() {
    this.input2.update();
    if (this.input2.justPressed(1, 'up')) this.moveSelection(-1);
    if (this.input2.justPressed(1, 'down')) this.moveSelection(1);
    if (this.input2.justPressed(1, 'action')) this.confirm();
  }

  moveSelection(dir) {
    this.selected = (this.selected + dir + this.options.length) % this.options.length;
    this.updateSelection();
    this.sound.play && this.sound.play('menu_nav', { volume: 0.3 }).catch?.(() => {});
  }

  updateSelection() {
    this.menuItems.forEach((item, i) => {
      item.setColor(i === this.selected ? '#e8e4f0' : '#8a86a0');
      item.setFontSize(i === this.selected ? '20px' : '18px');
    });
    this.cursor.y = SCREEN_H * 0.48 + this.selected * 50;
  }

  confirm() {
    const opt = this.options[this.selected];
    if (opt === 'Começar Jogo') {
      this.cameras.main.fadeOut(400, 0, 0, 0, (cam, p) => {
        if (p === 1) this.scene.start('CharSelect');
      });
    } else if (opt === 'Como Jogar') {
      this.showHowToPlay();
    } else if (opt === 'Sair') {
      this.add.text(SCREEN_W / 2, SCREEN_H / 2, 'Feche a janela do navegador.', {
        fontFamily: 'monospace', fontSize: '14px', color: '#e8e4f0',
      }).setOrigin(0.5);
    }
  }

  showHowToPlay() {
    const overlay = this.add.rectangle(SCREEN_W / 2, SCREEN_H / 2, SCREEN_W, SCREEN_H, 0x000000, 0.85);
    const lines = [
      'COMO JOGAR',
      '',
      'Jogador 1: W/A/S/D + F (ação) + G (habilidade) + TAB (menu)',
      'Jogador 2: ↑↓←→ + L (ação) + K (habilidade) + SHIFT (menu)',
      '',
      'Controle SNES: Conecte antes de iniciar o jogo.',
      '',
      'EXPLORAÇÃO: Mova-se pelo mapa, interaja com NPCs.',
      'BATALHA: Turno por turno — ataque, habilidade, defend ou item.',
      '',
      'CLASSES:',
      '  Dit (Metamorfo) — Absorve essências de inimigos',
      '  Dullant (Duelista) — Cria armas com materiais do chão',
      '  Sura (Xamã) — Lança mantras em três caminhos',
      '  Dren (Voraz) — Acumula dano e libera em burst',
      '',
      '[Pressione qualquer tecla para voltar]',
    ];
    const t = this.add.text(SCREEN_W / 2, SCREEN_H / 2, lines.join('\n'), {
      fontFamily: 'monospace', fontSize: '13px', color: '#e8e4f0',
      align: 'center', lineSpacing: 4,
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown', () => { overlay.destroy(); t.destroy(); });
    this.input.once('pointerdown', () => { overlay.destroy(); t.destroy(); });
  }
}
