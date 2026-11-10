import Phaser from 'phaser';
import { CHARACTERS_DATA } from '../data/characters';
import { TALENTS_CATALOG, getTalentsForPath, meetsTalentRequirements } from '../data/talents';
import { getWeaponById, WEAPONS_DATABASE } from '../data/weapons';
import { PATHS_CATALOG, getPathsForCharacter } from '../data/paths';
import { CharacterId, CharacterPathId, ItemRarity, LootDropInstance, StatusEffectType, TalentCard, WeaponItem, SubSkillDefinition } from '../types';
import { GreyHealthState, PathSpecificStatusType, PathStatusInstance, GREY_HEALTH_RULES } from '../types/damageTypes';
import { SpriteController } from '../sprites/SpriteController';
import { ScenarioHook } from '../hooks/ScenarioHook';
import { LootSystem } from '../systems/loot';
import { DamageSystem, createGreyHealthState } from '../systems/damage';
import { EffectDispatcher } from '../systems/EffectDispatcher';
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
    /** Podridão de Dren - Vida Cinza cumulativa */
    greyHealth?: GreyHealthState;
    /** Status de caminho ativos (chamas negras, podre, fissão...) */
    pathStatuses?: PathStatusInstance[];
    /** Status clássicos ativos (rachadura, fragilidade, queimadura...) */
    classicStatuses?: any[];
    antiHealActive?: boolean;
    damageDealtMultiplier?: number;
    isSilenced?: boolean;
    speedMultiplier?: number;
  }[] = [];

  // Caminho e sub-caminho ativos do Marcado
  private currentPathId: CharacterPathId = 'dit_metamorfo_multiplo';
  private currentSubPathId: string | null = null;
  private currentSubSkillId: string | null = null;
  private subSkillCooldownUntil: number = 0;
  private drenLifestealBonus: number = 0;

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
    V: Phaser.Input.Keyboard.Key;
    ONE: Phaser.Input.Keyboard.Key;
    TWO: Phaser.Input.Keyboard.Key;
    THREE: Phaser.Input.Keyboard.Key;
    FOUR: Phaser.Input.Keyboard.Key;
    FIVE: Phaser.Input.Keyboard.Key;
    SIX: Phaser.Input.Keyboard.Key;
    SEVEN: Phaser.Input.Keyboard.Key;
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
    this.showLog('Véu Partido 2.5D Iniciado! Pressione 1, 2, 3, 4 para trocar de classe. [5] Caminho [6] Sub-caminho [V] Sub-habilidade');

    // Expõe a cena para depuração/QA (console do navegador)
    (window as any).__arenaScene = this;
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
      V: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V),
      ONE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      TWO: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      THREE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      FOUR: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      FIVE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
      SIX: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SIX),
      SEVEN: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SEVEN),
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

    // Sub-habilidade do sub-caminho ativo / ciclagem de caminhos
    this.keys.V.on('down', () => this.handleSubSkill());
    this.keys.FIVE.on('down', () => this.cyclePath(1));
    this.keys.SIX.on('down', () => this.cycleSubPath());
    this.keys.SEVEN.on('down', () => this.showPathOverview());

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
    this.currentWeapon = this.getDefaultWeaponFor(charId);

    // Recalcula pools baseados em PUL e ECO
    this.playerMaxHp = 80 + charData.baseStats.pulso * 15;
    this.playerHp = this.playerMaxHp;
    this.playerMaxEco = 30 + charData.baseStats.eco * 12;
    this.playerEco = this.playerMaxEco;

    // Caminho padrão do Marcado + primeiro sub-caminho
    this.currentPathId = charData.availablePaths[0];
    this.currentSubPathId = PATHS_CATALOG[this.currentPathId].subPaths[0]?.id ?? null;
    this.currentSubSkillId = PATHS_CATALOG[this.currentPathId].subPaths[0]?.subSkill.id ?? null;
    this.drenLifestealBonus = 0;

    if (this.playerSprite) {
      this.playerSprite.setTexture(charData.spriteKey);
      SpriteController.playAnimation(this.playerSprite, charData.spriteKey, 'idle', this.playerFacing);
    }

    const pathName = PATHS_CATALOG[this.currentPathId].name;
    this.showLog(`${charData.name} (${charData.loreRole}) | Caminho: ${pathName} | Origem: ${charData.culturalOrigin}`);
    this.debugLogPath();
  }

  /**
   * Arma inicial respeitando a restrição de caminho (fallback para a arma canônica do Marcado)
   */
  private getDefaultWeaponFor(charId: CharacterId): WeaponItem {
    const charData = CHARACTERS_DATA[charId];
    const weapon = getWeaponById(charData.initialWeaponId);
    if (weapon.allowedPaths && !weapon.allowedPaths.some(p => charData.availablePaths.includes(p))) {
      const fallback = WEAPONS_DATABASE.find(w => !w.allowedPaths || w.allowedPaths.some(p => charData.availablePaths.includes(p)));
      return fallback ?? weapon;
    }
    return weapon;
  }

  private debugLogPath(): void {
    const path = PATHS_CATALOG[this.currentPathId];
    const sub = path.subPaths.find(s => s.id === this.currentSubPathId);
    console.info(
      `[O Véu Partido] Caminho: ${path.name} | Status assinatura: ${path.signatureStatus}` +
      ` | Sub-caminho: ${sub?.name ?? '-'} | Sub-habilidade [V]: ${sub?.subSkill.name ?? '-'}`
    );
  }

  /**
   * Ciclngem dos caminhos disponíveis do Marcado (tecla 5)
   */
  private cyclePath(direction: 1 | -1): void {
    const available = CHARACTERS_DATA[this.currentCharacterId].availablePaths;
    const idx = available.indexOf(this.currentPathId);
    this.currentPathId = available[(idx + direction + available.length) % available.length];
    this.currentSubPathId = PATHS_CATALOG[this.currentPathId].subPaths[0]?.id ?? null;
    this.currentSubSkillId = PATHS_CATALOG[this.currentPathId].subPaths[0]?.subSkill.id ?? null;
    this.showLog(`Caminho alternado: ${PATHS_CATALOG[this.currentPathId].name}`);
    this.debugLogPath();
  }

  /**
   * Ciclngem dos sub-caminhos do caminho atual (tecla 6)
   */
  private cycleSubPath(): void {
    const subs = PATHS_CATALOG[this.currentPathId].subPaths;
    if (subs.length === 0) return;
    const idx = subs.findIndex(s => s.id === this.currentSubPathId);
    const next = subs[(idx + 1) % subs.length];
    this.currentSubPathId = next.id;
    this.currentSubSkillId = next.subSkill.id;
    this.showLog(`Sub-caminho: ${next.name} | [V] ${next.subSkill.name}`);
  }

  /**
   * Resumo do catálogo de caminhos/sub-caminhos no log (tecla 7)
   */
  private showPathOverview(): void {
    const paths = getPathsForCharacter(this.currentCharacterId)
      .map(p => `${p.name} [${p.subPaths.length} sub-caminhos]`)
      .join(' · ');
    this.showLog(`Caminhos de ${CHARACTERS_DATA[this.currentCharacterId].name}: ${paths}`);
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
        greyHealth: createGreyHealthState(cfg.hp),
        pathStatuses: [],
        classicStatuses: [],
        antiHealActive: false,
        damageDealtMultiplier: 1,
        isSilenced: false,
        speedMultiplier: 1,
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
      statusEffects: [],
      pathStatuses: [],
      currentPath: this.currentPathId,
      currentSubPathId: this.currentSubPathId ?? undefined,
      damageDealtMultiplier: 1,
      speedMultiplier: 1,
      takeDamage: (amount) => {
        this.playerHp = Math.max(0, this.playerHp - amount);
      },
    };
  }

  /**
   * Bônus passivos do sub-caminho ativo (dano, resistência, penetração, lifesteal)
   */
  private getSubPathModifiers() {
    const path = PATHS_CATALOG[this.currentPathId];
    const sub = path?.subPaths.find(s => s.id === this.currentSubPathId);
    return sub?.passiveModifiers ?? {};
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
        statusEffects: e.classicStatuses ?? [],
        pathStatuses: e.pathStatuses,
        greyHealth: e.greyHealth,
        antiHealActive: e.antiHealActive,
        damageDealtMultiplier: e.damageDealtMultiplier,
        isSilenced: e.isSilenced,
        speedMultiplier: e.speedMultiplier,
        takeDamage: (amount, isCritical, appliedEffects) => {
          e.hp -= amount;
          this.showDamagePopup(e.sprite.x, e.sprite.y - 20, amount, isCritical);

          // Registra os status clássicos aplicados para que Rachadura/Fragilidade afetem os próximos golpes
          if (appliedEffects && appliedEffects.length > 0) {
            this.addClassicStatuses(e, appliedEffects);
          }
          
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

            // Podridão: morte 100% cinza espalha a peste para os vizinhos
            if (e.greyHealth?.isFullyRotten && this.currentCharacterId === 'dren') {
              const spread = Math.round(e.maxHp * 0.25);
              for (const other of this.enemies) {
                if (other.id !== e.id && !other.isDead && Math.hypot(other.sprite.x - e.sprite.x, other.sprite.y - e.sprite.y) < 180) {
                  this.applyPathStatusToEnemy(other, 'status_podre', spread, 0.30, 8000);
                }
              }
            }

            // Gera drop no local da morte
            const drop = this.lootSystem.generateDrop(e.sprite.x, e.sprite.y, 'normal');
            this.createDropVisual(drop);

            this.showLog(`Inimigo [${e.name}] abatido! Drop gerado: ${drop.item.name} (${drop.item.rarity.toUpperCase()})`);

            // Respawn do inimigo de teste após 6 segundos
            this.time.delayedCall(6000, () => {
              e.isDead = false;
              e.hp = e.maxHp;
              e.greyHealth = createGreyHealthState(e.maxHp);
              e.pathStatuses = [];
              e.classicStatuses = [];
              e.antiHealActive = false;
              e.damageDealtMultiplier = 1;
              e.isSilenced = false;
              e.speedMultiplier = 1;
              e.sprite.setVisible(true);
            });
          }
        },
      }));
  }

  /**
   * Aplica um status de caminho em um inimigo do cenário (mantém estado entre golpes)
   */
  private applyPathStatusToEnemy(
    enemy: NonNullable<MainArenaScene['enemies'][number]>,
    status: PathSpecificStatusType,
    potency: number,
    penetration: number,
    durationMs?: number
  ): void {
    const entity = this.enemies.find(en => en.id === enemy.id) ?? enemy;
    const combatEntity: CombatEntity = {
      id: entity.id,
      name: entity.name,
      x: entity.sprite.x,
      y: entity.sprite.y,
      width: entity.sprite.width,
      height: entity.sprite.height,
      facing: entity.facing,
      stats: { fratura: 3, pulso: 3, eco: 2, veu: 2, limiar: 2 },
      currentHp: entity.hp,
      maxHp: entity.maxHp,
      currentEco: 0,
      maxEco: 0,
      currentWeapon: getWeaponById('w01_gladio_ferro'),
      activeTalents: [],
      isDodging: false,
      isParrying: false,
      isStunned: false,
      statusEffects: entity.classicStatuses ?? [],
      pathStatuses: entity.pathStatuses,
      greyHealth: entity.greyHealth,
      antiHealActive: entity.antiHealActive,
      takeDamage: () => { /* resolução de dano tratada pelo handler principal */ },
    };

    // Sincroniza a vida cinza já acumulada com a entidade antes de aplicar o novo stack
    entity.greyHealth = DamageSystem.applyRotToTarget(
      { ...combatEntity, currentHp: entity.hp, maxHp: entity.maxHp } as CombatEntity,
      0
    );
    combatEntity.greyHealth = entity.greyHealth;
    combatEntity.pathStatuses = entity.pathStatuses;

    const result = EffectDispatcher.applyPathStatus(
      combatEntity,
      status,
      potency,
      penetration,
      durationMs,
      undefined,
      this.getPlayerCombatEntity()
    );

    // Escreve de volta o estado mutado (arrays e estrutura de vida cinza)
    entity.pathStatuses = combatEntity.pathStatuses ?? [];
    entity.greyHealth = combatEntity.greyHealth ?? entity.greyHealth;
    entity.antiHealActive = combatEntity.antiHealActive;

    if (entity.greyHealth) {
      entity.greyHealth.currentGreyHp = Math.min(entity.hp, entity.greyHealth.currentGreyHp);
    }

    if (result.exploded && result.damageDealt > 0) {
      entity.hp -= result.damageDealt;
      this.showDamagePopup(entity.sprite.x, entity.sprite.y - 35, result.damageDealt, true);
      this.showLog(result.message ?? 'STATUS DETONADO!');
    } else if (result.message && (status === 'status_podre' || status === 'chamas_negras')) {
      this.showLog(result.message);
    }
  }

  /**
   * Registra status clássicos (rachadura, fragilidade, queimadura...) em um inimigo
   */
  private addClassicStatuses(
    enemy: NonNullable<MainArenaScene['enemies'][number]>,
    effects: StatusEffectType[]
  ): void {
    if (!enemy.classicStatuses) enemy.classicStatuses = [];
    const durations: Partial<Record<StatusEffectType, number>> = {
      rachadura: 3000,
      fragilidade: 5000,
      hemorragia: 4000,
      queimadura: 4000,
      veneno: 6000,
      exposicao: 5000,
      corrupcao: 4000,
      lentidao: 3000,
      atordoamento: 1200,
      silencio: 3000,
      congelamento: 4000,
      sangria_vital: 4000,
    };

    for (const type of effects) {
      const existing = enemy.classicStatuses.find((s: any) => s.type === type);
      const duration = durations[type] ?? 3000;
      if (existing) {
        existing.stacks = Math.min(10, existing.stacks + 1);
        existing.elapsedMs = 0;
      } else {
        enemy.classicStatuses.push({
          type,
          durationMs: duration,
          elapsedMs: 0,
          stacks: 1,
          tickTimerMs: 0,
          sourceValue: 10,
        });
      }
    }
  }

  private showDamagePopup(x: number, y: number, amount: number, isCritical: boolean, colorOverride?: string): void {
    const color = colorOverride ?? (isCritical ? '#f59e0b' : '#ffffff');
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

    // Estiramento Visceral do Dren Corcovado: recupera vida proporcional ao dano
    if (this.currentCharacterId === 'dren' && result.damageDealt > 0) {
      const mods = this.getSubPathModifiers();
      const lifestealRatio = 0.12 + (mods.lifestealBonus ?? 0) + this.drenLifestealBonus;
      const heal = Math.round(result.damageDealt * Math.min(0.60, lifestealRatio));
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal);
      this.drenLifestealBonus = Math.min(0.18, this.drenLifestealBonus + 0.02);
    }

    // Sincroniza a vida vermelha de volta com o cenário e aplica os status de caminho gerados
    this.syncEnemiesAfterAttack(targets, result);

    const charKey = CHARACTERS_DATA[this.currentCharacterId].spriteKey;
    SpriteController.playAnimation(this.playerSprite, charKey, result.animationTriggered as any, this.playerFacing);

    this.time.delayedCall(300, () => {
      this.isAttacking = false;
    });

    if (result.targetsHit > 0) {
      const extra = result.greyHealthDealt ? ` | Vida Cinza: ${result.greyHealthDealt}` : '';
      this.showLog(`Ataque ${isHeavy ? 'Pesado' : 'Leve'} causou ${result.damageDealt} de dano! (${result.targetsHit} alvo(s))${extra}`);
    }
  }

  /**
   * Recopia a vida e aplica os status de caminho retornados pelos ataques nas entidades do cenário.
   */
  private syncEnemiesAfterAttack(
    targets: CombatEntity[],
    result: { pathStatusesApplied?: PathSpecificStatusType[]; greyHealthDealt?: number }
  ): void {
    for (const t of targets) {
      const enemy = this.enemies.find(e => e.id === t.id);
      if (!enemy) continue;
      enemy.hp = t.currentHp;
      if (t.greyHealth) enemy.greyHealth = t.greyHealth;

      // Todos os status de caminho retornados pelo golpe são aplicados ao cenário
      for (const status of result.pathStatusesApplied ?? []) {
        this.applyPathStatusToEnemy(
          enemy,
          status,
          Math.max(6, Math.round((result.greyHealthDealt ?? 10) * 0.5) + 4),
          0.30,
          status === 'chamas_negras' ? 6000 : 8000
        );
      }
    }
  }

  /**
   * Sub-habilidade do sub-caminho ativo (tecla V).
   * Resolve o dano a partir dos componentes declarados em data/paths.ts e aplica
   * o status exclusivo do sub-caminho.
   */
  private handleSubSkill(): void {
    if (this.isAttacking || this.isDodging || this.isHealing) return;

    const path = PATHS_CATALOG[this.currentPathId];
    const sub = path?.subPaths.find(s => s.id === this.currentSubPathId);
    const skill: SubSkillDefinition | undefined = sub?.subSkill;
    if (!skill) {
      this.showLog('Nenhum sub-caminho ativo. Pressione [6] para escolher um sub-caminho.');
      return;
    }

    const now = Date.now();
    if (now < this.subSkillCooldownUntil) {
      this.showLog(`${skill.name} em recarga (${Math.ceil((this.subSkillCooldownUntil - now) / 1000)}s)`);
      return;
    }
    if (this.playerEco < skill.ecoCost) {
      this.showLog(`Eco insuficiente para ${skill.name} (requer ${skill.ecoCost}).`);
      return;
    }

    this.isAttacking = true;
    this.playerEco -= skill.ecoCost;
    this.subSkillCooldownUntil = now + skill.cooldownMs;

    const attackerEntity = this.getPlayerCombatEntity();
    const targets = this.getEnemiesCombatEntities();
    const mods = this.getSubPathModifiers();

    // Auto-dano de pactos (Sino de Sangue, Sacrifício)
    if (skill.selfDamageRatio) {
      const selfDmg = Math.round(this.playerMaxHp * skill.selfDamageRatio);
      this.playerHp = Math.max(1, this.playerHp - selfDmg);
    }

    let totalDamage = 0;
    let hits = 0;
    const statusApplied: PathSpecificStatusType[] = [];

    for (const target of targets) {
      const dist = skill.radius
        ? Math.hypot(target.x - attackerEntity.x, (target.y - attackerEntity.y) * 1.5)
        : Math.abs(target.x - attackerEntity.x);
      const inRange = skill.radius ? dist <= skill.radius : dist <= (skill.rangeX ?? 120);
      if (!inRange) continue;
      if (!skill.radius && skill.rangeX) {
        const dirMultiplier = this.playerFacing === 'left' ? -1 : 1;
        if ((target.x - attackerEntity.x) * dirMultiplier <= 0) continue;
      }

      const components = skill.damageComponents ?? skill.damageTypes.map(t => ({
        type: t,
        baseAmount: Math.round(10 + this.currentWeapon.baseDamage * 0.6),
        penetrationRatio: skill.penetrationRatio,
      }));

      const dmgResult = DamageSystem.calculateDamage(
        attackerEntity,
        this.currentWeapon,
        target,
        false,
        {
          activeTalentIds: this.activeTalents,
          customDamageComponents: components,
          bonusPenetration: mods.penetrationBonus ?? 0,
          damageMultiplierBonus: (mods.damageMultiplier ?? 1) - 1,
        }
      );

      target.takeDamage(dmgResult.mitigatedDamage, dmgResult.isCritical, dmgResult.appliedEffects);
      totalDamage += dmgResult.mitigatedDamage;
      hits++;

      if (skill.inflictedStatus && !statusApplied.includes(skill.inflictedStatus)) {
        statusApplied.push(skill.inflictedStatus);
      }
    }

    // Aplica os status da sub-habilidade no cenário
    const enemyTargets = this.enemies.filter(e => !e.isDead);
    for (const status of statusApplied) {
      for (const enemy of enemyTargets) {
        const dist = skill.radius
          ? Math.hypot(enemy.sprite.x - attackerEntity.x, (enemy.sprite.y - attackerEntity.y) * 1.5)
          : Math.abs(enemy.sprite.x - attackerEntity.x);
        const inRange = skill.radius ? dist <= skill.radius : dist <= (skill.rangeX ?? 120);
        if (!inRange) continue;
        this.applyPathStatusToEnemy(
          enemy,
          status,
          Math.max(10, Math.round(totalDamage / Math.max(1, hits)) * 0.8),
          skill.penetrationRatio,
          undefined
        );
      }
    }

    const charKey = CHARACTERS_DATA[this.currentCharacterId].spriteKey;
    SpriteController.playAnimation(this.playerSprite, charKey, 'spellcast' as any, this.playerFacing);

    if (this.cameras?.main) {
      this.cameras.main.flash(120, 60, 20, 90);
    }

    this.showLog(
      `${skill.name} executada! Dano: ${totalDamage} (${hits} alvo(s))` +
      (statusApplied.length ? ` | Status: ${statusApplied.join(', ')}` : '')
    );

    this.time.delayedCall(400, () => {
      this.isAttacking = false;
    });
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

    // 2. Processamento dos status (Vida Cinza, Chamas Negras, Fissão, podridão 100%)
    this.updateEnemyStatuses(delta);

    // 3. Ordenação de Profundidade 2.5D (Y-sorting essencial)
    this.playerSprite.setDepth(this.playerSprite.y);
    this.enemies.forEach(e => {
      if (!e.isDead) {
        e.sprite.setDepth(e.sprite.y);

        // Aura visual: cinza quando 100% podre, arroxeada quando amaldiçoado
        if (e.greyHealth?.isFullyRotten) {
          e.sprite.setTint(0x9ca3af);
        } else if (e.antiHealActive) {
          e.sprite.setTint(0x7c3aed);
        }

        // Atualiza barras de vida dos inimigos (vida vermelha + vida cinza)
        e.hpBar.clear();
        e.hpBar.fillStyle(0x374151, 0.8);
        e.hpBar.fillRect(e.sprite.x - 20, e.sprite.y - 45, 40, 5);

        const hpRatio = Phaser.Math.Clamp(e.hp / e.maxHp, 0, 1);
        const greyRatio = Phaser.Math.Clamp((e.greyHealth?.currentGreyHp ?? 0) / e.maxHp, 0, 1);

        // Barra cinza (Podridão de Dren) preenche a partir da direita
        if (greyRatio > 0) {
          e.hpBar.fillStyle(0x9ca3af, 1);
          e.hpBar.fillRect(e.sprite.x - 20 + 40 * Math.max(0, hpRatio - greyRatio), e.sprite.y - 45, 40 * greyRatio, 5);
        }

        // Barra vermelha restante (vida vermelha = hp - vida cinza)
        const redRatio = Math.max(0, hpRatio - greyRatio);
        e.hpBar.fillStyle(0xef4444, 1);
        e.hpBar.fillRect(e.sprite.x - 20, e.sprite.y - 45, 40 * redRatio, 5);

        // Marcador de falência necrótica
        if (e.greyHealth?.isFullyRotten) {
          e.hpBar.lineStyle(1, 0xf59e0b, 1);
          e.hpBar.strokeRect(e.sprite.x - 20, e.sprite.y - 45, 40, 5);
        }

        e.hpBar.setDepth(e.sprite.y + 1);
      }
    });

    // 4. Verificação de proximidade de Drops para o painel de escolha
    this.checkNearestDrop();

    // 5. Regeneração passiva sutil de Eco
    if (this.playerEco < this.playerMaxEco) {
      this.playerEco = Math.min(this.playerMaxEco, this.playerEco + (delta / 1000) * 1.5);
    }

    // 6. Renderização do HUD
    this.renderHUD();
  }

  /**
   * Ticks de status dos inimigos:
   * - Colapso necrótico quando 100% da vida é cinza (dano over time)
   * - DoT de Chamas Negras, Decaimento de Fissão, Corrosão, etc.
   * - Expiração dos status clássicos e de caminho
   */
  private updateEnemyStatuses(delta: number): void {
    const now = Date.now();

    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;

      let hpBefore = enemy.hp;

      // --- 1. COLAPSO NECRÓTICO: vida 100% cinza ---
      if (enemy.greyHealth && enemy.greyHealth.isFullyRotten && enemy.hp > 0) {
        enemy.greyHealth.decayDotTimerMs += delta;
        if (enemy.greyHealth.decayDotTimerMs >= GREY_HEALTH_RULES.FULL_ROT_TICK_MS) {
          enemy.greyHealth.decayDotTimerMs = 0;
          const necrosisDmg = Math.max(3, Math.round(enemy.maxHp * GREY_HEALTH_RULES.FULL_ROT_DPS));
          const greyBurn = Math.round(enemy.greyHealth.currentGreyHp * GREY_HEALTH_RULES.FULL_ROT_GREY_BURN_RATIO);
          enemy.hp = Math.max(0, enemy.hp - necrosisDmg);
          enemy.greyHealth.currentGreyHp = Math.min(enemy.hp, Math.max(0, enemy.greyHealth.currentGreyHp - greyBurn));
          enemy.greyHealth.isFullyRotten = enemy.hp > 0 && enemy.greyHealth.currentGreyHp >= enemy.hp;
          this.showDamagePopup(enemy.sprite.x, enemy.sprite.y - 55, necrosisDmg, false, '#9ca3af');
        }
      }

      // --- 2. DOTS DE STATUS DE CAMINHO ---
      if (enemy.pathStatuses && enemy.pathStatuses.length > 0) {
        const remaining: PathStatusInstance[] = [];
        for (const instance of enemy.pathStatuses) {
          instance.elapsedMs += delta;
          instance.tickTimerMs += delta;

          const dotSpec = this.getPathStatusDot(instance.type);
          if (dotSpec && instance.tickTimerMs >= dotSpec.intervalMs) {
            instance.tickTimerMs = 0;
            const dmg = Math.max(2, Math.round(instance.potency * dotSpec.ratio * instance.stacks));
            enemy.hp = Math.max(0, enemy.hp - dmg);
            this.showDamagePopup(enemy.sprite.x, enemy.sprite.y - 40, dmg, false, dotSpec.color);
          }

          if (instance.elapsedMs < instance.durationMs) {
            remaining.push(instance);
          } else if (instance.type === 'chamas_negras') {
            enemy.antiHealActive = remaining.some(s => s.type === 'chamas_negras');
          }
        }
        enemy.pathStatuses = remaining;
      }

      // --- 3. STATUS CLÁSSICOS (rachadura, fragilidade, queimadura...) ---
      if (enemy.classicStatuses && enemy.classicStatuses.length > 0) {
        const remainingClassic: any[] = [];
        for (const effect of enemy.classicStatuses) {
          effect.elapsedMs += delta;
          effect.tickTimerMs = (effect.tickTimerMs ?? 0) + delta;

          if ((effect.type === 'hemorragia' || effect.type === 'queimadura') && effect.tickTimerMs >= 500) {
            effect.tickTimerMs = 0;
            const dmg = Math.max(1, Math.round(effect.stacks * 2));
            enemy.hp = Math.max(0, enemy.hp - dmg);
          }
          if (effect.type === 'veneno' && effect.tickTimerMs >= 1000) {
            effect.tickTimerMs = 0;
            const dmg = Math.max(1, Math.round(effect.stacks * 3));
            enemy.hp = Math.max(0, enemy.hp - dmg);
          }

          if (effect.elapsedMs < effect.durationMs) remainingClassic.push(effect);
        }
        enemy.classicStatuses = remainingClassic;
      }

      // --- 4. Morte por DoT ---
      if (enemy.hp <= 0 && !enemy.isDead) {
        enemy.isDead = true;
        enemy.sprite.setVisible(false);
        enemy.hpBar.clear();
        this.showLog(`${enemy.name} sucumbiu às aflições!`);
        const drop = this.lootSystem.generateDrop(enemy.sprite.x, enemy.sprite.y, 'normal');
        this.createDropVisual(drop);
        this.time.delayedCall(6000, () => {
          enemy.isDead = false;
          enemy.hp = enemy.maxHp;
          enemy.greyHealth = createGreyHealthState(enemy.maxHp);
          enemy.pathStatuses = [];
          enemy.classicStatuses = [];
          enemy.antiHealActive = false;
          enemy.damageDealtMultiplier = 1;
          enemy.sprite.setVisible(true);
        });
      } else if (enemy.hp !== hpBefore) {
        hpBefore = enemy.hp;
      }
    }
  }

  /**
   * Tabela de intensidade de DoT por status de caminho (dano relativo à potência do stack)
   */
  private getPathStatusDot(status: PathSpecificStatusType): { intervalMs: number; ratio: number; color: string } | null {
    switch (status) {
      case 'chamas_negras': return { intervalMs: 500, ratio: 0.15, color: '#a855f7' };
      case 'decaimento_fissao': return { intervalMs: 1000, ratio: 0.20, color: '#22c55e' };
      case 'irradiacao_celular': return { intervalMs: 1000, ratio: 0.10, color: '#84cc16' };
      case 'corrosao_vitriolica': return { intervalMs: 1000, ratio: 0.12, color: '#facc15' };
      case 'flogisto_incandescente': return { intervalMs: 500, ratio: 0.12, color: '#f97316' };
      case 'estigma_santo': return { intervalMs: 1000, ratio: 0.06, color: '#fcd34d' };
      case 'frenesi_predatorio_alfa': return { intervalMs: 500, ratio: 0.10, color: '#dc2626' };
      case 'sinergia_quimica_hibrida': return { intervalMs: 500, ratio: 0.08, color: '#c084fc' };
      case 'bomba_de_chumbo': return { intervalMs: 1000, ratio: 0.10, color: '#eab308' };
      case 'trilha_de_cinzas': return { intervalMs: 1000, ratio: 0.08, color: '#9333ea' };
      default: return null;
    }
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

    // Caminho / Sub-caminho / Sub-habilidade ativos
    const path = PATHS_CATALOG[this.currentPathId];
    const sub = path?.subPaths.find(s => s.id === this.currentSubPathId);
    const subPathLabel = sub ? sub.name : 'sem sub-caminho';
    const skillLabel = sub ? sub.subSkill.name : '-';
    const cooldownLeft = Math.max(0, this.subSkillCooldownUntil - Date.now());

    this.hudTalentsText.setText(
      `CAMINHO: ${path.name} | SUB: ${subPathLabel}\n` +
      `[V] ${skillLabel} ${cooldownLeft > 0 ? `(${Math.ceil(cooldownLeft / 1000)}s)` : '(pronta)'} | [5] Caminho [6] Sub-caminho`
    );
  }

  /**
   * Lista de talentos liberados para o caminho atual (com requisitos e custo em Poeira)
   */
  public getAvailableTalents(): TalentCard[] {
    const stats = CHARACTERS_DATA[this.currentCharacterId].baseStats;
    return getTalentsForPath(this.currentPathId)
      .filter(t => meetsTalentRequirements(stats, t.requirements))
      .sort((a, b) => a.id - b.id);
  }
}

