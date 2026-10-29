import { PathSpecificStatusType, PathStatusInstance } from '../types/damageTypes';
import { CombatEntity } from '../types';
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
 * Dispatcher de Efeitos, Talentos e Habilidades Baseados em Dados (Data-Driven Architecture)
 * Desacopla 100% dos dados em JSON dos scripts lógicos do jogo
 */
export class EffectDispatcher {
  private static behaviorHandlers: Map<string, CustomBehaviorHandler> = new Map();

  /**
   * Registra um handler de comportamento para os talentos e habilidades que alteram as regras básicas do jogo
   */
  public static registerBehaviorHook(hookId: string, handler: CustomBehaviorHandler): void {
    this.behaviorHandlers.set(hookId, handler);
  }

  /**
   * Executa um gancho de comportamento especial
   */
  public static triggerBehaviorHook(hookId: string, context: any): void {
    const handler = this.behaviorHandlers.get(hookId);
    if (handler) {
      handler(context);
    }
  }

  /**
   * Gerenciador de Status Específicos por Caminho:
   * - Duja Maldito: Maldição Visceral (10x Implosão de Alma) & Chamas Negras (Anti-Cura 100%)
   * - Duja Imaculada: Beatificação Ressonante (7x Explosão de Cura e Luz Radiante)
   * - Duja Cética: Saturação Alquímica (5x Reação em Cadeia)
   * - Dren Corcovado: Podridão (Vida Cinza) & Dívida de Carne
   * - Dren Espelhado: Retaliação Prismática
   * - Dullant Fratura: Decaimento de Fissão
   * - Dullant Eco: Estilhaçamento Radiante
   */
  public static applyPathStatus(
    target: CombatEntity,
    statusType: PathSpecificStatusType,
    potency: number,
    penetration: number,
    durationMs: number = 5000,
    maxStacks: number = 10,
    sourceEntity?: CombatEntity
  ): { exploded: boolean; damageDealt: number; healDealt?: number; message?: string } {
    if (!target.pathStatuses) {
      target.pathStatuses = [];
    }

    // Caso Especial 1: Podridão do Dren (Manipula a estrutura de Vida Cinza)
    if (statusType === 'status_podre') {
      const greyAmount = Math.max(15, Math.round(potency));
      DamageSystem.applyRotToTarget(target, greyAmount);
      return { 
        exploded: false, 
        damageDealt: 0, 
        message: target.greyHealth?.isFullyRotten ? 'FALÊNCIA NECRÓTICA (PODRE 100%)' : 'INFECÇÃO POR PODRIDÃO' 
      };
    }

    // Caso Especial 2: Chamas Negras da Duja (Bloqueia 100% de cura imediatamente)
    if (statusType === 'chamas_negras') {
      target.antiHealActive = true;
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
        maxStacks,
        durationMs,
        elapsedMs: 0,
        tickTimerMs: 0,
        potency,
        penetration,
        sourceCharacterId: sourceEntity?.id,
        extraData: {
          antiHealRatio: statusType === 'chamas_negras' ? 1.0 : undefined,
        }
      };
      target.pathStatuses.push(existing);
    } else {
      existing.stacks = Math.min(existing.maxStacks, existing.stacks + 1);
      existing.elapsedMs = 0; // Renova duração

      // 1. Regra da Maldição Visceral de Duja (Caminho Maldito):
      // No 10º stack, ocorre Implosão de Alma
      if (statusType === 'maldicao_visceral' && existing.stacks >= existing.maxStacks) {
        exploded = true;
        damageDealt = Math.round(potency * existing.stacks * 1.8);
        message = 'IMPLOSÃO DE ALMA (10x MALDIÇÃO)';
        existing.stacks = 1;
      }

      // 2. Regra da Beatificação Ressonante de Duja (Caminho Imaculado):
      // No 7º stack, explode em cura maciça e luz que purifica
      if (statusType === 'beatificacao_ressonante' && existing.stacks >= 7) {
        exploded = true;
        healDealt = Math.round(potency * 2.5);
        message = 'CLÍMAX DA BEATIFICAÇÃO (7x SALMOS)';
        DamageSystem.applyHeal(target, healDealt);
        existing.stacks = 1;
      }

      // 3. Regra da Saturação Alquímica de Duja (Caminho Cético):
      // No 5º stack, explode em catálise elemental
      if (statusType === 'saturacao_alquimica' && existing.stacks >= 5) {
        exploded = true;
        damageDealt = Math.round(potency * 2.2);
        message = 'CATÁLISE ELEMENTAL ALQUÍMICA (5x REAGENTES)';
        existing.stacks = 1;
      }
    }

    return { exploded, damageDealt, healDealt, message };
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
