/**
 * Tipos e Interfaces Fundamentais de O Véu Partido
 * Baseado estritamente na nomenclatura e regras de game-document.md
 */

import { PathSpecificStatusType, PathStatusInstance, GreyHealthState, SpecificDamageType } from './damageTypes';

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

export interface SubSkillDefinition {
  id: string;
  name: string;
  pathId: CharacterPathId;
  description: string;
  ecoCost: number;
  cooldownMs: number;
  damageTypes: SpecificDamageType[];
  penetrationRatio: number;
  inflictedStatus?: PathSpecificStatusType;
  gameplayModifierTag?: string;
}

export interface CharacterPathDefinition {
  id: CharacterPathId;
  characterId: CharacterId;
  name: string;
  description: string;
  coreMechanic: string;
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
}

export type StatusEffectType = 
  | 'hemorragia'   // DoT continuo a cada 0.5s ignorando 50% da defesa
  | 'corrupcao'    // Inverte Eixo Y ou reduz velocidade de ataque em 30%
  | 'fragilidade'   // Aumenta em 20% todo o dano recebido
  | 'fadiga_eco'   // Impede o uso de dash e reduz profundidade no Eixo Y
  | 'rachadura'    // Redução de defesa por stack (-5% cada)
  | 'mente_ancorada' // Segura HP em 1 por 1 segundo (cooldown longo)
  | 'intangivel';  // Imunidade total após esquiva perfeita (I-frames)

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

export type WeaponCategory = 'espadas' | 'martelos' | 'lancas' | 'magicas' | 'construtos';

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
