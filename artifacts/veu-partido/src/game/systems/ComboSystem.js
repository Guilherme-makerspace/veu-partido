export const COMBOS = [
  {
    id: 'eco_compartilhado',
    name: 'Eco Compartilhado',
    classes: ['xama', 'voraz'],
    trigger: (p1, p2, action) => {
      const xama = [p1, p2].find(p => p.classType === 'xama');
      const voraz = [p1, p2].find(p => p.classType === 'voraz');
      return xama && voraz && action.type === 'skill' && action.path === 'mistico' && voraz.activeCurses.length > 0;
    },
    effect: (p1, p2) => {
      const voraz = [p1, p2].find(p => p.classType === 'voraz');
      if (voraz) {
        voraz.stats.eco = Math.min(voraz.stats.eco + 8, voraz.maxStats.eco);
        voraz.nextBurstElemental = true;
      }
      return 'Eco Compartilhado! Eco de Dren +8 — próximo burst é elemental!';
    },
  },
  {
    id: 'essencia_armada',
    name: 'Essência Armada',
    classes: ['metamorfo', 'duelista'],
    trigger: (p1, p2, action) => {
      const meta = [p1, p2].find(p => p.classType === 'metamorfo');
      const duel = [p1, p2].find(p => p.classType === 'duelista');
      return meta && duel && action.type === 'essenceShare' && meta.essences.some(e => e.type === 'voadora');
    },
    effect: (p1, p2) => {
      const duel = [p1, p2].find(p => p.classType === 'duelista');
      const meta = [p1, p2].find(p => p.classType === 'metamorfo');
      if (duel && meta) {
        const ess = meta.essences.find(e => e.type === 'voadora');
        duel.essenceProjectiles = { trait: ess.trait, charges: 3 };
      }
      return 'Essência Armada! Rael dispara com traço da criatura por 3 tiros!';
    },
  },
  {
    id: 'maldicao_transferida',
    name: 'Maldição Transferida',
    classes: ['voraz', '*'],
    trigger: (p1, p2, action) => {
      const voraz = [p1, p2].find(p => p.classType === 'voraz');
      return voraz && action.type === 'transferCurse' && voraz.activeCurses.length > 0;
    },
    effect: (p1, p2) => {
      const voraz = [p1, p2].find(p => p.classType === 'voraz');
      const ally = [p1, p2].find(p => p !== voraz);
      if (voraz && ally) {
        const curse = voraz.activeCurses.shift();
        ally.tempCurse = { ...curse, duration: 2, bonus: true };
      }
      return 'Maldição Transferida! Aliado recebe debuff + stat bonus por 2 turnos!';
    },
  },
  {
    id: 'ruptura_em_cadeia',
    name: 'Ruptura em Cadeia',
    classes: ['xama', 'duelista'],
    trigger: (p1, p2, action) => {
      const xama = [p1, p2].find(p => p.classType === 'xama');
      const duel = [p1, p2].find(p => p.classType === 'duelista');
      return xama && duel && action.type === 'attack' && action.actor === duel &&
        action.target && action.target.debuffs && action.target.debuffs.includes('fratura');
    },
    effect: (p1, p2, action) => {
      if (action.target) {
        action.target.debuffs = action.target.debuffs || [];
        action.target.debuffs.push('fragmentado');
        action.ignoreArmor = true;
      }
      return 'Ruptura em Cadeia! Disparo ignora armadura + aplica Fragmentado!';
    },
  },
  {
    id: 'sombra_de_veu',
    name: 'Sombra de Véu',
    classes: ['metamorfo', 'xama'],
    trigger: (p1, p2, action) => {
      const meta = [p1, p2].find(p => p.classType === 'metamorfo');
      const xama = [p1, p2].find(p => p.classType === 'xama');
      return meta && xama && action.type === 'skill' && action.name === 'Покров' &&
        meta.essences.some(e => e.trait === 'invisivel');
    },
    effect: (p1, p2) => {
      const meta = [p1, p2].find(p => p.classType === 'metamorfo');
      if (meta) meta.intangible = { duration: 1 };
      return 'Sombra de Véu! Dit fica intangível por 1 turno!';
    },
  },
  {
    id: 'engrenagem_de_caos',
    name: 'Engrenagem de Caos',
    classes: ['duelista', 'voraz'],
    trigger: (p1, p2, action) => {
      const duel = [p1, p2].find(p => p.classType === 'duelista');
      const voraz = [p1, p2].find(p => p.classType === 'voraz');
      return duel && voraz && action.type === 'burst' && action.actor === voraz &&
        duel.currentWeapon && duel.currentWeapon.quality === 'S' && duel.lendWeapon;
    },
    effect: (p1, p2) => {
      const voraz = [p1, p2].find(p => p.classType === 'voraz');
      if (voraz) voraz.nextBurstCombined = true;
      return 'Engrenagem de Caos! Burst de Dren combina físico + entrópico!';
    },
  },
];

export default class ComboSystem {
  constructor() {
    this.lastCombo = null;
    this.comboHistory = [];
  }

  check(p1, p2, action) {
    for (const combo of COMBOS) {
      try {
        if (combo.trigger(p1, p2, action)) {
          const msg = combo.effect(p1, p2, action);
          this.lastCombo = combo.id;
          this.comboHistory.push({ id: combo.id, name: combo.name });
          return { triggered: true, name: combo.name, message: msg };
        }
      } catch (e) {}
    }
    return { triggered: false };
  }
}
