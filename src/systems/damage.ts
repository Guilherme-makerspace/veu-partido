import { ActiveStatusEffect, BaseStats, DamageCalculationResult, StatusEffectType, WeaponItem, CombatEntity } from '../types';
import { RARITY_CONFIGS } from '../data/weapons';
import { getDamageProfile, WEAPON_CATEGORY_DAMAGE_MAP } from '../data/damageProfiles';
import {
  DamageComponent,
  GREY_HEALTH_RULES,
  GreyHealthState,
  PathSpecificStatusType,
  PathStatusInstance,
  SpecificDamageType,
} from '../types/damageTypes';

export interface AdvancedDamageResult extends DamageCalculationResult {
  damageBreakdown?: { type: SpecificDamageType; amount: number; penetration: number }[];
  appliedPathStatuses?: PathSpecificStatusType[];
  greyHealthDealt?: number;
  isAntiHealApplied?: boolean;
}

/**
 * Estrutura de estado extra de combate (vida cinza e status de caminho).
 * A cena mantém este objeto por inimigo para que os status persistam entre golpes.
 */
export interface CombatRuntimeState {
  greyHealth?: GreyHealthState;
  pathStatuses: PathStatusInstance[];
  classicStatuses: ActiveStatusEffect[];
  antiHealActive: boolean;
}

export function createRuntimeState(maxHp: number): CombatRuntimeState {
  return {
    greyHealth: createGreyHealthState(maxHp),
    pathStatuses: [],
    classicStatuses: [],
    antiHealActive: false,
  };
}

export function createGreyHealthState(maxHp: number): GreyHealthState {
  return {
    currentGreyHp: 0,
    maxHp,
    rotDebuffRatio: 0,
    rotVulnerabilityRatio: 0,
    isFullyRotten: false,
    decayDotTimerMs: 0,
  };
}

/**
 * Calculador de Dano, Mitigação, Necrose de Dren (Vida Cinza) e Aflições de O Véu Partido
 */
export class DamageSystem {
  /**
   * Resolve os componentes de dano de uma arma, considerando:
   * - componente híbrido declarado na arma (damageComponents)
   * - lista de tipos específicos (damageTypes)
   * - mapa de afinidade de categoria
   * - fallback por peso/categoria
   */
  public static resolveWeaponComponents(weapon: WeaponItem, isHeavy: boolean): DamageComponent[] {
    if (weapon.damageComponents && weapon.damageComponents.length > 0) {
      return weapon.damageComponents;
    }

    if (weapon.damageTypes && weapon.damageTypes.length > 0) {
      const share = weapon.baseDamage / weapon.damageTypes.length;
      return weapon.damageTypes.map(t => ({
        type: t,
        baseAmount: Math.max(1, Math.round(share)),
        penetrationRatio: weapon.penetrationRatio ?? getDamageProfile(t).basePenetration,
      }));
    }

    const categoryTypes = WEAPON_CATEGORY_DAMAGE_MAP[weapon.category];
    if (categoryTypes && categoryTypes.length > 0) {
      const share = weapon.baseDamage / categoryTypes.length;
      return categoryTypes.map((t, i) => ({
        type: t,
        baseAmount: Math.max(1, Math.round(share * (i === 0 ? 1 : 0.5))),
        penetrationRatio: weapon.penetrationRatio ?? getDamageProfile(t).basePenetration,
        scalingStat: getDamageProfile(t).category === 'fisico' ? 'fratura' : 'eco',
      }));
    }

    const fallbackType: SpecificDamageType = isHeavy ? 'physical_cleave' : 'physical_slash';
    return [
      {
        type: fallbackType,
        baseAmount: weapon.baseDamage,
        penetrationRatio: weapon.penetrationRatio ?? getDamageProfile(fallbackType).basePenetration,
      },
    ];
  }

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
      /** Bônus de penetração vindo de sub-caminho/talento */
      bonusPenetration?: number;
      /** Multiplicador de dano vindo de sub-caminho/talento */
      damageMultiplierBonus?: number;
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
    const components: DamageComponent[] = options.customDamageComponents
      || DamageSystem.resolveWeaponComponents(weapon, isHeavy);

    const activeTalents = options.activeTalentIds || [];
    const appliedModifiers: string[] = [];

    // Modificadores globais
    let globalScaling = 1.0;
    if (!isHeavy && options.isTargetStunned && activeTalents.includes(14)) {
      globalScaling += 0.05; // Talento 14 (Fratura Exposta)
      appliedModifiers.push('talento_14');
    }
    if (options.allyFullHp && activeTalents.includes(18)) {
      globalScaling += 0.05; // Talento 18 (Harmonia)
      appliedModifiers.push('talento_18');
    }
    if (activeTalents.includes(36) && options.attackerHpPercent !== undefined) {
      const lostHp = Math.max(0, 1 - options.attackerHpPercent);
      globalScaling += lostHp * 0.20; // Talento 36 (Fúria do Marcado)
      appliedModifiers.push('talento_36');
    }
    if (activeTalents.includes(50) && options.attackerHpPercent !== undefined && options.attackerHpPercent < 0.20) {
      globalScaling += 1.0; // Talento 50 (Vínculo Terminal)
      appliedModifiers.push('talento_50');
    }
    if (options.damageMultiplierBonus) {
      globalScaling += options.damageMultiplierBonus;
      appliedModifiers.push('bonus_subcaminho');
    }

    // Debuff da Podridão de Dren no ATACANTE (se o atacante for um inimigo infectado com podre)
    if (attacker.greyHealth && attacker.greyHealth.rotDebuffRatio > 0) {
      globalScaling *= (1 - attacker.greyHealth.rotDebuffRatio); // Reduz ataque em até 30%
      appliedModifiers.push('podridao_atacante');
    }

    // Multiplicador direto de dano do atacante (Códice do Medo, Desespero Sônico...)
    if (attacker.damageDealtMultiplier !== undefined && attacker.damageDealtMultiplier !== 1) {
      globalScaling *= attacker.damageDealtMultiplier;
      appliedModifiers.push('debuff_dano_atacante');
    }

    // Bônus de Vulnerabilidade da Podridão de Dren no ALVO (se o alvo tiver Vida Cinza acumulada)
    let rotVulnerability = 1.0;
    if (target.greyHealth && target.greyHealth.rotVulnerabilityRatio > 0) {
      rotVulnerability += target.greyHealth.rotVulnerabilityRatio; // Sofre até +30% de dano
      appliedModifiers.push('vulnerabilidade_podre');
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

    // Corrosão Vitriólica / Estilhaço de Granito: exposição aumenta penetração
    const exposureStacks = targetStatusEffects.find(s => s.type === 'exposicao')?.stacks ?? 0;
    const penetrationBonusFromStatus = Math.min(0.40, exposureStacks * 0.08);

    let totalRawDamage = 0;
    let totalMitigatedDamage = 0;
    const appliedEffects: StatusEffectType[] = [];
    const appliedPathStatuses: PathSpecificStatusType[] = [];
    const breakdown: { type: SpecificDamageType; amount: number; penetration: number }[] = [];
    let greyHealthGenerated = 0;
    let antiHealTriggered = false;
    let lastCriticalHit = isCritical;

    // 5. Itera sobre cada componente de dano composto
    for (const comp of components) {
      const profile = getDamageProfile(comp.type);
      const statKey = comp.scalingStat
        || (profile.category === 'fisico' ? 'fratura' : 'eco');
      const statVal = attackerStats[statKey] || 0;
      const compScaling = 1 + statVal * 0.05;

      const compRaw = Math.round(comp.baseAmount * rarityMultiplier * compScaling * globalScaling * rotVulnerability);
      totalRawDamage += compRaw;

      // Cálculo de penetração específica do tipo de dano
      let effectivePenetration = comp.penetrationRatio || profile.basePenetration;
      if (isHeavy && activeTalents.includes(45)) {
        effectivePenetration = Math.min(0.95, effectivePenetration + 0.30); // Talento 45
      }
      if (activeTalents.includes(51) && (profile.category === 'magico' || profile.category === 'entropico' || profile.category === 'verdadeiro')) {
        effectivePenetration = Math.min(0.95, effectivePenetration + 0.50); // Talento 51
      }
      if (options.bonusPenetration) {
        effectivePenetration = Math.min(0.95, effectivePenetration + options.bonusPenetration);
      }
      effectivePenetration = Math.min(0.95, effectivePenetration + penetrationBonusFromStatus);

      // Defesa efetiva contra este componente
      const baseDefense = targetStats.pulso * 1.5 + targetStats.limiar * 1.0;
      const compDefense = Math.max(0, baseDefense * (1 - effectivePenetration) * (1 - rachaduraReduction));
      const compMitigationRatio = compDefense / (compDefense + 50);

      let compMitigated = Math.max(1, Math.round(compRaw * (1 - compMitigationRatio)));

      // Modificador de armadura do tipo de dano (esmagamento penaliza couraça, perfuração não)
      if (profile.armorMultiplier) {
        compMitigated = Math.round(compMitigated * profile.armorMultiplier);
      }

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

      // Aplicação dos status clássicos e de caminho declarados no perfil do tipo de dano
      if (profile.classicStatuses) {
        for (const st of profile.classicStatuses as StatusEffectType[]) {
          // Alguns status clássicos só disparam sob condição (sangramento crítico, atordoamento em golpes pesados)
          if (st === 'hemorragia' && !isCritical && comp.type === 'physical_slash') continue;
          if (st === 'rachadura' && !isHeavy && comp.type === 'physical_blunt') continue;
          if (!appliedEffects.includes(st)) appliedEffects.push(st);
        }
      }

      if (profile.pathStatuses) {
        for (const ps of profile.pathStatuses) {
          if (!appliedPathStatuses.includes(ps)) appliedPathStatuses.push(ps);
        }
      }

      if (profile.antiHeal) {
        antiHealTriggered = true;
        if (!appliedPathStatuses.includes('chamas_negras')) appliedPathStatuses.push('chamas_negras');
      }

      // Chamas Negras (Duja) - impede 100% de cura
      if (comp.type === 'black_flame') {
        appliedPathStatuses.push('chamas_negras');
        antiHealTriggered = true;
      }

      // Podridão de Dren (gera Vida Cinza cumulativa) - EXCLUSIVA de Dren
      const isDrenSource = attacker.id === 'dren' || attacker.currentPath === 'dren_corcovado';
      const rotRatio = profile.greyHealthRatio ?? 0;
      if (rotRatio > 0 && isDrenSource) {
        if (!appliedPathStatuses.includes('status_podre')) appliedPathStatuses.push('status_podre');
        greyHealthGenerated += Math.round(compMitigated * rotRatio);
      } else if (isDrenSource && (comp.type === 'physical_cleave' || comp.type === 'tomb_weight')) {
        appliedPathStatuses.push('status_podre');
        greyHealthGenerated += Math.round(compMitigated * 0.30); // Golpes pesados do Voraz perfuram a carne
      }

      // Crítico de corte causa sangramento adicional
      if (isCritical && (comp.type === 'physical_slash' || comp.type === 'blade_edge') && !appliedEffects.includes('hemorragia')) {
        appliedEffects.push('hemorragia');
      }
    }

    if (isHeavy) {
      appliedEffects.push('rachadura');
    }
    if (targetStatusEffects.some(s => s.type === 'hemorragia') && !appliedEffects.includes('hemorragia') && lastCriticalHit) {
      appliedEffects.push('hemorragia');
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
      target.greyHealth = createGreyHealthState(target.maxHp);
    }
    return DamageSystem.addGreyHealth(target, target.greyHealth, greyAmount, target.maxHp);
  }

  /**
   * Acumula Vida Cinza em um estado externo (inimigos controlados pela cena) e recalcula os debuffs.
   * Regras:
   * - A Vida Cinza nunca excede a vida vermelha restante (o alvo pode ser 100% cinza mas não "cinza negativo").
   * - rotDebuffRatio (dano causado) e rotVulnerabilityRatio (dano recebido) escalam com a fração de vida cinza, teto 30%.
   * - Quando toda a vida restante é cinza -> isFullyRotten = true (colapso necrótico por segundo).
   */
  public static addGreyHealth(
    target: CombatEntity,
    state: GreyHealthState,
    greyAmount: number,
    maxHp: number
  ): GreyHealthState {
    state.maxHp = maxHp;
    const redHp = Math.max(0, target.currentHp);
    const rawGrey = Math.max(0, Math.round(greyAmount));

    state.currentGreyHp = Math.min(redHp, state.currentGreyHp + rawGrey);

    // Recalcula as proporções (0.00 a 1.00 frente à vida máxima do inimigo)
    const infectionRatio = Math.min(1.0, state.currentGreyHp / Math.max(1, maxHp));
    state.rotDebuffRatio = Math.min(GREY_HEALTH_RULES.MAX_ROT_PERCENT, infectionRatio * GREY_HEALTH_RULES.MAX_ROT_PERCENT);
    state.rotVulnerabilityRatio = Math.min(GREY_HEALTH_RULES.MAX_ROT_PERCENT, infectionRatio * GREY_HEALTH_RULES.MAX_ROT_PERCENT);

    state.isFullyRotten = redHp > 0 && state.currentGreyHp >= redHp;

    // Sincroniza com a entidade (quando a entidade é a mesma instância) e com o "contato" da cena
    target.greyHealth = state;
    target.greyHealth.rotDebuffRatio = state.rotDebuffRatio;
    target.greyHealth.rotVulnerabilityRatio = state.rotVulnerabilityRatio;
    target.greyHealth.isFullyRotten = state.isFullyRotten;

    return state;
  }

  /**
   * Converte Vida Cinza de volta em vida vermelha (cura de podridão, ex: Veludo de Eco).
   */
  public static cleanseGreyHealth(target: CombatEntity, ratio: number): number {
    if (!target.greyHealth || target.greyHealth.currentGreyHp <= 0) return 0;
    const amount = Math.min(target.greyHealth.currentGreyHp, Math.round(target.greyHealth.maxHp * ratio));
    target.greyHealth.currentGreyHp -= amount;
    target.currentHp = Math.min(target.maxHp, target.currentHp + amount);
    DamageSystem.addGreyHealth(target, target.greyHealth, 0, target.greyHealth.maxHp || target.maxHp);
    return amount;
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
      target.greyHealth.currentGreyHp = Math.max(0, target.greyHealth.currentGreyHp - actualHeal * GREY_HEALTH_RULES.HEAL_GREY_REMOVAL_RATIO);
      DamageSystem.addGreyHealth(target, target.greyHealth, 0, target.greyHealth.maxHp || target.maxHp);
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

      if (effect.type === 'queimadura' && effect.tickTimerMs >= 500) {
        effect.tickTimerMs = 0;
        onDotDamage(Math.max(2, Math.round(effect.sourceValue * 0.12 * effect.stacks)), 'queimadura');
      }

      if (effect.type === 'veneno' && effect.tickTimerMs >= 1000) {
        effect.tickTimerMs = 0;
        onDotDamage(Math.max(2, Math.round(effect.sourceValue * 0.08 * effect.stacks)), 'veneno');
      }

      if (effect.type === 'sangria_vital' && effect.tickTimerMs >= 500) {
        effect.tickTimerMs = 0;
        onDotDamage(Math.max(2, Math.round(effect.sourceValue * 0.15 * effect.stacks)), 'sangria_vital');
      }

      if (effect.elapsedMs < effect.durationMs) {
        updated.push(effect);
      }
    }

    return updated;
  }

  /**
   * Atualização contínua dos Status de Caminho (DoT de Podre 100%, DoT de Chamas Negras, etc.)
   * Retorna o dano total aplicado no tick para que a cena atualize a barra de vida.
   */
  public static updatePathStatuses(
    entity: CombatEntity,
    deltaMs: number,
    onDotDamage: (damage: number, statusType: PathSpecificStatusType) => void,
    onSoulImplosion?: (x: number, y: number, damage: number) => void
  ): void {
    // 1. Processamento da Vida Cinza 100% (Colapso Necrótico da Podridão de Dren)
    if (entity.greyHealth && entity.greyHealth.isFullyRotten && entity.currentHp > 0) {
      entity.greyHealth.decayDotTimerMs += deltaMs;
      if (entity.greyHealth.decayDotTimerMs >= GREY_HEALTH_RULES.FULL_ROT_TICK_MS) {
        entity.greyHealth.decayDotTimerMs = 0;

        // DoT severo de necrose (teto de 6% da vida máxima/s) + queima parte da própria vida cinza
        const necrosisDmg = Math.max(5, Math.round(entity.greyHealth.maxHp * GREY_HEALTH_RULES.FULL_ROT_DPS));
        const greyBurn = Math.round(entity.greyHealth.currentGreyHp * GREY_HEALTH_RULES.FULL_ROT_GREY_BURN_RATIO);
        entity.currentHp = Math.max(0, entity.currentHp - necrosisDmg);
        entity.greyHealth.currentGreyHp = Math.max(0, entity.greyHealth.currentGreyHp - greyBurn);
        entity.greyHealth.currentGreyHp = Math.min(entity.currentHp, entity.greyHealth.currentGreyHp);
        entity.greyHealth.isFullyRotten = entity.currentHp > 0 && entity.greyHealth.currentGreyHp >= entity.currentHp;
        onDotDamage(necrosisDmg, 'status_podre');
      }
    }

    // 2. Processamento dos PathStatusInstances
    if (!entity.pathStatuses) return;

    const remaining: PathStatusInstance[] = [];
    for (const instance of entity.pathStatuses) {
      instance.elapsedMs += deltaMs;
      instance.tickTimerMs += deltaMs;

      switch (instance.type) {
        // --- DUJA MALDITO ---
        case 'chamas_negras': {
          if (instance.tickTimerMs >= 500) {
            instance.tickTimerMs = 0;
            const fireDmg = Math.max(3, Math.round(instance.potency * 0.15 * instance.stacks));
            entity.currentHp = Math.max(0, entity.currentHp - fireDmg);
            onDotDamage(fireDmg, 'chamas_negras');
          }
          break;
        }
        // --- DULLANT FRATURA ---
        case 'decaimento_fissao': {
          if (instance.tickTimerMs >= 1000) {
            instance.tickTimerMs = 0;
            const fissionDmg = Math.max(4, Math.round(instance.potency * 0.20 * instance.stacks));
            entity.currentHp = Math.max(0, entity.currentHp - fissionDmg);
            onDotDamage(fissionDmg, 'decaimento_fissao');
          }
          break;
        }
        case 'irradiacao_celular': {
          if (instance.tickTimerMs >= 1000) {
            instance.tickTimerMs = 0;
            entity.damageDealtMultiplier = Math.max(0.6, (entity.damageDealtMultiplier ?? 1) * 0.98);
            onDotDamage(Math.max(2, Math.round(instance.potency * 0.08)), 'irradiacao_celular');
          }
          break;
        }
        // --- DUJA CÉTICO ---
        case 'corrosao_vitriolica': {
          if (instance.tickTimerMs >= 1000) {
            instance.tickTimerMs = 0;
            const stacks = instance.stacks;
            entity.stats.pulso = Math.max(1, entity.stats.pulso * (1 - 0.02 * stacks));
            entity.stats.limiar = Math.max(1, entity.stats.limiar * (1 - 0.02 * stacks));
            onDotDamage(Math.max(1, Math.round(instance.potency * 0.10)), 'corrosao_vitriolica');
          }
          break;
        }
        case 'flogisto_incandescente': {
          if (instance.tickTimerMs >= 500) {
            instance.tickTimerMs = 0;
            onDotDamage(Math.max(2, Math.round(instance.potency * 0.12 * instance.stacks)), 'flogisto_incandescente');
          }
          break;
        }
        // --- DREN ---
        case 'peso_do_tumulo': {
          entity.speedMultiplier = Math.min(entity.speedMultiplier ?? 1, 0.65);
          break;
        }
        // --- DUJA IMACULADO (dano contínuo de punição) ---
        case 'salmo_de_estase': {
          entity.speedMultiplier = 0;
          break;
        }
        case 'estigma_santo': {
          if (instance.tickTimerMs >= 1000) {
            instance.tickTimerMs = 0;
            onDotDamage(Math.max(2, Math.round(instance.potency * 0.06)), 'estigma_santo');
          }
          break;
        }
        // --- DIT ---
        case 'frenesi_predatorio_alfa': {
          if (instance.tickTimerMs >= 500) {
            instance.tickTimerMs = 0;
            onDotDamage(Math.max(2, Math.round(instance.potency * 0.10 * instance.stacks)), 'frenesi_predatorio_alfa');
          }
          break;
        }
        case 'sinergia_quimica_hibrida': {
          if (instance.tickTimerMs >= 500) {
            instance.tickTimerMs = 0;
            onDotDamage(Math.max(2, Math.round(instance.potency * 0.08 * instance.stacks)), instance.type);
          }
          break;
        }
        default:
          break;
      }

      if (instance.elapsedMs < instance.durationMs) {
        remaining.push(instance);
      } else {
        // Ao expirar chamas negras, desativa anti-cura se não houver outra instância
        if (instance.type === 'chamas_negras') {
          const stillBurning = remaining.some(s => s.type === 'chamas_negras');
          entity.antiHealActive = stillBurning;
        }
        if (instance.type === 'salmo_de_estase' || instance.type === 'peso_do_tumulo') {
          entity.speedMultiplier = 1;
        }
      }
    }

    entity.pathStatuses = remaining;
  }
}
