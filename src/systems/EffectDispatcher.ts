import { PathSpecificStatusType, PathStatusInstance } from '../types/damageTypes';
import { ActiveStatusEffect, CombatEntity, StatusEffectType } from '../types';
import { DamageSystem } from './damage';

export type TriggerType =
  | 'on_hit'
  | 'on_attack'
  | 'on_heavy_attack'
  | 'on_dash_contact'
  | 'on_calculate_damage'
  | 'on_kill_heavy'
  | 'on_take_damage'
  | 'on_fatal_damage'
  | 'on_perfect_dash_streak'
  | 'on_perfect_parry'
  | 'on_combo_10';

export interface ModifierContext {
  attacker?: CombatEntity;
  target?: CombatEntity;
  isHeavy?: boolean;
  isMagic?: boolean;
  attackerHpPercent?: number;
  targetHpPercent?: number;
  isTargetStunned?: boolean;
}

export type CustomBehaviorHandler = (ctx: any) => void;

/**
 * Configuração declarativa de cada status de caminho:
 * - maxStacks: teto de acúmulo
 * - durationMs: duração base
 * - explosionAt: stack que dispara o efeito catastrófico
 * - explosionMultiplier: multiplicador do dano de explosão sobre (potência × stacks)
 * - ritual: status benéfico (não inflige dano, cura/escuda)
 */
export interface PathStatusConfig {
  maxStacks: number;
  durationMs: number;
  explosionAt?: number;
  explosionMultiplier?: number;
  ritual?: boolean;
  message?: string;
}

/**
 * Tabela central de todos os status de caminho implementados.
 * Cobre os 8 caminhos e os 24 sub-caminhos do catálogo (data/paths.ts).
 */
export const PATH_STATUS_CONFIG: Record<PathSpecificStatusType, PathStatusConfig> = {
  // --- DREN CORCOVADO ---
  status_podre: { maxStacks: 10, durationMs: 10000, message: 'INFECÇÃO POR PODRIDÃO' },
  divida_de_carne: { maxStacks: 5, durationMs: 8000 },
  peso_do_tumulo: { maxStacks: 3, durationMs: 4000 },
  frenesi_cadavérico: { maxStacks: 1, durationMs: 4000, ritual: true, message: 'FRENESI CADAVÉRICO' },
  ossos_de_tau_tau: { maxStacks: 3, durationMs: 6000, ritual: true },
  marca_do_nicho: { maxStacks: 1, durationMs: 6000 },
  coreografia_voraz: { maxStacks: 5, durationMs: 8000, ritual: true },

  // --- DREN ESPELHADO ---
  carapaca_prismatica: { maxStacks: 5, durationMs: 8000, explosionAt: 5, explosionMultiplier: 1.5, message: 'CARAPAÇA PRISMÁTICA PLENA' },
  escudo_de_refracao: { maxStacks: 3, durationMs: 6000, ritual: true },
  estilhaco_vingativo: { maxStacks: 5, durationMs: 5000 },
  postura_de_parry_pesado: { maxStacks: 3, durationMs: 5000, ritual: true },
  guarda_espelhada: { maxStacks: 3, durationMs: 5000, ritual: true },
  desafio_do_duelista: { maxStacks: 1, durationMs: 5000 },

  // --- DUJA MALDITO ---
  maldicao_visceral: { maxStacks: 10, durationMs: 8000, explosionAt: 10, explosionMultiplier: 1.8, message: 'IMPLOSÃO DE ALMA (10x MALDIÇÃO)' },
  chamas_negras: { maxStacks: 3, durationMs: 6000, message: 'CHAMAS NEGRAS (ANTI-CURA)' },
  desespero_sonico: { maxStacks: 1, durationMs: 5000 },
  sangue_maculado: { maxStacks: 5, durationMs: 6000, ritual: true },
  pacto_do_sino: { maxStacks: 3, durationMs: 8000, ritual: true },
  exorcismo_implosivo: { maxStacks: 1, durationMs: 4000, explosionAt: 1, explosionMultiplier: 2.2, message: 'EXORCISMO IMPLOSIVO' },
  trilha_de_cinzas: { maxStacks: 3, durationMs: 4000 },

  // --- DUJA IMACULADO ---
  beatificacao_ressonante: { maxStacks: 7, durationMs: 9000, explosionAt: 7, explosionMultiplier: 2.5, ritual: true, message: 'CLÍMAX DA BEATIFICAÇÃO (7x SALMOS)' },
  manto_de_luz_purificante: { maxStacks: 1, durationMs: 8000, ritual: true },
  estigma_santo: { maxStacks: 1, durationMs: 8000 },
  salmo_de_estase: { maxStacks: 1, durationMs: 1200 },
  veluto_de_eco: { maxStacks: 3, durationMs: 8000, ritual: true },
  santuario_errante: { maxStacks: 1, durationMs: 8000, ritual: true },

  // --- DUJA CÉTICO ---
  saturacao_alquimica: { maxStacks: 5, durationMs: 8000, explosionAt: 5, explosionMultiplier: 2.2, message: 'CATÁLISE ELEMENTAL ALQUÍMICA (5x REAGENTES)' },
  corrosao_vitriolica: { maxStacks: 5, durationMs: 6000 },
  flogisto_incandescente: { maxStacks: 3, durationMs: 4000 },
  hipotermia_criogenica: { maxStacks: 3, durationMs: 5000, explosionAt: 3, explosionMultiplier: 0.5, message: 'CONGELAMENTO CRIOGÊNICO' },
  marionete_de_lama: { maxStacks: 1, durationMs: 6000 },
  destilado_de_cinabrio: { maxStacks: 3, durationMs: 8000, ritual: true },
  reacao_em_cadeia: { maxStacks: 5, durationMs: 6000, explosionAt: 5, explosionMultiplier: 1.6, message: 'REAÇÃO EM CADEIA' },

  // --- DULLANT ECO ---
  estilhacamento_radiante: { maxStacks: 5, durationMs: 6000 },
  fio_de_ressonancia: { maxStacks: 1, durationMs: 8000 },
  harmonia_de_bon: { maxStacks: 10, durationMs: 10000, ritual: true },
  acorde_de_quartzo: { maxStacks: 3, durationMs: 5000, explosionAt: 3, explosionMultiplier: 1.4, message: 'ACORDE DE QUARTZO' },
  postura_de_atirador: { maxStacks: 1, durationMs: 8000, ritual: true },
  veia_de_eco: { maxStacks: 5, durationMs: 8000, ritual: true },

  // --- DULLANT FRATURA ---
  decaimento_fissao: { maxStacks: 5, durationMs: 5000 },
  irradiacao_celular: { maxStacks: 3, durationMs: 6000 },
  mira_de_precisao_extrema: { maxStacks: 1, durationMs: 3000, ritual: true },
  onda_de_concussao: { maxStacks: 1, durationMs: 3000 },
  estilhaco_de_granito: { maxStacks: 3, durationMs: 5000 },
  bomba_de_chumbo: { maxStacks: 3, durationMs: 4000 },
  olho_do_bon: { maxStacks: 1, durationMs: 6000 },

  // --- DIT MÚLTIPLO ---
  memoria_muscular_furtada: { maxStacks: 5, durationMs: 6000, ritual: true },
  eco_cadavérico_ressonante: { maxStacks: 3, durationMs: 6000, explosionAt: 3, explosionMultiplier: 1.5, message: 'ECO CADE' },
  sinergia_quimica_hibrida: { maxStacks: 3, durationMs: 6000 },
  tain_ykvyt_sobrecarregado: { maxStacks: 3, durationMs: 10000, ritual: true },
  mimetismo_perfeito: { maxStacks: 1, durationMs: 8000, ritual: true },
  troca_de_pele: { maxStacks: 3, durationMs: 5000, ritual: true },

  // --- DIT EVOLUTIVO ---
  enxerto_osseo_permanente: { maxStacks: 5, durationMs: 15000, ritual: true },
  carapaca_quitinosa: { maxStacks: 3, durationMs: 10000, ritual: true },
  frenesi_predatorio_alfa: { maxStacks: 1, durationMs: 6000 },
  clandestino_do_permafrost: { maxStacks: 1, durationMs: 8000, ritual: true },
  espinhos_de_osso_gelido: { maxStacks: 3, durationMs: 6000, ritual: true },
  predador_da_cadeia: { maxStacks: 5, durationMs: 15000, ritual: true },
};

export type PathStatusResult = {
  exploded: boolean;
  damageDealt: number;
  healDealt?: number;
  message?: string;
};

/**
 * Dispatcher de Efeitos, Talentos e Habilidades Baseados em Dados (Data-Driven Architecture)
 */
export class EffectDispatcher {
  private static behaviorHandlers: Map<string, CustomBehaviorHandler> = new Map();

  public static registerBehaviorHook(hookId: string, handler: CustomBehaviorHandler): void {
    this.behaviorHandlers.set(hookId, handler);
  }

  public static triggerBehaviorHook(hookId: string, context: any): void {
    const handler = this.behaviorHandlers.get(hookId);
    if (handler) handler(context);
  }

  /**
   * Aplica (ou empilha) qualquer status de caminho em uma entidade.
   *
   * Regras especiais:
   * - `status_podre`: exclusivo do Dren. Acumula Vida Cinza, que reduz o dano do inimigo
   *   e aumenta o dano que ele recebe em até 30%; em 100% de vida cinza, colapso necrótico.
   * - `chamas_negras`: bloqueia 100% de cura imediatamente.
   * - Status com `explosionAt`: ao atingir o teto, explode e reseta para 1 stack.
   */
  public static applyPathStatus(
    target: CombatEntity,
    statusType: PathSpecificStatusType,
    potency: number,
    penetration: number,
    durationMs?: number,
    maxStacks?: number,
    sourceEntity?: CombatEntity,
    extraData?: PathStatusInstance['extraData']
  ): PathStatusResult {
    if (!target.pathStatuses) {
      target.pathStatuses = [];
    }

    const config = PATH_STATUS_CONFIG[statusType] ?? { maxStacks: 10, durationMs: 5000 };
    const effectiveMaxStacks = maxStacks ?? config.maxStacks;
    const effectiveDuration = durationMs ?? config.durationMs;

    // Caso Especial: Podridão do Dren (Vida Cinza) - somente Dren pode aplicar
    if (statusType === 'status_podre') {
      const isDrenSource = !sourceEntity || sourceEntity.id === 'dren' || sourceEntity.currentPath === 'dren_corcovado';
      if (!isDrenSource) {
        return { exploded: false, damageDealt: 0, message: 'Apenas o Voraz pode propagar a Podridão.' };
      }

      const greyAmount = Math.max(3, Math.round(potency));
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
      DamageSystem.addGreyHealth(target, target.greyHealth, greyAmount, target.maxHp);

      // Marcador de stacks para a HUD (cada 25 de vida cinza = 1 stack)
      let podreInstance = target.pathStatuses.find(s => s.type === 'status_podre');
      if (!podreInstance) {
        podreInstance = {
          type: 'status_podre',
          stacks: 1,
          maxStacks: effectiveMaxStacks,
          durationMs: effectiveDuration,
          elapsedMs: 0,
          tickTimerMs: 0,
          potency: greyAmount,
          penetration,
          sourceCharacterId: sourceEntity?.id,
          extraData: { greyHealthAmount: target.greyHealth.currentGreyHp },
        };
        target.pathStatuses.push(podreInstance);
      } else {
        podreInstance.elapsedMs = 0;
        podreInstance.potency = greyAmount;
        podreInstance.extraData = { ...podreInstance.extraData, greyHealthAmount: target.greyHealth.currentGreyHp };
      }
      const grayRatio = target.greyHealth.currentGreyHp / Math.max(1, target.maxHp);
      podreInstance.stacks = Math.max(1, Math.min(effectiveMaxStacks, Math.ceil(grayRatio * effectiveMaxStacks)));

      return {
        exploded: false,
        damageDealt: 0,
        message: target.greyHealth.isFullyRotten
          ? 'FALÊNCIA NECRÓTICA (PODRE 100%)'
          : `INFECÇÃO POR PODRIDÃO (${Math.round(grayRatio * 100)}%)`,
      };
    }

    // Caso Especial: Chamas Negras da Duja (Bloqueia 100% de cura imediatamente)
    if (statusType === 'chamas_negras') {
      target.antiHealActive = true;
    }

    // Efeitos imediatos de controle
    if (statusType === 'salmo_de_estase') {
      target.speedMultiplier = 0;
    }
    if (statusType === 'peso_do_tumulo') {
      target.speedMultiplier = Math.min(target.speedMultiplier ?? 1, 0.65);
    }
    if (statusType === 'desespero_sonico') {
      target.isSilenced = true;
      target.damageDealtMultiplier = Math.min(target.damageDealtMultiplier ?? 1, 0.8);
    }
    if (statusType === 'irradiacao_celular') {
      target.damageDealtMultiplier = Math.min(target.damageDealtMultiplier ?? 1, 0.8);
    }
    if (statusType === 'manto_de_luz_purificante') {
      target.antiHealActive = false;
      target.statusEffects = target.statusEffects.filter(
        (s: ActiveStatusEffect) => s.type !== 'corrupcao' && s.type !== 'veneno' && s.type !== 'queimadura'
      );
    }

    let existing = target.pathStatuses.find(s => s.type === statusType);
    let exploded = false;
    let damageDealt = 0;
    let healDealt = 0;
    let message: string | undefined;

    if (!existing) {
      existing = {
        type: statusType,
        stacks: 1,
        maxStacks: effectiveMaxStacks,
        durationMs: effectiveDuration,
        elapsedMs: 0,
        tickTimerMs: 0,
        potency,
        penetration,
        sourceCharacterId: sourceEntity?.id,
        extraData: {
          antiHealRatio: statusType === 'chamas_negras' ? 1.0 : undefined,
          ...extraData,
        },
      };
      target.pathStatuses.push(existing);
      message = config.message;
    } else {
      existing.stacks = Math.min(existing.maxStacks, existing.stacks + 1);
      existing.elapsedMs = 0; // Renova duração
      existing.potency = Math.max(existing.potency, potency);

      // Regra genérica de explosão ao atingir o teto (Maldição Visceral 10x, Beatificação 7x, Saturação 5x...)
      if (config.explosionAt && existing.stacks >= config.explosionAt) {
        exploded = true;
        const multiplier = config.explosionMultiplier ?? 1.5;
        if (config.ritual) {
          healDealt = Math.round(potency * multiplier);
          DamageSystem.applyHeal(target, healDealt);
        } else {
          damageDealt = Math.round(potency * existing.stacks * multiplier);
        }
        message = config.message ?? `EXPLOSÃO DE ${statusType.toUpperCase()}`;
        existing.stacks = 1;
        existing.elapsedMs = 0;
      }
    }

    return { exploded, damageDealt, healDealt, message };
  }

  /**
   * Remove todos os status ativos de uma entidade (usado por purificações e trocas de pele)
   */
  public static cleanseAll(target: CombatEntity, includePathStatuses: boolean = true): void {
    target.statusEffects = [];
    target.antiHealActive = false;
    target.isSilenced = false;
    target.damageDealtMultiplier = 1;
    target.speedMultiplier = 1;
    if (includePathStatuses) {
      target.pathStatuses = [];
    }
  }
}

// =========================================================================
// REGISTRO DE GANCHOS DE COMPORTAMENTOS ESPECIAIS (Game-Altering Behaviors)
// =========================================================================

EffectDispatcher.registerBehaviorHook('espectro_imortal_8s', (entity: CombatEntity) => {
  entity.isImmortalSpectre = true;
  entity.currentHp = 1;
  setTimeout(() => {
    entity.isImmortalSpectre = false;
  }, 8000);
});

EffectDispatcher.registerBehaviorHook('modo_deus_invulneravel', (entity: CombatEntity) => {
  entity.isInvulnerable = true;
  entity.isGodMode = true;
  setTimeout(() => {
    entity.isInvulnerable = false;
    entity.isGodMode = false;
  }, 5000);
});

EffectDispatcher.registerBehaviorHook('chamas_negras_cura_nula', (entity: CombatEntity) => {
  entity.antiHealActive = true;
});

EffectDispatcher.registerBehaviorHook('eco_infinito_5s', (entity: CombatEntity) => {
  entity.currentEco = entity.maxEco;
});

EffectDispatcher.registerBehaviorHook('troca_de_pele_cleanse', (entity: CombatEntity) => {
  entity.statusEffects = entity.statusEffects.filter(
    (s: ActiveStatusEffect) => !(['corrupcao', 'veneno', 'queimadura', 'congelamento'] as StatusEffectType[]).includes(s.type)
  );
  entity.isInvulnerable = true;
  setTimeout(() => {
    entity.isInvulnerable = false;
  }, 600);
});

EffectDispatcher.registerBehaviorHook('frenesi_quimerico', (entity: CombatEntity) => {
  entity.damageDealtMultiplier = (entity.damageDealtMultiplier ?? 1) * 1.4;
  entity.speedMultiplier = (entity.speedMultiplier ?? 1) * 1.4;
  setTimeout(() => {
    entity.damageDealtMultiplier = (entity.damageDealtMultiplier ?? 1.4) / 1.4;
    entity.speedMultiplier = (entity.speedMultiplier ?? 1.4) / 1.4;
  }, 6000);
});
