import { MATERIAL_QUALITY } from '../constants.js';

export const WEAPON_RECIPES = {
  F: { name: 'Ferro Enferrujado', damage: 8, range: 'melee', ecoCost: 0, trait: null, color: 0x8a86a0 },
  D: { name: 'Chicote de Fios', damage: 12, range: 'melee', ecoCost: 1, trait: 'eletric', color: 0xe09a3a },
  C: { name: 'Lança Improvisada', damage: 16, range: 'ranged', ecoCost: 1, trait: null, color: 0x5aaaee },
  B: { name: 'Besta de Sucata', damage: 22, range: 'ranged', ecoCost: 2, trait: 'pierce', color: 0x6bcf8a },
  A: { name: 'Rifle de Fragmentos', damage: 30, range: 'ranged', ecoCost: 2, trait: 'multishot', color: 0xc47afe },
  S: { name: 'Canhão Entrópico', damage: 45, range: 'ranged', ecoCost: 3, trait: 'entropic', special: true, color: 0xe05c6a },
};

export default class CraftingSystem {
  constructor(player) {
    this.player = player;
    this.currentWeapon = null;
  }

  craft(materialQuality, essenceBonus = null) {
    if (!MATERIAL_QUALITY.includes(materialQuality)) {
      return { success: false, msg: 'Qualidade de material inválida.' };
    }
    const ecoCost = WEAPON_RECIPES[materialQuality].ecoCost;
    const reduction = this.player.ecoCostReduction || 0;
    const finalCost = Math.max(0, ecoCost - reduction);

    if (this.player.stats.eco < finalCost) {
      return { success: false, msg: 'Eco insuficiente para crafting!' };
    }

    this.player.stats.eco -= finalCost;
    const weapon = {
      ...WEAPON_RECIPES[materialQuality],
      quality: materialQuality,
      id: Date.now(),
    };

    if (essenceBonus) {
      weapon.essenceTrait = essenceBonus;
      weapon.damage = Math.floor(weapon.damage * 1.15);
    }

    this.currentWeapon = weapon;
    this.player.currentWeapon = weapon;
    return { success: true, weapon };
  }

  getAttackBonus() {
    if (!this.currentWeapon) return 0;
    return this.currentWeapon.damage - 8;
  }

  clearWeapon() {
    this.currentWeapon = null;
    this.player.currentWeapon = null;
  }

  detectMaterialOnGround(enemies) {
    const qualities = ['F', 'D', 'C', 'B', 'A', 'S'];
    const baseIdx = Math.floor(Math.random() * 3);
    const bonus = enemies.filter(e => e.stats.pulso <= 0).length;
    const idx = Math.min(qualities.length - 1, baseIdx + bonus);
    return qualities[idx];
  }
}
