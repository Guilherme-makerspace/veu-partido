
import { DamageTypeProfile, SpecificDamageType } from '../types/damageTypes';

/**
 * Perfis Mecânicos de Todos os Tipos Específicos de Dano
 * Cada perfil define: categoria primária, penetração base, status clássicos,
 * status de caminho, geração de Vida Cinza (exclusiva do Dren), anti-cura e DoT.
 */
export const DAMAGE_TYPE_PROFILES: Record<SpecificDamageType, DamageTypeProfile> = {
  // ---------------- CORPO A CORPO ----------------
  physical_slash: {
    label: 'Corte',
    category: 'fisico',
    basePenetration: 0.20,
    classicStatuses: ['hemorragia'],
  },
  physical_blunt: {
    label: 'Esmagamento',
    category: 'fisico',
    basePenetration: 0.10,
    armorMultiplier: 1.15,
    classicStatuses: ['rachadura'],
  },
  physical_pierce: {
    label: 'Perfuração',
    category: 'fisico',
    basePenetration: 0.40,
    armorMultiplier: 1.10,
  },
  physical_cleave: {
    label: 'Fendimento',
    category: 'fisico',
    basePenetration: 0.25,
    armorMultiplier: 1.20,
    classicStatuses: ['rachadura', 'hemorragia'],
  },
  physical_shatter: {
    label: 'Estilhaçamento',
    category: 'fisico',
    basePenetration: 0.35,
    armorMultiplier: 1.30,
    classicStatuses: ['rachadura', 'exposicao'],
  },
  blade_edge: {
    label: 'Fio Afiado',
    category: 'fisico',
    basePenetration: 0.25,
    classicStatuses: ['hemorragia'],
  },
  rapier_thrust: {
    label: 'Estocada Fina',
    category: 'fisico',
    basePenetration: 0.45,
    armorMultiplier: 1.05,
    classicStatuses: ['hemorragia'],
  },
  axe_frenzy: {
    label: 'Fúria de Machado',
    category: 'fisico',
    basePenetration: 0.22,
    classicStatuses: ['hemorragia', 'rachadura'],
  },
  hammer_crush: {
    label: 'Esmagamento de Malho',
    category: 'fisico',
    basePenetration: 0.15,
    armorMultiplier: 1.25,
    classicStatuses: ['rachadura', 'atordoamento'],
  },
  spike_impale: {
    label: 'Empalação',
    category: 'fisico',
    basePenetration: 0.30,
    classicStatuses: ['hemorragia', 'rachadura'],
  },
  polearm_sweep: {
    label: 'Varredura de Haste',
    category: 'fisico',
    basePenetration: 0.28,
    classicStatuses: ['hemorragia'],
  },
  harpoon_drag: {
    label: 'Arpão',
    category: 'fisico',
    basePenetration: 0.35,
    classicStatuses: ['lentidao'],
  },
  whip_lash: {
    label: 'Açoite',
    category: 'fisico',
    basePenetration: 0.18,
    classicStatuses: ['hemorragia'],
  },
  gauntlet_impact: {
    label: 'Impacto de Punho',
    category: 'fisico',
    basePenetration: 0.12,
    armorMultiplier: 1.10,
    classicStatuses: ['atordoamento'],
  },

  // ---------------- BALÍSTICA ----------------
  ballistic_pierce: {
    label: 'Perfuração Balística',
    category: 'fisico',
    basePenetration: 0.65,
    armorMultiplier: 1.20,
  },
  ballistic_shrapnel: {
    label: 'Metralha',
    category: 'fisico',
    basePenetration: 0.30,
    armorMultiplier: 1.15,
    classicStatuses: ['hemorragia', 'atordoamento'],
  },
  ballistic_concussive: {
    label: 'Impacto Concussivo',
    category: 'fisico',
    basePenetration: 0.35,
    armorMultiplier: 1.35,
    classicStatuses: ['atordoamento', 'rachadura'],
  },
  ballistic_bolt: {
    label: 'Dardo de Besta',
    category: 'fisico',
    basePenetration: 0.40,
  },
  ballistic_arrow: {
    label: 'Flecha',
    category: 'fisico',
    basePenetration: 0.30,
    classicStatuses: ['hemorragia'],
  },
  fissao_decay: {
    label: 'Decaimento de Fissão',
    category: 'entropico',
    basePenetration: 0.55,
    armorMultiplier: 1.20,
    pathStatuses: ['decaimento_fissao'],
    dotRatio: 0.20,
    dotIntervalMs: 1000,
  },
  radiacao_dot: {
    label: 'Radiação',
    category: 'entropico',
    basePenetration: 0.60,
    pathStatuses: ['irradiacao_celular'],
    dotRatio: 0.25,
    dotIntervalMs: 1000,
  },

  // ---------------- MINERAIS ----------------
  crystallite_resonance: {
    label: 'Ressonância Cristalina',
    category: 'magico',
    basePenetration: 0.60,
    pathStatuses: ['estilhacamento_radiante'],
  },
  pyritic_spark: {
    label: 'Faísca Pirítica',
    category: 'magico',
    basePenetration: 0.45,
    classicStatuses: ['queimadura'],
    dotRatio: 0.15,
    dotIntervalMs: 500,
  },
  magnetite_disruption: {
    label: 'Disrupção Magnética',
    category: 'magico',
    basePenetration: 0.50,
    classicStatuses: ['lentidao', 'exposicao'],
  },
  obsidian_shear: {
    label: 'Cisalhamento de Obsidiana',
    category: 'fisico',
    basePenetration: 0.32,
    classicStatuses: ['hemorragia'],
  },
  lead_toxicity: {
    label: 'Toxicidade de Chumbo',
    category: 'fisico',
    basePenetration: 0.35,
    classicStatuses: ['veneno'],
    dotRatio: 0.18,
    dotIntervalMs: 1000,
  },

  // ---------------- MALDIÇÃO / SOM ----------------
  maldicao_status: {
    label: 'Maldição Profana',
    category: 'magico',
    basePenetration: 0.75,
    pathStatuses: ['maldicao_visceral'],
  },
  black_flame: {
    label: 'Chamas Negras',
    category: 'entropico',
    basePenetration: 0.70,
    antiHeal: true,
    pathStatuses: ['chamas_negras'],
    classicStatuses: ['queimadura'],
    dotRatio: 0.20,
    dotIntervalMs: 500,
  },
  eco_acoustic: {
    label: 'Som Primordial',
    category: 'magico',
    basePenetration: 0.80,
    pathStatuses: ['desespero_sonico'],
  },
  entropia_pura: {
    label: 'Entropia Pura',
    category: 'entropico',
    basePenetration: 0.85,
    classicStatuses: ['corrupcao'],
  },
  blood_sacrifice: {
    label: 'Sacrifício de Sangue',
    category: 'magico',
    basePenetration: 0.60,
    pathStatuses: ['sangue_maculado'],
    classicStatuses: ['hemorragia'],
  },
  hex_whisper: {
    label: 'Sussurro Amaldiçoado',
    category: 'magico',
    basePenetration: 0.65,
    pathStatuses: ['maldicao_visceral'],
    classicStatuses: ['corrupcao'],
  },
  curse_detonation: {
    label: 'Detonação de Maldições',
    category: 'magico',
    basePenetration: 0.70,
    pathStatuses: ['exorcismo_implosivo'],
  },

  // ---------------- ALQUIMIA ----------------
  alchemical_fire: {
    label: 'Flogisto',
    category: 'magico',
    basePenetration: 0.40,
    classicStatuses: ['queimadura'],
    pathStatuses: ['flogisto_incandescente'],
    dotRatio: 0.22,
    dotIntervalMs: 500,
  },
  alchemical_acid: {
    label: 'Vitríolo',
    category: 'entropico',
    basePenetration: 0.50,
    classicStatuses: ['exposicao'],
    pathStatuses: ['corrosao_vitriolica'],
    dotRatio: 0.15,
    dotIntervalMs: 1000,
  },
  alchemical_ice: {
    label: 'Criogenia',
    category: 'magico',
    basePenetration: 0.45,
    classicStatuses: ['lentidao', 'congelamento'],
    pathStatuses: ['hipotermia_criogenica'],
  },
  alchemical_shock: {
    label: 'Galvanismo',
    category: 'magico',
    basePenetration: 0.55,
    classicStatuses: ['atordoamento'],
  },
  alchemical_poison: {
    label: 'Veneno Destilado',
    category: 'entropico',
    basePenetration: 0.50,
    classicStatuses: ['veneno'],
    pathStatuses: ['saturacao_alquimica'],
    dotRatio: 0.18,
    dotIntervalMs: 1000,
  },
  alchemical_plasma: {
    label: 'Plasma de Cinábrio',
    category: 'magico',
    basePenetration: 0.60,
    classicStatuses: ['queimadura', 'exposicao'],
    pathStatuses: ['saturacao_alquimica'],
    dotRatio: 0.20,
    dotIntervalMs: 500,
  },
  alchemical_mist: {
    label: 'Névoa de Enxofre',
    category: 'magico',
    basePenetration: 0.35,
    classicStatuses: ['silencio', 'lentidao'],
  },

  // ---------------- MILAGRES ----------------
  radiant_holy: {
    label: 'Luz Beatificada',
    category: 'magico',
    basePenetration: 0.55,
    armorMultiplier: 1.25,
    pathStatuses: ['beatificacao_ressonante'],
  },
  astral_resonance: {
    label: 'Vibração Astral',
    category: 'verdadeiro',
    basePenetration: 0.90,
    pathStatuses: ['estigma_santo'],
  },
  sacral_ward: {
    label: 'Selo Sacro',
    category: 'verdadeiro',
    basePenetration: 0.70,
    pathStatuses: ['manto_de_luz_purificante'],
  },
  spirit_blight: {
    label: 'Punição de Almas',
    category: 'verdadeiro',
    basePenetration: 0.80,
    pathStatuses: ['salmo_de_estase'],
    dotRatio: 0.12,
    dotIntervalMs: 1000,
  },

  // ---------------- QUIMERA (DIT) ----------------
  quimeric_venom: {
    label: 'Veneno Quimérico',
    category: 'entropico',
    basePenetration: 0.45,
    classicStatuses: ['veneno', 'lentidao'],
    pathStatuses: ['sinergia_quimica_hibrida'],
    dotRatio: 0.20,
    dotIntervalMs: 500,
  },
  osseous_puncture: {
    label: 'Perfuração Óssea',
    category: 'fisico',
    basePenetration: 0.50,
    armorMultiplier: 1.15,
    pathStatuses: ['enxerto_osseo_permanente'],
  },
  predatory_claw: {
    label: 'Dilaceração Predatória',
    category: 'fisico',
    basePenetration: 0.30,
    classicStatuses: ['hemorragia'],
    pathStatuses: ['memoria_muscular_furtada'],
  },
  frost_bite: {
    label: 'Mordida de Inverno',
    category: 'magico',
    basePenetration: 0.40,
    classicStatuses: ['congelamento', 'lentidao'],
    pathStatuses: ['clandestino_do_permafrost'],
  },
  memory_echo: {
    label: 'Eco de Memória',
    category: 'magico',
    basePenetration: 0.55,
    pathStatuses: ['eco_cadavérico_ressonante'],
  },
  hybrid_mutation: {
    label: 'Mutação Híbrida',
    category: 'verdadeiro',
    basePenetration: 0.65,
    pathStatuses: ['sinergia_quimica_hibrida', 'tain_ykvyt_sobrecarregado'],
  },

  // ---------------- DREN / NECROSE ----------------
  rot_necrosis: {
    label: 'Podridão Necrótica',
    category: 'entropico',
    basePenetration: 0.35,
    pathStatuses: ['status_podre'],
    greyHealthRatio: 0.75,
  },
  visceral_rend: {
    label: 'Estiramento Visceral',
    category: 'fisico',
    basePenetration: 0.25,
    armorMultiplier: 1.15,
    classicStatuses: ['hemorragia'],
    pathStatuses: ['coreografia_voraz'],
  },
  tomb_weight: {
    label: 'Peso do Túmulo',
    category: 'fisico',
    basePenetration: 0.20,
    armorMultiplier: 1.30,
    classicStatuses: ['lentidao', 'atordoamento'],
    pathStatuses: ['peso_do_tumulo'],
  },
  bone_marrow_drain: {
    label: 'Drenagem de Tutano',
    category: 'entropico',
    basePenetration: 0.45,
    pathStatuses: ['divida_de_carne'],
  },
  mirror_shard: {
    label: 'Estilhaço Prismático',
    category: 'fisico',
    basePenetration: 0.55,
    classicStatuses: ['hemorragia'],
    pathStatuses: ['estilhaco_vingativo'],
  },
};

/**
 * Retorna o perfil de um tipo de dano (fallback seguro para corte físico)
 */
export function getDamageProfile(type: SpecificDamageType): DamageTypeProfile {
  return DAMAGE_TYPE_PROFILES[type] ?? DAMAGE_TYPE_PROFILES.physical_slash;
}

/**
 * Mapa de afinidade arma -> tipos de dano (cobre todas as categorias do arsenal)
 */
export const WEAPON_CATEGORY_DAMAGE_MAP: Record<string, SpecificDamageType[]> = {
  espadas: ['blade_edge'],
  martelos: ['hammer_crush', 'physical_cleave'],
  lancas: ['polearm_sweep', 'physical_pierce'],
  magicas: ['maldicao_status', 'eco_acoustic'],
  construtos: ['ballistic_pierce', 'ballistic_bolt'],
  adagas: ['rapier_thrust', 'physical_pierce'],
  foices: ['physical_slash', 'physical_cleave'],
  mangual: ['spike_impale', 'physical_blunt'],
  chicotes: ['whip_lash'],
  arremesso: ['ballistic_bolt', 'physical_pierce'],
};
