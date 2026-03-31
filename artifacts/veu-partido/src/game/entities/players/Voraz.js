import Player from './Player.js';
import CurseSystem from '../../systems/CurseSystem.js';
import { COLORS } from '../../constants.js';

export default class Voraz extends Player {
  constructor(scene, x, y, playerIndex) {
    super(scene, x, y, 'voraz', playerIndex);
    this.curseSystem = new CurseSystem(this);
    this.activeCurses = this.curseSystem.curses;
    this.revengeCounter = 0;
    this.maxRevenge = 100;
    this.nextBurstElemental = false;
    this.nextBurstCombined = false;
    this.burstFreeturns = 0;
  }

  onDamage(amount) {
    const rate = this.skillTree.isUnlocked('vl1') ? 1.2 : 1;
    this.revengeCounter = Math.min(this.maxRevenge, this.revengeCounter + Math.floor(amount * rate));

    if (this.collapsed && this.skillTree.isUnlocked('vp2')) {
      this.triggerBurst();
    }

    if (this.collapsed && this.skillTree.isUnlocked('vv3')) {
      this.collapsed = false;
      this.stats.pulso = 5;
    }
  }

  absorbCurse(curseId) {
    const result = this.curseSystem.absorb(curseId);
    if (result.success) {
      if (this.skillTree.isUnlocked('vp1')) this.heal(10);
      if (this.skillTree.isUnlocked('vee2') && this.curseSystem.count() >= 2) {
        this.gainEco(5);
      }
    }
    return result;
  }

  triggerBurst() {
    if (this.revengeCounter <= 0) return { success: false, msg: 'Revenge Counter vazio!' };
    const curseCount = this.curseSystem.count();
    let power = Math.floor(this.revengeCounter * 0.5);
    const isTriple = this.skillTree.isUnlocked('vf3') && curseCount >= 3;
    const isCombined = this.nextBurstCombined;
    const isElemental = this.nextBurstElemental;

    if (isTriple) power *= 3;
    if (isCombined) power = Math.floor(power * 1.5);
    if (isElemental) power = Math.floor(power * 1.3);
    if (this.curseSystem.hasType('fome') && this.skillTree.isUnlocked('vf2')) {
      power = Math.floor(power * 1.2);
    }

    this.revengeCounter = 0;
    this.nextBurstCombined = false;
    this.nextBurstElemental = false;

    if (this.skillTree.isUnlocked('vee3')) {
      this.burstFreeturns = 2;
    }

    return {
      success: true,
      type: isTriple ? 'burst_triple' : 'burst',
      bonus: power,
      ecoCost: 0,
    };
  }

  transferCurse(ally) {
    return this.curseSystem.transfer(ally);
  }

  onTurnStart() {
    this.curseSystem.processTurn();
    if (this.burstFreeturns > 0) this.burstFreeturns--;
    if (this.stats.pulso <= 0 && !this.dead) {
      if (this.skillTree.isUnlocked('vp3') && this.curseSystem.count() > 0) {
        const reviveHp = Math.floor(this.maxStats.pulso * 0.3);
        this.stats.pulso = reviveHp;
        this.collapsed = false;
      }
    }
  }

  getActions() {
    const actions = [
      { type: 'attack', name: 'Golpe Entrópico', desc: 'Ataque físico com energia corrupta', bonus: 2 },
      { type: 'defend', name: 'Absorver', desc: 'Absorve uma maldição do inimigo' },
    ];
    if (this.revengeCounter >= 20) {
      actions.push({
        type: 'burst',
        name: this.curseSystem.count() >= 3 && this.skillTree.isUnlocked('vf3') ? 'Ira Entrópica' : 'Burst de Revenge',
        desc: `Libera ${Math.floor(this.revengeCounter * 0.5)} de dano acumulado`,
        power: this.revengeCounter,
        ecoCost: 0,
      });
    }
    if (this.curseSystem.count() > 0) {
      actions.push({ type: 'transferCurse', name: 'Transferir Maldição', desc: 'Passa 1 maldição para aliado (com bônus)' });
    }
    return actions;
  }
}
