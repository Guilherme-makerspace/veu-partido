import { Enemy } from './Enemy.js';
import bus from '../utils/EventBus.js';

export class Boss extends Enemy {
  constructor(scene, x, y, config) {
    super(scene, x, y, {
      ...config,
      maxHp: config.maxHp || 350,
      attack: config.attack || 18,
      speed: config.speed || 75,
      aggroRange: 700,
      attackRange: 90,
      attackCooldown: 1500,
      color: config.color || 0x880088,
      size: config.size || 35,
      xpValue: 120,
      scoreValue: 500,
    });

    this.isBoss = true;
    this.phase = 1;
    this.specialCooldown = 0;
    this.specialCooldownMax = config.specialCooldown || 5000;
    this.enraged = false;
    this._patterns = config.patterns || [];
    this._patternIndex = 0;
  }

  update(delta, players) {
    if (this.isDead) return;

    if (this.hp < this.maxHp * 0.4 && !this.enraged) {
      this.enraged = true;
      this.speed *= 1.4;
      this.attackCooldownMax = Math.floor(this.attackCooldownMax * 0.6);
      bus.emit('bossEnraged', { boss: this });
      this._doEnrageEffect();
    }

    if (this.scene.time.now >= this.specialCooldown) {
      const aliveTargets = players.filter(p => !p.isDead);
      if (aliveTargets.length > 0) {
        this._doSpecialAttack(aliveTargets);
        this.specialCooldown = this.scene.time.now + this.specialCooldownMax;
      }
    }

    super.update(delta, players);
  }

  _doSpecialAttack(targets) {}

  _doEnrageEffect() {
    const gfx = this.scene.add.graphics();
    gfx.fillStyle(0xff0000, 0.3);
    gfx.fillCircle(this.x, this.y, 100);
    gfx.setDepth(5);
    this.scene.tweens.add({
      targets: gfx,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 800,
      onComplete: () => gfx.destroy(),
    });
  }

  _drawShape(g) {
    const s = this.size;
    g.fillStyle(this.color, 1);
    g.fillRect(this.x - s, this.y - s, s * 2, s * 2);

    g.fillStyle(0xffffff, 0.4);
    g.fillRect(this.x - s, this.y - s, s * 2, 6);

    const hpRatio = this.hp / this.maxHp;
    g.fillStyle(hpRatio > 0.5 ? 0xff8800 : 0xff0000, 0.9);
    for (let i = 0; i < 3; i++) {
      g.fillCircle(this.x - s + 15 + i * 20, this.y + s * 0.3, 5);
    }

    if (this.enraged) {
      g.lineStyle(3, 0xff0000, 1);
      g.strokeRect(this.x - s - 4, this.y - s - 4, s * 2 + 8, s * 2 + 8);
    }
  }

  die(killer) {
    bus.emit('bossDefeated', { boss: this, killer });
    super.die(killer);
  }
}
