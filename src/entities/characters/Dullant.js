import { Player } from '../Player.js';
import bus from '../../utils/EventBus.js';

export class Dullant extends Player {
  constructor(scene, x, y, playerId) {
    super(scene, x, y, {
      playerId,
      name: 'Dullant',
      characterClass: 'duelista',
      color: 0x00bcd4,
      accentColor: 0x006064,
      maxHp: 95,
      maxMana: 55,
      attack: 10,
      skillDmg: 28,
      baseSpeed: 175,
      attackCooldown: 300,
      skillCooldown: 2800,
    });

    this.comboCount = 0;
    this.comboTimer = 0;
    this.maxCombo = 4;
  }

  performAttack() {
    if (this.scene.time.now > this.comboTimer) {
      this.comboCount = 0;
    }

    this.comboCount = Math.min(this.comboCount + 1, this.maxCombo);
    this.comboTimer = this.scene.time.now + 1200;

    this.isAttacking = true;
    this.attackCooldown = this.scene.time.now + this.attackCooldownMax;

    const comboColors = [0x00bcd4, 0x26c6da, 0x00e5ff, 0xffffff];
    const c = comboColors[this.comboCount - 1] || 0x00bcd4;
    const dmgMultiplier = 0.7 + this.comboCount * 0.25;

    const w = this.scene.add.graphics();
    w.fillStyle(c, 0.9);

    if (this.comboCount < 3) {
      const sw = this.facing > 0
        ? [this.x + 20, this.y - 48, 55, 22]
        : [this.x - 75, this.y - 48, 55, 22];
      w.fillRect(...sw);
    } else {
      w.fillCircle(this.x + this.facing * 50, this.y - 35, 30);
    }
    w.setDepth(12);

    this.scene.time.delayedCall(this.comboCount === this.maxCombo ? 200 : 120, () => {
      w.destroy();
      this.isAttacking = false;
    });

    const finalDmg = Math.round(this.getAttack() * dmgMultiplier);

    if (this.comboCount === this.maxCombo) {
      this.mana = Math.min(this.getMaxMana(), this.mana + 8);
      bus.emit('showSkillLabel', {
        x: this.x,
        y: this.y - 80,
        label: `COMBO x${this.comboCount}!`,
        color: '#00e5ff',
      });
    }

    bus.emit('playerAttack', {
      player: this,
      x: this.x + this.facing * 55,
      y: this.y - 35,
      damage: finalDmg,
      combo: this.comboCount,
    });
  }

  performSkill() {
    if (this.mana < 25) return;
    super.performSkill();
    this.mana -= 25;
    this.isUsingSkill = true;

    const dash = this.scene.add.graphics();
    dash.fillStyle(0x00e5ff, 0.6);
    dash.fillRect(
      this.facing > 0 ? this.x : this.x - 140,
      this.y - 44,
      140, 44
    );
    dash.setDepth(8);

    const prevX = this.x;
    this.x += this.facing * 110;
    this._clampPosition();

    this.scene.tweens.add({
      targets: dash,
      alpha: 0,
      duration: 250,
      onComplete: () => dash.destroy(),
    });

    this.scene.time.delayedCall(80, () => {
      this.isUsingSkill = false;
    });

    const impactDmg = this.getSkillDmg() + this.comboCount * 4;

    bus.emit('playerSkill', {
      player: this,
      skillName: 'Golpe Acelerado',
      x: this.x,
      y: this.y - 30,
      radius: 65,
      damage: impactDmg,
    });

    bus.emit('showSkillLabel', {
      x: this.x,
      y: this.y - 80,
      label: 'GOLPE ACELERADO',
      color: '#00bcd4',
    });

    this.comboCount = 0;
  }

  _redraw() {
    super._redraw();
    if (!this._gfx || !this._gfx.scene) return;
    if (this.comboCount > 0) {
      for (let i = 0; i < this.comboCount; i++) {
        this._gfx.fillStyle(0x00e5ff, 0.9);
        this._gfx.fillRect(this.x - 16 + i * 9, this.y - 6, 7, 4);
      }
    }
  }
}
