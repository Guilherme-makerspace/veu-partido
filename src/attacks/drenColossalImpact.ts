import { AttackContext, AttackFunction, AttackResult } from './types';
import { StatusEffectType } from '../types';
import { DamageSystem } from '../systems/damage';
import { EffectDispatcher } from '../systems/EffectDispatcher';

/**
 * Habilidade Única de Dren: Impacto Colossal do Leito Funerário (Módulo 16.3)
 * Golpe com hyper-armor total, esmagamento em raio no Eixo X e Y, Estiramento Visceral (lifesteal)
 * e Infecção de Necrose Ancestral (Gera Vida Cinza cumulativa no inimigo)
 */
export const executeDrenColossalImpact: AttackFunction = (ctx: AttackContext): AttackResult => {
  const { attacker, targets, scene } = ctx;
  const ecoCost = 10;

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

  const rangeX = 120;
  const toleranceY = 80; // Área ampla cobrindo quase toda a profundidade da arena
  let targetsHit = 0;
  let totalDamage = 0;
  const appliedEffects: StatusEffectType[] = ['rachadura', 'fragilidade'];

  for (const target of targets) {
    if (target.currentHp <= 0) continue;

    const diffX = Math.abs(target.x - attacker.x);
    const diffY = Math.abs(target.y - attacker.y);

    if (diffX <= rangeX && diffY <= toleranceY) {
      // Dano pesado escalado com Fratura e Pulso (+Pulso, +Fratura de Dren)
      const dmg = Math.round(attacker.currentWeapon.baseDamage * 2.2 + attacker.stats.fratura * 3.2);
      target.takeDamage(dmg, true, appliedEffects);
      totalDamage += dmg;
      targetsHit++;

      // Aplicação da Podridão de Dren (Converte parte do golpe em Vida Cinza)
      EffectDispatcher.applyPathStatus(
        target,
        'status_podre',
        dmg * 0.85,
        0.30,
        10000,
        1,
        attacker
      );
    }
  }

  // Estiramento Visceral: Roubo de vida proporcional ao dano causado (Módulo 16.3)
  if (totalDamage > 0) {
    const lifesteal = Math.max(3, Math.round(totalDamage * 0.18));
    DamageSystem.applyHeal(attacker, lifesteal);
  }

  // Efeito de tremor de terra na arena (Módulo 12.1)
  if (scene && scene.cameras && scene.cameras.main) {
    scene.cameras.main.shake(160, 0.01);
  }

  return {
    damageDealt: totalDamage,
    targetsHit,
    energySpent: ecoCost,
    animationTriggered: 'slash',
    statusApplied: appliedEffects,
  };
};
