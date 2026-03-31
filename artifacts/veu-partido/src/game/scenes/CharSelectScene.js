import { COLORS, SCREEN_W, SCREEN_H, CLASSES, CLASS_NAMES, CLASS_DESC, CLASS_COLORS } from '../constants.js';
import InputSNES from '../core/InputSNES.js';

const CLASS_LIST = [CLASSES.METAMORFO, CLASSES.DUELISTA, CLASSES.XAMA, CLASSES.VORAZ];

export default class CharSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharSelect' });
    this.p1Select = 0;
    this.p2Select = 1;
    this.p1Confirmed = false;
    this.p2Confirmed = false;
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.BG);
    this.cameras.main.fadeIn(400, 0, 0, 0);

    const bg = this.add.graphics();
    bg.fillGradientStyle(COLORS.BG, COLORS.BG, COLORS.BG3, COLORS.BG3, 1);
    bg.fillRect(0, 0, SCREEN_W, SCREEN_H);

    this.add.text(SCREEN_W / 2, 40, 'ESCOLHA DE PERSONAGENS', {
      fontFamily: 'monospace', fontSize: '13px', color: '#7c6af7', letterSpacing: 4,
    }).setOrigin(0.5);

    this.add.text(SCREEN_W / 2, 70, 'Dois jogadores são obrigatórios', {
      fontFamily: 'monospace', fontSize: '10px', color: '#4a4760',
    }).setOrigin(0.5);

    this.add.text(SCREEN_W * 0.25, 100, 'JOGADOR 1', { fontFamily: 'monospace', fontSize: '11px', color: '#3ec9a0', letterSpacing: 2 }).setOrigin(0.5);
    this.add.text(SCREEN_W * 0.75, 100, 'JOGADOR 2', { fontFamily: 'monospace', fontSize: '11px', color: '#5aaaee', letterSpacing: 2 }).setOrigin(0.5);

    this.cards = [];
    CLASS_LIST.forEach((cls, i) => {
      const x = 80 + i * 290;
      const y = SCREEN_H / 2;
      this.createClassCard(x, y, cls, i);
    });

    this.p1Indicator = this.add.text(0, 0, 'P1 ▶', { fontFamily: 'monospace', fontSize: '12px', color: '#3ec9a0' }).setOrigin(0.5);
    this.p2Indicator = this.add.text(0, 0, 'P2 ▶', { fontFamily: 'monospace', fontSize: '12px', color: '#5aaaee' }).setOrigin(0.5);

    this.statusText = this.add.text(SCREEN_W / 2, SCREEN_H - 60, '', {
      fontFamily: 'monospace', fontSize: '12px', color: '#e8e4f0',
    }).setOrigin(0.5);

    this.add.text(SCREEN_W / 2, SCREEN_H - 30, 'P1: A/D + F(confirmar) | P2: ←→ + L(confirmar)', {
      fontFamily: 'monospace', fontSize: '9px', color: '#4a4760',
    }).setOrigin(0.5);

    this.input2 = new InputSNES(this);

    this.input.keyboard.on('keydown-A', () => { if (!this.p1Confirmed) { this.p1Select = (this.p1Select - 1 + 4) % 4; this.updateCards(); } });
    this.input.keyboard.on('keydown-D', () => { if (!this.p1Confirmed) { this.p1Select = (this.p1Select + 1) % 4; this.updateCards(); } });
    this.input.keyboard.on('keydown-F', () => this.confirmP1());
    this.input.keyboard.on('keydown-LEFT', () => { if (!this.p2Confirmed) { this.p2Select = (this.p2Select - 1 + 4) % 4; this.updateCards(); } });
    this.input.keyboard.on('keydown-RIGHT', () => { if (!this.p2Confirmed) { this.p2Select = (this.p2Select + 1) % 4; this.updateCards(); } });
    this.input.keyboard.on('keydown-L', () => this.confirmP2());

    this.updateCards();
  }

  update() {
    this.input2.update();
    if (this.input2.justPressed(1, 'left') && !this.p1Confirmed) { this.p1Select = (this.p1Select - 1 + 4) % 4; this.updateCards(); }
    if (this.input2.justPressed(1, 'right') && !this.p1Confirmed) { this.p1Select = (this.p1Select + 1) % 4; this.updateCards(); }
    if (this.input2.justPressed(1, 'action')) this.confirmP1();
    if (this.input2.justPressed(2, 'left') && !this.p2Confirmed) { this.p2Select = (this.p2Select - 1 + 4) % 4; this.updateCards(); }
    if (this.input2.justPressed(2, 'right') && !this.p2Confirmed) { this.p2Select = (this.p2Select + 1) % 4; this.updateCards(); }
    if (this.input2.justPressed(2, 'action')) this.confirmP2();
  }

  createClassCard(x, y, cls, idx) {
    const w = 260, h = 280;
    const card = this.add.container(x + w / 2, y);
    const bg = this.add.graphics();
    const color = CLASS_COLORS[cls];
    bg.fillStyle(COLORS.BG2, 1);
    bg.fillRect(-w / 2, -h / 2, w, h);
    bg.lineStyle(2, color, 0.4);
    bg.strokeRect(-w / 2, -h / 2, w, h);

    const topBar = this.add.graphics();
    topBar.fillStyle(color, 0.2);
    topBar.fillRect(-w / 2, -h / 2, w, 4);

    const avatar = this.add.graphics();
    avatar.fillStyle(color, 0.8);
    avatar.fillRect(-20, -h / 2 + 20, 40, 60);
    avatar.fillCircle(0, -h / 2 + 10, 16);

    const clsLabel = this.add.text(0, -h / 2 + 95, cls.toUpperCase(), {
      fontFamily: 'monospace', fontSize: '9px', color: '#' + color.toString(16).padStart(6, '0'), letterSpacing: 2,
    }).setOrigin(0.5);

    const nameText = this.add.text(0, -h / 2 + 115, CLASS_NAMES[cls], {
      fontFamily: 'Georgia, serif', fontSize: '22px', color: '#e8e4f0',
    }).setOrigin(0.5);

    const descText = this.add.text(0, -h / 2 + 155, CLASS_DESC[cls], {
      fontFamily: 'monospace', fontSize: '10px', color: '#8a86a0',
      wordWrap: { width: w - 30 }, align: 'center', lineSpacing: 2,
    }).setOrigin(0.5, 0);

    card.add([bg, topBar, avatar, clsLabel, nameText, descText]);
    this.cards.push({ card, bg, cls, index: idx });
  }

  updateCards() {
    this.cards.forEach(({ card, bg, cls, index }) => {
      const isP1 = index === this.p1Select;
      const isP2 = index === this.p2Select;
      const isConfirmedP1 = isP1 && this.p1Confirmed;
      const isConfirmedP2 = isP2 && this.p2Confirmed;
      const alpha = (isP1 || isP2) ? 1 : 0.4;
      card.setAlpha(alpha);
      const scl = (isP1 || isP2) ? 1.05 : 0.95;
      card.setScale(scl);
    });

    const p1x = 80 + this.p1Select * 290 + 130;
    const p2x = 80 + this.p2Select * 290 + 130;
    this.p1Indicator.setPosition(p1x, SCREEN_H / 2 - 175);
    this.p2Indicator.setPosition(p2x, SCREEN_H / 2 - 160);

    let status = '';
    if (!this.p1Confirmed) status += 'P1: Escolhendo... ';
    else status += `P1: ${CLASS_NAMES[CLASS_LIST[this.p1Select]]} ✓  `;
    if (!this.p2Confirmed) status += 'P2: Escolhendo... ';
    else status += `P2: ${CLASS_NAMES[CLASS_LIST[this.p2Select]]} ✓`;
    this.statusText.setText(status);
  }

  confirmP1() {
    if (this.p1Confirmed) return;
    this.p1Confirmed = true;
    this.updateCards();
    this.checkBothConfirmed();
  }

  confirmP2() {
    if (this.p2Confirmed) return;
    this.p2Confirmed = true;
    this.updateCards();
    this.checkBothConfirmed();
  }

  checkBothConfirmed() {
    if (this.p1Confirmed && this.p2Confirmed) {
      this.statusText.setText('Iniciando...').setColor('#c47afe');
      this.time.delayedCall(600, () => {
        this.cameras.main.fadeOut(400, 0, 0, 0, (cam, p) => {
          if (p === 1) {
            this.scene.start('Explore', {
              p1Class: CLASS_LIST[this.p1Select],
              p2Class: CLASS_LIST[this.p2Select],
            });
          }
        });
      });
    }
  }
}
