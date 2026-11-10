import { CharacterData, CharacterId } from '../types';

/**
 * Definição dos 4 Personagens Principais (Os Marcados)
 * Conforme Módulo 16 de game-document.md e history.md
 */
export const CHARACTERS_DATA: Record<CharacterId, CharacterData> = {
  dit: {
    id: 'dit',
    name: 'Dit',
    quadrant: 'Noroeste (Alasca / Chukt)',
    culturalOrigin: 'Cobaia do Alasca / Tradição Chukchi e Confraria Ulfhedinn',
    baseStats: {
      fratura: 3,
      pulso: 4,
      eco: 4,
      veu: 3,
      limiar: 2,
    },
    weaponRestriction: 'Apossa-se da arma e estilo do cadáver abatido (Mimetismo de Receptáculo)',
    loreRole: 'Metamorfo do Osso Gélido',
    spriteKey: 'dit',
    sheetCols: 13,
    initialWeaponId: 'w17_machado_batalha',
    availablePaths: ['dit_metamorfo_multiplo', 'dit_metamorfo_evolutivo'],
    elementalAffinity: ['osseous_puncture', 'frost_bite', 'predatory_claw'],
  },
  dullant: {
    id: 'dullant',
    name: 'Dullant',
    quadrant: 'Nordeste (Yung-Dong)',
    culturalOrigin: 'Inglês Aculturado / Yungdrung Bön e Sacerdócio Dongba',
    baseStats: {
      fratura: 4,
      pulso: 2,
      eco: 4,
      veu: 3,
      limiar: 3,
    },
    weaponRestriction: 'Não segura armas comuns; projeta construtos balísticos a partir de minerais brutos',
    loreRole: 'Duelista da Geometria Mineral',
    spriteKey: 'dullant',
    sheetCols: 18,
    initialWeaponId: 'd03_sniper_quartzo',
    availablePaths: ['dullant_duelista_eco', 'dullant_duelista_fratura'],
    elementalAffinity: ['crystallite_resonance', 'ballistic_pierce', 'fissao_decay'],
  },
  dren: {
    id: 'dren',
    name: 'Dren',
    quadrant: 'Sudeste (Tana-Rambu)',
    culturalOrigin: 'Ontologia Funerária Toraja (Aluk To Dolo) e Caçadores Asmat',
    baseStats: {
      fratura: 5,
      pulso: 4,
      eco: 1,
      veu: 2,
      limiar: 4,
    },
    weaponRestriction: 'Usa estritamente armas pesadas com hyper-armor (Martelos, Machados Colossais)',
    loreRole: 'Voraz da Carne Petrificada',
    spriteKey: 'dren',
    sheetCols: 18,
    initialWeaponId: 'w26_grande_malho_pedra',
    availablePaths: ['dren_corcovado', 'dren_espelhado'],
    elementalAffinity: ['rot_necrosis', 'physical_cleave', 'tomb_weight'],
  },
  duja: {
    id: 'duja',
    name: 'Duja (Suna)',
    quadrant: 'Sudoeste (Fueguina)',
    culturalOrigin: 'Cerimônia do Hain (Selk\'nam) e Tradição Machi Mapuche',
    baseStats: {
      fratura: 1,
      pulso: 3,
      eco: 5,
      veu: 3,
      limiar: 4,
    },
    weaponRestriction: 'Usa somente armas leves ou mágicas, sem armas físicas leves (Tomos, Xacrans, Códices)',
    loreRole: 'Shamã da Voz Fraturada',
    spriteKey: 'suna',
    sheetCols: 24,
    initialWeaponId: 'w47_xacran_vidro',
    availablePaths: ['duja_maldito', 'duja_imaculado', 'duja_cetico'],
    elementalAffinity: ['maldicao_status', 'black_flame', 'eco_acoustic'],
  },
};

