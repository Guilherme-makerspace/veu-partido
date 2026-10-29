import { AttackContext, AttackFunction, AttackResult } from './types';
import { StatusEffectType } from '../types';
import { EffectDispatcher } from '../systems/EffectDispatcher';

/**
 * Habilidade Única de Dullant: Disparo de Construto Mineral / Canhão de Fissão (Módulo 16.2)
 * Projeta um feixe balístico linear de alta perfuração cinética (30% a 80%) que cruza o Eixo X
 * e aplica Decaimento de Fissão atômica corrosiva
 */
export const executeDullantConstructAttack: AttackFunction = (ctx: AttackContext): AttackResult => {
  const { attacker, targets, scene } = ctx;
  const ecoCost = 12;

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

  const rangeX = 380; // Longo alcance cirúrgico (Sniper de Quartzo / Canhão de Urânio)
  const toleranceY = 30; // Linha de precisão balística
  let targetsHit = 0;
  let totalDamage = 0;
  const dirMultiplier = attacker.facing === 'left' ? -1 : 1;
  const appliedEffects: StatusEffectType[] = ['fragilidade'];

  for (const target of targets) {
    if (target.currentHp <= 0) continue;

    const diffX = (target.x - attacker.x) * dirMultiplier;
    const diffY = Math.abs(target.y - attacker.y);

    if (diffX > 0 && diffX <= rangeX && diffY <= toleranceY) {
      // Dano balístico perfurante escala com Fratura e Eco (+Fratura, +Eco de Dullant)
      // Perfuração cinética base de 65% (Dullant balístico)
      const dmg = Math.round(attacker.currentWeapon.baseDamage * 1.9 + attacker.stats.fratura * 2.8 + attacker.stats.eco * 1.5);
      target.takeDamage(dmg, true, appliedEffects);
      totalDamage += dmg;
      targetsHit++;

      // Aplica Decaimento por Fissão atômica (DoT corrosivo e degradação de blindagem)
      EffectDispatcher.applyPathStatus(
        target,
        'decaimento_fissao',
        Math.round(dmg * 0.35),
        0.65,
        5000,
        5,
        attacker
      );
    }
  }

  if (scene && scene.cameras && scene.cameras.main && targetsHit > 0) {
    scene.cameras.main.shake(80, 0.005);
  }

  return {
    damageDealt: totalDamage,
    targetsHit,
    energySpent: ecoCost,
    animationTriggered: 'shoot',
    statusApplied: appliedEffects,
  };
};
