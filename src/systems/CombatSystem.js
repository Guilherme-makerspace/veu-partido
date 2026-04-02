import bus from '../utils/EventBus.js';

export class CombatSystem {
  constructor(scene) {
    this.scene = scene;
    this.hitCooldowns = new Map();
  }

  tryHit(attacker, targets, damage, knockback = 80, hitboxOffset = { x: 0, y: 0 }, hitboxSize = { w: 60, h: 50 }) {
    const ax = attacker.x + hitboxOffset.x * attacker.facing;
    const ay = attacker.y + hitboxOffset.y;

    for (const target of targets) {
      if (target.isDead) continue;
      if (this._isOnCooldown(attacker, target)) continue;

      const dx = Math.abs(target.x - ax);
      const dy = Math.abs(target.y - ay);

      if (dx < hitboxSize.w && dy < hitboxSize.h) {
        this._applyHit(attacker, target, damage, knockback);
      }
    }
  }

  _applyHit(attacker, target, damage, knockback) {
    const finalDamage = Math.max(1, Math.round(damage));
    target.takeDamage(finalDamage, attacker);

    const dir = target.x > attacker.x ? 1 : -1;
    target.vx = (target.vx || 0) + dir * knockback;

    const key = `${attacker.id || 'a'}_${target.id || 't'}`;
    this.hitCooldowns.set(key, this.scene.time.now + 400);

    bus.emit('hit', { attacker, target, damage: finalDamage });
    this._spawnHitEffect(target.x, target.y);
  }

  _isOnCooldown(attacker, target) {
    const key = `${attacker.id || 'a'}_${target.id || 't'}`;
    const cooldown = this.hitCooldowns.get(key);
    return cooldown && this.scene.time.now < cooldown;
  }

  _spawnHitEffect(x, y) {
    const gfx = this.scene.add.graphics();
    const colors = [0xffffff, 0xffaa00, 0xff4400];
    const color = colors[Phaser.Math.Between(0, 2)];
    gfx.fillStyle(color, 1);
    gfx.fillCircle(x, y, 10);
    gfx.setDepth(100);

    this.scene.tweens.add({
      targets: gfx,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => gfx.destroy(),
    });
  }

  cleanup() {
    this.hitCooldowns.clear();
  }
}
