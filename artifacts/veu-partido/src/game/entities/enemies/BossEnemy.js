import Enemy from './Enemy.js';
import { COLORS } from '../../constants.js';

export default class BossEnemy extends Enemy {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y, {
      ...config,
      pulso: config.pulso || 500,
      fratura: config.fratura || 25,
      veu: config.veu || 5,
      color: COLORS.RED,
    });
    this.phase = 1;
    this.maxPhases = config.phases || 2;
    this.specialUsed = false;
    this.phaseThresholds = [0.6, 0.3];
    this.bossName = config.bossName || 'Boss';
    this.phaseChanged = false;
  }

  drawEnemy() {
    this.body.clear();
    this.body.fillStyle(COLORS.RED, 1);
    this.body.fillRect(-18, -18, 36, 36);
    this.body.lineStyle(2, COLORS.AMBER, 0.8);
    this.body.strokeRect(-18, -18, 36, 36);
    this.body.fillStyle(COLORS.WHITE, 0.8);
    this.body.fillCircle(-5, -5, 4);
    this.body.fillCircle(5, -5, 4);
    this.body.fillStyle(COLORS.RED, 0.6);
    this.body.fillRect(-8, 2, 16, 6);
  }

  update(delta, players) {
    super.update(delta, players);
    const hpRatio = this.stats.pulso / this.maxStats.pulso;
    const nextPhase = this.phaseThresholds[this.phase - 1];
    if (nextPhase && hpRatio <= nextPhase && !this.phaseChanged) {
      this.phaseChanged = true;
      this.enterNextPhase();
    }
  }

  enterNextPhase() {
    this.phase++;
    this.maxStats.fratura = Math.floor(this.maxStats.fratura * 1.3);
    this.stats.fratura = this.maxStats.fratura;
    this.alertRange += 30;
    const flashTween = this.scene.tweens.add({
      targets: this.body,
      alpha: 0,
      duration: 100,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.body.setAlpha(1);
        this.phaseChanged = false;
      },
    });
    if (this.scene.onBossPhaseChange) this.scene.onBossPhaseChange(this, this.phase);
  }

  getSpecialAttack() {
    if (this.phase === 1) {
      return { name: 'Esmagar', bonus: 20, type: 'attack', aoe: false };
    }
    return { name: 'Dilaceração', bonus: 35, type: 'attack', aoe: true };
  }

  getBattleActions(players) {
    const useSpecial = !this.specialUsed && Math.random() < 0.3;
    if (useSpecial) {
      this.specialUsed = true;
      setTimeout(() => { this.specialUsed = false; }, 3000);
      return this.getSpecialAttack();
    }
    return { type: 'attack', bonus: 0 };
  }
}
