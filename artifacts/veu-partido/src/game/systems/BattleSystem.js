import { BATTLE_TURN_DELAY, COLORS } from '../constants.js';

export default class BattleSystem {
  constructor(scene) {
    this.scene = scene;
    this.players = [];
    this.enemies = [];
    this.turnOrder = [];
    this.currentTurnIndex = 0;
    this.isPlayerTurn = false;
    this.isAnimating = false;
    this.onTurnEnd = null;
    this.onBattleEnd = null;
    this.log = [];
  }

  init(players, enemies) {
    this.players = players;
    this.enemies = enemies;
    this.log = [];
    this.buildTurnOrder();
    this.currentTurnIndex = 0;
  }

  buildTurnOrder() {
    const all = [...this.players, ...this.enemies];
    this.turnOrder = all.sort((a, b) => (b.stats.veu || 5) - (a.stats.veu || 5));
  }

  getCurrentActor() {
    return this.turnOrder[this.currentTurnIndex % this.turnOrder.length];
  }

  isPlayerActor(actor) {
    return this.players.includes(actor);
  }

  advanceTurn() {
    this.currentTurnIndex++;
    this.removeDeadActors();
    if (this.checkBattleEnd()) return;
    const next = this.getCurrentActor();
    if (next && !this.isPlayerActor(next)) {
      this.scene.time.delayedCall(BATTLE_TURN_DELAY, () => {
        this.executeEnemyTurn(next);
      });
    }
  }

  removeDeadActors() {
    const alive = (a) => a.stats.pulso > 0 || a.collapsed;
    this.turnOrder = this.turnOrder.filter(alive);
  }

  checkBattleEnd() {
    const playersAlive = this.players.some(p => p.stats.pulso > 0 || p.collapsed);
    const enemiesAlive = this.enemies.some(e => e.stats.pulso > 0);
    if (!enemiesAlive) {
      this.addLog('Batalha vencida!');
      if (this.onBattleEnd) this.onBattleEnd('win');
      return true;
    }
    if (!playersAlive) {
      this.addLog('Derrota...');
      if (this.onBattleEnd) this.onBattleEnd('lose');
      return true;
    }
    return false;
  }

  executeEnemyTurn(enemy) {
    if (!enemy || enemy.stats.pulso <= 0) {
      this.advanceTurn();
      return;
    }
    const target = this.players.find(p => p.stats.pulso > 0) || this.players[0];
    if (!target) { this.advanceTurn(); return; }

    const dmg = this.calculateDamage(enemy, target);
    this.applyDamage(target, dmg);
    this.addLog(`${enemy.name} ataca ${target.className} causando ${dmg} de dano!`);
    this.scene.time.delayedCall(BATTLE_TURN_DELAY, () => this.advanceTurn());
  }

  executePlayerAction(player, action, target) {
    if (this.isAnimating) return false;
    const actor = this.getCurrentActor();
    if (actor !== player) return false;

    this.isAnimating = true;

    switch (action.type) {
      case 'attack':
        this.handleAttack(player, target, action);
        break;
      case 'skill':
        this.handleSkill(player, target, action);
        break;
      case 'absorb':
        this.handleAbsorb(player, target, action);
        break;
      case 'defend':
        this.handleDefend(player, action);
        break;
      case 'item':
        this.handleItem(player, action);
        break;
    }

    this.scene.time.delayedCall(BATTLE_TURN_DELAY, () => {
      this.isAnimating = false;
      this.advanceTurn();
    });
    return true;
  }

  handleAttack(player, target, action) {
    const dmg = this.calculateDamage(player, target, action.bonus || 0);
    this.applyDamage(target, dmg);
    this.addLog(`${player.className} ataca ${target.name} causando ${dmg} de dano!`);
  }

  handleSkill(player, target, action) {
    if (player.stats.eco < (action.ecoCost || 5)) {
      this.addLog('Eco insuficiente!');
      return;
    }
    player.stats.eco -= action.ecoCost || 5;
    const dmg = this.calculateDamage(player, target, action.bonus || 10);
    this.applyDamage(target, dmg);
    this.addLog(`${player.className} usa ${action.name}! ${target.name} sofre ${dmg}!`);
  }

  handleAbsorb(player, target, action) {
    if (!player.absorbEssence) return;
    if (target.stats.pulso > 0) {
      this.addLog('Inimigo ainda está de pé!');
      return;
    }
    player.absorbEssence(target.essenceType || 'basico');
    this.addLog(`${player.className} absorve essência de ${target.name}!`);
  }

  handleDefend(player, action) {
    player.defending = true;
    player.stats.pulso = Math.min(player.stats.pulso + 5, player.maxStats.pulso);
    this.addLog(`${player.className} se defende e recupera 5 de Pulso.`);
  }

  handleItem(player, action) {
    const item = action.item;
    if (!item) return;
    if (item.healPulso) {
      player.stats.pulso = Math.min(player.stats.pulso + item.healPulso, player.maxStats.pulso);
      this.addLog(`${player.className} usa ${item.name} e recupera ${item.healPulso} Pulso!`);
    }
    if (item.healEco) {
      player.stats.eco = Math.min(player.stats.eco + item.healEco, player.maxStats.eco);
    }
  }

  calculateDamage(attacker, defender, bonus = 0) {
    const attack = (attacker.stats.fratura || 10) + bonus;
    const defense = Math.floor((defender.stats.fratura || 5) * 0.3);
    const defending = defender.defending ? 0.5 : 1;
    const raw = Math.max(1, (attack - defense) * defending);
    const variance = 0.9 + Math.random() * 0.2;
    return Math.floor(raw * variance);
  }

  applyDamage(target, amount) {
    target.defending = false;
    target.stats.pulso -= amount;
    if (target.stats.pulso <= 0) {
      target.stats.pulso = 0;
      if (target.collapsed !== undefined) {
        target.collapsed = true;
      }
    }
    if (target.onDamage) target.onDamage(amount);
  }

  addLog(msg) {
    this.log.push(msg);
    if (this.log.length > 10) this.log.shift();
    if (this.scene.updateBattleLog) this.scene.updateBattleLog(msg);
  }
}
