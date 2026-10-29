import { AttackContext, AttackFunction, AttackResult } from './types';
import { StatusEffectType } from '../types';
import { EffectDispatcher } from '../systems/EffectDispatcher';

/**
 * Habilidade Única de Dit: Projeção Quimérica do Receptáculo Ósseo (Módulo 16.1)
 * Perfura em linha no Eixo X, mimetiza a fúria da carcaça assimilada do Alasca
 * e aplica Dilaceração Predatória Quimérica
 */
export const executeDitMorphedAttack: AttackFunction = (ctx: AttackContext): AttackResult => {
  const { attacker, targets, scene } = ctx;
  const ecoCost = 14;

  if (attacker.currentEco < ecoCost) {
    return {
      damageDealt: 0,
      targetsHit: 0,
      energySpent: 0,
      animationTriggered: 'idle',
      statusApplied: [],
    };
  }

  attacker.currentEco -= ecoCost;

  const rangeX = 150; // Projeção de espinhos ósseos e garras carniceiras
  const toleranceY = 45;
  let targetsHit = 0;
  let totalDamage = 0;
  const dirMultiplier = attacker.facing === 'left' ? -1 : 1;
  const appliedEffects: StatusEffectType[] = ['rachadura', 'hemorragia'];

  for (const target of targets) {
    if (target.currentHp <= 0) continue;

    const diffX = (target.x - attacker.x) * dirMultiplier;
    const diffY = Math.abs(target.y - attacker.y);

    if (diffX > 0 && diffX <= rangeX && diffY <= toleranceY) {
      // Dano escala fortemente com Eco, Fratura e Pulso (+Eco, +Pulso de Dit)
      const dmg = Math.round(attacker.currentWeapon.baseDamage * 1.7 + attacker.stats.eco * 2.2 + attacker.stats.pulso * 1.8);
      target.takeDamage(dmg, true, appliedEffects);
      totalDamage += dmg;
      targetsHit++;

      // Aplica Memória Muscular Furtada / Dilaceração
      EffectDispatcher.applyPathStatus(
        target,
        'memoria_muscular_furtada',
        Math.round(dmg * 0.25),
        0.40,
        6000,
        5,
        attacker
      );
    }
  }

  if (scene && scene.cameras && scene.cameras.main && targetsHit > 0) {
    scene.cameras.main.shake(90, 0.006);
  }

  return {
    damageDealt: totalDamage,
    targetsHit,
    energySpent: ecoCost,
    animationTriggered: 'thrust',
    statusApplied: appliedEffects,
  };
};
