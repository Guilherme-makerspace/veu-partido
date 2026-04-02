import bus from '../utils/EventBus.js';

let _enemyUid = 0;

export class Enemy {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.id = `enemy_${++_enemyUid}`;
    this.name = config.name || 'Inimigo';
    this.type = config.type || 'generic';
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;

    this.maxHp = config.maxHp || 40;
    this.hp = this.maxHp;
    this.attack = config.attack || 8;
    this.speed = config.speed || 60;
    this.xpValue = config.xpValue || 20;
    this.scoreValue = config.scoreValue || 50;
    this.color = config.color || 0xff4444;
    this.size = config.size || 18;
    this.aggroRange = config.aggroRange || 250;
    this.attackRange = config.attackRange || 60;
    this.attackCooldownMax = config.attackCooldown || 1200;
    this.attackCooldown = 0;

    this.isDead = false;
    this.isKnockback = false;
    this.floorBounds = config.floorBounds || { top: 520, bottom: 620, left: 80, right: 1200 };

    this.state = 'patrol';
    this.patrolDir = Math.random() > 0.5 ? 1 : -1;
    this.patrolTimer = 0;

    this._gfx = null;
    this._hpBar = null;
    this._buildGraphics();
  }

  _buildGraphics() {
    this._gfx = this.scene.add.graphics();
    this._hpBar = this.scene.add.graphics();
    this._redraw();
  }

  _redraw() {
    if (!this._gfx || !this._gfx.scene) return;
    const g = this._gfx;
    g.clear();
    g.setDepth(9);
    g.fillStyle(this.color, 1);
    this._drawShape(g);

    const hp = this._hpBar;
    hp.clear();
    hp.setDepth(10);
    if (this.hp < this.maxHp) {
      const bw = this.size * 2;
      const bh = 5;
      const bx = this.x - this.size;
      const by = this.y - this.size - 12;
      hp.fillStyle(0x333333, 1);
      hp.fillRect(bx, by, bw, bh);
      const ratio = this.hp / this.maxHp;
      const hpColor = ratio > 0.5 ? 0x44ff44 : ratio > 0.25 ? 0xffaa00 : 0xff2222;
      hp.fillStyle(hpColor, 1);
      hp.fillRect(bx, by, bw * ratio, bh);
    }
  }

  _drawShape(g) {
    const s = this.size;
    g.fillRect(this.x - s, this.y - s, s * 2, s * 2);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(this.x + 5, this.y - s * 0.4, 4);
    g.fillCircle(this.x - 5, this.y - s * 0.4, 4);
    g.fillStyle(0x000000, 1);
    g.fillCircle(this.x + 5, this.y - s * 0.4, 2);
    g.fillCircle(this.x - 5, this.y - s * 0.4, 2);
  }

  update(delta, players) {
    if (this.isDead) return;

    const dt = delta / 1000;
    const target = this._findClosestAlivePlayer(players);

    this._updateAI(delta, target);
    this._applyPhysics(dt);
    this._clampPosition();

    if (target && !target.isDead && this.scene.time.now >= this.attackCooldown) {
      const dx = Math.abs(target.x - this.x);
      const dy = Math.abs(target.y - this.y);
      if (dx < this.attackRange && dy < 40) {
        this._doAttack(target);
      }
    }

    this._redraw();
  }

  _updateAI(delta, target) {
    if (!target || target.isDead) {
      this._patrol(delta);
      return;
    }

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.aggroRange) {
      this.state = 'chase';
    } else if (dist > this.aggroRange * 1.5) {
      this.state = 'patrol';
    }

    if (this.state === 'chase') {
      const spd = this.speed;
      if (Math.abs(dx) > this.attackRange * 0.8) {
        this.vx = (dx > 0 ? spd : -spd);
      } else {
        this.vx *= 0.8;
      }
      if (Math.abs(dy) > 20) {
        this.vy = dy > 0 ? spd * 0.4 : -spd * 0.4;
      } else {
        this.vy *= 0.8;
      }
    } else {
      this._patrol(delta);
    }
  }

  _patrol(delta) {
    this.patrolTimer -= delta;
    if (this.patrolTimer <= 0) {
      this.patrolDir = Math.random() > 0.5 ? 1 : -1;
      this.patrolTimer = Phaser.Math.Between(1500, 3500);
    }
    this.vx = this.patrolDir * this.speed * 0.4;
    this.vy = 0;
  }

  _applyPhysics(dt) {
    if (this.isKnockback) {
      this.vx *= 0.8;
      this.vy *= 0.8;
      if (Math.abs(this.vx) < 3 && Math.abs(this.vy) < 3) this.isKnockback = false;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  _clampPosition() {
    const b = this.floorBounds;
    this.x = Phaser.Math.Clamp(this.x, b.left, b.right);
    this.y = Phaser.Math.Clamp(this.y, b.top, b.bottom);
  }

  _findClosestAlivePlayer(players) {
    let closest = null;
    let minDist = Infinity;
    for (const p of players) {
      if (p.isDead) continue;
      const dx = p.x - this.x;
      const dy = p.y - this.y;
      const d = dx * dx + dy * dy;
      if (d < minDist) { minDist = d; closest = p; }
    }
    return closest;
  }

  _doAttack(target) {
    this.attackCooldown = this.scene.time.now + this.attackCooldownMax;
    target.takeDamage(this.attack, this);
    bus.emit('enemyAttack', { enemy: this, target });
  }

  takeDamage(amount, attacker) {
    if (this.isDead) return;
    const finalAmount = Math.max(1, amount);
    this.hp = Math.max(0, this.hp - finalAmount);

    this._showDamageNumber(finalAmount);

    const dir = this.x > attacker.x ? 1 : -1;
    this.vx = dir * 120;
    this.isKnockback = true;

    if (this.hp <= 0) this.die(attacker);
  }

  _showDamageNumber(amount) {
    const t = this.scene.add.text(
      this.x + Phaser.Math.Between(-10, 10),
      this.y - this.size - 15,
      `${amount}`,
      { fontSize: '13px', color: '#ffff44', stroke: '#000', strokeThickness: 2, fontStyle: 'bold' }
    ).setDepth(200).setOrigin(0.5);

    this.scene.tweens.add({
      targets: t,
      y: t.y - 30,
      alpha: 0,
      duration: 700,
      ease: 'Power2',
      onComplete: () => t.destroy(),
    });
  }

  die(killer) {
    this.isDead = true;
    this.hp = 0;

    if (this._gfx) {
      this.scene.tweens.add({
        targets: [this._gfx, this._hpBar],
        alpha: 0,
        angle: 90,
        duration: 400,
        onComplete: () => {
          this._gfx && this._gfx.destroy();
          this._hpBar && this._hpBar.destroy();
        },
      });
    }

    bus.emit('enemyDied', { enemy: this, killer, xpValue: this.xpValue, scoreValue: this.scoreValue });
  }

  destroy() {
    this._gfx && this._gfx.destroy();
    this._hpBar && this._hpBar.destroy();
  }
}
