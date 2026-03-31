import { COLORS } from '../../constants.js';

export default class Enemy {
  constructor(scene, x, y, config = {}) {
    this.scene = scene;
    this.name = config.name || 'Inimigo';
    this.essenceType = config.essenceType || 'basico';
    this.scoreValue = config.scoreValue || 100;
    this.debuffs = [];
    this.defending = false;

    this.maxStats = {
      pulso: config.pulso || 60,
      eco: config.eco || 20,
      fratura: config.fratura || 8,
      veu: config.veu || 3,
      limiar: config.limiar || 5,
    };
    this.stats = { ...this.maxStats };

    this.color = config.color || COLORS.RED;
    this.loot = config.loot || [];
    this.curseDrop = config.curseDrop || null;

    this.container = scene.add.container(x, y);

    this.body = scene.add.graphics();
    this.drawEnemy();
    this.container.add(this.body);

    this.nameTag = scene.add.text(0, -28, this.name.toUpperCase(), {
      fontFamily: 'monospace', fontSize: '8px', color: '#' + (this.color).toString(16).padStart(6, '0'),
      resolution: 2,
    }).setOrigin(0.5, 1);
    this.container.add(this.nameTag);

    scene.physics.add.existing(this.container);
    const phBody = this.container.body;
    if (phBody) {
      phBody.setSize(20, 20);
      phBody.setOffset(-10, -10);
    }

    this.state = 'idle';
    this.target = null;
    this.moveTimer = 0;
    this.patrolDir = { x: 1, y: 0 };
    this.alertRange = config.alertRange || 120;
    this.attackRange = config.attackRange || 60;
  }

  drawEnemy() {
    this.body.clear();
    this.body.fillStyle(this.color, 0.9);
    this.body.fillRect(-10, -10, 20, 20);
    this.body.lineStyle(1.5, COLORS.WHITE, 0.3);
    this.body.strokeRect(-10, -10, 20, 20);
    this.body.fillStyle(COLORS.WHITE, 0.6);
    this.body.fillCircle(-3, -3, 3);
    this.body.fillCircle(3, -3, 3);
  }

  update(delta, players) {
    if (this.stats.pulso <= 0) {
      this.body.setAlpha(0.3);
      return;
    }
    const phBody = this.container.body;
    if (!phBody) return;

    const nearest = this.getNearestPlayer(players);
    if (!nearest) { phBody.setVelocity(0, 0); return; }

    const dx = nearest.container.x - this.container.x;
    const dy = nearest.container.y - this.container.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.alertRange) {
      this.state = 'chase';
      this.target = nearest;
    }

    if (this.state === 'chase' && dist > this.attackRange) {
      const speed = 60 + (this.maxStats.veu || 3) * 5;
      phBody.setVelocity((dx / dist) * speed, (dy / dist) * speed);
    } else {
      phBody.setVelocity(0, 0);
    }

    this.moveTimer += delta;
    if (this.moveTimer > 150) {
      this.moveTimer = 0;
      const bounce = Math.sin(Date.now() * 0.01) * 2;
      this.body.y = bounce;
    }
  }

  getNearestPlayer(players) {
    let nearest = null, minDist = Infinity;
    for (const p of players) {
      if (!p.isAlive()) continue;
      const dx = p.container.x - this.container.x;
      const dy = p.container.y - this.container.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < minDist) { minDist = d; nearest = p; }
    }
    return nearest;
  }

  takeDamage(amount, ignoreArmor = false) {
    const armor = ignoreArmor ? 0 : Math.floor((this.stats.fratura || 8) * 0.2);
    const dmg = Math.max(1, amount - armor);
    this.stats.pulso -= dmg;
    if (this.stats.pulso < 0) this.stats.pulso = 0;
    this.flashHit();
    return dmg;
  }

  flashHit() {
    this.scene.tweens.add({
      targets: this.body, alpha: 0.2, duration: 80, yoyo: true, repeat: 1,
    });
  }

  isAlive() {
    return this.stats.pulso > 0;
  }

  getDrops() {
    return this.loot.filter(() => Math.random() < 0.5);
  }

  destroy() {
    this.container.destroy();
  }
}
