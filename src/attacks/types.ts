import { BaseStats, StatusEffectType, WeaponItem, CharacterPathId } from '../types';
import { GreyHealthState, PathStatusInstance, PathSpecificStatusType } from '../types/damageTypes';

export interface CombatEntity {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  facing: 'left' | 'right' | 'up' | 'down';
  stats: BaseStats;
  currentHp: number;
  maxHp: number;
  currentEco: number;
  maxEco: number;
  currentWeapon: WeaponItem;
  activeTalents: number[];
  isDodging: boolean;
  isParrying: boolean;
  isStunned: boolean;
  statusEffects: any[];
  pathStatuses?: PathStatusInstance[];
  greyHealth?: GreyHealthState;
  antiHealActive?: boolean;
  isInvulnerable?: boolean;
  currentPath?: CharacterPathId;
  currentSubPathId?: string;
  damageDealtMultiplier?: number;
  isSilenced?: boolean;
  speedMultiplier?: number;
  takeDamage: (amount: number, isCritical: boolean, appliedEffects: StatusEffectType[]) => void;
}

export interface AttackContext {
  attacker: CombatEntity;
  targets: CombatEntity[];
  scene: any;
  isHeavy?: boolean;
  /** Sub-habilidade ativa (quando o ataque é disparado por um sub-caminho) */
  subSkillId?: string;
}

export interface AttackResult {
  damageDealt: number;
  targetsHit: number;
  energySpent: number;
  animationTriggered: string;
  statusApplied: StatusEffectType[];
  /** Status de caminho aplicados pelo golpe (Podridão, Chamas Negras, etc.) */
  pathStatusesApplied?: PathSpecificStatusType[];
  /** Vida Cinza gerada (exclusivo Dren) */
  greyHealthDealt?: number;
}

export type AttackFunction = (ctx: AttackContext) => AttackResult;

