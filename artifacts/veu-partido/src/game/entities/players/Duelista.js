import Player from './Player.js';
import CraftingSystem from '../../systems/CraftingSystem.js';
import { COLORS } from '../../constants.js';

export default class Duelista extends Player {
  constructor(scene, x, y, playerIndex) {
    super(scene, x, y, 'duelista', playerIndex);
    this.craftingSystem = new CraftingSystem(this);
    this.essenceProjectiles = null;
    this.doubleActionUsed = false;
    this.lendWeapon = false;
  }

  craftWeapon(enemies) {
    const quality = this.craftingSystem.detectMaterialOnGround(enemies);
    return this.craftingSystem.craft(quality);
  }

  craftWeaponManual(quality) {
    return this.craftingSystem.craft(quality);
  }

  getAttackBonus() {
    return this.craftingSystem.getAttackBonus();
  }

  onTurnStart() {
    this.doubleActionUsed = false;
    if (this.intangible) {
      this.intangible.duration--;
      if (this.intangible.duration <= 0) this.intangible = null;
    }
  }

  performEvasion(battleSystem) {
    if (!this.skillTree.isUnlocked('dp1')) return false;
    if ((this.stats.veu || 5) < 3) return false;
    this.defending = true;
    if (this.skillTree.isUnlocked('dp2')) {
      return { evaded: true, counterAttack: true };
    }
    return { evaded: true, counterAttack: false };
  }

  getActions() {
    const base = [
      { type: 'attack', name: 'Disparar', desc: `Atira com ${this.currentWeapon?.name || 'arma improvisa'}`, bonus: this.getAttackBonus() },
      { type: 'defend', name: 'Esquivar', desc: 'Tenta esquivar do próximo ataque' },
    ];
    base.push({
      type: 'craft',
      name: 'Improvisar Arma',
      desc: 'Cria arma com material disponível no ambiente',
    });
    if (this.currentWeapon) {
      base.push({
        type: 'attack',
        name: `Atacar com ${this.currentWeapon.name}`,
        desc: `Dano base: ${this.currentWeapon.damage}`,
        bonus: this.currentWeapon.damage - 8,
        weapon: this.currentWeapon,
      });
    }
    return base;
  }
}
