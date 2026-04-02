import { Dit } from '../entities/characters/Dit.js';
import { Dullant } from '../entities/characters/Dullant.js';
import { CombatSystem } from '../systems/CombatSystem.js';
import { ProgressionSystem } from '../systems/ProgressionSystem.js';
import { InputSystem } from '../systems/InputSystem.js';
import { LevelLoader } from '../levels/LevelLoader.js';
import { LEVELS } from '../levels/LevelConfig.js';
import { AranhaDiamante } from '../entities/bosses/AranhaDiamante.js';
import bus from '../utils/EventBus.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });

    this.players = [];
    this.levelLoader = null;
    this.combatSystem = null;
    this.progressionSystem = null;
    this.inputSystem = null;
    this.uiScene = null;

    this.currentLevelIndex = 0;
    this.score = 0;
    this.gameActive = false;
    this.transitioning = false;
  }

  init(data) {
    this.currentLevelIndex = data.levelIndex || 0;
  }

  create() {
    this.gameActive = true;
    this.transitioning = false;

    this.inputSystem       = new InputSystem(this);
    this.combatSystem      = new CombatSystem(this);
    this.progressionSystem = new ProgressionSystem();
    this.levelLoader       = new LevelLoader(this);
    this.levelLoader.registerBossClass('aranha_diamante', AranhaDiamante);

    const levelData = LEVELS[this.currentLevelIndex];
    const bounds = levelData.floorBounds;

    this._createPlayers(bounds);
    this._setupBusListeners();
    this._loadCurrentLevel();

    this.uiScene = this.scene.get('UIScene');
    this.uiScene.registerPlayers(this.players);

    this.scene.launch('UIScene');

    this._buildLevelTitle(levelData);
    this._buildControls();
    this._buildScrollGround(levelData);
  }

  _createPlayers(bounds) {
    const p1 = new Dit(this, 200, 560, 1);
    p1.floorBounds = bounds;
    const p2 = new Dullant(this, 280, 560, 2);
    p2.floorBounds = bounds;

    this.players = [p1, p2];

    this.progressionSystem.registerPlayer(1, p1);
    this.progressionSystem.registerPlayer(2, p2);
  }

  _loadCurrentLevel() {
    const levelData = LEVELS[this.currentLevelIndex];
    this.levelLoader.loadLevel(levelData, levelData.floorBounds);
  }

  _buildLevelTitle(levelData) {
    const title = this.add.text(640, 300, levelData.name, {
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(500).setAlpha(0);

    const sub = this.add.text(640, 345, levelData.subtitle, {
      fontSize: '18px',
      color: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(500).setAlpha(0);

    this.tweens.add({
      targets: [title, sub],
      alpha: 1,
      duration: 400,
      ease: 'Power2',
      yoyo: true,
      hold: 1600,
      onComplete: () => { title.destroy(); sub.destroy(); }
    });
  }

  _buildControls() {
    const hint = this.add.text(640, 640, 'P1: WASD + J(atk) K(skill)  |  P2: Setas + Num1(atk) Num2(skill)', {
      fontSize: '11px',
      color: '#666666',
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(6);
  }

  _buildScrollGround(levelData) {
    const lineGfx = this.add.graphics();
    lineGfx.lineStyle(1, 0x444444, 0.4);
    for (let i = 0; i < 20; i++) {
      const x = i * 70;
      lineGfx.moveTo(x, levelData.floorBounds.top);
      lineGfx.lineTo(x, levelData.floorBounds.bottom);
    }
    lineGfx.strokePath();
    lineGfx.setDepth(2);
  }

  _setupBusListeners() {
    bus.on('playerAttack',  this._onPlayerAttack,  this);
    bus.on('playerSkill',   this._onPlayerSkill,   this);
    bus.on('enemyDied',     this._onEnemyDied,     this);
    bus.on('playerDied',    this._onPlayerDied,    this);
    bus.on('bossDefeated',  this._onBossDefeated,  this);

    this.events.on('shutdown', () => {
      bus.off('playerAttack',  this._onPlayerAttack);
      bus.off('playerSkill',   this._onPlayerSkill);
      bus.off('enemyDied',     this._onEnemyDied);
      bus.off('playerDied',    this._onPlayerDied);
      bus.off('bossDefeated',  this._onBossDefeated);
      this.combatSystem && this.combatSystem.cleanup();
      this.levelLoader && this.levelLoader.cleanup();
      this.players.forEach(p => p.destroy && p.destroy());
    });
  }

  _onPlayerAttack({ player, x, y, damage }) {
    const enemies = this.levelLoader.getAliveEnemies();
    const dmg = damage || player.getAttack();

    this.combatSystem.tryHit(
      player,
      enemies,
      dmg,
      100,
      { x: player.facing * 30, y: -25 },
      { w: 70, h: 50 }
    );
  }

  _onPlayerSkill({ player, x, y, radius, damage }) {
    const enemies = this.levelLoader.getAliveEnemies();
    for (const enemy of enemies) {
      const dx = Math.abs(enemy.x - x);
      const dy = Math.abs(enemy.y - y);
      if (dx < radius && dy < radius * 0.6) {
        enemy.takeDamage(damage, player);
        if (player.characterClass === 'metamorfo') {
          player.absorbEssence && player.absorbEssence();
        }
      }
    }
  }

  _onEnemyDied({ enemy, killer, xpValue, scoreValue }) {
    const playerId = killer ? killer.playerId : null;

    if (playerId) {
      this.progressionSystem.addXP(playerId, xpValue);
      killer.addScore(scoreValue);
      killer.mana = Math.min(killer.getMaxMana(), killer.mana + 5);
    }

    this.score += scoreValue;
    this.time.delayedCall(600, () => {
      if (!enemy.isDead) return;
    });
  }

  _onPlayerDied({ player }) {
    const allDead = this.players.every(p => p.isDead);
    if (allDead && !this.transitioning) {
      this.transitioning = true;
      this.time.delayedCall(1500, () => this._triggerGameOver(false));
    }
  }

  _onBossDefeated({ boss }) {
    this.time.delayedCall(3000, () => {
      if (!this.transitioning && this.levelLoader.isLevelComplete()) {
        this._advanceLevel();
      }
    });
  }

  _advanceLevel() {
    if (this.transitioning) return;
    this.transitioning = true;

    const totalScore = this.players.reduce((sum, p) => sum + p.score, 0);

    if (this.currentLevelIndex + 1 >= LEVELS.length) {
      this.time.delayedCall(1500, () => {
        this._triggerGameOver(true, totalScore);
      });
      return;
    }

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0);
    overlay.fillRect(0, 0, 1280, 720);
    overlay.setDepth(1000);

    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        this.scene.stop('UIScene');
        this.scene.start('GameScene', { levelIndex: this.currentLevelIndex + 1 });
      }
    });
  }

  _triggerGameOver(victory, totalScore) {
    const t = this.players.reduce((sum, p) => sum + p.score, 0) + (totalScore || 0);
    this.scene.stop('UIScene');
    this.scene.start('GameOverScene', { victory, score: t });
  }

  update(time, delta) {
    if (!this.gameActive || this.transitioning) return;

    const p1Input = this.inputSystem.getP1State();
    const p2Input = this.inputSystem.getP2State();

    this.players[0] && this.players[0].update(delta, p1Input);
    this.players[1] && this.players[1].update(delta, p2Input);

    this.levelLoader.update(delta, this.players);

    this._checkLevelAdvance();
    this._checkManaRegen(delta);
  }

  _checkLevelAdvance() {
    if (this.transitioning) return;
    if (this.levelLoader.isLevelComplete()) {
      this._advanceLevel();
    }
  }

  _checkManaRegen(delta) {
    for (const p of this.players) {
      if (!p.isDead) {
        p.mana = Math.min(p.getMaxMana(), p.mana + (delta / 1000) * 3);
      }
    }
  }
}
