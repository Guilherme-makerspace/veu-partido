import bus from '../utils/EventBus.js';

export const STATS = {
  FRATURA: 'fratura',
  PULSO:   'pulso',
  ECO:     'eco',
  VEU:     'veu',
  LIMIAR:  'limiar',
};

const BASE_XP_PER_LEVEL = 100;
const MAX_LEVEL = 20;

export class ProgressionSystem {
  constructor() {
    this.players = {};
  }

  registerPlayer(id, player) {
    this.players[id] = {
      player,
      level: 1,
      xp: 0,
      xpToNext: BASE_XP_PER_LEVEL,
      stats: {
        [STATS.FRATURA]: 0,
        [STATS.PULSO]:   0,
        [STATS.ECO]:     0,
        [STATS.VEU]:     0,
        [STATS.LIMIAR]:  0,
      },
      passiveCards: [],
      activeCard: null,
      statPoints: 0,
    };
  }

  addXP(playerId, amount) {
    const pd = this.players[playerId];
    if (!pd || pd.level >= MAX_LEVEL) return;

    pd.xp += amount;
    while (pd.xp >= pd.xpToNext && pd.level < MAX_LEVEL) {
      pd.xp -= pd.xpToNext;
      pd.level++;
      pd.xpToNext = Math.floor(BASE_XP_PER_LEVEL * Math.pow(1.3, pd.level - 1));
      pd.statPoints += 2;
      bus.emit('levelUp', { playerId, level: pd.level, statPoints: pd.statPoints });
    }

    bus.emit('xpGained', { playerId, xp: pd.xp, xpToNext: pd.xpToNext, level: pd.level });
  }

  investStat(playerId, stat, points = 1) {
    const pd = this.players[playerId];
    if (!pd || pd.statPoints < points) return false;
    const current = pd.stats[stat] || 0;
    if (current >= 10) return false;
    pd.stats[stat] = Math.min(10, current + points);
    pd.statPoints -= points;
    this._applyStatBonuses(playerId);
    return true;
  }

  _applyStatBonuses(playerId) {
    const pd = this.players[playerId];
    if (!pd) return;
    const { player, stats } = pd;

    player.bonusAttack   = stats[STATS.FRATURA] * 3;
    player.bonusMaxHp    = stats[STATS.PULSO] * 20;
    player.bonusMaxMana  = stats[STATS.ECO] * 10;
    player.bonusSpeed    = stats[STATS.VEU] * 8;
    player.bonusSkillDmg = stats[STATS.LIMIAR] * 3;

    if (player.hp > player.getMaxHp()) player.hp = player.getMaxHp();
    if (player.mana > player.getMaxMana()) player.mana = player.getMaxMana();
  }

  getPlayerData(playerId) {
    return this.players[playerId];
  }

  addPassiveCard(playerId, card) {
    const pd = this.players[playerId];
    if (!pd || pd.passiveCards.length >= 4) return false;
    pd.passiveCards.push(card);
    card.onEquip && card.onEquip(pd.player);
    return true;
  }

  setActiveCard(playerId, card) {
    const pd = this.players[playerId];
    if (!pd) return;
    if (pd.activeCard) pd.activeCard.onUnequip && pd.activeCard.onUnequip(pd.player);
    pd.activeCard = card;
    card.onEquip && card.onEquip(pd.player);
  }
}
