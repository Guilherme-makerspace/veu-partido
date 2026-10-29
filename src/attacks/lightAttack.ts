import { AttackContext, AttackFunction, AttackResult } from './types';
import { DamageSystem } from '../systems/damage';
import { StatusEffectType } from '../types';

/**
 * Ataque Leve Independente (Módulo 1.2)
 * Rápido, baseado em frames de animação curtos, consome estamina mínima
 */
export const executeLightAttack: AttackFunction = (ctx: AttackContext): AttackResult => {
  const { attacker, targets } = ctx;
  const rangeX = 65;
  const toleranceY = 35; // Profundidade 2.5D no Eixo Y
  let targetsHit = 0;
  let totalDamage = 0;
  const appliedEffects: StatusEffectType[] = [];

  // Determina direção do ataque
  const dirMultiplier = attacker.facing === 'left' ? -1 : 1;

  for (const target of targets) {
    if (target.currentHp <= 0) continue;

    const diffX = (target.x - attacker.x) * dirMultiplier;
    const diffY = Math.abs(target.y - attacker.y);

    // Hitbox retangular simples 2.5D (Módulo 8.2)
    if (diffX > 0 && diffX <= rangeX && diffY <= toleranceY) {
      const dmgResult = DamageSystem.calculateDamage(
        attacker.stats,
        attacker.currentWeapon,
        target.stats,
        [],
        false,
        {
          activeTalentIds: attacker.activeTalents,
          isTargetStunned: target.isStunned,
          isTargetDodging: target.isDodging,
          isTargetParrying: target.isParrying,
        }
      );

      if (!dmgResult.isDodged && !dmgResult.isParried) {
        target.takeDamage(dmgResult.mitigatedDamage, dmgResult.isCritical, dmgResult.appliedEffects);
        totalDamage += dmgResult.mitigatedDamage;
        targetsHit++;
        appliedEffects.push(...dmgResult.appliedEffects);

        // Talento 9 (Eco de Impacto): Ataques básicos restauram 2 de Eco
        if (attacker.activeTalents.includes(9)) {
          attacker.currentEco = Math.min(attacker.maxEco, attacker.currentEco + 2);
        }
      }
    }
  }

  return {
    damageDealt: totalDamage,
    targetsHit,
    energySpent: 0,
    animationTriggered: 'slash',
    statusApplied: appliedEffects,
  };
};

