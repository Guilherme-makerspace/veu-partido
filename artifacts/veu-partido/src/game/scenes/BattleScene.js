import { COLORS, SCREEN_W, SCREEN_H, CLASS_NAMES, CLASS_COLORS } from '../constants.js';
import InputSNES from '../core/InputSNES.js';
import BattleSystem from '../systems/BattleSystem.js';
import ComboSystem from '../systems/ComboSystem.js';
import Metamorfo from '../entities/players/Metamorfo.js';
import Duelista from '../entities/players/Duelista.js';
import Xama from '../entities/players/Xama.js';
import Voraz from '../entities/players/Voraz.js';
import Enemy from '../entities/enemies/Enemy.js';
import BossEnemy from '../entities/enemies/BossEnemy.js';

const PLAYER_CLASSES = { metamorfo: Metamorfo, duelista: Duelista, xama: Xama, voraz: Voraz };

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Battle' });
    this.battleSystem = null;
    this.comboSystem = null;
    this.menuState = 'main';
    this.selectedAction = 0;
    this.activePlayerIndex = 0;
  }

  init(data) {
    this.incomingPlayers = data.players;
    this.incomingEnemies = data.enemies;
    this.score = data.score;
    this.returnScene = data.returnScene || 'Explore';
    this.p1Class = data.p1Class;
    this.p2Class = data.p2Class;
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.BG);
    this.cameras.main.fadeIn(400, 0, 0, 0);

    this.drawBackground();
    this.positionCombatants();

    this.battleSystem = new BattleSystem(this);
    this.comboSystem = new ComboSystem();
    this.battleSystem.init(this.incomingPlayers, this.incomingEnemies);
    this.battleSystem.onBattleEnd = (result) => this.endBattle(result);

    this.input2 = new InputSNES(this);

    this.createBattleUI();
    this.renderActions();
    this.showTurnIndicator();
  }

  drawBackground() {
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.BG, 1);
    bg.fillRect(0, 0, SCREEN_W, SCREEN_H);
    bg.fillStyle(COLORS.BG3, 1);
    bg.fillRect(0, SCREEN_H * 0.55, SCREEN_W, SCREEN_H * 0.45);
    bg.lineStyle(1, COLORS.ACCENT, 0.2);
    for (let y = SCREEN_H * 0.55; y < SCREEN_H; y += 32) {
      bg.beginPath();
      bg.moveTo(0, y);
      bg.lineTo(SCREEN_W, y);
      bg.strokePath();
    }
    bg.lineStyle(2, COLORS.BORDER, 0.5);
    bg.beginPath();
    bg.moveTo(0, SCREEN_H * 0.55);
    bg.lineTo(SCREEN_W, SCREEN_H * 0.55);
    bg.strokePath();

    this.add.text(SCREEN_W / 2, 16, 'COMBATE', {
      fontFamily: 'monospace', fontSize: '10px', color: '#7c6af7', letterSpacing: 4,
    }).setOrigin(0.5);
  }

  positionCombatants() {
    const players = this.incomingPlayers;
    const enemies = this.incomingEnemies;

    players.forEach((p, i) => {
      const x = 180 + i * 120;
      const y = SCREEN_H * 0.45;
      p.container.x = x;
      p.container.y = y;
    });

    enemies.forEach((e, i) => {
      const x = SCREEN_W - 200 + i * 80;
      const y = SCREEN_H * 0.35;
      e.container.x = x;
      e.container.y = y;
    });
  }

  createBattleUI() {
    this.combatantCards = this.add.graphics();
    this.logText = this.add.text(SCREEN_W / 2, SCREEN_H * 0.58, '', {
      fontFamily: 'monospace', fontSize: '11px', color: '#e8e4f0',
      wordWrap: { width: 600 }, lineSpacing: 2, align: 'center',
    }).setOrigin(0.5, 0).setDepth(10);

    this.comboText = this.add.text(SCREEN_W / 2, SCREEN_H * 0.5, '', {
      fontFamily: 'monospace', fontSize: '13px', color: '#e09a3a',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20).setAlpha(0);

    this.actionMenuBg = this.add.graphics().setDepth(9);
    this.actionTexts = [];

    this.turnText = this.add.text(SCREEN_W / 2, SCREEN_H * 0.52, '', {
      fontFamily: 'monospace', fontSize: '11px', color: '#c47afe',
    }).setOrigin(0.5).setDepth(10);

    this.updateCombatantCards();
  }

  updateCombatantCards() {
    this.combatantCards.clear();
    const all = [...this.incomingPlayers, ...this.incomingEnemies];
    all.forEach((c, i) => {
      const isPlayer = this.incomingPlayers.includes(c);
      const x = c.container.x - 50;
      const y = c.container.y + 20;
      const w = 100, h = 55;
      const clr = isPlayer ? (i === 0 ? 0x3ec9a0 : 0x5aaaee) : 0xe05c6a;
      const isCurrent = this.battleSystem.getCurrentActor() === c;

      this.combatantCards.fillStyle(COLORS.BG2, 0.9);
      this.combatantCards.fillRect(x, y, w, h);
      this.combatantCards.lineStyle(isCurrent ? 2 : 1, clr, isCurrent ? 1 : 0.4);
      this.combatantCards.strokeRect(x, y, w, h);

      const label = isPlayer ? c.className : c.name;
      const pulso = c.stats.pulso;
      const maxPulso = c.maxStats?.pulso || c.maxStats?.pulso || 100;
      const barW = Math.max(0, Math.floor((pulso / maxPulso) * (w - 6)));

      this.combatantCards.fillStyle(COLORS.SURFACE, 1);
      this.combatantCards.fillRect(x + 3, y + 32, w - 6, 8);
      this.combatantCards.fillStyle(isPlayer ? 0x6bcf8a : 0xe05c6a, 1);
      this.combatantCards.fillRect(x + 3, y + 32, barW, 8);

      const t1 = this.add.text(x + w / 2, y + 6, label.toUpperCase(), {
        fontFamily: 'monospace', fontSize: '7px', color: '#' + clr.toString(16).padStart(6, '0'),
      }).setOrigin(0.5, 0).setDepth(11);
      const t2 = this.add.text(x + w / 2, y + 18, `${pulso}/${maxPulso}`, {
        fontFamily: 'monospace', fontSize: '8px', color: '#e8e4f0',
      }).setOrigin(0.5, 0).setDepth(11);
      const t3 = this.add.text(x + w / 2, y + 44, `E:${c.stats.eco || 0}`, {
        fontFamily: 'monospace', fontSize: '7px', color: '#3ec9a0',
      }).setOrigin(0.5, 0).setDepth(11);

      this.actionTexts.push(t1, t2, t3);
    });
  }

  renderActions() {
    this.actionTexts.forEach(t => t?.destroy?.());
    this.actionTexts = [];
    this.actionMenuBg.clear();

    const actor = this.battleSystem.getCurrentActor();
    if (!actor || !this.battleSystem.isPlayerActor(actor)) return;

    const actions = actor.getActions ? actor.getActions() : [
      { type: 'attack', name: 'Atacar', desc: 'Ataque físico' },
      { type: 'defend', name: 'Defender', desc: 'Recupera Pulso' },
    ];

    const menuX = 10, menuY = SCREEN_H * 0.72;
    const menuW = SCREEN_W / 2 - 20, menuH = SCREEN_H * 0.25;

    this.actionMenuBg.fillStyle(COLORS.BG2, 0.92);
    this.actionMenuBg.fillRect(menuX, menuY, menuW, menuH);
    this.actionMenuBg.lineStyle(1, COLORS.ACCENT, 0.4);
    this.actionMenuBg.strokeRect(menuX, menuY, menuW, menuH);

    const playerIdx = this.incomingPlayers.indexOf(actor);
    const pLabel = playerIdx === 0 ? 'P1' : 'P2';
    const pColor = playerIdx === 0 ? '#3ec9a0' : '#5aaaee';
    const t0 = this.add.text(menuX + 8, menuY + 5, `${pLabel} — ${actor.className.toUpperCase()}`, {
      fontFamily: 'monospace', fontSize: '9px', color: pColor,
    }).setDepth(11);
    this.actionTexts.push(t0);

    const visible = actions.slice(0, 6);
    visible.forEach((action, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const ax = menuX + 8 + col * (menuW / 2 - 8);
      const ay = menuY + 22 + row * 22;
      const isSel = i === this.selectedAction;
      const color = isSel ? '#e8e4f0' : '#8a86a0';
      const prefix = isSel ? '▶ ' : '  ';
      const txt = this.add.text(ax, ay, `${prefix}${action.name}`, {
        fontFamily: 'monospace', fontSize: '10px', color,
      }).setDepth(11);
      this.actionTexts.push(txt);

      if (action.ecoCost) {
        const eco = this.add.text(ax + 120, ay, `E:${action.ecoCost}`, {
          fontFamily: 'monospace', fontSize: '9px', color: '#3ec9a0',
        }).setDepth(11);
        this.actionTexts.push(eco);
      }
    });

    const descText = visible[this.selectedAction]?.desc || '';
    const desc = this.add.text(menuX + 8, menuY + menuH - 18, descText, {
      fontFamily: 'monospace', fontSize: '9px', color: '#8a86a0',
    }).setDepth(11);
    this.actionTexts.push(desc);

    this.currentActions = actions;
    this.updateCombatantCards();
  }

  showTurnIndicator() {
    const actor = this.battleSystem.getCurrentActor();
    if (!actor) return;
    const isPlayer = this.battleSystem.isPlayerActor(actor);
    const name = isPlayer ? actor.className : actor.name;
    this.turnText.setText(`Turno de: ${name.toUpperCase()}`);
  }

  update() {
    this.input2.update();

    const actor = this.battleSystem.getCurrentActor();
    if (!actor || !this.battleSystem.isPlayerActor(actor) || this.battleSystem.isAnimating) return;

    const actions = this.currentActions || [];
    const pIdx = this.incomingPlayers.indexOf(actor) + 1;

    if (this.input2.justPressed(pIdx, 'up') || this.input2.justPressed(pIdx, 'left')) {
      this.selectedAction = (this.selectedAction - 1 + actions.length) % actions.length;
      this.renderActions();
    }
    if (this.input2.justPressed(pIdx, 'down') || this.input2.justPressed(pIdx, 'right')) {
      this.selectedAction = (this.selectedAction + 1) % actions.length;
      this.renderActions();
    }
    if (this.input2.justPressed(pIdx, 'action')) {
      this.executeSelectedAction(actor, actions[this.selectedAction]);
    }
    if (this.input2.justPressed(pIdx, 'skill')) {
      this.selectedAction = 0;
      this.renderActions();
    }
  }

  executeSelectedAction(actor, action) {
    if (!action) return;
    const target = this.incomingEnemies.find(e => e.isAlive() || e.stats?.pulso > 0) || this.incomingEnemies[0];
    const ally = this.incomingPlayers.find(p => p !== actor && p.isAlive?.());

    const comboResult = this.comboSystem.check(
      this.incomingPlayers[0], this.incomingPlayers[1],
      { ...action, actor, target }
    );

    if (action.type === 'mantra' && actor.castMantra) {
      const result = actor.castMantra(action.mantra, target, ally);
      if (!result.success) {
        this.updateBattleLog(result.msg);
        return;
      }
      action = { ...action, bonus: result.bonus };
    }

    if (action.type === 'burst' && actor.triggerBurst) {
      const burst = actor.triggerBurst();
      if (!burst.success) {
        this.updateBattleLog(burst.msg);
        return;
      }
      action = { ...action, ...burst };
    }

    if (action.type === 'craft' && actor.craftWeapon) {
      const craftResult = actor.craftWeapon(this.incomingEnemies);
      if (craftResult.success) {
        this.updateBattleLog(`${actor.className} cria ${craftResult.weapon.name}!`);
        this.battleSystem.advanceTurn();
        this.renderActions();
        this.showTurnIndicator();
        return;
      }
      this.updateBattleLog(craftResult.msg || 'Crafting falhou.');
      return;
    }

    const success = this.battleSystem.executePlayerAction(actor, action, target);

    if (success) {
      if (comboResult.triggered) {
        this.showComboEffect(comboResult.name, comboResult.message);
        if (this.score) this.score.addCombo(comboResult.name);
      }
      this.selectedAction = 0;
      this.time.delayedCall(700, () => {
        this.renderActions();
        this.showTurnIndicator();
      });
    }
  }

  updateBattleLog(msg) {
    if (this.logText) {
      const lines = this.logText.text.split('\n');
      lines.push(msg);
      if (lines.length > 4) lines.shift();
      this.logText.setText(lines.join('\n'));
    }
  }

  showComboEffect(name, msg) {
    this.comboText.setText(`COMBO: ${name}!`).setAlpha(1);
    this.tweens.add({
      targets: this.comboText, alpha: 0, y: this.comboText.y - 30,
      duration: 1600, ease: 'Power2',
      onComplete: () => { this.comboText.setAlpha(0).setY(SCREEN_H * 0.5); },
    });
  }

  endBattle(result) {
    const msg = result === 'win' ? 'VITÓRIA!' : 'DERROTA...';
    const color = result === 'win' ? '#6bcf8a' : '#e05c6a';

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, SCREEN_W, SCREEN_H);

    this.add.text(SCREEN_W / 2, SCREEN_H / 2 - 40, msg, {
      fontFamily: 'Georgia, serif', fontSize: '48px', color,
    }).setOrigin(0.5).setDepth(50);

    if (result === 'win') {
      this.incomingEnemies.forEach(e => {
        if (this.score) this.score.addKill(e);
        const expGain = e.scoreValue ? Math.floor(e.scoreValue / 2) : 50;
        this.incomingPlayers.forEach(p => p.gainExp && p.gainExp(expGain));
      });
    }

    this.time.delayedCall(1800, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0, (cam, p) => {
        if (p === 1) {
          if (result === 'win') {
            this.scene.stop();
            const exploreScene = this.scene.get('Explore');
            if (exploreScene) {
              exploreScene.battleTransitionTimer = null;
              this.scene.resume('Explore');
            } else {
              this.scene.start('Explore', {
                p1Class: this.p1Class,
                p2Class: this.p2Class,
                score: this.score,
              });
            }
          } else {
            this.scene.start('GameOver', { score: this.score });
          }
        }
      });
    });
  }
}
