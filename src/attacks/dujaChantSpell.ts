import { AttackContext, AttackFunction, AttackResult } from './types';
import { StatusEffectType } from '../types';
import { EffectDispatcher } from '../systems/EffectDispatcher';

/**
 * Habilidade Única de Duja: Entonação Vocal do Hain (Módulo 16.4)
 * Sem necessidade de catalisador físico; emite ondas harmônicas em anel no Eixo Y,
 * aplica Chamas Negras (anti-cura 100%) e acumula Maldição Visceral (10x Implosão de Alma)
 */
export const executeDujaChantSpell: AttackFunction = (ctx: AttackContext): AttackResult => {
  const { attacker, targets, scene } = ctx;
  const ecoCost = 16;

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

  const radius = 190; // Área acústica circular cobrindo a arena 2.5D
  let targetsHit = 0;
  let totalDamage = 0;
  const appliedEffects: StatusEffectType[] = ['corrupcao', 'hemorragia'];

  for (const target of targets) {
    if (target.currentHp <= 0) continue;

    const dist = Math.hypot(target.x - attacker.x, (target.y - attacker.y) * 1.5);

    if (dist <= radius) {
      // Dano mágico escala com Eco e Limiar (+Eco, +Limiar de Duja)
      const dmg = Math.round(attacker.currentWeapon.baseDamage * 1.8 + attacker.stats.eco * 3.6);
      target.takeDamage(dmg, true, appliedEffects);
      totalDamage += dmg;
      targetsHit++;

      // 1. Aplicação de Chamas Negras (Bloqueia 100% de cura por 6 segundos)
      EffectDispatcher.applyPathStatus(
        target,
        'chamas_negras',
        Math.round(dmg * 0.4),
        0.70,
        6000,
        3,
        attacker
      );

      // 2. Acúmulo de Maldição Visceral (Stacka até 10x; no 10º causa Implosão de Alma)
      const curseResult = EffectDispatcher.applyPathStatus(
        target,
        'maldicao_visceral',
        dmg,
        0.80,
        8000,
        10,
        attacker
      );

      if (curseResult.exploded) {
        target.takeDamage(curseResult.damageDealt, true, ['fragilidade']);
        if (scene && scene.cameras && scene.cameras.main) {
          scene.cameras.main.flash(200, 120, 0, 180);
        }
      }
    }
  }

  return {
    damageDealt: totalDamage,
    targetsHit,
    energySpent: ecoCost,
    animationTriggered: 'spellcast',
    statusApplied: appliedEffects,
  };
};
