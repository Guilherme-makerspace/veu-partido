export default class ScoreSystem {
  constructor() {
    this.score = 0;
    this.multiplier = 1;
    this.comboCount = 0;
    this.history = [];
  }

  addKill(enemy) {
    const base = enemy.scoreValue || 100;
    const gained = Math.floor(base * this.multiplier);
    this.score += gained;
    this.comboCount++;
    this.multiplier = Math.min(4, 1 + this.comboCount * 0.1);
    this.history.push({ type: 'kill', enemy: enemy.name, gained });
    return gained;
  }

  addCombo(comboName) {
    const gained = 500;
    this.score += gained;
    this.history.push({ type: 'combo', name: comboName, gained });
    return gained;
  }

  addExplore() {
    const gained = 50;
    this.score += gained;
    return gained;
  }

  resetMultiplier() {
    this.comboCount = 0;
    this.multiplier = 1;
  }

  takeDamagePenalty() {
    this.comboCount = Math.max(0, this.comboCount - 1);
    this.multiplier = Math.max(1, this.multiplier - 0.1);
  }

  getTotal() {
    return this.score;
  }
}
