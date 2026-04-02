import bus from '../utils/EventBus.js';

let _uid = 0;

export class Player {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.id = `player_${++_uid}`;
    this.playerId = config.playerId || 1;
    this.name = config.name || 'Player';
    this.characterClass = config.characterClass || 'unknown';
    this.color = config.color || 0xffffff;
    this.accentColor = config.accentColor || 0xaaaaaa;

    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;

    this.baseSpeed = config.baseSpeed || 160;
    this.baseMaxHp = config.maxHp || 100;
    this.baseMaxMana = config.maxMana || 60;
    this.baseAttack = config.attack || 12;
    this.baseSkillDmg = config.skillDmg || 20;

    this.bonusAttack = 0;
    this.bonusMaxHp = 0;
    this.bonusMaxMana = 0;
    this.bonusSpeed = 0;
    this.bonusSkillDmg = 0;

    this.hp = this.getMaxHp();
    this.mana = this.getMaxMana();

    this.isDead = false;
    this.isAttacking = false;
    this.isUsingSkill = false;
    this.isKnockback = false;
    this.invincibleUntil = 0;
    this.attackCooldown = 0;
    this.skillCooldown = 0;
    this.attackCooldownMax = config.attackCooldown || 400;
    this.skillCooldownMax = config.skillCooldown || 2500;

    this.score = 0;
    this.floorBounds = config.floorBounds || { top: 520, bottom: 620, left: 80, right: 1200 };

    this._gfx = null;
    this._nameText = null;
    this._attackGfx = null;
    this._statusEffects = [];

    this._buildGraphics();
  }

  getMaxHp()   { return this.baseMaxHp + this.bonusMaxHp; }
  getMaxMana() { return this.baseMaxMana + this.bonusMaxMana; }
  getAttack()  { return this.baseAttack + this.bonusAttack; }
  getSkillDmg(){ return this.baseSkillDmg + this.bonusSkillDmg; }
  getSpeed()   { return this.baseSpeed + this.bonusSpeed; }

  _buildGraphics() {
    this._gfx = this.scene.add.graphics();
    this._nameText = this.scene.add.text(this.x, this.y - 56, this.name, {
      fontSize: '12px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(15);
    this._redraw();
  }

  _redraw() {
    if (!this._gfx || !this._gfx.scene) return;
    const g = this._gfx;
    g.clear();
    g.setDepth(10);

    const alpha = this.isInvincible() ? 0.5 : 1;

    g.fillStyle(this.color, alpha);
    g.fillRect(this.x - 16, this.y - 44, 32, 44);

    g.fillStyle(this.accentColor, alpha);
    g.fillCircle(this.x, this.y - 54, 14);

    if (this.facing > 0) {
      g.fillStyle(0xffffff, alpha);
      g.fillCircle(this.x + 5, this.y - 56, 3);
      g.fillStyle(0x000000, 1);
      g.fillCircle(this.x + 6, this.y - 56, 1.5);
    } else {
      g.fillStyle(0xffffff, alpha);
      g.fillCircle(this.x - 5, this.y - 56, 3);
      g.fillStyle(0x000000, 1);
      g.fillCircle(this.x - 6, this.y - 56, 1.5);
    }

    const classColors = {
      metamorfo: 0x7c4dff,
      duelista:  0x00bcd4,
      xama:      0x4caf50,
      voraz:     0xf44336,
    };
    const emblemColor = classColors[this.characterClass] || 0xffffff;
    g.fillStyle(emblemColor, alpha);
    g.fillCircle(this.x, this.y - 30, 6);

    if (this._nameText) {
      this._nameText.setPosition(this.x, this.y - 74);
    }
  }

  isInvincible() {
    return this.scene.time.now < this.invincibleUntil;
  }

  update(delta, inputState) {
    if (this.isDead) return;

    this._processInput(delta, inputState);
    this._applyPhysics(delta);
    this._clampPosition();
    this._updateStatusEffects(delta);
    this._redraw();
  }

  _processInput(delta, input) {
    if (this.isKnockback) return;

    const speed = this.getSpeed();
    let moved = false;

    if (input.left)  { this.vx = -speed; this.facing = -1; moved = true; }
    if (input.right) { this.vx =  speed; this.facing =  1; moved = true; }
    if (input.up)    { this.vy = -speed * 0.6; moved = true; }
    if (input.down)  { this.vy =  speed * 0.6; moved = true; }

    if (!input.left && !input.right) this.vx *= 0.75;
    if (!input.up   && !input.down)  this.vy *= 0.75;

    if (input.attack && !this.isAttacking && this.scene.time.now >= this.attackCooldown) {
      this.performAttack();
    }
    if (input.skill && !this.isUsingSkill && this.scene.time.now >= this.skillCooldown) {
      this.performSkill();
    }
  }

  _applyPhysics(delta) {
    const dt = delta / 1000;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.isKnockback) {
      this.vx *= 0.85;
      this.vy *= 0.85;
      if (Math.abs(this.vx) < 5 && Math.abs(this.vy) < 5) {
        this.isKnockback = false;
      }
    }
  }

  _clampPosition() {
    const b = this.floorBounds;
    this.x = Phaser.Math.Clamp(this.x, b.left, b.right);
    this.y = Phaser.Math.Clamp(this.y, b.top, b.bottom);
  }

  _updateStatusEffects(delta) {
    this._statusEffects = this._statusEffects.filter(effect => {
      effect.duration -= delta;
      if (effect.tickTimer !== undefined) {
        effect.tickTimer -= delta;
        if (effect.tickTimer <= 0) {
          effect.onTick && effect.onTick(this);
          effect.tickTimer = effect.tickInterval;
        }
      }
      return effect.duration > 0;
    });
  }

  addStatusEffect(effect) {
    const existing = this._statusEffects.find(e => e.id === effect.id);
    if (existing) {
      existing.duration = Math.max(existing.duration, effect.duration);
    } else {
      this._statusEffects.push({ ...effect });
    }
    bus.emit('statusEffect', { player: this, effect });
  }

  hasStatusEffect(id) {
    return this._statusEffects.some(e => e.id === id);
  }

  performAttack() {
    this.isAttacking = true;
    this.attackCooldown = this.scene.time.now + this.attackCooldownMax;
    this.invincibleUntil = this.scene.time.now + 150;

    const attackGfx = this.scene.add.graphics();
    attackGfx.fillStyle(0xffffff, 0.8);
    const aox = this.facing * 35;
    attackGfx.fillRect(this.x + aox - 20, this.y - 40, 40, 30);
    attackGfx.setDepth(11);

    this.scene.time.delayedCall(120, () => {
      attackGfx.destroy();
      this.isAttacking = false;
    });

    bus.emit('playerAttack', { player: this, x: this.x + this.facing * 50, y: this.y - 25 });
  }

  performSkill() {
    this.skillCooldown = this.scene.time.now + this.skillCooldownMax;
  }

  takeDamage(amount, attacker) {
    if (this.isDead || this.isInvincible()) return;

    const finalAmount = Math.max(1, amount);
    this.hp = Math.max(0, this.hp - finalAmount);
    this.invincibleUntil = this.scene.time.now + 600;

    const dir = this.x > attacker.x ? 1 : -1;
    this.vx = dir * 120;
    this.isKnockback = true;

    this.scene.cameras.main.shake(80, 0.005);
    bus.emit('playerDamaged', { player: this, amount: finalAmount, hp: this.hp });

    this._showDamageNumber(finalAmount);

    if (this.hp <= 0) {
      this.die();
    }
  }

  heal(amount) {
    this.hp = Math.min(this.getMaxHp(), this.hp + amount);
    bus.emit('playerHealed', { player: this, amount, hp: this.hp });
  }

  _showDamageNumber(amount) {
    const dmgText = this.scene.add.text(
      this.x + Phaser.Math.Between(-20, 20),
      this.y - 60,
      `-${amount}`,
      { fontSize: '16px', color: '#ff4444', stroke: '#000', strokeThickness: 3, fontStyle: 'bold' }
    ).setDepth(200).setOrigin(0.5);

    this.scene.tweens.add({
      targets: dmgText,
      y: dmgText.y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => dmgText.destroy(),
    });
  }

  die() {
    this.isDead = true;
    this.hp = 0;

    if (this._gfx) {
      this.scene.tweens.add({
        targets: this._gfx,
        alpha: 0,
        duration: 600,
        onComplete: () => { this._gfx && this._gfx.destroy(); }
      });
    }
    if (this._nameText) {
      this.scene.tweens.add({
        targets: this._nameText,
        alpha: 0,
        duration: 600,
        onComplete: () => { this._nameText && this._nameText.destroy(); }
      });
    }

    bus.emit('playerDied', { player: this });
  }

  addScore(amount) {
    this.score += amount;
    bus.emit('scoreChanged', { player: this, score: this.score });
  }

  destroy() {
    this._gfx && this._gfx.destroy();
    this._nameText && this._nameText.destroy();
    this._attackGfx && this._attackGfx.destroy();
  }
}
