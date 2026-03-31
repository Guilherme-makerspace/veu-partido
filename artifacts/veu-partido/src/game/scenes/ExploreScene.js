import { COLORS, SCREEN_W, SCREEN_H, MOVE_SPEED, TILE_SIZE } from '../constants.js';
import InputSNES from '../core/InputSNES.js';
import WorldManager from '../core/WorldManager.js';
import Metamorfo from '../entities/players/Metamorfo.js';
import Duelista from '../entities/players/Duelista.js';
import Xama from '../entities/players/Xama.js';
import Voraz from '../entities/players/Voraz.js';
import Enemy from '../entities/enemies/Enemy.js';
import NPC from '../entities/npcs/NPC.js';
import { ENEMY_CONFIGS, createEnemyConfig } from '../entities/enemies/EnemyTypes.js';
import { NPC_CONFIGS } from '../entities/npcs/NPCTypes.js';
import ScoreSystem from '../systems/ScoreSystem.js';

const PLAYER_CLASSES = {
  metamorfo: Metamorfo,
  duelista: Duelista,
  xama: Xama,
  voraz: Voraz,
};

export default class ExploreScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Explore' });
    this.players = [];
    this.enemies = [];
    this.npcs = [];
    this.walls = [];
  }

  init(data) {
    this.p1Class = data.p1Class || 'metamorfo';
    this.p2Class = data.p2Class || 'duelista';
    this.score = data.score || new ScoreSystem();
    this.biome = data.biome || 'cidade';
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.BG);
    this.cameras.main.fadeIn(600, 0, 0, 0);

    this.worldManager = new WorldManager(this);
    this.worldManager.setBiome(this.biome);

    this.physics.world.setBounds(0, 0, SCREEN_W * 2, SCREEN_H * 2);

    this.buildMap();
    this.spawnPlayers();
    this.spawnEnemies();
    this.spawnNPCs();

    this.input2 = new InputSNES(this);

    this.cameras.main.setBounds(0, 0, SCREEN_W * 2, SCREEN_H * 2);

    if (this.players.length > 0) {
      const midX = (this.players[0].container.x + (this.players[1]?.container.x || this.players[0].container.x)) / 2;
      const midY = (this.players[0].container.y + (this.players[1]?.container.y || this.players[0].container.y)) / 2;
      this.cameras.main.centerOn(midX, midY);
    }

    this.scene.launch('UI');
    this.scene.get('UI').events?.emit('init', { players: this.players });

    this.createHUD();

    this.input.keyboard.on('keydown-TAB', () => this.openSkillTree());

    this.interactPrompt = this.add.text(SCREEN_W / 2, SCREEN_H - 50, '', {
      fontFamily: 'monospace', fontSize: '11px', color: '#c47afe',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10);

    this.battleTransitionTimer = null;
  }

  buildMap() {
    const gfx = this.add.graphics();
    const mapW = SCREEN_W * 2;
    const mapH = SCREEN_H * 2;

    gfx.fillStyle(COLORS.BG3, 1);
    gfx.fillRect(0, 0, mapW, mapH);

    const floorColor = this.biome === 'cidade' ? 0x1a1528 :
      this.biome === 'dungeon' ? 0x0f0d18 : 0x131820;
    gfx.fillStyle(floorColor, 1);
    gfx.fillRect(40, 40, mapW - 80, mapH - 80);

    for (let x = 40; x < mapW - 40; x += TILE_SIZE) {
      gfx.lineStyle(1, COLORS.SURFACE, 0.15);
      gfx.beginPath();
      gfx.moveTo(x, 40);
      gfx.lineTo(x, mapH - 40);
      gfx.strokePath();
    }
    for (let y = 40; y < mapH - 40; y += TILE_SIZE) {
      gfx.lineStyle(1, COLORS.SURFACE, 0.15);
      gfx.beginPath();
      gfx.moveTo(40, y);
      gfx.lineTo(mapW - 40, y);
      gfx.strokePath();
    }

    gfx.lineStyle(3, COLORS.ACCENT, 0.3);
    gfx.strokeRect(40, 40, mapW - 80, mapH - 80);

    this.addDecorations(gfx, mapW, mapH);

    const wallData = [
      [200, 200, 160, 32], [500, 300, 32, 160],
      [800, 150, 200, 32], [300, 600, 32, 200],
      [1000, 400, 180, 32], [700, 700, 32, 160],
      [1200, 200, 32, 200], [400, 900, 200, 32],
    ];

    wallData.forEach(([x, y, w, h]) => {
      gfx.fillStyle(COLORS.BG2, 1);
      gfx.fillRect(x, y, w, h);
      gfx.lineStyle(1, COLORS.BORDER, 0.5);
      gfx.strokeRect(x, y, w, h);

      const wall = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x000000, 0);
      this.physics.add.existing(wall, true);
      this.walls.push(wall);
    });
  }

  addDecorations(gfx, mapW, mapH) {
    const decorColor = this.biome === 'cidade' ? COLORS.MUTED : COLORS.ACCENT;
    for (let i = 0; i < 20; i++) {
      const x = 80 + Math.random() * (mapW - 160);
      const y = 80 + Math.random() * (mapH - 160);
      gfx.fillStyle(decorColor, 0.08);
      gfx.fillCircle(x, y, Math.random() * 30 + 10);
    }
    if (this.biome === 'cidade') {
      for (let i = 0; i < 8; i++) {
        const x = 80 + Math.random() * (mapW - 160);
        const y = 80 + Math.random() * (mapH - 160);
        gfx.fillStyle(COLORS.SURFACE, 1);
        gfx.fillRect(x, y, 24, 48);
        gfx.lineStyle(1, COLORS.ACCENT, 0.2);
        gfx.strokeRect(x, y, 24, 48);
      }
    }
  }

  spawnPlayers() {
    const P1Class = PLAYER_CLASSES[this.p1Class] || Metamorfo;
    const P2Class = PLAYER_CLASSES[this.p2Class] || Duelista;
    this.player1 = new P1Class(this, 200, 200, 0);
    this.player2 = new P2Class(this, 240, 200, 1);
    this.players = [this.player1, this.player2];

    for (const wall of this.walls) {
      for (const player of this.players) {
        this.physics.add.collider(player.container, wall);
      }
    }
    this.physics.add.collider(this.player1.container, this.player2.container);
  }

  spawnEnemies() {
    const enemyTypes = ['fragmentado', 'corrompido', 'espectro', 'fragmentado', 'corrompido'];
    enemyTypes.forEach((type, i) => {
      const x = 400 + (i % 3) * 200 + Math.random() * 100;
      const y = 400 + Math.floor(i / 3) * 200 + Math.random() * 100;
      const cfg = createEnemyConfig(type, 1);
      const enemy = new Enemy(this, x, y, cfg);
      this.enemies.push(enemy);
      for (const wall of this.walls) {
        this.physics.add.collider(enemy.container, wall);
      }
    });
  }

  spawnNPCs() {
    const npcConfigs = [
      { type: 'mercador', x: 150, y: 400 },
      { type: 'sobrevivente', x: 600, y: 150 },
      { type: 'oraculo', x: 900, y: 800 },
    ];
    npcConfigs.forEach(({ type, x, y }) => {
      const cfg = NPC_CONFIGS[type];
      if (cfg) {
        const npc = new NPC(this, x, y, cfg);
        this.npcs.push(npc);
      }
    });
  }

  createHUD() {
    this.hudGraphics = this.add.graphics().setScrollFactor(0).setDepth(20);
    this.hudTexts = [];
    this.updateHUD();
  }

  updateHUD() {
    if (!this.hudGraphics) return;
    this.hudGraphics.clear();
    this.hudTexts.forEach(t => t.destroy());
    this.hudTexts = [];

    this.players.forEach((player, i) => {
      const info = player.getHUDInfo();
      const x = i === 0 ? 10 : SCREEN_W - 220;
      const y = 10;
      const w = 200, h = 80;

      const clr = i === 0 ? 0x3ec9a0 : 0x5aaaee;
      this.hudGraphics.fillStyle(COLORS.BG2, 0.85);
      this.hudGraphics.fillRect(x, y, w, h);
      this.hudGraphics.lineStyle(1, clr, 0.5);
      this.hudGraphics.strokeRect(x, y, w, h);
      this.hudGraphics.lineStyle(2, clr, 0.8);
      this.hudGraphics.beginPath();
      this.hudGraphics.moveTo(x, y);
      this.hudGraphics.lineTo(x + w, y);
      this.hudGraphics.strokePath();

      const nameT = this.add.text(x + 8, y + 6, `P${i + 1} ${info.name.toUpperCase()}  Lv.${info.level}`, {
        fontFamily: 'monospace', fontSize: '9px', color: '#' + clr.toString(16).padStart(6, '0'),
      }).setScrollFactor(0).setDepth(21);
      this.hudTexts.push(nameT);

      const pulsoW = Math.floor((info.pulso / info.maxPulso) * (w - 16));
      this.hudGraphics.fillStyle(COLORS.SURFACE, 1);
      this.hudGraphics.fillRect(x + 8, y + 22, w - 16, 10);
      this.hudGraphics.fillStyle(0x6bcf8a, 1);
      this.hudGraphics.fillRect(x + 8, y + 22, pulsoW, 10);
      const pulsoT = this.add.text(x + 8, y + 20, `P ${info.pulso}/${info.maxPulso}`, {
        fontFamily: 'monospace', fontSize: '8px', color: '#6bcf8a',
      }).setScrollFactor(0).setDepth(21);
      this.hudTexts.push(pulsoT);

      const ecoW = Math.floor((info.eco / info.maxEco) * (w - 16));
      this.hudGraphics.fillStyle(COLORS.SURFACE, 1);
      this.hudGraphics.fillRect(x + 8, y + 38, w - 16, 10);
      this.hudGraphics.fillStyle(0x3ec9a0, 1);
      this.hudGraphics.fillRect(x + 8, y + 38, ecoW, 10);
      const ecoT = this.add.text(x + 8, y + 36, `E ${info.eco}/${info.maxEco}`, {
        fontFamily: 'monospace', fontSize: '8px', color: '#3ec9a0',
      }).setScrollFactor(0).setDepth(21);
      this.hudTexts.push(ecoT);

      const statT = this.add.text(x + 8, y + 55, `F:${info.fratura} V:${info.veu} L:${info.limiar}${info.collapsed ? ' [COLAPSO]' : ''}`, {
        fontFamily: 'monospace', fontSize: '8px', color: info.collapsed ? '#e05c6a' : '#8a86a0',
      }).setScrollFactor(0).setDepth(21);
      this.hudTexts.push(statT);
    });

    const scoreT = this.add.text(SCREEN_W / 2, 12, `SCORE: ${this.score.getTotal()}`, {
      fontFamily: 'monospace', fontSize: '10px', color: '#c47afe',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(21);
    this.hudTexts.push(scoreT);
  }

  update(time, delta) {
    this.input2.update();

    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i];
      const pn = i + 1;
      const axis = this.input2.getAxis(pn);
      let vx = axis.x * MOVE_SPEED;
      let vy = axis.y * MOVE_SPEED;
      if (vx !== 0 && vy !== 0) {
        vx *= 0.707;
        vy *= 0.707;
      }
      player.move(vx, vy);
      player.update(delta);

      if (this.input2.justPressed(pn, 'action')) {
        this.handlePlayerInteract(player, i);
      }
    }

    for (const enemy of this.enemies) {
      if (enemy.isAlive()) enemy.update(delta, this.players);
    }

    for (const npc of this.npcs) {
      npc.update(delta);
    }

    this.updateCamera();
    this.checkBattleTrigger();
    this.checkNPCInteract();
    this.updateHUD();
  }

  updateCamera() {
    if (this.players.length < 2) return;
    const p1 = this.players[0].getPosition();
    const p2 = this.players[1].getPosition();
    const cx = (p1.x + p2.x) / 2;
    const cy = (p1.y + p2.y) / 2;
    const cam = this.cameras.main;
    cam.centerOn(
      Phaser.Math.Clamp(cx, cam.width / 2, SCREEN_W * 2 - cam.width / 2),
      Phaser.Math.Clamp(cy, cam.height / 2, SCREEN_H * 2 - cam.height / 2),
    );
  }

  checkBattleTrigger() {
    for (const enemy of this.enemies) {
      if (!enemy.isAlive()) continue;
      for (const player of this.players) {
        const dx = player.container.x - enemy.container.x;
        const dy = player.container.y - enemy.container.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 40) {
          this.startBattle([enemy]);
          return;
        }
      }
    }
  }

  checkNPCInteract() {
    let nearNPC = null;
    let nearPlayer = null;
    for (const npc of this.npcs) {
      for (const player of this.players) {
        if (npc.isNear(player)) { nearNPC = npc; nearPlayer = player; break; }
      }
      if (nearNPC) break;
    }
    if (nearNPC) {
      this.interactPrompt.setText(`[F/L] Falar com ${nearNPC.npcName}`);
    } else {
      this.interactPrompt.setText('');
    }
    this._nearNPC = nearNPC;
  }

  handlePlayerInteract(player, playerIdx) {
    if (this._nearNPC) {
      const data = this._nearNPC.interact([player]);
      this.scene.pause();
      this.scene.launch('Dialog', {
        dialogs: data.dialogs,
        returnScene: 'Explore',
        returnData: {},
      });
    }
  }

  startBattle(enemiesToFight) {
    if (this.battleTransitionTimer) return;
    enemiesToFight.forEach(e => this.enemies.splice(this.enemies.indexOf(e), 1));
    this.battleTransitionTimer = this.time.delayedCall(100, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0, (cam, p) => {
        if (p === 1) {
          this.scene.pause();
          this.scene.launch('Battle', {
            players: this.players,
            enemies: enemiesToFight,
            score: this.score,
            p1Class: this.p1Class,
            p2Class: this.p2Class,
            returnScene: 'Explore',
          });
        }
      });
    });
  }

  openSkillTree() {
    this.scene.pause();
    this.scene.launch('SkillTree', {
      player: this.player1,
      returnScene: 'Explore',
    });
  }

  onLevelUp(player) {
    const txt = this.add.text(player.container.x, player.container.y - 30, 'LEVEL UP!', {
      fontFamily: 'monospace', fontSize: '12px', color: '#e09a3a',
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({
      targets: txt, y: txt.y - 40, alpha: 0, duration: 1200,
      onComplete: () => txt.destroy(),
    });
  }
}
