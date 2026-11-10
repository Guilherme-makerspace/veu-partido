/**
 * Sistema Avançado de Tipos de Dano, Perfuração, Afinidades e Status Específicos por Caminho
 * O Véu Partido - Dark Fantasy 2.5D Hardcore RPG
 */

export type PrimaryDamageCategory = 'fisico' | 'magico' | 'entropico' | 'verdadeiro';

/**
 * Catálogo Expandido de Tipos Específicos de Dano Cobrindo TODO o Arsenal de Armas,
 * Construtos, Feitiçaria, Alquimia, Milagres e Instintos Quiméricos.
 *
 * Convenção: cada tipo carrega um "flavor" mecânico que o DamageSystem traduz em:
 * penetração base, efeito elemental padrão, status clássico e/ou status de caminho.
 */
export type SpecificDamageType =
  // ==========================================
  // ARMAS FÍSICAS & CORPO A CORPO
  // ==========================================
  | 'physical_slash'        // Corte (Espadas, Foices, Adagas) - aplica sangramento, crítico elevado
  | 'physical_blunt'        // Esmagamento/Contundente (Martelos, Malhos, Escudos) - alta quebra de postura/stagger
  | 'physical_pierce'       // Perfuração de Estocada (Lanças, Rapiers, Baionetas) - ignora 20-40% de blindagem
  | 'physical_cleave'       // Fendimento Pesado (Machados Colossais de Dren, Montantes) - dano híbrido Slash + Blunt
  | 'physical_shatter'      // Estilhaçamento Ósseo (Armas Sísmicas, Golpes de Granito) - destrói armadura base

  // --- Especificidades por Família de Arma Branca (cobertura total do catálogo) ---
  | 'blade_edge'            // Fio de Espada/Katana/Glaive - sangramento limpo e precisão
  | 'rapier_thrust'         // Estocada de Rapieira/Florete - velocidade de golpe e perfuração fina
  | 'axe_frenzy'            // Fúria de Machado - escalada de dano por hits contínuos
  | 'hammer_crush'          // Esmagamento de Malho/Marreta - stagger e quebra de guarda
  | 'spike_impale'          // Empalação de Estrela da Manhã/Mangual - sangramento + fratura
  | 'polearm_sweep'         // Varredura de Lança/Alabarda/Naginata - atinge múltiplos alvos no Eixo Y
  | 'harpoon_drag'          // Arpão / Pique de Vácuo - puxa o alvo e rompe distância
  | 'whip_lash'             // Chicote / Lâmina de Vime - múltiplos acertos rápidos
  | 'gauntlet_impact'       // Punho Reforçado / Soqueira - contusão pura sem lâmina

  // ==========================================
  // ARMAS DE LONGO ALCANCE & BALÍSTICA (DULLANT)
  // ==========================================
  | 'ballistic_pierce'      // Balas de Rifle/Sniper com alta penetração cinética (30% a 80%)
  | 'ballistic_shrapnel'    // Chumbo e Sucata de Bacamarte - dispersão cônica, stagger massivo
  | 'ballistic_concussive'  // Impacto Balístico de Canhão Pesado - onda de choque e knockback no Eixo X
  | 'ballistic_bolt'        // Dardo de Besta/Arco - perfuração leve e cadência
  | 'ballistic_arrow'       // Flecha de Arco Longo - trajetória estável e sangramento
  | 'fissao_decay'          // Decaimento por Fissão Nuclear - dano físico de status corrosivo
  | 'radiacao_dot'          // Radiação Ionizante contínua - DoT persistente que degrada vigor celular

  // ==========================================
  // ARMAS & CONSTRUTOS MINERAIS (DULLANT & MUNDO)
  // ==========================================
  | 'crystallite_resonance' // Raio contínuo de quartzo puro / cristal de Bön - laser de dano ininterrupto
  | 'pyritic_spark'         // Faísca pirolítica de sílica férrica - micro-explosões ígneas
  | 'magnetite_disruption'  // Interferência magnética - atrai e desestabiliza inimigos blindados
  | 'obsidian_shear'        // Lâmina de obsidiana - corte vítreo que causa cortes profundos
  | 'lead_toxicity'         // Chumbo líquido / bacamarte - envenenamento por metal pesado

  // ==========================================
  // FEITIÇARIA, MALDIÇÕES & SOM (DUJA)
  // ==========================================
  | 'maldicao_status'      // Maldição Profana - dano mágico de status com altíssima penetração (50% a 90%)
  | 'black_flame'          // Chamas Negras - dano necromântico que bloqueia 100% de cura/regeneração
  | 'eco_acoustic'         // Som Primordial e Entonação Xamânica - ignora blindagem física, atinge órgãos
  | 'entropia_pura'        // Corrupção e Ruptura do Limiar - dissolve matéria e estabilidade dimensional
  | 'blood_sacrifice'      // Magia de Sangue Visceral - converte tributo vital em dano devastador
  | 'hex_whisper'          // Sussurro Amaldiçoado / Códice - debilita a mente e reduz dano inimigo
  | 'curse_detonation'     // Exorcismo que implode aflições acumuladas em onda de choque

  // ==========================================
  // ELEMENTOS ALQUÍMICOS (DUJA CÉTICA)
  // ==========================================
  | 'alchemical_fire'      // Flogisto Ígneo - queima prolongada com dano térmico cumulativo
  | 'alchemical_acid'      // Vitríolo Ácido - dissolve permanentemente porcentagem da blindagem do alvo
  | 'alchemical_ice'       // Criogenia e Sal Amoníaco - lentidão progressiva que culmina em congelamento
  | 'alchemical_shock'     // Fagulha Galvânica - dano elétrico que salta entre entidades no mesmo Eixo Y
  | 'alchemical_poison'    // Veneno destilado (nymphea, mercúrio) - DoT que empilha toxinas
  | 'alchemical_plasma'    // Plasma de cinábrio - explosão incandescente que deixa fogo no solo
  | 'alchemical_mist'      // Névoa de enxofre / incenso - zona de densidade que cega e desacelera

  // ==========================================
  // MILAGRES & BEATIFICAÇÃO (DUJA IMACULADA)
  // ==========================================
  | 'radiant_holy'         // Luz Beatificada - dano radiante concentrado, triplo contra aberrações
  | 'astral_resonance'     // Vibração Purificadora - expurga corrupção de aliados e pune alvos profanos
  | 'sacral_ward'          // Selo Sacro de proteção - escudo luminoso que absorve o próximo golpe
  | 'spirit_blight'        // Punição de almas profanas - punição contínua a quem carrega corrupção

  // ==========================================
  // INSTINTOS QUIMÉRICOS & PREDATÓRIOS (DIT)
  // ==========================================
  | 'quimeric_venom'       // Veneno de Aberração Carniceira - DoT neurológico desacelerador
  | 'osseous_puncture'     // Perfuração por Espinhos de Osso Calcificado - perfuração estática
  | 'predatory_claw'       // Dilaceração de Predador Alfa - rouba fração temporária dos status do alvo
  | 'frost_bite'           // Mordida de Inverno - dano de gelo com hipotermia e redução de cadência
  | 'memory_echo'          // Eco de Memória roubada - repete parcialmente o último golpe do corpo armazenado
  | 'hybrid_mutation'      // Mutação híbrida estável - soma dois tipos elementais de corpos distintos

  // ==========================================
  // NECROSE & PODRIDÃO TUMULAR (DREN)
  // ==========================================
  | 'rot_necrosis'         // Podridão Ancestral de Tana-Rambu - gera Vida Cinza cumulativa
  | 'visceral_rend'        // Estiramento Visceral - rasgo que devolve vida ao atacante
  | 'tomb_weight'          // Peso do Túmulo - esmagamento que lentifica e prende o alvo
  | 'bone_marrow_drain'    // Drenagem de Tutano - rouba vigor e alimenta a couraça
  | 'mirror_shard';        // Estilhaço Prismático - reflexo perfurante dos parries espelhados

/**
 * Componente individual de dano que compõe um golpe híbrido
 */
export interface DamageComponent {
  type: SpecificDamageType;
  baseAmount: number;
  penetrationRatio: number; // Fração ignorada de armadura/resistência (ex: 0.30 a 0.80 para Dullant, 0.50 a 0.90 para Maldição)
  scalingStat?: 'fratura' | 'pulso' | 'eco' | 'veu' | 'limiar';
}

/**
 * Metadados mecânicos de cada tipo específico de dano.
 * Usado pelo DamageSystem para resolver mitigação, status clássicos, status de caminho e efeitos extras.
 */
export interface DamageTypeProfile {
  label: string;
  category: PrimaryDamageCategory;
  /** Fração de armadura ignorada por padrão quando a arma não informa penetração */
  basePenetration: number;
  /** Multiplicador de dano contra alvos com armadura/postura elevada */
  armorMultiplier?: number;
  /** Status clássicos (StatusEffectType) aplicados no impacto */
  classicStatuses?: string[];
  /** Status exclusivos de caminho aplicados no impacto */
  pathStatuses?: PathSpecificStatusType[];
  /** Fração do dano convertida em Vida Cinza (exclusivo das fontes de Podridão) */
  greyHealthRatio?: number;
  /** Ativa bloqueio de cura (Chamas Negras) */
  antiHeal?: boolean;
  /** Causa dano contínuo (DoT) após o impacto, fração do dano mitigado */
  dotRatio?: number;
  /** Intervalo do DoT em ms */
  dotIntervalMs?: number;
}

/**
 * TODOS OS STATUS ESPECÍFICOS POR CAMINHO, SUB-CAMINHO E HABILIDADE (Módulo 16 e Expansões)
 */
export type PathSpecificStatusType =
  // ========================================================
  // DREN - CAMINHO CORCOVADO (Mártir Titânico & Necrose)
  // ========================================================
  | 'status_podre'            // Vida Cinza cumulativa no alvo! Enfraquece ataque até -30%, aumenta dano recebido em até +30%. Se vida ficar 100% cinza, aplica DoT de necrose severa.
  | 'divida_de_carne'         // Dren converte dano sofrido em dívida de vida; perde HP máx logaritmicamente mas ganha Estiramento (Lifesteal extremo).
  | 'peso_do_tumulo'          // Reduz velocidade de movimento e impede dashes de alvos pesados atingidos.
  | 'frenesi_cadavérico'      // Ao derrotar um inimigo podre, Dren ganha armadura titânica inabalável por 4s.
  | 'ossos_de_tau_tau'        // Sub-caminho: couraça de madeira esculpida absorve 12% do dano físico de cada golpe recebido.
  | 'marca_do_nicho'          // Sub-caminho: nicho funerário marcado no chão; alvos sobre ele perdem 10% de defesa e 15% de cadência.
  | 'coreografia_voraz'       // Sub-caminho: cada esmagamento consecutivo no mesmo alvo aumenta o lifesteal em 6% (até 30%).

  // ========================================================
  // DREN - CAMINHO ESPELHADO (Guerreiro Prismático & Parries)
  // ========================================================
  | 'carapaca_prismatica'     // Acúmulo de parries perfeitos. Reflete 150% de dano e projéteis de volta.
  | 'escudo_de_refracao'      // Converte dano bloqueado em barreira protetora que absorve o próximo golpe.
  | 'estilhaco_vingativo'     // Ao quebrar a guarda do inimigo, emite cacos de espelho perfurantes no Eixo X e Y.
  | 'postura_de_parry_pesado' // Sub-caminho: janela de parry +40%, parry perfeito desfere contra-ataque automático de 60% do dano.
  | 'guarda_espelhada'        // Sub-caminho: enquanto defende, reflete 25% do dano de projéteis e 10% de corpo a corpo.
  | 'desafio_do_duelista'     // Sub-caminho: provoca o alvo; ele causa -15% de dano a outros, mas +25% a você.

  // ========================================================
  // DUJA - CAMINHO MALDITO (Feitiçaria Visceral & Chamas Negras)
  // ========================================================
  | 'maldicao_visceral'       // Stacka de 1 a 10x. Ignora 50-90% de defesa mágica. No 10º stack: Implosão de Alma (300% dano AoE).
  | 'chamas_negras'           // Fogo negro profano que BLOQUEIA 100% de cura/regeneração e queima a vida continuamente.
  | 'desespero_sonico'        // Grito xamânico que silencia habilidades de elite e reduz precisão em 40%.
  | 'sangue_maculado'         // Sacrifica o próprio HP para aumentar o poder de penetração mágica de todas as magias.
  | 'pacto_do_sino'          // Sub-caminho: pacto visível no HUD; +20% dano de maldição, mas você recebe 10% mais dano.
  | 'exorcismo_implosivo'     // Sub-caminho: o próximo golpe detona TODAS as aflições do alvo em dano de choque (maldição + chamas negras).
  | 'trilha_de_cinzas'        // Sub-caminho: onde a Duja pisa, o chão amaldiçoado queima inimigos por 4s (dano de chamas negras).

  // ========================================================
  // DUJA - CAMINHO IMACULADO (Entonação Beatificada & Sacralidade)
  // ========================================================
  | 'beatificacao_ressonante' // Stacka em aliados até 7x. No 7º stack: explosão de cura em área e dano radiante sagrado.
  | 'manto_de_luz_purificante'// Aliado regenera Eco continuamente e fica imune a aflições de Entropia.
  | 'estigma_santo'           // Marca um inimigo: todo dano causado a ele por qualquer jogador cura o atacante em 8%.
  | 'salmo_de_estase'         // Sub-caminho: zera a velocidade do alvo por 1.2s ao cantar (sem dano imediato).
  | 'veluto_de_eco'           // Sub-caminho: reverte 1 Vida Cinza a cada segundo em aliados próximos (contra-podridão).
  | 'santuario_errante'       // Sub-caminho: zona sagrada móvel que remove debuffs e reduz 15% do dano mágico recebido.

  // ========================================================
  // DUJA - CAMINHO CÉTICO (Alquimia, Reagentes & Transmutação)
  // ========================================================
  | 'saturacao_alquimica'     // Stacka reagentes (1 a 5x). No 5º stack detona em reação elementar catastrófica.
  | 'corrosao_vitriolica'     // Ácido que derrete 8% de defesa física e mágica a cada segundo.
  | 'flogisto_incandescente'  // O chão da arena queima sob os pés do alvo, punindo deslocamentos no Eixo X e Y.
  | 'hipotermia_criogenica'   // Reduz velocidade de ataque e cast time em até 60%; congela em 3 stacks.
  | 'marionete_de_lama'       // Sub-caminho: invoca homúnculo que provoca os inimigos por 6s e explode em ácido.
  | 'destilado_de_cinabrio'   // Sub-caminho: a próxima poção/habilidade concede +25% de dano elementar por 8s.
  | 'reacao_em_cadeia'        // Sub-caminho: reações elementares entre alvos saturados espalham metade do dano aos vizinhos.

  // ========================================================
  // DULLANT - DUELISTA ECO (Arcos Mágicos, Fios de Luz & Ressonância)
  // ========================================================
  | 'estilhacamento_radiante' // Disparos de quartzo criam estilhaços luminosos que causam dano em cadeia em alvos próximos.
  | 'fio_de_ressonancia'      // Conecta dois alvos: 50% de todo dano aplicado a um é duplicado no outro.
  | 'harmonia_de_bon'         // Tiros contínuos sem errar aumentam cadência de disparo e restauram Eco da dupla.
  | 'acorde_de_quartzo'       // Sub-caminho: três disparos alinhados no mesmo alvo disparam um acorde que atordoa 0.8s.
  | 'postura_de_atirador'     // Sub-caminho: ficar parado 1s concede +30% de penetração e crítico garantido no próximo tiro.
  | 'veia_de_eco'             // Sub-caminho: cada acerto no ponto fraco devolve 4 de Eco e 2% da vida do aliado.

  // ========================================================
  // DULLANT - DUELISTA FRATURA (Snipers, Canhões, Urânio & Fissão)
  // ========================================================
  | 'decaimento_fissao'       // Corrosão atômica contínua; degrada resistência física e quebra super-armadura.
  | 'irradiacao_celular'      // Reduz o dano do alvo em 20% e impede que ele regenere postura de guarda.
  | 'mira_de_precisao_extrema'// Estado estático que eleva penetração de armadura de 30% para 80% e garante crítico.
  | 'onda_de_concussao'       // Disparos à queima-roupa empurram qualquer entidade para trás no Eixo X com atordoamento.
  | 'estilhaco_de_granito'    // Sub-caminho: canhão de granito levanta pedras; alvos atingidos ficam lentos e expostos (Fragilidade).
  | 'bomba_de_chumbo'         // Sub-caminho: bacamarte deixa chumbo incandescente no solo queima e envenena por 3s.
  | 'olho_do_bon'             // Sub-caminho: feixe orbital contínuo que perfura tudo em linha reta e marca o alvo (crítico aumentado).

  // ========================================================
  // DIT - METAMORFO MÚLTIPLO (Arsenal de Memórias & Roubo de Almas)
  // ========================================================
  | 'memoria_muscular_furtada'// Bônus temporário acumulado ao matar e copiar os movesets do cadáver inimigo.
  | 'eco_cadavérico_ressonante'// Ao alternar entre corpos armazenados, solta uma explosão do elemento do corpo anterior.
  | 'sinergia_quimica_hibrida'// Dit combina os tipos de dano do corpo atual com o tipo de dano do corpo anterior.
  | 'tain_ykvyt_sobrecarregado' // Sub-caminho: acumula 3 matrizes simultâneas, ganhando +8% de dano por matriz de elemento distinto.
  | 'mimetismo_perfeito'      // Sub-caminho: após matar, o próximo ataque replica o golpe letal do inimigo abatido (dano dobrado).
  | 'troca_de_pele'           // Sub-caminho: trocar de corpo limpa debuffs de Entropia e concede 0.6s de intangibilidade.

  // ========================================================
  // DIT - METAMORFO EVOLUTIVO (Quimera Permanente & Órgãos Enxertados)
  // ========================================================
  | 'enxerto_osseo_permanente'// Bônus passivo acumulativo de Fratura e Limiar conquistado a cada 5 mortes de elite.
  | 'carapaca_quitinosa'      // Concede hiper-armadura passiva contra ataques leves.
  | 'frenesi_predatorio_alfa' // Ao atingir menos de 25% de vida, entra em fúria quimérica com 40% de velocidade de ataque e roubo de vida.
  | 'clandestino_do_permafrost' // Sub-caminho: mutação de resistência ao frio; imune a hipotermia e lentidão.
  | 'espinhos_de_osso_gelido' // Sub-caminho: ataques recebidos reverberam 12% do dano em perfuração óssea no atacante.
  | 'predador_da_cadeia'      // Sub-caminho: cada abate aumenta permanentemente o dano predatório em 1% (até 25%) na arena.

/**
 * Instância ativa de um Status de Caminho aplicada em uma entidade
 */
export interface PathStatusInstance {
  type: PathSpecificStatusType;
  stacks: number;
  maxStacks: number;
  durationMs: number;
  elapsedMs: number;
  tickTimerMs: number;
  potency: number;           // Valor base do efeito (dano do DoT, % de redução, cura, etc.)
  penetration: number;       // Penetração de armadura/resistência deste status (ex: 0.50 a 0.90)
  sourceCharacterId?: string;// Ex: 'dren', 'duja', 'dullant', 'dit'
  extraData?: {
    greyHealthAmount?: number;   // Quantidade de Vida Cinza acumulada (Podridão do Dren)
    antiHealRatio?: number;      // 1.0 = bloqueio total de cura (Chamas Negras)
    reflectedDamageRatio?: number; // Para parry prismático
    elementalType?: SpecificDamageType;
    linkedTargetId?: string;     // Fio de Ressonância de Dullant
    directionX?: number;         // Empurrão (onda de concussão)
    silenceElite?: boolean;      // Desespero Sônico
  };
}

/**
 * Estrutura de Vida Cinza (Grey Health) gerada exclusivamente pela Podridão de Dren
 */
export interface GreyHealthState {
  currentGreyHp: number;       // Vida Cinza acumulada no monstro
  maxHp: number;               // Vida total do monstro
  rotDebuffRatio: number;      // Redução de ataque do inimigo (0.00 a 0.30 - max 30%)
  rotVulnerabilityRatio: number;// Bônus de dano recebido pelo inimigo dos heróis (0.00 a 0.30 - max 30%)
  isFullyRotten: boolean;      // Verdadeiro quando toda a vida restante é cinza (Inicia DoT de colapso)
  decayDotTimerMs: number;     // Temporizador do DoT de necrose quando está totalmente podre
}

/**
 * Regras numéricas da Vida Cinza (Podridão de Dren).
 * O buff máximo é 30% e somente o Dren pode infligir Vida Cinza.
 *
 * - Vida cinza + vida vermelha: inimigo causa menos dano e recebe mais dano, escalando
 *   proporcionalmente à fração de vida cinza (teto de 30%).
 * - Vida 100% cinza: falência necrótica, o inimigo começa a tomar dano over time.
 */
export const GREY_HEALTH_RULES = {
  /** Tamanho do acúmulo aplicado por "stack" de podridão (marcador para UI/tuning) */
  STACK_SIZE: 25,
  /** Teto de cada lado (redução de dano causado / aumento de dano recebido) */
  MAX_ROT_PERCENT: 0.30,
  /** Fração da vida máxima perdida por segundo quando o alvo está 100% cinza */
  FULL_ROT_DPS: 0.06,
  /** Intervalo do tick do colapso necrótico */
  FULL_ROT_TICK_MS: 1000,
  /** Fração da Vida Cinza convertida em dano real a cada tick de necrose */
  FULL_ROT_GREY_BURN_RATIO: 0.15,
  /** Vida Cinza mínima reinjetada por um golpe de podridão (garante permeabilidade) */
  MIN_GREY_PER_HIT: 3,
  /** Fração da vida cinza removida por cada ponto de cura efetiva */
  HEAL_GREY_REMOVAL_RATIO: 0.5,
} as const;
