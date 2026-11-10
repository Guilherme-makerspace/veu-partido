import { AttackContext, AttackFunction, AttackResult } from './types';
import { DamageSystem } from '../systems/damage';
import { EffectDispatcher } from '../systems/EffectDispatcher';
import { StatusEffectType } from '../types';
import { PathSpecificStatusType } from '../types/damageTypes';

/**
 * Ataque Pesado Independente (Módulo 1.2 e 12.1)
 * Possui hitstop (congelamento de 3 a 5 frames), quebra de postura e aplica Rachadura
 */
export const executeHeavyAttack: AttackFunction = (ctx: AttackContext): AttackResult => {
  const { attacker, targets, scene } = ctx;
  const rangeX = 85;
  const toleranceY = 45; // Cobertura mais ampla no Eixo Y
  let targetsHit = 0;
  let totalDamage = 0;
  let greyHealthDealt = 0;
  const appliedEffects: StatusEffectType[] = ['rachadura'];
  const appliedPathStatuses: PathSpecificStatusType[] = [];

  const dirMultiplier = attacker.facing === 'left' ? -1 : 1;

  for (const target of targets) {
    if (target.currentHp <= 0) continue;

    const diffX = (target.x - attacker.x) * dirMultiplier;
    const diffY = Math.abs(target.y - attacker.y);

    if (diffX > 0 && diffX <= rangeX && diffY <= toleranceY) {
      const dmgResult = DamageSystem.calculateDamage(
        attacker,
        attacker.currentWeapon,
        target,
        true, // isHeavy
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
        greyHealthDealt += dmgResult.greyHealthDealt ?? 0;
        targetsHit++;

        for (const ps of dmgResult.appliedPathStatuses ?? []) {
          if (!appliedPathStatuses.includes(ps)) appliedPathStatuses.push(ps);
          EffectDispatcher.applyPathStatus(target, ps, dmgResult.mitigatedDamage * 0.8, 0.30, 8000, 10, attacker);
        }

        // Hitstop (Módulo 12.1: pausa de 3 a 5 frames para peso e impacto físico)
        if (scene && scene.physics) {
          scene.physics.world.pause();
          scene.time.delayedCall(70, () => {
            scene.physics.world.resume();
          });
        }
      }
    }
  }

  // Talento 1 (Impacto Ressonante - FRA 3): Onda frontal em ataques pesados (120px, 30% dano)
  if (attacker.activeTalents.includes(1)) {
    for (const target of targets) {
      if (target.currentHp <= 0) continue;
      const diffX = (target.x - attacker.x) * dirMultiplier;
      const diffY = Math.abs(target.y - attacker.y);
      if (diffX > rangeX && diffX <= 120 && diffY <= 30) {
        const waveDamage = Math.max(1, Math.round(attacker.currentWeapon.baseDamage * 0.30));
        target.takeDamage(waveDamage, false, []);
        totalDamage += waveDamage;
        targetsHit++;
      }
    }
  }

  return {
    damageDealt: totalDamage,
    targetsHit,
    energySpent: 5,
    animationTriggered: 'slash',
    statusApplied: appliedEffects,
    pathStatusesApplied: appliedPathStatuses,
    greyHealthDealt,
  };
};

