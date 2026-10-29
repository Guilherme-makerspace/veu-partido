import { ItemRarity, RarityConfig, WeaponCategory, WeaponItem } from '../types';

/**
 * Tabela de Raridades e Multiplicadores conforme Módulos 5.1 e 14.2
 */
export const RARITY_CONFIGS: Record<ItemRarity, RarityConfig> = {
  comum: {
    name: 'comum',
    multiplier: 1.1,
    colorHex: '#9ca3af',
    colorNumber: 0x9ca3af,
  },
  incomum: {
    name: 'incomum',
    multiplier: 1.5,
    colorHex: '#22c55e',
    colorNumber: 0x22c55e,
  },
  raro: {
    name: 'raro',
    multiplier: 2.0,
    colorHex: '#3b82f6',
    colorNumber: 0x3b82f6,
  },
  epico: {
    name: 'epico',
    multiplier: 2.5,
    colorHex: '#a855f7',
    colorNumber: 0xa855f7,
  },
  lendario: {
    name: 'lendario',
    multiplier: 3.0,
    colorHex: '#f59e0b',
    colorNumber: 0xf59e0b,
  },
};

/**
 * Arsenal de Armas e Construtos de O Véu Partido (Módulo 15)
 */
export const WEAPONS_DATABASE: WeaponItem[] = [
  // CATEGORIA 1: ESPADAS (1 a 15) - Foco: Véu / Corte
  { id: 'w01_gladio_ferro', name: 'Gládio de Ferro', category: 'espadas', rarity: 'comum', baseDamage: 12, description: 'Arma padrão. Sem efeitos bônus.', weightCategory: 'medio' },
  { id: 'w02_cimitarra_deserto', name: 'Cimitarra do Deserto', category: 'espadas', rarity: 'incomum', baseDamage: 15, description: 'Aumenta a distância do Dash em 15%.', weightCategory: 'leve' },
  { id: 'w03_rapieira_prata', name: 'Rapieira de Prata', category: 'espadas', rarity: 'incomum', baseDamage: 14, description: 'Ataques de estocada ignoram 10% da defesa física.', weightCategory: 'leve' },
  { id: 'w04_katana_cinzas', name: 'Katana de Cinzas', category: 'espadas', rarity: 'raro', baseDamage: 18, description: 'O primeiro ataque após um Dash causa 50% de dano extra.', weightCategory: 'leve' },
  { id: 'w05_espada_larga_estilhacada', name: 'Espada Larga Estilhaçada', category: 'espadas', rarity: 'raro', baseDamage: 22, description: 'Ataques pesados lançam estilhaços cobrindo 50px do Eixo Y.', weightCategory: 'medio' },
  { id: 'w06_lamina_mercurio', name: 'Lâmina de Mercúrio', category: 'espadas', rarity: 'raro', baseDamage: 17, description: 'Acertos consecutivos aumentam velocidade de ataque em 2% (acumula 5x).', weightCategory: 'leve' },
  { id: 'w07_montante_guardiao', name: 'Montante do Guardião', category: 'espadas', rarity: 'epico', baseDamage: 26, description: 'Aumenta a Postura em 20% enquanto o jogador está parado.', weightCategory: 'pesado' },
  { id: 'w08_sabre_pirata_veu', name: 'Sabre do Pirata de Véu', category: 'espadas', rarity: 'epico', baseDamage: 21, description: 'Inimigos abatidos têm 10% de chance de dropar o dobro de Eco.', weightCategory: 'leve' },
  { id: 'w09_espada_curta_runica', name: 'Espada Curta Rúnica', category: 'espadas', rarity: 'incomum', baseDamage: 16, description: 'Recupera 2 pontos de Eco a cada golpe crítico.', weightCategory: 'leve' },
  { id: 'w10_kopis_bronze', name: 'Kopis de Bronze', category: 'espadas', rarity: 'comum', baseDamage: 13, description: 'Causa 15% de dano adicional contra inimigos do tipo Fera.', weightCategory: 'medio' },
  { id: 'w11_alfange_mare', name: 'Alfange da Maré', category: 'espadas', rarity: 'raro', baseDamage: 19, description: 'O terceiro golpe do combo empurra os inimigos 100px para trás no Eixo X.', weightCategory: 'medio' },
  { id: 'w12_zweihander_chumbo', name: 'Zweihander de Chumbo', category: 'espadas', rarity: 'epico', baseDamage: 28, description: 'Reduz velocidade de movimento, mas concede imunidade a atordoamento.', weightCategory: 'pesado' },
  { id: 'w13_lamina_vento', name: 'Lâmina de Vento', category: 'espadas', rarity: 'epico', baseDamage: 23, description: 'Lança foice de ar que atravessa 3 inimigos em linha reta.', weightCategory: 'leve' },
  { id: 'w14_corta_almas', name: 'Corta-Almas', category: 'espadas', rarity: 'epico', baseDamage: 24, description: 'Causa dano direto na barra de Eco dos inimigos impedindo habilidades.', weightCategory: 'medio' },
  { id: 'w15_espada_kallyadranoch', name: 'Espada de Kallyadranoch', category: 'espadas', rarity: 'lendario', baseDamage: 35, description: 'Cria trilha de vidro vulcânico que causa Veneno de Sílica.', weightCategory: 'pesado' },

  // CATEGORIA 2: MARTELOS E MACHADOS (16 a 30) - Foco: Fratura / Impacto (Exclusivo Dren & Pesadas)
  { id: 'w16_malho_carga', name: 'Malho de Carga', category: 'martelos', rarity: 'comum', baseDamage: 18, description: 'Ataques pesados carregam 20% mais rápido.', weightCategory: 'pesado' },
  { id: 'w17_machado_batalha', name: 'Machado de Batalha', category: 'martelos', rarity: 'incomum', baseDamage: 22, description: 'Aumenta o dano de Sangramento causado por outras fontes em 10%.', weightCategory: 'pesado' },
  { id: 'w18_marreta_demolicao', name: 'Marreta de Demolição', category: 'martelos', rarity: 'incomum', baseDamage: 24, description: 'Causa 3x dano em objetos destrutíveis e escudos de madeira.', weightCategory: 'pesado' },
  { id: 'w19_mangual_estrelado', name: 'Mangual Estrelado', category: 'martelos', rarity: 'raro', baseDamage: 25, description: 'Ignora bônus de defesa de inimigos que usam escudos.', weightCategory: 'pesado' },
  { id: 'w20_martelo_juiz', name: 'Martelo de Juiz', category: 'martelos', rarity: 'raro', baseDamage: 26, description: 'Críticos deixam o inimigo Lento por 3 segundos.', weightCategory: 'pesado' },
  { id: 'w21_machado_duplo', name: 'Machado Duplo', category: 'martelos', rarity: 'raro', baseDamage: 27, description: 'Ataque carregado é um giro de 360 graus que limpa o Eixo Y ao redor.', weightCategory: 'pesado' },
  { id: 'w22_quebra_cranios', name: 'Quebra-Crânios', category: 'martelos', rarity: 'epico', baseDamage: 30, description: 'Aumenta o dano de finalização em 25%.', weightCategory: 'pesado' },
  { id: 'w23_maca_inquisidor', name: 'Maça do Inquisidor', category: 'martelos', rarity: 'incomum', baseDamage: 21, description: 'Causa dano sagrado extra em inimigos com alta Corrupção.', weightCategory: 'pesado' },
  { id: 'w24_martelo_vapor', name: 'Martelo de Vapor', category: 'martelos', rarity: 'raro', baseDamage: 25, description: 'Ao defender, libera nuvem que reduz a precisão dos inimigos próximos.', weightCategory: 'pesado' },
  { id: 'w25_machado_gelo_negro', name: 'Machado de Gelo Negro', category: 'martelos', rarity: 'epico', baseDamage: 29, description: 'Reduz a regeneração de fôlego do inimigo ao atingir.', weightCategory: 'pesado' },
  { id: 'w26_grande_malho_pedra', name: 'Grande Malho de Pedra', category: 'martelos', rarity: 'epico', baseDamage: 34, description: 'Requer 40 Fratura; cada golpe treme o chão levemente.', weightCategory: 'pesado' },
  { id: 'w27_estrela_manha', name: 'Estrela da Manhã', category: 'martelos', rarity: 'epico', baseDamage: 31, description: 'Aplica Sangramento e Fragilidade simultaneamente no golpe crítico.', weightCategory: 'pesado' },
  { id: 'w28_machado_execucao', name: 'Machado de Execução', category: 'martelos', rarity: 'epico', baseDamage: 33, description: 'Se o inimigo tiver menos de 10% de vida, o ataque pesado o elimina.', weightCategory: 'pesado' },
  { id: 'w29_martelo_sismico', name: 'Martelo Sísmico', category: 'martelos', rarity: 'epico', baseDamage: 32, description: 'Impacto no chão cria onda que derruba inimigos leves.', weightCategory: 'pesado' },
  { id: 'w30_esmagador_mundos', name: 'O Esmagador de Mundos', category: 'martelos', rarity: 'lendario', baseDamage: 45, description: 'Ativo: Golpeia o chão e congela todos os inimigos na tela por 1s.', weightCategory: 'pesado' },

  // CATEGORIA 3: LANÇAS E HASTES (31 a 45) - Foco: Véu e Limiar / Alcance
  { id: 'w31_lanca_caca', name: 'Lança de Caça', category: 'lancas', rarity: 'comum', baseDamage: 14, description: 'Aumenta dano contra inimigos longe (ponta da lança).', weightCategory: 'medio' },
  { id: 'w32_pique_falange', name: 'Pique de Falange', category: 'lancas', rarity: 'incomum', baseDamage: 17, description: 'Ganha 15% de defesa frontal durante a animação de ataque.', weightCategory: 'pesado' },
  { id: 'w33_tridente_real', name: 'Tridente Real', category: 'lancas', rarity: 'raro', baseDamage: 20, description: 'Ataque estocado atinge 3 vezes em rápida sucessão.', weightCategory: 'medio' },
  { id: 'w34_glaive_lotus', name: 'Glaive de Lótus', category: 'lancas', rarity: 'raro', baseDamage: 21, description: 'Aumenta a área de corte lateral no Eixo Y.', weightCategory: 'medio' },
  { id: 'w35_lanca_luz', name: 'Lança de Luz', category: 'lancas', rarity: 'incomum', baseDamage: 18, description: 'Ataques deixam rastro luminoso que brilha no escuro.', weightCategory: 'medio' },
  { id: 'w36_arpao_sangue', name: 'Arpão de Sangue', category: 'lancas', rarity: 'raro', baseDamage: 22, description: 'Puxa o inimigo atingido 50px na direção do jogador.', weightCategory: 'pesado' },
  { id: 'w37_pique_cristal', name: 'Pique de Cristal', category: 'lancas', rarity: 'epico', baseDamage: 25, description: 'Ao atingir o chão, cria cristal que explode após 2 segundos.', weightCategory: 'medio' },
  { id: 'w38_lanca_vime', name: 'Lança de Vime', category: 'lancas', rarity: 'comum', baseDamage: 12, description: 'Recupera 10% de fôlego mais rápido enquanto equipada.', weightCategory: 'leve' },
  { id: 'w39_lanca_sombria', name: 'Lança Sombria', category: 'lancas', rarity: 'epico', baseDamage: 26, description: 'Pode atingir inimigos invisíveis ou dentro do Véu.', weightCategory: 'medio' },
  { id: 'w40_alabarda_ouro', name: 'Alabarda de Ouro', category: 'lancas', rarity: 'epico', baseDamage: 27, description: 'Dano aumenta conforme a quantidade de Eco que o jogador possui.', weightCategory: 'pesado' },
  { id: 'w41_lanca_eletrica', name: 'Lança Elétrica', category: 'lancas', rarity: 'raro', baseDamage: 23, description: 'O terceiro golpe encadeia raio que atinge segundo alvo próximo.', weightCategory: 'medio' },
  { id: 'w42_naginata_seda', name: 'Naginata de Seda', category: 'lancas', rarity: 'epico', baseDamage: 24, description: 'Aumenta os I-frames do Dash em 20%.', weightCategory: 'leve' },
  { id: 'w43_lanca_cinzas', name: 'Lança de Cinzas', category: 'lancas', rarity: 'incomum', baseDamage: 19, description: 'Cria cortina de fumaça que oculta o jogador por 1s após combo.', weightCategory: 'leve' },
  { id: 'w44_pique_vacuo', name: 'Pique do Vácuo', category: 'lancas', rarity: 'epico', baseDamage: 26, description: 'Suga fragmentos de Eco distantes automaticamente.', weightCategory: 'medio' },
  { id: 'w45_alinhador_veu', name: 'O Alinhador do Véu', category: 'lancas', rarity: 'lendario', baseDamage: 38, description: 'Lança projétil de energia cósmica que cruza toda a tela.', weightCategory: 'pesado' },

  // CATEGORIA 4: ARMAS MÁGICAS E IMPLEMENTOS ACÚSTICOS (46 a 60) - Foco: Eco / Limiar (Exclusivo Duja)
  { id: 'w46_tomo_sussurros', name: 'Tomo dos Sussurros', category: 'magicas', rarity: 'comum', baseDamage: 11, description: 'Projéteis de tinta que cegam inimigos por 2s.', weightCategory: 'leve' },
  { id: 'w47_xacran_vidro', name: 'Xacran de Vidro', category: 'magicas', rarity: 'incomum', baseDamage: 15, description: 'Lâmina circular que volta para a mão com dano de retorno duplicado.', weightCategory: 'leve' },
  { id: 'w48_grimorio_estilhacado', name: 'Grimório Estilhaçado', category: 'magicas', rarity: 'incomum', baseDamage: 16, description: 'Lança fragmentos de realidade que explodem em área.', weightCategory: 'leve' },
  { id: 'w49_cajado_serpente', name: 'Cajado da Serpente', category: 'magicas', rarity: 'raro', baseDamage: 18, description: 'Deixa névoa venenosa no local onde o projétil atinge.', weightCategory: 'leve' },
  { id: 'w50_xacran_magnetico', name: 'Xacran Magnético', category: 'magicas', rarity: 'raro', baseDamage: 19, description: 'Puxa inimigos para o centro da trajetória do disco.', weightCategory: 'leve' },
  { id: 'w51_codice_medo', name: 'Códice do Medo', category: 'magicas', rarity: 'raro', baseDamage: 17, description: 'Inimigos atingidos causam 10% a menos de dano por 5s.', weightCategory: 'leve' },
  { id: 'w52_esfera_entropica', name: 'Esfera Entrópica', category: 'magicas', rarity: 'epico', baseDamage: 22, description: 'Ataca o inimigo mais próximo de forma passiva a cada 4s.', weightCategory: 'leve' },
  { id: 'w53_xacran_plasma', name: 'Xacran de Plasma', category: 'magicas', rarity: 'epico', baseDamage: 24, description: 'Deixa rastro de fogo azul no Eixo X por onde passa.', weightCategory: 'leve' },
  { id: 'w54_livro_sangue', name: 'Livro de Sangue', category: 'magicas', rarity: 'raro', baseDamage: 25, description: 'Sacrifica 5% de Pulso para aumentar o dano do próximo feitiço em 40%.', weightCategory: 'leve' },
  { id: 'w55_pendulo_prata', name: 'Pêndulo de Prata', category: 'magicas', rarity: 'epico', baseDamage: 20, description: 'Balanceia os status e vida entre os jogadores.', weightCategory: 'leve' },
  { id: 'w56_incensario_cinzas', name: 'Incensário de Cinzas', category: 'magicas', rarity: 'epico', baseDamage: 21, description: 'Cria zona onde projéteis inimigos ficam 50% mais lentos.', weightCategory: 'leve' },
  { id: 'w57_xacran_gelo_sombrio', name: 'Xacran de Gelo Sombrio', category: 'magicas', rarity: 'epico', baseDamage: 23, description: 'Aplica congelamento que impede o inimigo de usar habilidades.', weightCategory: 'leve' },
  { id: 'w58_tomo_alquimista', name: 'Tomo do Alquimista', category: 'magicas', rarity: 'epico', baseDamage: 25, description: 'Alterna ciclicamente entre Fogo, Gelo e Raio a cada ataque.', weightCategory: 'leve' },
  { id: 'w59_orbe_pulso', name: 'Orbe de Pulso', category: 'magicas', rarity: 'epico', baseDamage: 24, description: 'Cria onda de choque que limpa o Eixo Y de projéteis menores.', weightCategory: 'leve' },
  { id: 'w60_eco_primordial', name: 'O Eco Primordial', category: 'magicas', rarity: 'lendario', baseDamage: 38, description: 'Dispara feixes de luz que perseguem automaticamente todos os alvos.', weightCategory: 'leve' },

  // CATEGORIA 5: O ARSENAL IMPROVISADO DE DULLANT (D01 a D15)
  { id: 'd01_arco_curto_betula', name: 'Arco de Bétula', category: 'construtos', rarity: 'comum', baseDamage: 12, description: 'Construto rápido moldado com galhos e resina.', materialCost: { material: 'madeira', amount: 2 } },
  { id: 'd02_balista_calcario', name: 'Balista de Calcário', category: 'construtos', rarity: 'incomum', baseDamage: 16, description: 'Projeta estacas de pedra que quebram escudos.', materialCost: { material: 'pedra', amount: 3 } },
  { id: 'd03_sniper_quartzo', name: 'Sniper de Quartzo', category: 'construtos', rarity: 'raro', baseDamage: 24, description: 'Feixe linear concentrado de longa distância.', materialCost: { material: 'cristal', amount: 2 } },
  { id: 'd04_bacamarte_ferro', name: 'Bacamarte de Ferro', category: 'construtos', rarity: 'incomum', baseDamage: 18, description: 'Disparo disperso cônico com alto knockback.', materialCost: { material: 'sucata', amount: 3 } },
  { id: 'd05_arco_obsidiana', name: 'Arco Longo de Obsidiana', category: 'construtos', rarity: 'raro', baseDamage: 22, description: 'Flechas de vidro vulcânico que causam sangramento.', materialCost: { material: 'obsidiana', amount: 2 } },
  { id: 'd06_canhao_bronze', name: 'Canhão de Bronze Rúnico', category: 'construtos', rarity: 'epico', baseDamage: 28, description: 'Bolas explosivas que limpam o Eixo Y.', materialCost: { material: 'sucata', amount: 4 } },
  { id: 'd07_besta_salgueiro', name: 'Besta de Repetição', category: 'construtos', rarity: 'raro', baseDamage: 20, description: 'Rajadas rápidas de 5 dardos envenenados.', materialCost: { material: 'madeira', amount: 3 } },
  { id: 'd08_dardo_magnetico', name: 'Lança-Dardos Magnético', category: 'construtos', rarity: 'raro', baseDamage: 21, description: 'Dardos atraídos ao alvo de maior Fratura.', materialCost: { material: 'sucata', amount: 2 } },
  { id: 'd09_fuzil_cinabrio', name: 'Fuzil de Cinábrio', category: 'construtos', rarity: 'epico', baseDamage: 27, description: 'Gera névoa ácida corrosiva ao colidir.', materialCost: { material: 'pedra', amount: 3 } },
  { id: 'd10_arco_osso_baleia', name: 'Arco de Osso de Baleia', category: 'construtos', rarity: 'incomum', baseDamage: 17, description: 'Reduz a velocidade do alvo em 40%.', materialCost: { material: 'osso', amount: 3 } },
  { id: 'd11_canhao_granito', name: 'Canhão Sísmico de Granito', category: 'construtos', rarity: 'epico', baseDamage: 29, description: 'Projétil treme o solo levantando inimigos.', materialCost: { material: 'pedra', amount: 4 } },
  { id: 'd12_besta_chumbo', name: 'Besta de Chumbo Líquido', category: 'construtos', rarity: 'epico', baseDamage: 30, description: 'Reduz a armadura física do inimigo atingido.', materialCost: { material: 'sucata', amount: 4 } },
  { id: 'd13_rifle_silica', name: 'Rifle de Sílica Férrica', category: 'construtos', rarity: 'epico', baseDamage: 31, description: 'Estilhaços incandescentes que queimam o solo.', materialCost: { material: 'cristal', amount: 3 } },
  { id: 'd14_canhao_uranio', name: 'Canhão de Fissão de Urânio', category: 'construtos', rarity: 'epico', baseDamage: 36, description: 'Radiação violenta e dano contínuo.', materialCost: { material: 'uranio', amount: 2 } },
  { id: 'd15_olho_bon', name: 'O Olho do Bön', category: 'construtos', rarity: 'lendario', baseDamage: 48, description: 'Construto orbital de ferro meteórico e laser contínuo.', materialCost: { material: 'uranio', amount: 3 } },
];

/**
 * Função utilitária para obter arma por ID
 */
export function getWeaponById(id: string): WeaponItem {
  const weapon = WEAPONS_DATABASE.find(w => w.id === id);
  if (!weapon) {
    return WEAPONS_DATABASE[0]; // Retorna Gládio de Ferro como fallback seguro
  }
  return weapon;
}

/**
 * Lógica de Drop por Tipo de Arena (Módulo 5.3)
 */
export function rollRarityForArena(arenaType: 'normal' | 'elite' | 'boss'): ItemRarity {
  const roll = Math.random() * 100;
  if (arenaType === 'normal') {
    if (roll < 80) return 'comum';
    if (roll < 95) return 'incomum';
    return 'raro';
  } else if (arenaType === 'elite') {
    if (roll < 50) return 'incomum';
    if (roll < 90) return 'raro';
    return 'epico';
  } else {
    // Boss
    if (roll < 70) return 'raro';
    if (roll < 95) return 'epico';
    return 'lendario';
  }
}

