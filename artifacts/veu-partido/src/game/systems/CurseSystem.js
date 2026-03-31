import { MAX_CURSES } from '../constants.js';

export const CURSE_TYPES = {
  fome: {
    id: 'fome',
    name: 'Fome',
    label: 'Fome (+Véu, -Pulso/turno)',
    applyTurn: (player) => {
      player.stats.pulso -= 3;
      player.stats.veu = (player.stats.veu || 5) + 2;
    },
    onApply: (player) => { player.stats.veu = (player.stats.veu || 5) + 2; },
    onRemove: (player) => { player.stats.veu = Math.max(1, (player.stats.veu || 7) - 2); },
    color: 0xe09a3a,
  },
  preguica: {
    id: 'preguica',
    name: 'Preguiça',
    label: 'Preguiça (-Véu, -custo Eco)',
    applyTurn: (player) => {},
    onApply: (player) => { player.stats.veu = Math.max(1, (player.stats.veu || 5) - 1); player.ecoCostReduction = (player.ecoCostReduction || 0) + 1; },
    onRemove: (player) => { player.stats.veu = (player.stats.veu || 4) + 1; player.ecoCostReduction = Math.max(0, (player.ecoCostReduction || 1) - 1); },
    color: 0x8a86a0,
  },
  despedaco: {
    id: 'despedaco',
    name: 'Despedaço',
    label: 'Despedaço (-Fratura)',
    applyTurn: (player) => {},
    onApply: (player) => { player.stats.fratura = Math.max(1, (player.stats.fratura || 10) - 3); },
    onRemove: (player) => { player.stats.fratura = (player.stats.fratura || 7) + 3; },
    color: 0xe05c6a,
  },
};

export default class CurseSystem {
  constructor(player) {
    this.player = player;
    this.curses = [];
    this.maxCurses = MAX_CURSES;
  }

  canAbsorb() {
    return this.curses.length < this.maxCurses;
  }

  absorb(curseId) {
    if (!this.canAbsorb()) return { success: false, msg: 'Máximo de maldições atingido!' };
    const def = CURSE_TYPES[curseId];
    if (!def) return { success: false, msg: 'Tipo de maldição desconhecido.' };
    const curse = { ...def, id: curseId + '_' + Date.now(), duration: -1 };
    this.curses.push(curse);
    if (def.onApply) def.onApply(this.player);
    return { success: true, curse };
  }

  processTurn() {
    for (const curse of [...this.curses]) {
      if (curse.applyTurn) curse.applyTurn(this.player);
      if (curse.duration > 0) {
        curse.duration--;
        if (curse.duration <= 0) this.remove(curse.id);
      }
    }
  }

  remove(id) {
    const idx = this.curses.findIndex(c => c.id === id);
    if (idx === -1) return false;
    const curse = this.curses.splice(idx, 1)[0];
    const def = CURSE_TYPES[curse.id.split('_')[0]];
    if (def && def.onRemove) def.onRemove(this.player);
    return true;
  }

  transfer(toPlayer) {
    if (this.curses.length === 0) return null;
    const curse = this.curses.shift();
    const def = CURSE_TYPES[curse.id.split('_')[0]];
    if (def && def.onRemove) def.onRemove(this.player);
    const newCurse = new CurseSystem(toPlayer);
    newCurse.curses.push({ ...curse, duration: 2, bonus: true });
    if (def && def.onApply) def.onApply(toPlayer);
    toPlayer.tempCurseBonus = true;
    return curse;
  }

  hasType(typeId) {
    return this.curses.some(c => c.id.startsWith(typeId));
  }

  count() {
    return this.curses.length;
  }
}
