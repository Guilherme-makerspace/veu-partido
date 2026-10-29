import { ActiveStatusEffect, BaseStats, DamageCalculationResult, StatusEffectType, WeaponItem, CombatEntity } from '../types';
import { RARITY_CONFIGS } from '../data/weapons';
import { DamageComponent, PathSpecificStatusType, SpecificDamageType, GreyHealthState, PathStatusInstance } from '../types/damageTypes';

export interface AdvancedDamageResult extends DamageCalculationResult {
  damageBreakdown?: { type: SpecificDamageType; amount: number; penetration: number }[];
  appliedPathStatuses?: PathSpecificStatusType[];
  greyHealthDealt?: number;
  isAntiHealApplied?: boolean;
}

/**
 * Calculador de Dano, Mitigação, Necrose de Dren (Vida Cinza) e Aflições de O Véu Partido
 */
export class DamageSystem {
  /**
   * Cálculo completo de ataque com suporte a tipos compostos e perfuração variável (30%-90%)
   */
  public static calculateDamage(
    attacker: CombatEntity,
    weapon: WeaponItem,
    target: CombatEntity,
    isHeavy: boolean = false,
    options: {
      isTargetStunned?: boolean;
      allyFullHp?: boolean;
      attackerHpPercent?: number;
      isTargetParrying?: boolean;
      isTargetDodging?: boolean;
      activeTalentIds?: number[];
      customDamageComponents?: DamageComponent[];
    } = {}
  ): AdvancedDamageResult {
    const attackerStats = attacker.stats;
    const targetStats = target.stats;
    const targetStatusEffects = target.statusEffects;

    // 1. Verificação de I-frames / Esquiva
    if (options.isTargetDodging || target.isInvulnerable) {
      return {
        rawDamage: 0,
        mitigatedDamage: 0,
        isCritical: false,
        isParried: false,
        isDodged: true,
        appliedEffects: [],
        appliedPathStatuses: [],
        greyHealthDealt: 0,
      };
    }

    // 2. Verificação de Bloqueio / Parry (Escudo de Véu)
    if (options.isTargetParrying) {
      return {
        rawDamage: 0,
        mitigatedDamage: 0,
        isCritical: false,
        isParried: true,
        isDodged: false,
        appliedEffects: [],
        appliedPathStatuses: [],
        greyHealthDealt: 0,
      };
    }

    // 3. Multiplicador de Raridade da Arma
    const rarityConfig = RARITY_CONFIGS[weapon.rarity] || RARITY_CONFIGS.comum;
    const rarityMultiplier = rarityConfig.multiplier;

    // 4. Componentes de Dano (Suporte a múltiplos tipos de dano simultâneos)
    const components: DamageComponent[] = options.customDamageComponents || [
      {
        type: weapon.category === 'magicas' 
          ? 'maldicao_status' 
          : (weapon.weightCategory === 'pesado' ? 'physical_cleave' : 'physical_slash'),
        baseAmount: weapon.baseDamage,
        penetrationRatio: weapon.category === 'magicas' ? 0.65 : 0.20,
        scalingStat: weapon.category === 'magicas' ? 'eco' : 'fratura',
      },
    ];

    const activeTalents = options.activeTalentIds || [];

    // Modificadores globais
    let globalScaling = 1.0;
    if (!isHeavy && options.isTargetStunned && activeTalents.includes(14)) {
      globalScaling += 0.05; // Talento 14 (Fratura Exposta)
    }
    if (options.allyFullHp && activeTalents.includes(18)) {
      globalScaling += 0.05; // Talento 18 (Harmonia)
    }
    if (activeTalents.includes(36) && options.attackerHpPercent !== undefined) {
      const lostHp = Math.max(0, 1 - options.attackerHpPercent);
      globalScaling += lostHp * 0.20; // Talento 36 (Fúria do Marcado)
    }
    if (activeTalents.includes(50) && options.attackerHpPercent !== undefined && options.attackerHpPercent < 0.20) {
      globalScaling += 1.0; // Talento 50 (Vínculo Terminal)
    }

    // Debuff da Podridão de Dren no ATACANTE (se o atacante for um inimigo infectado com podre)
    if (attacker.greyHealth && attacker.greyHealth.rotDebuffRatio > 0) {
      globalScaling *= (1 - attacker.greyHealth.rotDebuffRatio); // Reduz ataque em até 30%
    }

    // Bônus de Vulnerabilidade da Podridão de Dren no ALVO (se o alvo tiver Vida Cinza acumulada)
    let rotVulnerability = 1.0;
    if (target.greyHealth && target.greyHealth.rotVulnerabilityRatio > 0) {
      rotVulnerability += target.greyHealth.rotVulnerabilityRatio; // Sofre até +30% de dano
    }

    // Chance Crítica por Véu
    const critChance = Math.min(0.50, attackerStats.veu * 0.02 + 0.05);
    const isCritical = Math.random() < critChance;
    if (isCritical) {
      globalScaling *= 1.5;
    }

    // Redução cumulativa de Rachadura (-5% de defesa por stack)
    const rachadura = targetStatusEffects.find(s => s.type === 'rachadura');
    const rachaduraReduction = rachadura ? Math.min(0.70, rachadura.stacks * 0.05) : 0;

    let totalRawDamage = 0;
    let totalMitigatedDamage = 0;
    const appliedEffects: StatusEffectType[] = [];
    const appliedPathStatuses: PathSpecificStatusType[] = [];
    const breakdown: { type: SpecificDamageType; amount: number; penetration: number }[] = [];
    let greyHealthGenerated = 0;
    let antiHealTriggered = false;

    // 5. Itera sobre cada componente de dano composto
    for (const comp of components) {
      const statKey = comp.scalingStat || (comp.type === 'maldicao_status' || comp.type === 'eco_acoustic' ? 'eco' : 'fratura');
      const statVal = attackerStats[statKey] || 0;
      const compScaling = 1 + statVal * 0.05;

      const compRaw = Math.round(comp.baseAmount * rarityMultiplier * compScaling * globalScaling * rotVulnerability);
      totalRawDamage += compRaw;

      // Cálculo de penetração específica:
      // - Balas de Dullant (ballistic_pierce): 30% a 80%
      // - Maldições de Duja (maldicao_status): 50% a 90%
      let effectivePenetration = comp.penetrationRatio;
      if (isHeavy && activeTalents.includes(45)) {
        effectivePenetration = Math.min(0.95, effectivePenetration + 0.30); // Talento 45
      }
      if (activeTalents.includes(51) && (comp.type === 'maldicao_status' || comp.type === 'eco_acoustic')) {
        effectivePenetration = Math.min(0.95, effectivePenetration + 0.50); // Talento 51
      }

      // Defesa efetiva contra este componente
      const baseDefense = targetStats.pulso * 1.5 + targetStats.limiar * 1.0;
      const compDefense = Math.max(0, baseDefense * (1 - effectivePenetration) * (1 - rachaduraReduction));
      const compMitigationRatio = compDefense / (compDefense + 50);

      let compMitigated = Math.max(1, Math.round(compRaw * (1 - compMitigationRatio)));

      // Efeito de fragilidade (+20% dano)
      if (targetStatusEffects.some(s => s.type === 'fragilidade')) {
        compMitigated = Math.round(compMitigated * 1.20);
      }

      totalMitigatedDamage += compMitigated;
      breakdown.push({
        type: comp.type,
        amount: compMitigated,
        penetration: Math.round(effectivePenetration * 100),
      });

      // Aplicação de status conforme tipo de componente
      if (comp.type === 'physical_slash' && isCritical) {
        appliedEffects.push('hemorragia');
      }
      if (comp.type === 'physical_blunt' && isHeavy) {
        appliedEffects.push('rachadura');
      }
      if (comp.type === 'physical_cleave') {
        // Dano de Fendimento Pesado: combina corte e esmagamento
        appliedEffects.push('rachadura');
        if (isCritical) appliedEffects.push('hemorragia');
      }
      if (comp.type === 'radiacao_dot') {
        appliedEffects.push('hemorragia');
      }

      // Status exclusivos de caminho:
      // Chamas Negras (Duja) - impede 100% de cura
      if (comp.type === 'black_flame') {
        appliedPathStatuses.push('chamas_negras');
        antiHealTriggered = true;
      }

      // Podridão de Dren (gera Vida Cinza cumulativa)
      if (comp.type === 'rot_necrosis' || (attacker.id === 'dren' && (isHeavy || comp.type === 'physical_cleave'))) {
        appliedPathStatuses.push('status_podre');
        greyHealthGenerated += Math.round(compMitigated * 0.75); // 75% do dano é convertido em acúmulo de podridão
      }
    }

    if (isHeavy) {
      appliedEffects.push('rachadura');
    }

    return {
      rawDamage: totalRawDamage,
      mitigatedDamage: totalMitigatedDamage,
      isCritical,
      isParried: false,
      isDodged: false,
      appliedEffects,
      appliedPathStatuses,
      damageBreakdown: breakdown,
      greyHealthDealt: greyHealthGenerated,
      isAntiHealApplied: antiHealTriggered,
    };
  }

  /**
   * Aplicação e Atualização da Podridão de Dren (Vida Cinza)
   * - Redução de dano do inimigo: até 30%
   * - Aumento de dano recebido pelo inimigo: até 30%
   * - Falência Necrótica quando 100% da vida restante é cinza (Inicia DoT de colapso)
   */
  public static applyRotToTarget(target: CombatEntity, greyAmount: number): GreyHealthState {
    if (!target.greyHealth) {
      target.greyHealth = {
        currentGreyHp: 0,
        maxHp: target.maxHp,
        rotDebuffRatio: 0,
        rotVulnerabilityRatio: 0,
        isFullyRotten: false,
        decayDotTimerMs: 0,
      };
    }

    const state = target.greyHealth;
    state.currentGreyHp = Math.min(target.currentHp, state.currentGreyHp + greyAmount);

    // Razão de infecção (0.00 a 1.00)
    const infectionRatio = Math.min(1.0, state.currentGreyHp / Math.max(1, target.maxHp));

    // Escala linear até o teto fixo de 30% (0.30)
    state.rotDebuffRatio = Math.min(0.30, infectionRatio * 0.30);
    state.rotVulnerabilityRatio = Math.min(0.30, infectionRatio * 0.30);

    // Se toda a vida restante virou vida cinza, a aberração entra em falência necrótica
    if (state.currentGreyHp >= target.currentHp && target.currentHp > 0) {
      state.isFullyRotten = true;
    } else {
      state.isFullyRotten = false;
    }

    return state;
  }

  /**
   * Executa a cura respeitando o bloqueio de Chamas Negras (Anti-Cura)
   */
  public static applyHeal(target: CombatEntity, healAmount: number): number {
    if (target.antiHealActive) {
      return 0; // Chamas Negras anulam 100% da cura
    }
    const actualHeal = Math.min(target.maxHp - target.currentHp, Math.round(healAmount));
    target.currentHp += actualHeal;

    // Se o alvo for curado, diminui a proporção de vida cinza
    if (target.greyHealth) {
      target.greyHealth.currentGreyHp = Math.max(0, target.greyHealth.currentGreyHp - actualHeal * 0.5);
    }
    return actualHeal;
  }

  /**
   * Processador de ticks de status negativos e DoT contínuo
   */
  public static updateStatusEffects(
    effects: ActiveStatusEffect[],
    deltaMs: number,
    onDotDamage: (damage: number, type: StatusEffectType) => void
  ): ActiveStatusEffect[] {
    const updated: ActiveStatusEffect[] = [];

    for (const effect of effects) {
      effect.elapsedMs += deltaMs;
      effect.tickTimerMs += deltaMs;

      if (effect.type === 'hemorragia' && effect.tickTimerMs >= 500) {
        effect.tickTimerMs = 0;
        const bleedDmg = Math.max(2, Math.round(effect.sourceValue * 0.10 * effect.stacks));
        onDotDamage(bleedDmg, 'hemorragia');
      }

      if (effect.elapsedMs < effect.durationMs) {
        updated.push(effect);
      }
    }

    return updated;
  }

  /**
   * Atualização contínua dos Status de Caminho (DoT de Podre 100%, DoT de Chamas Negras, etc.)
   */
  public static updatePathStatuses(
    entity: CombatEntity,
    deltaMs: number,
    onDotDamage: (damage: number, statusType: PathSpecificStatusType) => void,
    onSoulImplosion?: (x: number, y: number, damage: number) => void
  ): void {
    // 1. Processamento da Vida Cinza 100% (Podridão do Dren)
    if (entity.greyHealth && entity.greyHealth.isFullyRotten && entity.currentHp > 0) {
      entity.greyHealth.decayDotTimerMs += deltaMs;
      if (entity.greyHealth.decayDotTimerMs >= 1000) {
        entity.greyHealth.decayDotTimerMs = 0;
        // DoT severo de necrose: 6% da vida máxima por segundo ignorando blindagem
        const necrosisDmg = Math.max(5, Math.round(entity.maxHp * 0.06));
        entity.currentHp = Math.max(0, entity.currentHp - necrosisDmg);
        entity.greyHealth.currentGreyHp = Math.min(entity.currentHp, entity.greyHealth.currentGreyHp);
        onDotDamage(necrosisDmg, 'status_podre');
      }
    }

    // 2. Processamento dos PathStatusInstances
    if (!entity.pathStatuses) return;

    const remaining: PathStatusInstance[] = [];
    for (const instance of entity.pathStatuses) {
      instance.elapsedMs += deltaMs;
      instance.tickTimerMs += deltaMs;

      // DoT de Chamas Negras
      if (instance.type === 'chamas_negras' && instance.tickTimerMs >= 500) {
        instance.tickTimerMs = 0;
        const fireDmg = Math.max(3, Math.round(instance.potency * 0.15 * instance.stacks));
        entity.currentHp = Math.max(0, entity.currentHp - fireDmg);
        onDotDamage(fireDmg, 'chamas_negras');
      }

      // DoT de Decaimento de Fissão
      if (instance.type === 'decaimento_fissao' && instance.tickTimerMs >= 1000) {
        instance.tickTimerMs = 0;
        const fissionDmg = Math.max(4, Math.round(instance.potency * 0.20 * instance.stacks));
        entity.currentHp = Math.max(0, entity.currentHp - fissionDmg);
        onDotDamage(fissionDmg, 'decaimento_fissao');
      }

      if (instance.elapsedMs < instance.durationMs) {
        remaining.push(instance);
      } else {
        // Ao expirar chamas negras, desativa anti-cura se não houver outra instância
        if (instance.type === 'chamas_negras') {
          entity.antiHealActive = false;
        }
      }
    }

    entity.pathStatuses = remaining;
  }
}
