import { BaseStats, StatusEffectType, WeaponItem } from '../types';

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
  takeDamage: (amount: number, isCritical: boolean, appliedEffects: StatusEffectType[]) => void;
}

export interface AttackContext {
  attacker: CombatEntity;
  targets: CombatEntity[];
  scene: any;
  isHeavy?: boolean;
}

export interface AttackResult {
  damageDealt: number;
  targetsHit: number;
  energySpent: number;
  animationTriggered: string;
  statusApplied: StatusEffectType[];
}

export type AttackFunction = (ctx: AttackContext) => AttackResult;

