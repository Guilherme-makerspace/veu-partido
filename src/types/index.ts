/**
 * Tipos e Interfaces Fundamentais de O Véu Partido
 * Baseado estritamente na nomenclatura e regras de game-document.md
 */

import { DamageComponent, PathSpecificStatusType, PathStatusInstance, GreyHealthState, SpecificDamageType } from './damageTypes';

export type CharacterId = 'dit' | 'dullant' | 'dren' | 'duja';

export type StatKey = 'fratura' | 'pulso' | 'eco' | 'veu' | 'limiar';

export interface BaseStats {
  fratura: number; // FRA: Força física, dano, quebra de guarda, stagger
  pulso: number;   // PUL: Vitalidade, vida máxima, eficácia de cura, ressonância
  eco: number;     // ECO: Energia arcana, mana, redução de cooldowns
  veu: number;     // VEU: Rapidez de ataque, velocidade de dash, intangibilidade
  limiar: number;  // LIM: Resistência à entropia, duração de debuffs, mente ancorada
}

/**
 * Caminhos de Especialização dos 4 Marcados (Módulo 16)
 */
export type CharacterPathId =
  // Dit
  | 'dit_metamorfo_multiplo'
  | 'dit_metamorfo_evolutivo'
  // Dullant
  | 'dullant_duelista_eco'
  | 'dullant_duelista_fratura'
  // Dren
  | 'dren_corcovado'
  | 'dren_espelhado'
  // Duja
  | 'duja_maldito'
  | 'duja_imaculado'
  | 'duja_cetico';

/**
 * Sub-caminho: especialização interna de um Caminho (ex: Dren Corcovado -> Ossos de Tau-Tau)
 */
export interface SubPathDefinition {
  id: string;
  pathId: CharacterPathId;
  name: string;
  description: string;
  /** Status único concedido pelo sub-caminho */
  grantedStatus?: PathSpecificStatusType;
  /** Modificadores passivos aplicados ao Marcado */
  passiveModifiers?: {
    damageMultiplier?: number;
    damageTakenMultiplier?: number;
    lifestealBonus?: number;
    penetrationBonus?: number;
    critBonus?: number;
    cooldownReduction?: number;
    greyHealthResistance?: number;
    antiHealOnHit?: boolean;
  };
  /** Sub-habilidade desbloqueada por este sub-caminho */
  subSkill: SubSkillDefinition;
}

export interface SubSkillDefinition {
  id: string;
  name: string;
  pathId: CharacterPathId;
  subPathId?: string;
  description: string;
  ecoCost: number;
  cooldownMs: number;
  damageTypes: SpecificDamageType[];
  penetrationRatio: number;
  inflictedStatus?: PathSpecificStatusType;
  gameplayModifierTag?: string;
  /** Componentes de dano usados quando a sub-habilidade é resolvida diretamente */
  damageComponents?: DamageComponent[];
  /** Raio / alcance e custo mecânico da sub-habilidade */
  radius?: number;
  rangeX?: number;
  selfDamageRatio?: number;
}

export interface CharacterPathDefinition {
  id: CharacterPathId;
  characterId: CharacterId;
  name: string;
  description: string;
  coreMechanic: string;
  /** Status exclusivo do Caminho */
  signatureStatus: PathSpecificStatusType;
  subPaths: SubPathDefinition[];
  subSkills: SubSkillDefinition[];
}

export interface CharacterData {
  id: CharacterId;
  name: string;
  quadrant: string;
  culturalOrigin: string;
  baseStats: BaseStats;
  weaponRestriction: string;
  loreRole: string;
  spriteKey: string;
  sheetCols: number;
  initialWeaponId: string;
  availablePaths: CharacterPathId[];
  /** Peso elemental do Marcado (usado por talentos híbridos e sinergias) */
  elementalAffinity: SpecificDamageType[];
}

export type StatusEffectType = 
  | 'hemorragia'     // DoT continuo a cada 0.5s ignorando 50% da defesa
  | 'corrupcao'      // Inverte Eixo Y ou reduz velocidade de ataque em 30%
  | 'fragilidade'    // Aumenta em 20% todo o dano recebido
  | 'fadiga_eco'     // Impede o uso de dash e reduz profundidade no Eixo Y
  | 'rachadura'      // Redução de defesa por stack (-5% cada)
  | 'mente_ancorada' // Segura HP em 1 por 1 segundo (cooldown longo)
  | 'intangivel'     // Imunidade total após esquiva perfeita (I-frames)
  | 'queimadura'     // DoT térmico (flogisto, plasma, sílica incandescente)
  | 'veneno'         // DoT neurológico (quimeras, chumbo, destilados)
  | 'lentidao'       // Reduz velocidade de movimento e cadência
  | 'atordoamento'   // Impede ações por um curto período
  | 'silencio'       // Bloqueia habilidades de elite e sub-habilidades
  | 'congelamento'   // Reduz cadência e congela em 3 stacks
  | 'exposicao'      // Aumenta penetração de armadura contra o alvo
  | 'sangria_vital'; // Perda de vida por segundo que ignora cura

export interface ActiveStatusEffect {
  type: StatusEffectType;
  durationMs: number;
  elapsedMs: number;
  stacks: number;
  tickTimerMs: number;
  sourceValue: number;
}

export type ItemRarity = 'comum' | 'incomum' | 'raro' | 'epico' | 'lendario';

export interface RarityConfig {
  name: ItemRarity;
  multiplier: number;
  colorHex: string;
  colorNumber: number;
}

export type WeaponCategory =
  | 'espadas'
  | 'martelos'
  | 'lancas'
  | 'magicas'
  | 'construtos'
  | 'adagas'      // Adagas, foices curtas, punhais
  | 'foices'      // Foices de guerra, gadanhas
  | 'mangual'     // Mangual, estrela da manhã, corrente
  | 'chicotes'    // Chicotes e lâminas de vime
  | 'arremesso';  // Azagaias, dardos, fundas

export interface WeaponItem {
  id: string;
  name: string;
  category: WeaponCategory;
  rarity: ItemRarity;
  baseDamage: number;
  description: string;
  specialEffect?: string;
  weightCategory?: 'leve' | 'medio' | 'pesado';
  materialCost?: { material: string; amount: number };
  damageTypes?: SpecificDamageType[];
  penetrationRatio?: number;
  embeddedTalentId?: number;
  /** Componentes de dano híbridos específicos (sobrepõem damageTypes quando ausente) */
  damageComponents?: DamageComponent[];
  /** Status clássico aplicado pela arma */
  specialStatus?: StatusEffectType;
  /** Status de caminho aplicado pela arma */
  specialPathStatus?: PathSpecificStatusType;
  embeddedTalentIds?: number[];
  /** Caminhos que podem empunhar a arma (vazio = todos) */
  allowedPaths?: CharacterPathId[];
}

export type TalentTier = 'comum' | 'incomum' | 'raro' | 'epico' | 'lendario';

export interface TalentCard {
  id: number;
  name: string;
  tier: TalentTier;
  requirements: Partial<BaseStats>;
  description: string;
  implemented: boolean;
  gameplayModifierTag?: string;
  statModifiers?: Partial<Record<StatKey, number>>;
  specialHook?: string;
  /** Gatilho declarativo do talento (usado pelo EffectDispatcher) */
  trigger?: string;
  /** Condições declarativas (ex: { attackerHpBelow: 0.2, isHeavy: true }) */
  conditions?: Record<string, unknown>;
  /** Modificadores numéricos declarativos */
  modifiers?: { stat: string; operation: 'add' | 'multiply'; value: number }[];
  /** Efeitos declarativos (spawn, restauração, conversão, etc.) */
  effects?: Record<string, unknown>[];
  /** Status de caminho concedido/usado pelo talento */
  pathStatus?: PathSpecificStatusType;
  /** Caminhos que podem equipar o talento (vazio = qualquer) */
  allowedPaths?: CharacterPathId[];
  /** Custo em Poeira de Eco para desbloquear o grau máximo */
  poeiraCost?: number;
}

export interface DamageCalculationResult {
  rawDamage: number;
  mitigatedDamage: number;
  isCritical: boolean;
  isParried: boolean;
  isDodged: boolean;
  appliedEffects: StatusEffectType[];
  appliedPathStatuses?: PathSpecificStatusType[];
  greyHealthDealt?: number;
  isAntiHealApplied?: boolean;
  damageBreakdown?: { type: SpecificDamageType; amount: number; penetration: number }[];
  /** Efeitos extra declarados pelo tipo de dano (queimadura, veneno, silêncio...) */
  elementalEffects?: StatusEffectType[];
  /** Sub-caminho/passiva que alterou o cálculo (analytics e UI) */
  appliedModifiers?: string[];
}

export interface CombatEntity {
  id: string;
  name: string;
  stats: BaseStats;
  currentHp: number;
  maxHp: number;
  currentEco: number;
  maxEco: number;
  statusEffects: ActiveStatusEffect[];
  pathStatuses?: PathStatusInstance[];
  greyHealth?: GreyHealthState; // Podridão do Dren
  isInvulnerable?: boolean;
  isGodMode?: boolean;
  isImmortalSpectre?: boolean;
  antiHealActive?: boolean; // Chamas Negras da Duja
  currentPath?: CharacterPathId;
  currentSubPathId?: string;
  /** Dano causado reduzido (ex: Códice do Medo, Desespero Sônico) */
  damageDealtMultiplier?: number;
  /** Alvo silenciado: não pode usar habilidades de elite/sub-habilidades */
  isSilenced?: boolean;
  /** Modificador temporário de velocidade/cadência (1 = normal) */
  speedMultiplier?: number;
}

export interface AttackContext {
  attacker: CombatEntity;
  target?: CombatEntity;
  scene: any;
  isHeavy?: boolean;
  subSkillId?: string;
}

export interface AttackResult {
  damageDealt: number;
  targetsHit: number;
  energySpent: number;
  animationTriggered: string;
  greyHealthDealt?: number;
  statusesInflicted?: PathSpecificStatusType[];
}

export type AttackFunction = (ctx: AttackContext) => AttackResult;

export interface LootDropInstance {
  id: string;
  item: WeaponItem;
  x: number;
  y: number;
  sprite?: any;
  textPrompt?: any;
  createdAt: number;
}
