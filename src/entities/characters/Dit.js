import { Player } from '../Player.js';
import bus from '../../utils/EventBus.js';

export class Dit extends Player {
  constructor(scene, x, y, playerId) {
    super(scene, x, y, {
      playerId,
      name: 'Dit',
      characterClass: 'metamorfo',
      color: 0x7c4dff,
      accentColor: 0x4a148c,
      maxHp: 110,
      maxMana: 60,
      attack: 14,
      skillDmg: 22,
      baseSpeed: 155,
      attackCooldown: 380,
      skillCooldown: 3000,
    });

    this.essenceStacks = 0;
    this.maxEssenceStacks = 5;
    this.absorbedTraits = [];
  }

  performAttack() {
    this.isAttacking = true;
    this.attackCooldown = this.scene.time.now + this.attackCooldownMax;

    const w = this.scene.add.graphics();
    const dmgMultiplier = 1 + this.essenceStacks * 0.15;
    w.fillStyle(0x9c27b0, 0.9);
    w.fillRect(this.x + this.facing * 30 - 15, this.y - 45, 50 * this.facing, 35);
    w.setDepth(12);

    this.scene.time.delayedCall(150, () => {
      w.destroy();
      this.isAttacking = false;
    });

    bus.emit('playerAttack', {
      player: this,
      x: this.x + this.facing * 55,
      y: this.y - 28,
      damage: Math.round(this.getAttack() * dmgMultiplier),
    });
  }

  performSkill() {
    if (this.mana < 20) return;
    super.performSkill();
    this.mana -= 20;

    const ripple = this.scene.add.graphics();
    ripple.lineStyle(3, 0x9c27b0, 1);
    ripple.strokeCircle(this.x, this.y - 30, 20);
    ripple.setDepth(13);

    this.scene.tweens.add({
      targets: ripple,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => ripple.destroy(),
    });

    const absorbDmg = this.getSkillDmg() + this.essenceStacks * 5;

    bus.emit('playerSkill', {
      player: this,
      skillName: 'Absorção de Essência',
      x: this.x,
      y: this.y - 30,
      radius: 80,
      damage: absorbDmg,
    });

    bus.emit('showSkillLabel', {
      x: this.x,
      y: this.y - 80,
      label: 'ABSORÇÃO',
      color: '#9c27b0',
    });
  }

  absorbEssence() {
    if (this.essenceStacks < this.maxEssenceStacks) {
      this.essenceStacks++;
      bus.emit('essenceAbsorbed', { player: this, stacks: this.essenceStacks });
    }
  }

  takeDamage(amount, attacker) {
    super.takeDamage(amount, attacker);
    if (this.essenceStacks > 0 && Math.random() < 0.25) {
      this.mana = Math.min(this.getMaxMana(), this.mana + 5);
    }
  }

  _redraw() {
    super._redraw();
    if (!this._gfx || !this._gfx.scene) return;
    if (this.essenceStacks > 0) {
      this._gfx.lineStyle(2, 0xce93d8, 0.8);
      this._gfx.strokeCircle(this.x, this.y - 30, 10 + this.essenceStacks * 3);
    }
  }
}
