import Player from './Player.js';
import EssenceSystem from '../../systems/EssenceSystem.js';
import { COLORS } from '../../constants.js';

export default class Metamorfo extends Player {
  constructor(scene, x, y, playerIndex) {
    super(scene, x, y, 'metamorfo', playerIndex);
    this.essenceSystem = new EssenceSystem(this);
    this.essences = this.essenceSystem.slots;
    this.nextBurstElemental = false;
    this.teleportCharge = 1;
    this.resonanceActive = false;
    this.resonanceTurns = 0;
  }

  absorbEssence(essenceType) {
    const result = this.essenceSystem.absorb(essenceType);
    if (result.success) {
      this.playAbsorbFX();
      if (this.skillTree.isUnlocked('puls1')) {
        this.heal(5);
      }
      if (this.skillTree.isUnlocked('lim1')) {
        this.essenceSystem.maxSlots = 6;
      }
    }
    return result;
  }

  playAbsorbFX() {
    const color = this.color;
    const fx = this.scene.add.graphics();
    fx.lineStyle(2, color, 1);
    fx.strokeCircle(0, 0, 5);
    this.container.add(fx);
    this.scene.tweens.add({
      targets: fx,
      scaleX: 3, scaleY: 3, alpha: 0,
      duration: 400,
      onComplete: () => fx.destroy(),
    });
  }

  getAttackBonus() {
    let bonus = 0;
    if (this.skillTree.isUnlocked('bruch1')) {
      bonus += Math.floor(this.essenceSystem.count() * 0.5);
    }
    if (this.skillTree.isUnlocked('bruch2')) {
      bonus += this.essenceSystem.count() * 2;
    }
    return bonus;
  }

  useFragmentoComposto(target, battleSystem) {
    if (!this.skillTree.isUnlocked('bruch3')) return null;
    if (this.essenceSystem.count() < 3) return null;
    const bonus = 30;
    return { type: 'skill', name: 'Fragmento Composto', bonus, ecoCost: 8 };
  }

  useTeleport() {
    if (!this.skillTree.isUnlocked('veu3')) return false;
    if (this.teleportCharge <= 0) return false;
    this.teleportCharge = 0;
    return true;
  }

  onTurnStart() {
    if (this.resonanceActive) {
      this.resonanceTurns--;
      if (this.resonanceTurns <= 0) this.resonanceActive = false;
    }
    if (this.intangible) {
      this.intangible.duration--;
      if (this.intangible.duration <= 0) this.intangible = null;
    }
  }

  getActions() {
    const base = [
      { type: 'attack', name: 'Ataque', desc: 'Ataque físico básico' },
      { type: 'defend', name: 'Defender', desc: 'Defende e recupera 5 Pulso' },
    ];
    if (this.essenceSystem.count() > 0) {
      base.push({ type: 'skill', name: 'Habilidade de Essência', desc: 'Usa a essência ativa', bonus: this.getAttackBonus(), ecoCost: 4 });
    }
    if (this.skillTree.isUnlocked('bruch3') && this.essenceSystem.count() >= 3) {
      base.push({ type: 'skill', name: 'Fragmento Composto', desc: 'Funde 3 essências em ataque único', bonus: 30, ecoCost: 8 });
    }
    return base;
  }
}
