import { COLORS, SCREEN_W, SCREEN_H, CLASS_COLORS } from '../constants.js';
import InputSNES from '../core/InputSNES.js';

export default class SkillTreeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SkillTree' });
    this.selectedNode = null;
    this.selectedBranch = 0;
    this.selectedNodeIdx = 0;
  }

  init(data) {
    this.player = data.player;
    this.returnScene = data.returnScene || 'Explore';
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.BG);
    this.cameras.main.fadeIn(300, 0, 0, 0);

    const bg = this.add.graphics();
    bg.fillGradientStyle(COLORS.BG, COLORS.BG, COLORS.BG3, COLORS.BG3, 1);
    bg.fillRect(0, 0, SCREEN_W, SCREEN_H);

    const p = this.player;
    const clr = CLASS_COLORS[p.classType] || COLORS.ACCENT;

    this.add.text(SCREEN_W / 2, 20, `ÁRVORE DE HABILIDADES — ${p.className.toUpperCase()}`, {
      fontFamily: 'monospace', fontSize: '11px', color: '#' + clr.toString(16).padStart(6, '0'), letterSpacing: 3,
    }).setOrigin(0.5);

    this.pointsText = this.add.text(SCREEN_W / 2, 40, `Pontos: ${p.skillTree.points}`, {
      fontFamily: 'monospace', fontSize: '10px', color: '#e09a3a',
    }).setOrigin(0.5);

    this.buildTree();

    this.input2 = new InputSNES(this);
    this.input.keyboard.on('keydown-TAB', () => this.closeScene());
    this.input.keyboard.on('keydown-ESC', () => this.closeScene());
    this.input.keyboard.on('keydown-G', () => this.closeScene());
    this.input.keyboard.on('keydown-F', () => this.unlockSelected());
    this.input.keyboard.on('keydown-UP', () => this.moveNodeSel(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.moveNodeSel(1));
    this.input.keyboard.on('keydown-LEFT', () => this.moveBranchSel(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.moveBranchSel(1));

    this.add.text(SCREEN_W / 2, SCREEN_H - 20, 'F: Desbloquear | ←→: Trocar Ramo | ↑↓: Trocar Nó | G/ESC: Fechar', {
      fontFamily: 'monospace', fontSize: '9px', color: '#4a4760',
    }).setOrigin(0.5);

    this.descBox = this.add.text(SCREEN_W / 2, SCREEN_H - 45, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#8a86a0',
    }).setOrigin(0.5);
  }

  buildTree() {
    this.nodeButtons = [];
    const branches = Object.entries(this.player.skillTree.getBranches());
    const branchW = SCREEN_W / branches.length;

    branches.forEach(([key, branch], bi) => {
      const cx = branchW * bi + branchW / 2;

      this.add.text(cx, 68, branch.name, {
        fontFamily: 'monospace', fontSize: '9px', color: '#c47afe', letterSpacing: 1,
      }).setOrigin(0.5);

      branch.nodes.forEach((node, ni) => {
        const y = 110 + ni * 110;
        const unlocked = this.player.skillTree.isUnlocked(node.id);
        const canUnlock = this.player.skillTree.canUnlock(node.id);
        const bg_c = unlocked ? 0x2a1f3a : (canUnlock ? COLORS.BG3 : COLORS.BG2);
        const border_c = unlocked ? 0x7c6af7 : (canUnlock ? COLORS.ACCENT : COLORS.BORDER);

        const gfx = this.add.graphics();
        gfx.fillStyle(bg_c, 1);
        gfx.fillRect(cx - 65, y, 130, 90);
        gfx.lineStyle(2, border_c, 1);
        gfx.strokeRect(cx - 65, y, 130, 90);

        if (node.ultimate) {
          gfx.lineStyle(1, COLORS.AMBER, 0.5);
          gfx.strokeRect(cx - 63, y + 2, 126, 86);
        }

        const tierColor = node.ultimate ? '#e09a3a' : '#7c6af7';
        this.add.text(cx - 58, y + 5, `T${node.tier}${node.ultimate ? ' ★' : ''}`, {
          fontFamily: 'monospace', fontSize: '8px', color: tierColor,
        });

        this.add.text(cx, y + 18, node.name, {
          fontFamily: 'monospace', fontSize: '9px', color: unlocked ? '#e8e4f0' : '#8a86a0',
          wordWrap: { width: 118 }, align: 'center',
        }).setOrigin(0.5, 0);

        this.add.text(cx, y + 50, node.desc, {
          fontFamily: 'monospace', fontSize: '8px', color: '#4a4760',
          wordWrap: { width: 118 }, align: 'center', lineSpacing: 1,
        }).setOrigin(0.5, 0);

        const costT = this.add.text(cx + 55, y + 75, `Custo: ${node.cost}`, {
          fontFamily: 'monospace', fontSize: '7px', color: '#e09a3a',
        }).setOrigin(1, 1);

        if (unlocked) {
          const check = this.add.text(cx - 55, y + 75, '✓', {
            fontFamily: 'monospace', fontSize: '12px', color: '#6bcf8a',
          });
        }

        this.nodeButtons.push({ gfx, node, branchIdx: bi, nodeIdx: ni, cx, y });

        if (ni < branch.nodes.length - 1) {
          const connGfx = this.add.graphics();
          connGfx.lineStyle(1, COLORS.BORDER, 0.5);
          connGfx.beginPath();
          connGfx.moveTo(cx, y + 90);
          connGfx.lineTo(cx, y + 110);
          connGfx.strokePath();
        }
      });
    });

    this.updateNodeSelection();
  }

  updateNodeSelection() {
    const nodeObj = this.nodeButtons.find(n => n.branchIdx === this.selectedBranch && n.nodeIdx === this.selectedNodeIdx);
    if (nodeObj) {
      this.descBox?.setText(nodeObj.node.desc);
    }
  }

  moveBranchSel(dir) {
    const maxBranch = Object.keys(this.player.skillTree.getBranches()).length - 1;
    this.selectedBranch = Phaser.Math.Clamp(this.selectedBranch + dir, 0, maxBranch);
    this.updateNodeSelection();
  }

  moveNodeSel(dir) {
    const branch = Object.values(this.player.skillTree.getBranches())[this.selectedBranch];
    const maxNode = (branch?.nodes?.length || 1) - 1;
    this.selectedNodeIdx = Phaser.Math.Clamp(this.selectedNodeIdx + dir, 0, maxNode);
    this.updateNodeSelection();
  }

  unlockSelected() {
    const nodeObj = this.nodeButtons.find(n => n.branchIdx === this.selectedBranch && n.nodeIdx === this.selectedNodeIdx);
    if (!nodeObj) return;
    const success = this.player.skillTree.unlock(nodeObj.node.id);
    if (success) {
      this.pointsText.setText(`Pontos: ${this.player.skillTree.points}`);
      this.scene.restart({ player: this.player, returnScene: this.returnScene });
    }
  }

  update() {
    this.input2.update();
    if (this.input2.justPressed(1, 'menu') || this.input2.justPressed(1, 'skill')) this.closeScene();
    if (this.input2.justPressed(1, 'up')) this.moveNodeSel(-1);
    if (this.input2.justPressed(1, 'down')) this.moveNodeSel(1);
    if (this.input2.justPressed(1, 'left')) this.moveBranchSel(-1);
    if (this.input2.justPressed(1, 'right')) this.moveBranchSel(1);
    if (this.input2.justPressed(1, 'action')) this.unlockSelected();
  }

  closeScene() {
    this.cameras.main.fadeOut(200, 0, 0, 0, (cam, p) => {
      if (p === 1) {
        this.scene.stop();
        this.scene.resume(this.returnScene);
      }
    });
  }
}
