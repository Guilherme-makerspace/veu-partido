import { Boss } from '../Boss.js';
import bus from '../../utils/EventBus.js';

export class AranhaDiamante extends Boss {
  constructor(scene, x, y, config) {
    super(scene, x, y, {
      ...config,
      name: 'Aranha de Diamante',
      color: 0x88ccee,
      size: 40,
      maxHp: 400,
      attack: 20,
      speed: 70,
      attackCooldown: 1400,
      specialCooldown: 4500,
    });

    this._webCooldown = 0;
    this._webCooldownMax = 3500;
    this._webs = [];
    this._leapCooldown = 0;
    this._leapCooldownMax = 7000;
  }

  update(delta, players) {
    this._updateWebs(delta, players);
    super.update(delta, players);
  }

  _doSpecialAttack(targets) {
    const roll = Math.random();
    if (roll < 0.5) {
      this._shootWebAt(targets[0]);
    } else if (roll < 0.8) {
      this._crystalBurst(targets);
    } else {
      this._leapAttack(targets[0]);
    }
  }

  _shootWebAt(target) {
    if (!target) return;
    const web = {
      x: this.x,
      y: this.y,
      tx: target.x,
      ty: target.y,
      vx: (target.x - this.x),
      vy: (target.y - this.y),
      duration: 1200,
      elapsed: 0,
      gfx: this.scene.add.graphics(),
      hit: false,
    };

    const len = Math.sqrt(web.vx * web.vx + web.vy * web.vy);
    web.vx /= len; web.vy /= len;
    web.vx *= 350; web.vy *= 350;

    web.gfx.setDepth(12);
    this._webs.push(web);

    bus.emit('showSkillLabel', {
      x: this.x,
      y: this.y - 55,
      label: 'TEIA DE CRISTAL',
      color: '#88ccee',
    });
  }

  _crystalBurst(targets) {
    const angles = [0, 45, 90, 135, 180, 225, 270, 315];

    angles.forEach((angle, i) => {
      this.scene.time.delayedCall(i * 60, () => {
        const rad = (angle * Math.PI) / 180;
        const shard = {
          x: this.x,
          y: this.y - 20,
          vx: Math.cos(rad) * 280,
          vy: Math.sin(rad) * 280,
          duration: 900,
          elapsed: 0,
          gfx: this.scene.add.graphics(),
          hit: false,
        };
        shard.gfx.fillStyle(0xaaddff, 0.9);
        shard.gfx.fillTriangle(-4, -8, 4, -8, 0, 8);
        shard.gfx.setDepth(13);
        this._webs.push(shard);
      });
    });

    bus.emit('showSkillLabel', {
      x: this.x,
      y: this.y - 55,
      label: 'CHUVA DE CRISTAIS',
      color: '#aaddff',
    });
  }

  _leapAttack(target) {
    if (!target || this.scene.time.now < this._leapCooldown) return;
    this._leapCooldown = this.scene.time.now + this._leapCooldownMax;

    const startX = this.x;
    const startY = this.y;
    const endX = target.x;
    const endY = target.y;

    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x88ccee, 0.3);
    shadow.fillEllipse(endX, endY - 10, 80, 30);
    shadow.setDepth(3);

    this.scene.tweens.add({
      targets: this,
      x: endX,
      y: endY,
      duration: 450,
      ease: 'Power3',
      onUpdate: () => {
        this._redraw();
      },
      onComplete: () => {
        shadow.destroy();
        if (!target.isDead && Math.abs(target.x - this.x) < 60) {
          target.takeDamage(this.attack * 1.8, this);
          this.scene.cameras.main.shake(200, 0.015);
        }
      },
    });

    bus.emit('showSkillLabel', {
      x: this.x,
      y: this.y - 55,
      label: 'SALTO DE PREDADORA',
      color: '#88ccee',
    });
  }

  _updateWebs(delta, players) {
    const dt = delta / 1000;

    this._webs = this._webs.filter(w => {
      w.elapsed += delta;
      if (w.elapsed > w.duration) {
        w.gfx && w.gfx.destroy();
        return false;
      }

      w.x += w.vx * dt;
      w.y += w.vy * dt;

      w.gfx.clear();
      w.gfx.fillStyle(0xaaddff, 0.85);
      w.gfx.fillCircle(w.x, w.y, 5);

      if (!w.hit) {
        for (const p of players) {
          if (p.isDead) continue;
          const dx = Math.abs(p.x - w.x);
          const dy = Math.abs(p.y - w.y);
          if (dx < 22 && dy < 22) {
            w.hit = true;
            p.takeDamage(this.attack * 0.6, this);
            p.addStatusEffect({
              id: 'web_slow',
              duration: 2500,
              tickInterval: 500,
              tickTimer: 500,
              onTick: (target) => {
                target.baseSpeed = Math.max(60, target.baseSpeed * 0.95);
              },
            });
            break;
          }
        }
      }

      return true;
    });
  }

  _drawShape(g) {
    const s = this.size;

    g.fillStyle(0x88ccee, 0.4);
    g.fillCircle(this.x, this.y - s * 0.3, s * 1.1);

    g.fillStyle(0xaaddff, 0.8);
    g.fillCircle(this.x, this.y - s * 0.3, s * 0.75);

    g.fillStyle(0xddeeff, 0.6);
    g.fillCircle(this.x - 8, this.y - s * 0.5, 8);
    g.fillCircle(this.x + 8, this.y - s * 0.5, 8);

    const legSpread = s * 1.5;
    g.lineStyle(3, 0x88ccee, 0.8);
    const legAngles = [-150, -120, -90, -60, -30, 0, 30, 60];
    legAngles.forEach((angle, i) => {
      const rad = (angle * Math.PI) / 180;
      const lx = this.x + Math.cos(rad) * legSpread;
      const ly = this.y + Math.sin(rad) * legSpread - 10;
      g.moveTo(this.x, this.y - s * 0.3);
      g.lineTo(lx, ly);
    });
    g.strokePath();

    g.fillStyle(0xffffff, 0.9);
    for (let i = 0; i < 4; i++) {
      const ex = this.x - 12 + i * 8;
      const ey = this.y - s * 0.55;
      g.fillCircle(ex, ey, 3);
    }

    if (this.enraged) {
      g.lineStyle(2, 0xff4444, 0.8);
      g.strokeCircle(this.x, this.y - s * 0.3, s * 1.2);
    }
  }

  die(killer) {
    for (const w of this._webs) {
      w.gfx && w.gfx.destroy();
    }
    this._webs = [];
    super.die(killer);
  }
}
