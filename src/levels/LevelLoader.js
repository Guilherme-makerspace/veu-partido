import { Enemy } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';
import { ENEMY_CONFIGS, BOSS_CONFIGS } from './LevelConfig.js';
import bus from '../utils/EventBus.js';

export class LevelLoader {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
    this.boss = null;
    this.waveIndex = 0;
    this.waveClearTimer = 0;
    this.waveGroups = {};
    this.allEnemiesSpawned = false;
    this.bossSpawned = false;
    this.levelData = null;
    this._decorations = [];
    this._bossClasses = {};
  }

  loadLevel(levelData, floorBounds) {
    this.levelData = levelData;
    this.floorBounds = floorBounds || levelData.floorBounds;
    this.enemies = [];
    this.boss = null;
    this.waveIndex = 0;
    this.allEnemiesSpawned = false;
    this.bossSpawned = false;

    this.waveGroups = {};
    for (const e of levelData.enemies) {
      const w = e.wave || 1;
      if (!this.waveGroups[w]) this.waveGroups[w] = [];
      this.waveGroups[w].push(e);
    }

    this._buildDecorations(levelData);
    this._spawnWave(1);

    return this;
  }

  _spawnWave(waveNum) {
    const wave = this.waveGroups[waveNum];
    if (!wave) return;
    this.waveIndex = waveNum;

    for (const spawnDef of wave) {
      const cfg = ENEMY_CONFIGS[spawnDef.type];
      if (!cfg) { console.warn(`Unknown enemy type: ${spawnDef.type}`); continue; }
      for (let i = 0; i < spawnDef.count; i++) {
        const side = Math.random() > 0.5 ? 'right' : 'left';
        const ex = side === 'right'
          ? Phaser.Math.Between(700, 1100)
          : Phaser.Math.Between(150, 500);
        const ey = Phaser.Math.Between(this.floorBounds.top + 10, this.floorBounds.bottom - 10);
        const enemy = new Enemy(this.scene, ex, ey, { ...cfg, floorBounds: this.floorBounds });
        this.enemies.push(enemy);
      }
    }

    bus.emit('waveStarted', { wave: waveNum, count: this.enemies.filter(e => !e.isDead).length });
  }

  _spawnBoss() {
    if (this.bossSpawned || !this.levelData.boss) return;
    this.bossSpawned = true;

    const bd = this.levelData.boss;
    const cfg = BOSS_CONFIGS[bd.type];
    if (!cfg) return;

    const BossClass = this._getBossClass(bd.type);
    this.boss = new BossClass(
      this.scene,
      bd.x || 950,
      bd.y || 560,
      { ...cfg, floorBounds: this.floorBounds }
    );
    this.enemies.push(this.boss);
    bus.emit('bossSpawned', { boss: this.boss });
  }

  _getBossClass(type) {
    return this._bossClasses[type] || Boss;
  }

  registerBossClass(type, cls) {
    if (!this._bossClasses) this._bossClasses = {};
    this._bossClasses[type] = cls;
  }

  update(delta, players) {
    for (const enemy of this.enemies) {
      if (!enemy.isDead) {
        enemy.update(delta, players);
      }
    }

    this._checkWaveProgress();
  }

  _checkWaveProgress() {
    const alive = this.enemies.filter(e => !e.isDead && !e.isBoss);
    if (alive.length === 0 && !this.allEnemiesSpawned) {
      const nextWave = this.waveIndex + 1;
      if (this.waveGroups[nextWave]) {
        this._spawnWave(nextWave);
      } else {
        this.allEnemiesSpawned = true;
        if (this.levelData.boss && !this.bossSpawned) {
          this.scene.time.delayedCall(1200, () => this._spawnBoss());
        }
      }
    }
  }

  isLevelComplete() {
    if (!this.allEnemiesSpawned) return false;
    if (this.levelData.boss && !this.bossSpawned) return false;
    const alive = this.enemies.filter(e => !e.isDead);
    return alive.length === 0;
  }

  isAllNormalEnemiesDead() {
    return this.enemies.filter(e => !e.isDead && !e.isBoss).length === 0;
  }

  getAliveEnemies() {
    return this.enemies.filter(e => !e.isDead);
  }

  _buildDecorations(levelData) {
    this._decorations.forEach(d => d.destroy && d.destroy());
    this._decorations = [];

    const { bgColors } = levelData;
    const bg = this.scene.add.graphics();
    bg.fillStyle(bgColors.sky, 1);
    bg.fillRect(0, 0, 1280, 500);

    const ground = this.scene.add.graphics();
    ground.fillStyle(bgColors.ground, 1);
    ground.fillRect(0, 500, 1280, 180);

    const floor = this.scene.add.graphics();
    floor.fillStyle(bgColors.floor, 1);
    floor.fillRect(0, 495, 1280, 20);
    floor.fillStyle(bgColors.floor - 0x101010, 1);
    floor.fillRect(0, 605, 1280, 20);

    this._decorations.push(bg, ground, floor);
    bg.setDepth(0);
    ground.setDepth(1);
    floor.setDepth(2);

    const details = levelData.id;
    this._addLevelDecorations(details, levelData.bgColors);
  }

  _addLevelDecorations(levelId, colors) {
    if (levelId === 'cidade_destruida') {
      for (let i = 0; i < 8; i++) {
        const bx = Phaser.Math.Between(60, 1200);
        const by = Phaser.Math.Between(100, 450);
        const bh = Phaser.Math.Between(60, 180);
        const bw = Phaser.Math.Between(30, 60);
        const bd = this.scene.add.graphics();
        bd.fillStyle(0x2a1a0a, 1);
        bd.fillRect(bx, by, bw, bh);
        const windows = Phaser.Math.Between(2, 5);
        bd.fillStyle(Math.random() > 0.3 ? 0x1a1000 : 0xffcc44, 0.8);
        for (let j = 0; j < windows; j++) {
          bd.fillRect(bx + 6, by + 10 + j * 22, 8, 10);
          bd.fillRect(bx + bw - 14, by + 10 + j * 22, 8, 10);
        }
        bd.setDepth(3);
        this._decorations.push(bd);
      }
    } else if (levelId === 'esgoto_limpo') {
      for (let i = 0; i < 12; i++) {
        const px = Phaser.Math.Between(60, 1200);
        const py = Phaser.Math.Between(150, 450);
        const pip = this.scene.add.graphics();
        pip.fillStyle(0x2a4a2a, 1);
        pip.fillRect(px, py, 20, Phaser.Math.Between(40, 120));
        pip.fillStyle(0x3a6a3a, 1);
        pip.fillCircle(px + 10, py, 12);
        pip.setDepth(3);
        this._decorations.push(pip);
      }

      for (let i = 0; i < 6; i++) {
        const wx = Phaser.Math.Between(60, 1100);
        const wy = 500 + Phaser.Math.Between(5, 80);
        const puddle = this.scene.add.graphics();
        puddle.fillStyle(0x1a3a1a, 0.6);
        puddle.fillEllipse(wx, wy, 60, 15);
        puddle.setDepth(2);
        this._decorations.push(puddle);
      }
    } else if (levelId === 'gruta_gelada') {
      for (let i = 0; i < 10; i++) {
        const sx = Phaser.Math.Between(60, 1200);
        const sy = Phaser.Math.Between(80, 430);
        const sh = Phaser.Math.Between(20, 60);
        const stal = this.scene.add.graphics();
        stal.fillStyle(0x4499cc, 0.8);
        stal.fillTriangle(sx, sy, sx - 8, sy + sh, sx + 8, sy + sh);
        stal.setDepth(3);
        this._decorations.push(stal);
      }

      for (let i = 0; i < 5; i++) {
        const sx = Phaser.Math.Between(100, 1100);
        const crystal = this.scene.add.graphics();
        crystal.fillStyle(0x88ddff, 0.7);
        crystal.fillTriangle(sx, 520, sx - 10, 490, sx + 10, 490);
        crystal.setDepth(4);
        this._decorations.push(crystal);
      }
    }
  }

  cleanup() {
    for (const e of this.enemies) {
      e.destroy && e.destroy();
    }
    this.enemies = [];
    this.boss = null;
    this._decorations.forEach(d => d.destroy && d.destroy());
    this._decorations = [];
  }
}
