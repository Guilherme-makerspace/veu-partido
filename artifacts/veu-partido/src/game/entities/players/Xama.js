import Player from './Player.js';
import { COLORS } from '../../constants.js';

export const MANTRA_PATHS = {
  DEPREDACAO: 'depredacao',
  DESASTRE: 'desastre',
  MISTICO: 'mistico',
};

export const MANTRAS = {
  depredacao: [
    { id: 'md1', name: 'Garra da Fratura', desc: 'Reduz Fratura inimiga em 30%', ecoCost: 4, type: 'debuff', stat: 'fratura', reduction: 0.3, path: 'depredacao' },
    { id: 'md2', name: 'Peso do Véu', desc: 'Imobiliza inimigo por 1 turno', ecoCost: 6, type: 'stun', path: 'depredacao' },
  ],
  desastre: [
    { id: 'mdes1', name: 'Chama do Abismo', desc: 'Dano elemental + queimando', ecoCost: 5, type: 'skill', bonus: 15, element: 'fire', path: 'desastre' },
    { id: 'mdes2', name: 'Correnteza de Gelo', desc: 'Dano de gelo + lentidão', ecoCost: 5, type: 'skill', bonus: 12, element: 'ice', path: 'desastre' },
  ],
  mistico: [
    { id: 'mm1', name: 'Покров', desc: 'Concede invisibilidade a aliado', ecoCost: 7, type: 'buff', target: 'ally', path: 'mistico' },
    { id: 'mm2', name: 'Eco Primordial', desc: 'Canaliza energia — ataque esmagador', ecoCost: 9, type: 'skill', bonus: 25, path: 'mistico' },
  ],
};

export default class Xama extends Player {
  constructor(scene, x, y, playerIndex) {
    super(scene, x, y, 'xama', playerIndex);
    this.dissonance = 0;
    this.pathHistory = [];
    this.mantrasUsedInRow = 0;
    this.freeNextMantra = false;
  }

  usePath(path) {
    const prevPath = this.pathHistory[this.pathHistory.length - 1];
    if (prevPath && prevPath !== path) {
      const reduction = this.skillTree.isUnlocked('xl1') ? 0.8 : 1;
      this.dissonance += 10 * reduction;
      if (this.dissonance > 100) this.dissonance = 100;
    }
    this.pathHistory.push(path);
    if (this.pathHistory.length > 3) this.pathHistory.shift();
  }

  castMantra(mantra, target, ally) {
    const ecoCost = this.freeNextMantra ? 0 : Math.max(0, (mantra.ecoCost || 4) - (this.ecoCostReduction || 0));
    if (this.stats.eco < ecoCost) return { success: false, msg: 'Eco insuficiente!' };
    if (this.dissonance >= 80 && !this.skillTree.isUnlocked('xl2')) {
      return { success: false, msg: 'Dissonância alta demais! Mantra cancelado.' };
    }

    this.stats.eco -= ecoCost;
    this.usePath(mantra.path);
    this.mantrasUsedInRow++;
    this.freeNextMantra = false;

    if (this.skillTree.isUnlocked('xe3') && this.mantrasUsedInRow >= 3) {
      this.freeNextMantra = true;
      this.mantrasUsedInRow = 0;
    }

    if (mantra.type === 'debuff' && target) {
      target.debuffs = target.debuffs || [];
      target.debuffs.push(mantra.stat || 'fratura');
      if (mantra.stat === 'fratura') {
        target.stats.fratura = Math.floor((target.stats.fratura || 10) * (1 - (mantra.reduction || 0.3)));
      }
    }

    if (mantra.type === 'buff' && ally) {
      ally.intangible = { duration: 1 };
    }

    if (this.skillTree.isUnlocked('xe2') && mantra.path === 'mistico') {
      this.gainEco(2);
    }

    return { success: true, bonus: mantra.bonus || 0, ecoCost };
  }

  getDissonancePenalty() {
    return this.dissonance / 100;
  }

  onTurnStart() {
    this.dissonance = Math.max(0, this.dissonance - 5);
  }

  getActions() {
    const actions = [
      { type: 'attack', name: 'Ataque Físico', desc: 'Ataque básico com cajado', bonus: 0 },
      { type: 'defend', name: 'Concentrar', desc: 'Reduz Dissonância em 15' },
    ];
    for (const path of Object.values(MANTRA_PATHS)) {
      for (const mantra of MANTRAS[path]) {
        actions.push({
          type: 'mantra',
          name: mantra.name,
          desc: mantra.desc,
          mantra,
          ecoCost: mantra.ecoCost,
          path,
        });
      }
    }
    return actions;
  }
}
