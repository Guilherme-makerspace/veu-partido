/**
 * Sistema Avançado de Tipos de Dano, Perfuração, Afinidades e Status Específicos por Caminho
 * O Véu Partido - Dark Fantasy 2.5D Hardcore RPG
 */

export type PrimaryDamageCategory = 'fisico' | 'magico' | 'entropico' | 'verdadeiro';

/**
 * Catálogo Expandido de Tipos Específicos de Dano Cobrindo Todo o Arsenal de Armas e Caminhos
 */
export type SpecificDamageType =
  // ==========================================
  // ARMAS FÍSICAS & CORPO A CORPO
  // ==========================================
  | 'physical_slash'       // Corte (Espadas, Foices, Adagas) - aplica sangramento, crítico elevado
  | 'physical_blunt'       // Esmagamento/Contundente (Martelos, Malhos, Escudos) - alta quebra de postura/stagger
  | 'physical_pierce'      // Perfuração de Estocada (Lanças, Rapiers, Baionetas) - ignora 20-40% de blindagem
  | 'physical_cleave'      // Fendimento Pesado (Machados Colossais de Dren, Montantes) - dano híbrido Slash + Blunt
  | 'physical_shatter'     // Estilhaçamento Ósseo (Armas Sísmicas, Golpes de Granito) - destrói armadura base

  // ==========================================
  // ARMAS DE LONGO ALCANCE & BALÍSTICA (DULLANT)
  // ==========================================
  | 'ballistic_pierce'     // Balas de Rifle/Sniper com alta penetração cinética (30% a 80%)
  | 'ballistic_shrapnel'   // Chumbo e Sucata de Bacamarte - dispersão cônica, stagger massivo
  | 'ballistic_concussive' // Impacto Balístico de Canhão Pesado - onda de choque e knockback no Eixo X
  | 'fissao_decay'         // Decaimento por Fissão Nuclear - dano físico de status corrosivo
  | 'radiacao_dot'         // Radiação Ionizante contínua - DoT persistente que degrada vigor celular

  // ==========================================
  // ARMAS & CONSTRUTOS MINERAIS (DULLANT & MUNDO)
  // ==========================================
  | 'crystallite_resonance' // Raio contínuo de quartzo puro / cristal de Bön - laser de dano ininterrupto
  | 'pyritic_spark'         // Faísca pirolítica de sílica férrica - micro-explosões ígneas
  | 'magnetite_disruption'  // Interferência magnética - atrai e desestabiliza inimigos blindados

  // ==========================================
  // FEITIÇARIA, MALDIÇÕES & SOM (DUJA)
  // ==========================================
  | 'maldicao_status'      // Maldição Profana - dano mágico de status com altíssima penetração (50% a 90%)
  | 'black_flame'          // Chamas Negras - dano necromântico que bloqueia 100% de cura/regeneração
  | 'eco_acoustic'         // Som Primordial e Entonação Xamânica - ignora blindagem física, atinge órgãos
  | 'entropia_pura'        // Corrupção e Ruptura do Limiar - dissolve matéria e estabilidade dimensional
  | 'blood_sacrifice'      // Magia de Sangue Visceral - converte tributo vital em dano devastador

  // ==========================================
  // ELEMENTOS ALQUÍMICOS (DUJA CÉTICA)
  // ==========================================
  | 'alchemical_fire'      // Flogisto Ígneo - queima prolongada com dano térmico cumulativo
  | 'alchemical_acid'      // Vitríolo Ácido - dissolve permanentemente porcentagem da blindagem do alvo
  | 'alchemical_ice'       // Criogenia e Sal Amoníaco - lentidão progressiva que culmina em congelamento
  | 'alchemical_shock'     // Fagulha Galvânica - dano elétrico que salta entre entidades no mesmo Eixo Y

  // ==========================================
  // MILAGRES & BEATIFICAÇÃO (DUJA IMACULADA)
  // ==========================================
  | 'radiant_holy'         // Luz Beatificada - dano radiante concentrado, triplo contra aberrações
  | 'astral_resonance'     // Vibração Purificadora - expurga corrupção de aliados e pune alvos profanos

  // ==========================================
  // INSTINTOS QUIMÉRICOS & PREDATÓRIOS (DIT)
  // ==========================================
  | 'quimeric_venom'       // Veneno de Aberração Carniceira - DoT neurológico desacelerador
  | 'osseous_puncture'     // Perfuração por Espinhos de Osso Calcificado - perfuração estática
  | 'predatory_claw'       // Dilaceração de Predador Alfa - rouba fração temporária dos status do alvo

  // ==========================================
  // NECROSE & PODRIDÃO TUMULAR (DREN)
  // ==========================================
  | 'rot_necrosis';        // Podridão Ancestral de Tana-Rambu - gera Vida Cinza cumulativa

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

  // ========================================================
  // DREN - CAMINHO ESPELHADO (Guerreiro Prismático & Parries)
  // ========================================================
  | 'carapaca_prismatica'     // Acúmulo de parries perfeitos. Reflete 150% de dano e projéteis de volta.
  | 'escudo_de_refracao'      // Converte dano bloqueado em barreira protetora que absorve o próximo golpe.
  | 'estilhaco_vingativo'     // Ao quebrar a guarda do inimigo, emite cacos de espelho perfurantes no Eixo X e Y.

  // ========================================================
  // DUJA - CAMINHO MALDITO (Feitiçaria Visceral & Chamas Negras)
  // ========================================================
  | 'maldicao_visceral'       // Stacka de 1 a 10x. Ignora 50-90% de defesa mágica. No 10º stack: Implosão de Alma (300% dano AoE).
  | 'chamas_negras'           // Fogo negro profano que BLOQUEIA 100% de cura/regeneração e queima a vida continuamente.
  | 'desespero_sonico'        // Grito xamânico que silencia habilidades de elite e reduz precisão em 40%.
  | 'sangue_maculado'         // Sacrifica o próprio HP para aumentar o poder de penetração mágica de todas as magias.

  // ========================================================
  // DUJA - CAMINHO IMACULADO (Entonação Beatificada & Sacralidade)
  // ========================================================
  | 'beatificacao_ressonante' // Stacka em aliados até 7x. No 7º stack: explosão de cura em área e dano radiante sagrado.
  | 'manto_de_luz_purificante'// Aliado regenera Eco continuamente e fica imune a aflições de Entropia.
  | 'estigma_santo'           // Marca um inimigo: todo dano causado a ele por qualquer jogador cura o atacante em 8%.

  // ========================================================
  // DUJA - CAMINHO CÉTICO (Alquimia, Reagentes & Transmutação)
  // ========================================================
  | 'saturacao_alquimica'     // Stacka reagentes (1 a 5x). No 5º stack detona em reação elementar catastrófica.
  | 'corrosao_vitriolica'     // Ácido que derrete 8% de defesa física e mágica a cada segundo.
  | 'flogisto_incandescente'  // O chão da arena queima sob os pés do alvo, punindo deslocamentos no Eixo X e Y.
  | 'hipotermia_criogenica'   // Reduz velocidade de ataque e cast time em até 60%; congela em 3 stacks.

  // ========================================================
  // DULLANT - DUELISTA ECO (Arcos Mágicos, Fios de Luz & Ressonância)
  // ========================================================
  | 'estilhacamento_radiante' // Disparos de quartzo criam estilhaços luminosos que causam dano em cadeia em alvos próximos.
  | 'fio_de_ressonancia'      // Conecta dois alvos: 50% de todo dano aplicado a um é duplicado no outro.
  | 'harmonia_de_bon'         // Tiros contínuos sem errar aumentam cadência de disparo e restauram Eco da dupla.

  // ========================================================
  // DULLANT - DUELISTA FRATURA (Snipers, Canhões, Urânio & Fissão)
  // ========================================================
  | 'decaimento_fissao'       // Corrosão atômica contínua; degrada resistência física e quebra super-armadura.
  | 'irradiacao_celular'      // Reduz o dano do alvo em 20% e impede que ele regenere postura de guarda.
  | 'mira_de_precisao_extrema'// Estado estático que eleva penetração de armadura de 30% para 80% e garante crítico.
  | 'onda_de_concussao'       // Disparos à queima-roupa empurram qualquer entidade para trás no Eixo X com atordoamento.

  // ========================================================
  // DIT - METAMORFO MÚLTIPLO (Arsenal de Memórias & Roubo de Almas)
  // ========================================================
  | 'memoria_muscular_furtada'// Bônus temporário acumulado ao matar e copiar os movesets do cadáver inimigo.
  | 'eco_cadavérico_ressonante'// Ao alternar entre corpos armazenados, solta uma explosão do elemento do corpo anterior.
  | 'sinergia_quimica_hibrida'// Dit combina os tipos de dano do corpo atual com o tipo de dano do corpo anterior.

  // ========================================================
  // DIT - METAMORFO EVOLUTIVO (Quimera Permanente & Órgãos Enxertados)
  // ========================================================
  | 'enxerto_osseo_permanente'// Bônus passivo acumulativo de Fratura e Limiar conquistado a cada 5 mortes de elite.
  | 'carapaca_quitinosa'      // Concede hiper-armadura passiva contra ataques leves.
  | 'frenesi_predatorio_alfa' // Ao atingir menos de 25% de vida, entra em fúria quimérica com 40% de velocidade de ataque e roubo de vida.

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
