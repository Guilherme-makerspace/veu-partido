import { MAX_ESSENCE_SLOTS } from '../constants.js';

export const ESSENCE_LIBRARY = {
  basico: { type: 'basico', trait: 'normal', fraturaBonus: 0, pulsoBonus: 0, ecoBonus: 0, veuBonus: 0, limiaryBonus: 0, label: 'Essência Básica', color: 0x8a86a0 },
  voadora: { type: 'voadora', trait: 'voadora', veuBonus: 1, label: 'Essência Voadora', color: 0x5aaaee },
  resistente: { type: 'resistente', trait: 'resistente', pulsoBonus: 10, shieldOnAbsorb: true, label: 'Essência Resistente', color: 0x6bcf8a },
  venenosa: { type: 'venenosa', trait: 'venenosa', poisonOnAttack: true, label: 'Essência Venenosa', color: 0x6bcf8a },
  eletrica: { type: 'eletrica', trait: 'eletrica', stunChance: 0.15, label: 'Essência Elétrica', color: 0xe09a3a },
  espectral: { type: 'espectral', trait: 'invisivel', fraturaBonus: 2, label: 'Essência Espectral', color: 0xc47afe },
  guardiao: { type: 'guardiao', trait: 'resistente', fraturaBonus: 5, label: 'Essência Guardiã', color: 0xe05c6a },
};

export default class EssenceSystem {
  constructor(player) {
    this.player = player;
    this.slots = [];
    this.maxSlots = MAX_ESSENCE_SLOTS;
  }

  canAbsorb() {
    return this.slots.length < this.maxSlots;
  }

  absorb(essenceType) {
    if (!this.canAbsorb()) return { success: false, msg: 'Slots de essência cheios!' };
    const ess = { ...ESSENCE_LIBRARY[essenceType] || ESSENCE_LIBRARY.basico, id: Date.now() };
    this.slots.push(ess);
    this.applyPassive(ess);
    return { success: true, ess };
  }

  applyPassive(ess) {
    const p = this.player;
    if (ess.fraturaBonus) p.stats.fratura = (p.stats.fratura || 10) + ess.fraturaBonus;
    if (ess.pulsoBonus) {
      p.stats.pulso = (p.stats.pulso || 100) + ess.pulsoBonus;
      p.maxStats.pulso = (p.maxStats.pulso || 100) + ess.pulsoBonus;
    }
    if (ess.ecoBonus) p.stats.eco = (p.stats.eco || 50) + ess.ecoBonus;
    if (ess.veuBonus) p.stats.veu = (p.stats.veu || 5) + ess.veuBonus;
  }

  remove(id) {
    const idx = this.slots.findIndex(e => e.id === id);
    if (idx === -1) return false;
    const ess = this.slots.splice(idx, 1)[0];
    this.removePassive(ess);
    return true;
  }

  removePassive(ess) {
    const p = this.player;
    if (ess.fraturaBonus) p.stats.fratura = Math.max(1, (p.stats.fratura || 10) - ess.fraturaBonus);
    if (ess.pulsoBonus) {
      p.maxStats.pulso = Math.max(10, (p.maxStats.pulso || 100) - ess.pulsoBonus);
      p.stats.pulso = Math.min(p.stats.pulso, p.maxStats.pulso);
    }
    if (ess.veuBonus) p.stats.veu = Math.max(1, (p.stats.veu || 5) - ess.veuBonus);
  }

  getTraits() {
    return this.slots.map(e => e.trait);
  }

  hasTrait(trait) {
    return this.slots.some(e => e.trait === trait);
  }

  count() {
    return this.slots.length;
  }
}
