import { COLORS, SCREEN_W, SCREEN_H } from '../constants.js';
import DialogSystem from '../systems/DialogSystem.js';
import InputSNES from '../core/InputSNES.js';

const SPEAKER_COLORS = {
  caio: '#3ec9a0',
  rael: '#5aaaee',
  sura: '#c47afe',
  dren: '#e05c6a',
  mercador: '#e09a3a',
  sobrevivente: '#8a86a0',
  amaldicado: '#c47afe',
  oraculo: '#7c6af7',
  npc: '#e8e4f0',
};

export default class DialogScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Dialog' });
  }

  init(data) {
    this.dialogs = data.dialogs || [];
    this.returnScene = data.returnScene || 'Explore';
    this.returnData = data.returnData || {};
  }

  create() {
    this.cameras.main.setBackgroundColor(0x000000);
    this.cameras.main.setAlpha(0);

    const boxH = SCREEN_H * 0.3;
    const boxY = SCREEN_H - boxH - 10;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.4);
    overlay.fillRect(0, 0, SCREEN_W, SCREEN_H);

    const boxBg = this.add.graphics();
    boxBg.fillStyle(COLORS.BG2, 0.96);
    boxBg.fillRect(10, boxY, SCREEN_W - 20, boxH);
    boxBg.lineStyle(1, COLORS.ACCENT, 0.4);
    boxBg.strokeRect(10, boxY, SCREEN_W - 20, boxH);
    boxBg.lineStyle(2, COLORS.ACCENT2, 0.6);
    boxBg.beginPath();
    boxBg.moveTo(10, boxY);
    boxBg.lineTo(SCREEN_W - 10, boxY);
    boxBg.strokePath();

    this.speakerText = this.add.text(30, boxY + 12, '', {
      fontFamily: 'monospace', fontSize: '11px', color: '#c47afe', letterSpacing: 2,
    }).setDepth(10);

    this.dialogText = this.add.text(30, boxY + 35, '', {
      fontFamily: 'Georgia, serif', fontSize: '15px', color: '#e8e4f0',
      wordWrap: { width: SCREEN_W - 80 }, lineSpacing: 4,
    }).setDepth(10);

    this.continueHint = this.add.text(SCREEN_W - 30, boxY + boxH - 18, '[ F / L / Enter ]', {
      fontFamily: 'monospace', fontSize: '9px', color: '#4a4760',
    }).setOrigin(1, 1).setDepth(10);

    this.tweens.add({ targets: this.continueHint, alpha: 0.2, duration: 700, yoyo: true, repeat: -1 });

    this.portraitBg = this.add.graphics();
    this.portraitBg.fillStyle(COLORS.BG3, 1);
    this.portraitBg.fillRect(SCREEN_W - 130, boxY + 10, 110, boxH - 20);
    this.portraitBg.lineStyle(1, COLORS.BORDER, 0.5);
    this.portraitBg.strokeRect(SCREEN_W - 130, boxY + 10, 110, boxH - 20);
    this.portraitGfx = this.add.graphics().setDepth(10);

    this.dialogSys = new DialogSystem(this);
    this.input2 = new InputSNES(this);

    this.input.keyboard.on('keydown-F', () => this.dialogSys.skip());
    this.input.keyboard.on('keydown-L', () => this.dialogSys.skip());
    this.input.keyboard.on('keydown-ENTER', () => this.dialogSys.skip());
    this.input.keyboard.on('keydown-SPACE', () => this.dialogSys.skip());

    this.dialogSys.start(this.dialogs, () => this.endDialog());
  }

  update() {
    this.input2.update();
    if (this.input2.justPressed(1, 'action') || this.input2.justPressed(2, 'action')) {
      this.dialogSys.skip();
    }
  }

  updateDialogText(text, current) {
    if (this.dialogText) this.dialogText.setText(text);
    if (this.speakerText && current) {
      const sp = current.speaker || 'npc';
      const col = SPEAKER_COLORS[sp.toLowerCase()] || '#e8e4f0';
      this.speakerText.setText(sp.toUpperCase()).setColor(col);
      this.drawPortrait(sp, col);
    }
  }

  drawPortrait(speaker, color) {
    if (!this.portraitGfx) return;
    this.portraitGfx.clear();
    const x = SCREEN_W - 75;
    const y = this.cameras.main.height - this.cameras.main.height * 0.3 + 40;
    const hexColor = parseInt(color.replace('#', ''), 16);
    this.portraitGfx.fillStyle(hexColor, 0.8);
    this.portraitGfx.fillRect(x - 20, y - 40, 40, 60);
    this.portraitGfx.fillCircle(x, y - 52, 16);
    this.portraitGfx.fillStyle(0xffffff, 0.1);
    this.portraitGfx.fillRect(x - 20, y - 40, 40, 8);
  }

  endDialog() {
    this.scene.stop();
    this.scene.resume(this.returnScene, this.returnData);
  }
}
