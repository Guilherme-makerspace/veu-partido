import Phaser from 'phaser';
import { CHARACTERS_DATA } from '../data/characters';
import { TALENTS_CATALOG } from '../data/talents';
import { getWeaponById } from '../data/weapons';
import { CharacterId, ItemRarity, LootDropInstance, StatusEffectType, WeaponItem } from '../types';
import { SpriteController } from '../sprites/SpriteController';
import { ScenarioHook } from '../hooks/ScenarioHook';
import { LootSystem } from '../systems/loot';
import { DamageSystem } from '../systems/damage';
import { CombatEntity } from '../attacks/types';
import { executeLightAttack } from '../attacks/lightAttack';
import { executeHeavyAttack } from '../attacks/heavyAttack';
import { executeDitMorphedAttack } from '../attacks/ditMorphedAttack';
import { executeDullantConstructAttack } from '../attacks/dullantConstructAttack';
import { executeDrenColossalImpact } from '../attacks/drenColossalImpact';
import { executeDujaChantSpell } from '../attacks/dujaChantSpell';

/**
 * Cena Principal da Arena 2.5D de O Véu Partido
 * Gerencia ciclo de combate, renderização de sprites LPC, HUD dual e sistema de loot com escolhas
 */
export class MainArenaScene extends Phaser.Scene {
  private currentCharacterId: CharacterId = 'dit';
  private playerSprite!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private scenarioHook!: ScenarioHook;
  private lootSystem!: LootSystem;

  // Atributos dinâmicos do jogador
  private playerHp: number = 100;
  private playerMaxHp: number = 100;
  private playerEco: number = 50;
  private playerMaxEco: number = 50;
  private playerPoeiraEco: number = 0;
  private currentWeapon!: WeaponItem;
  private activeTalents: number[] = [1, 3, 9, 14, 21, 26, 36, 45, 50, 58]; // Talentos de teste ativos

  // Estados de combate
  private isDodging: boolean = false;
  private isParrying: boolean = false;
  private isHealing: boolean = false;
  private isAttacking: boolean = false;
  private playerFacing: 'left' | 'right' | 'up' | 'down' = 'right';
  private lastDashTime: number = 0;

  // Inimigos de teste na arena
  private enemies: {
    id: string;
    name: string;
    sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    hp: number;
    maxHp: number;
    isDead: boolean;
    hpBar: Phaser.GameObjects.Graphics;
    facing: 'left' | 'right' | 'up' | 'down';
    statusEffects: any[];
  }[] = [];

  // Drop mais próximo do jogador para interação de escolha
  private nearestDrop: LootDropInstance | null = null;
  private dropPromptText!: Phaser.GameObjects.Text;
  private dropPromptBg!: Phaser.GameObjects.Graphics;

  // Teclado
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    J: Phaser.Input.Keyboard.Key;
    K: Phaser.Input.Keyboard.Key;
    L: Phaser.Input.Keyboard.Key;
    Z: Phaser.Input.Keyboard.Key;
    X: Phaser.Input.Keyboard.Key;
    C: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
    F: Phaser.Input.Keyboard.Key;
    R: Phaser.Input.Keyboard.Key;
    H: Phaser.Input.Keyboard.Key;
    ONE: Phaser.Input.Keyboard.Key;
    TWO: Phaser.Input.Keyboard.Key;
    THREE: Phaser.Input.Keyboard.Key;
    FOUR: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
    SHIFT: Phaser.Input.Keyboard.Key;
  };

  // Elementos do HUD
  private hudGraphics!: Phaser.GameObjects.Graphics;
  private hudTextInfo!: Phaser.GameObjects.Text;
  private hudTalentsText!: Phaser.GameObjects.Text;
  private logMessageText!: Phaser.GameObjects.Text;

  constructor() {
    super('MainArenaScene');
  }

  public preload(): void {
    // Carrega spritesheets LPC originais da pasta public/
    this.load.spritesheet('dit', 'dit.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('dren', 'dren.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('dullant', 'dullant.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('suna', 'suna.png', { frameWidth: 64, frameHeight: 64 });
  }

  public create(): void {
    this.lootSystem = new LootSystem();

    // 1. Registra animações de todos os 4 Marcados
    Object.values(CHARACTERS_DATA).forEach(c => {
      SpriteController.registerAnimations(this, c.spriteKey, c.sheetCols);
    });

    // 2. Inicializa o Gancho de Cenário (limites 2.5D: X 60-1220, Y 460-640)
    this.scenarioHook = new ScenarioHook(this);

    // 3. Inicializa Arma e Atributos Iniciais
    this.selectCharacter('dit');

    // 4. Cria o Sprite do Jogador
    const startY = 550;
    this.playerSprite = this.physics.add.sprite(300, startY, 'dit');
    this.playerSprite.setScale(1.5);
    this.playerSprite.setCollideWorldBounds(true);
    this.playerSprite.body.setSize(32, 48);
    this.playerSprite.body.setOffset(16, 16);

    // 5. Configura Controles de Entrada
    this.setupInputs();

    // 6. Spawna Inimigos de Teste de Combate (Cidadãos Famintos / Aberrações de Entropia)
    this.spawnTestEnemies();

    // 7. Criação do HUD Dual e Interface de Decisão
    this.createHUD();

    // 8. Log de Boas-Vindas
    this.showLog('Véu Partido 2.5D Iniciado! Pressione 1, 2, 3, 4 para trocar de classe.');
  }

  private setupInputs(): void {
    if (!this.input.keyboard) return;

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      J: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      K: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
      L: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
      Z: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      X: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
      C: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C),
      E: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      F: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
      R: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
      H: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H),
      ONE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      TWO: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      THREE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      FOUR: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      SHIFT: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
    };

    // Mapeamento de Troca Rápida de Personagens (Teclas 1, 2, 3, 4)
    this.keys.ONE.on('down', () => this.selectCharacter('dit'));
    this.keys.TWO.on('down', () => this.selectCharacter('dullant'));
    this.keys.THREE.on('down', () => this.selectCharacter('dren'));
    this.keys.FOUR.on('down', () => this.selectCharacter('duja'));

    // Ações de Combate
    this.keys.J.on('down', () => this.handlePlayerAttack(false));
    this.keys.Z.on('down', () => this.handlePlayerAttack(false));
    this.keys.K.on('down', () => this.handlePlayerAttack(true));
    this.keys.X.on('down', () => this.handlePlayerAttack(true));
    this.keys.L.on('down', () => this.handlePlayerClassAbility());
    this.keys.C.on('down', () => this.handlePlayerClassAbility());

    // Esquiva / Dash
    this.keys.SPACE.on('down', () => this.handlePlayerDash());

    // Canalização de Cura de Pulso
    this.keys.H.on('down', () => this.handlePlayerHeal());

    // Interações de Loot
    this.keys.E.on('down', () => this.handleLootAction('collect'));
    this.keys.F.on('down', () => this.handleLootAction('fragment'));
    this.keys.R.on('down', () => this.handleLootAction('class_action'));
  }

  /**
   * Troca dinâmica de personagem entre Dit, Dullant, Dren e Duja
   */
  public selectCharacter(charId: CharacterId): void {
    this.currentCharacterId = charId;
    const charData = CHARACTERS_DATA[charId];
    this.currentWeapon = getWeaponById(charData.initialWeaponId);

    // Recalcula pools baseados em PUL e ECO
    this.playerMaxHp = 80 + charData.baseStats.pulso * 15;
    this.playerHp = this.playerMaxHp;
    this.playerMaxEco = 30 + charData.baseStats.eco * 12;
    this.playerEco = this.playerMaxEco;

    if (this.playerSprite) {
      this.playerSprite.setTexture(charData.spriteKey);
      SpriteController.playAnimation(this.playerSprite, charData.spriteKey, 'idle', this.playerFacing);
    }

    this.showLog(`Marcado selecionado: ${charData.name} (${charData.loreRole}) | Origem: ${charData.culturalOrigin}`);
  }

  private spawnTestEnemies(): void {
    const enemyConfigs = [
      { name: 'Cidadão Faminto', x: 800, y: 500, hp: 60 },
      { name: 'Aberração de Sílica', x: 950, y: 570, hp: 90 },
      { name: 'Rato de Entropia', x: 700, y: 610, hp: 45 },
    ];

    enemyConfigs.forEach((cfg, idx) => {
      const sprite = this.physics.add.sprite(cfg.x, cfg.y, 'dit');
      sprite.setTint(0xef4444); // Tonalidade vermelha para indicar oponente
      sprite.setScale(1.4);
      sprite.body.setSize(30, 44);

      const hpBar = this.add.graphics();

      this.enemies.push({
        id: `enemy_${idx}`,
        name: cfg.name,
        sprite,
        hp: cfg.hp,
        maxHp: cfg.hp,
        isDead: false,
        hpBar,
        facing: 'left',
        statusEffects: [],
      });
    });
  }

  private createHUD(): void {
    this.hudGraphics = this.add.graphics().setDepth(100);

    // Texto de Informações do Marcado
    this.hudTextInfo = this.add.text(20, 20, '', {
      fontSize: '14px',
      color: '#f3f4f6',
      fontFamily: 'sans-serif',
      stroke: '#000',
      strokeThickness: 3,
    }).setDepth(101);

    // Texto de Talentos Ativos
    this.hudTalentsText = this.add.text(20, 85, '', {
      fontSize: '11px',
      color: '#c084fc',
      fontFamily: 'monospace',
      stroke: '#000',
      strokeThickness: 2,
    }).setDepth(101);

    // Log de Ações e Narrativa
    this.logMessageText = this.add.text(640, 680, '', {
      fontSize: '13px',
      color: '#fbbf24',
      fontFamily: 'sans-serif',
      stroke: '#000',
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5).setDepth(101);

    // Painel de Escolha de Loot
    this.dropPromptBg = this.add.graphics().setDepth(105);
    this.dropPromptText = this.add.text(640, 200, '', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      align: 'center',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(106);
    this.dropPromptText.setVisible(false);
  }

  private showLog(msg: string): void {
    this.logMessageText.setText(msg);
  }

  /**
   * Constrói a entidade de combate para injeção nos ataques independentes
   */
  private getPlayerCombatEntity(): CombatEntity {
    const charData = CHARACTERS_DATA[this.currentCharacterId];
    return {
      id: this.currentCharacterId,
      name: charData.name,
      x: this.playerSprite.x,
      y: this.playerSprite.y,
      width: this.playerSprite.width,
      height: this.playerSprite.height,
      facing: this.playerFacing,
      stats: charData.baseStats,
      currentHp: this.playerHp,
      maxHp: this.playerMaxHp,
      currentEco: this.playerEco,
      maxEco: this.playerMaxEco,
      currentWeapon: this.currentWeapon,
      activeTalents: this.activeTalents,
      isDodging: this.isDodging,
      isParrying: this.isParrying,
      isStunned: false,
      takeDamage: (amount) => {
        this.playerHp = Math.max(0, this.playerHp - amount);
      },
    };
  }

  private getEnemiesCombatEntities(): CombatEntity[] {
    return this.enemies
      .filter(e => !e.isDead)
      .map(e => ({
        id: e.id,
        name: e.name,
        x: e.sprite.x,
        y: e.sprite.y,
        width: e.sprite.width,
        height: e.sprite.height,
        facing: e.facing,
        stats: { fratura: 3, pulso: 3, eco: 2, veu: 2, limiar: 2 },
        currentHp: e.hp,
        maxHp: e.maxHp,
        currentEco: 0,
        maxEco: 0,
        currentWeapon: getWeaponById('w01_gladio_ferro'),
        activeTalents: [],
        isDodging: false,
        isParrying: false,
        isStunned: false,
        takeDamage: (amount, isCritical, appliedEffects) => {
          e.hp -= amount;
          this.showDamagePopup(e.sprite.x, e.sprite.y - 20, amount, isCritical);
          
          // Flash de dano (Módulo 12.1: piscar em branco por 2 frames)
          e.sprite.setTint(0xffffff);
          this.time.delayedCall(40, () => {
            if (!e.isDead) e.sprite.setTint(0xef4444);
          });

          // Se morreu
          if (e.hp <= 0 && !e.isDead) {
            e.isDead = true;
            e.sprite.setVisible(false);
            e.hpBar.clear();

            // Gera drop no local da morte
            const drop = this.lootSystem.generateDrop(e.sprite.x, e.sprite.y, 'normal');
            this.createDropVisual(drop);

            this.showLog(`Inimigo [${e.name}] abatido! Drop gerado: ${drop.item.name} (${drop.item.rarity.toUpperCase()})`);

            // Respawn do inimigo de teste após 6 segundos
            this.time.delayedCall(6000, () => {
              e.isDead = false;
              e.hp = e.maxHp;
              e.sprite.setVisible(true);
            });
          }
        },
      }));
  }

  private showDamagePopup(x: number, y: number, amount: number, isCritical: boolean): void {
    const color = isCritical ? '#f59e0b' : '#ffffff';
    const text = this.add.text(x, y, `${isCritical ? 'CRÍTICO! ' : ''}${amount}`, {
      fontSize: isCritical ? '18px' : '14px',
      color,
      fontFamily: 'sans-serif',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(200);

    this.tweens.add({
      targets: text,
      y: y - 35,
      alpha: 0,
      duration: 800,
      ease: 'Power1',
      onComplete: () => text.destroy(),
    });
  }

  private createDropVisual(drop: LootDropInstance): void {
    const graphics = this.add.graphics().setDepth(drop.y - 5);
    graphics.fillStyle(0xf59e0b, 0.8);
    graphics.fillCircle(drop.x, drop.y, 10);

    const aura = this.add.graphics().setDepth(drop.y - 6);
    aura.lineStyle(2, 0xa855f7, 0.7);
    aura.strokeCircle(drop.x, drop.y, 16);

    drop.sprite = graphics;
  }

  // --- HANDLERS DE AÇÕES DE COMBATE ---

  private handlePlayerAttack(isHeavy: boolean): void {
    if (this.isAttacking || this.isDodging || this.isHealing) return;

    this.isAttacking = true;
    const attackerEntity = this.getPlayerCombatEntity();
    const targets = this.getEnemiesCombatEntities();

    const attackFn = isHeavy ? executeHeavyAttack : executeLightAttack;
    const result = attackFn({
      attacker: attackerEntity,
      targets,
      scene: this,
      isHeavy,
    });

    const charKey = CHARACTERS_DATA[this.currentCharacterId].spriteKey;
    SpriteController.playAnimation(this.playerSprite, charKey, result.animationTriggered as any, this.playerFacing);

    this.time.delayedCall(300, () => {
      this.isAttacking = false;
    });

    if (result.targetsHit > 0) {
      this.showLog(`Ataque ${isHeavy ? 'Pesado' : 'Leve'} causou ${result.damageDealt} de dano! (${result.targetsHit} alvo(s))`);
    }
  }

  private handlePlayerClassAbility(): void {
    if (this.isAttacking || this.isDodging || this.isHealing) return;

    this.isAttacking = true;
    const attackerEntity = this.getPlayerCombatEntity();
    const targets = this.getEnemiesCombatEntities();

    let abilityResult;
    switch (this.currentCharacterId) {
      case 'dit':
        abilityResult = executeDitMorphedAttack({ attacker: attackerEntity, targets, scene: this });
        break;
      case 'dullant':
        abilityResult = executeDullantConstructAttack({ attacker: attackerEntity, targets, scene: this });
        break;
      case 'dren':
        abilityResult = executeDrenColossalImpact({ attacker: attackerEntity, targets, scene: this });
        break;
      case 'duja':
        abilityResult = executeDujaChantSpell({ attacker: attackerEntity, targets, scene: this });
        break;
    }

    if (abilityResult) {
      this.playerEco = attackerEntity.currentEco;
      const charKey = CHARACTERS_DATA[this.currentCharacterId].spriteKey;
      SpriteController.playAnimation(this.playerSprite, charKey, abilityResult.animationTriggered as any, this.playerFacing);

      this.time.delayedCall(450, () => {
        this.isAttacking = false;
      });

      this.showLog(`Habilidade de Classe executada! Dano: ${abilityResult.damageDealt} | Eco Gasto: ${abilityResult.energySpent}`);
    }
  }

  private handlePlayerDash(): void {
    const now = Date.now();
    const cooldown = 800; // ms
    if (this.isDodging || now - this.lastDashTime < cooldown) return;

    this.isDodging = true;
    this.lastDashTime = now;

    const charKey = CHARACTERS_DATA[this.currentCharacterId].spriteKey;
    const dir = this.playerFacing;
    const dashSpeed = 450;

    let vx = 0;
    let vy = 0;
    if (dir === 'left') vx = -dashSpeed;
    if (dir === 'right') vx = dashSpeed;
    if (dir === 'up') vy = -dashSpeed * 0.7;
    if (dir === 'down') vy = dashSpeed * 0.7;

    this.playerSprite.setVelocity(vx, vy);

    // Efeito de rastro/ghosting de Dash
    this.time.delayedCall(150, () => {
      this.isDodging = false;
    });

    this.time.delayedCall(250, () => {
      this.playerSprite.setVelocity(0, 0);
    });

    // Talento 3 (Passo Cortante): Dash causa dano no contato se cruzar inimigo
    if (this.activeTalents.includes(3)) {
      const targets = this.getEnemiesCombatEntities();
      for (const t of targets) {
        if (Math.hypot(t.x - this.playerSprite.x, t.y - this.playerSprite.y) < 50) {
          const dashDmg = CHARACTERS_DATA[this.currentCharacterId].baseStats.fratura * 4;
          t.takeDamage(dashDmg, false, []);
          this.showLog(`Passo Cortante causou ${dashDmg} de dano no Dash!`);
        }
      }
    }
  }

  private handlePlayerHeal(): void {
    if (this.isHealing || this.isAttacking) return;
    if (this.playerEco < 15) {
      this.showLog('Eco insuficiente para canalizar cura de Pulso (requer 15 Eco)!');
      return;
    }

    this.isHealing = true;
    this.playerEco -= 15;
    this.playerSprite.setVelocity(0, 0);

    // Cast time de 1 segundo vulnerável
    this.showLog('Canalizando cura de Pulso... Fique atento a ataques laterais!');

    this.time.delayedCall(1000, () => {
      if (this.playerHp > 0) {
        const healAmt = 25 + CHARACTERS_DATA[this.currentCharacterId].baseStats.pulso * 5;
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + healAmt);
        this.showLog(`Pulso canalizado! Recuperados +${healAmt} HP.`);
      }
      this.isHealing = false;
    });
  }

  private handleLootAction(action: 'collect' | 'fragment' | 'class_action'): void {
    if (!this.nearestDrop) return;

    const drop = this.nearestDrop;
    const item = drop.item;

    if (action === 'collect') {
      this.currentWeapon = item;
      this.showLog(`Equipado com sucesso: [${item.name}] (${item.rarity.toUpperCase()})`);
      this.destroyDrop(drop);
    } else if (action === 'fragment') {
      const poeira = LootSystem.calculatePoeiraEco(item.rarity);
      this.playerPoeiraEco += poeira;
      this.showLog(`Item fragmentado! +${poeira} Poeira de Eco adquirida (Total: ${this.playerPoeiraEco}).`);
      this.destroyDrop(drop);
    } else if (action === 'class_action') {
      const res = LootSystem.resolveClassLootAction(this.currentCharacterId, item);
      if (res.success) {
        if (res.transformedWeapon) this.currentWeapon = res.transformedWeapon;
        this.showLog(res.message);
        this.destroyDrop(drop);
      } else {
        this.showLog(res.message);
      }
    }
  }

  private destroyDrop(drop: LootDropInstance): void {
    if (drop.sprite) drop.sprite.destroy();
    this.lootSystem.removeDrop(drop.id);
    this.nearestDrop = null;
    this.dropPromptText.setVisible(false);
    this.dropPromptBg.clear();
  }

  // --- LOOP PRINCIPAL DO JOGO (UPDATE) ---

  public update(time: number, delta: number): void {
    // 1. Movimentação e Input 2.5D
    if (!this.isDodging && !this.isHealing && !this.isAttacking) {
      let vx = 0;
      let vy = 0;
      const speed = 180 + CHARACTERS_DATA[this.currentCharacterId].baseStats.veu * 10;

      if (this.cursors.left.isDown || this.keys.A.isDown) {
        vx = -speed;
        this.playerFacing = 'left';
      } else if (this.cursors.right.isDown || this.keys.D.isDown) {
        vx = speed;
        this.playerFacing = 'right';
      }

      if (this.cursors.up.isDown || this.keys.W.isDown) {
        vy = -speed * 0.75;
        this.playerFacing = 'up';
      } else if (this.cursors.down.isDown || this.keys.S.isDown) {
        vy = speed * 0.75;
        this.playerFacing = 'down';
      }

      this.playerSprite.setVelocity(vx, vy);

      // Trava movimentação rigorosamente na faixa de profundidade da arena (Módulo 1.1)
      const bounds = this.scenarioHook.getBounds();
      this.playerSprite.x = Phaser.Math.Clamp(this.playerSprite.x, bounds.minX, bounds.maxX);
      this.playerSprite.y = Phaser.Math.Clamp(this.playerSprite.y, bounds.minY, bounds.maxY);

      // Controle de Animação de Caminhada / Idle
      const charKey = CHARACTERS_DATA[this.currentCharacterId].spriteKey;
      if (vx !== 0 || vy !== 0) {
        SpriteController.playAnimation(this.playerSprite, charKey, 'walk', this.playerFacing);
      } else {
        SpriteController.playAnimation(this.playerSprite, charKey, 'idle', this.playerFacing);
      }
    }

    // 2. Ordenação de Profundidade 2.5D (Y-sorting essencial)
    this.playerSprite.setDepth(this.playerSprite.y);
    this.enemies.forEach(e => {
      if (!e.isDead) {
        e.sprite.setDepth(e.sprite.y);
        // Atualiza barras de vida dos inimigos
        e.hpBar.clear();
        e.hpBar.fillStyle(0x374151, 0.8);
        e.hpBar.fillRect(e.sprite.x - 20, e.sprite.y - 45, 40, 5);
        e.hpBar.fillStyle(0xef4444, 1);
        const fillW = Math.max(0, (e.hp / e.maxHp) * 40);
        e.hpBar.fillRect(e.sprite.x - 20, e.sprite.y - 45, fillW, 5);
        e.hpBar.setDepth(e.sprite.y + 1);
      }
    });

    // 3. Verificação de proximidade de Drops para o painel de escolha
    this.checkNearestDrop();

    // 4. Regeneração passiva sutil de Eco
    if (this.playerEco < this.playerMaxEco) {
      this.playerEco = Math.min(this.playerMaxEco, this.playerEco + (delta / 1000) * 1.5);
    }

    // 5. Renderização do HUD
    this.renderHUD();
  }

  private checkNearestDrop(): void {
    const drops = this.lootSystem.getActiveDrops();
    let closest: LootDropInstance | null = null;
    let minDist = 75; // Distância de ativação do painel de escolha

    for (const d of drops) {
      const dist = Math.hypot(d.x - this.playerSprite.x, d.y - this.playerSprite.y);
      if (dist < minDist) {
        minDist = dist;
        closest = d;
      }
    }

    this.nearestDrop = closest;

    if (this.nearestDrop) {
      const item = this.nearestDrop.item;
      this.dropPromptText.setVisible(true);
      this.dropPromptText.setText(
        `DROP PRÓXIMO: [${item.name}] (${item.rarity.toUpperCase()}) - Dano: ${item.baseDamage}\n` +
        `Pressione [E] Equipar | [F] Fragmentar (+Poeira de Eco) | [R] Ação de Classe`
      );

      this.dropPromptBg.clear();
      this.dropPromptBg.fillStyle(0x000000, 0.85);
      this.dropPromptBg.lineStyle(2, 0xa855f7, 1);
      this.dropPromptBg.fillRoundedRect(340, 165, 600, 70, 8);
      this.dropPromptBg.strokeRoundedRect(340, 165, 600, 70, 8);
    } else {
      this.dropPromptText.setVisible(false);
      this.dropPromptBg.clear();
    }
  }

  private renderHUD(): void {
    this.hudGraphics.clear();

    // Caixa de fundo do HUD Player 1
    this.hudGraphics.fillStyle(0x111827, 0.85);
    this.hudGraphics.lineStyle(2, 0x3b82f6, 0.8);
    this.hudGraphics.fillRoundedRect(15, 12, 380, 105, 6);
    this.hudGraphics.strokeRoundedRect(15, 12, 380, 105, 6);

    // Barra de Vida (Verde)
    const hpRatio = Phaser.Math.Clamp(this.playerHp / this.playerMaxHp, 0, 1);
    this.hudGraphics.fillStyle(0x1f2937, 1);
    this.hudGraphics.fillRect(25, 45, 180, 14);
    this.hudGraphics.fillStyle(0x22c55e, 1);
    this.hudGraphics.fillRect(25, 45, 180 * hpRatio, 14);

    // Barra de Eco (Ciano brilhante)
    const ecoRatio = Phaser.Math.Clamp(this.playerEco / this.playerMaxEco, 0, 1);
    this.hudGraphics.fillStyle(0x1f2937, 1);
    this.hudGraphics.fillRect(25, 65, 180, 10);
    this.hudGraphics.fillStyle(0x06b6d4, 1);
    this.hudGraphics.fillRect(25, 65, 180 * ecoRatio, 10);

    const char = CHARACTERS_DATA[this.currentCharacterId];
    this.hudTextInfo.setText(
      `${char.name.toUpperCase()} (${char.loreRole})\n` +
      `HP: ${Math.round(this.playerHp)}/${this.playerMaxHp} | ECO: ${Math.round(this.playerEco)}/${this.playerMaxEco}\n` +
      `ARMA: ${this.currentWeapon.name} [${this.currentWeapon.rarity.toUpperCase()}] | POEIRA: ${this.playerPoeiraEco}`
    );

    // Ícones dos Talentos Ativos (Módulo 10)
    const talentNames = this.activeTalents
      .map(id => TALENTS_CATALOG.find(t => t.id === id)?.name || `T#${id}`)
      .slice(0, 4)
      .join(' | ');

    this.hudTalentsText.setText(`TALENTOS: ${talentNames}`);
  }
}

