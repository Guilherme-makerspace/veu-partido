import { ItemRarity, LootDropInstance, WeaponItem } from '../types';
import { rollRarityForArena, WEAPONS_DATABASE } from '../data/weapons';

/**
 * Sistema de Drops, Loot e Economia de Poeira de Eco
 * Conforme Módulos 5, 14 e 15 de game-document.md
 */
export class LootSystem {
  private activeDrops: LootDropInstance[] = [];

  /**
   * Gera um drop aleatório no solo da arena
   */
  public generateDrop(x: number, y: number, arenaType: 'normal' | 'elite' | 'boss' = 'normal'): LootDropInstance {
    const rolledRarity = rollRarityForArena(arenaType);
    
    // Filtra armas com a raridade sorteada
    const matchingWeapons = WEAPONS_DATABASE.filter(w => w.rarity === rolledRarity);
    const chosenWeapon = matchingWeapons.length > 0
      ? matchingWeapons[Math.floor(Math.random() * matchingWeapons.length)]
      : WEAPONS_DATABASE[0];

    const drop: LootDropInstance = {
      id: `loot_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      item: chosenWeapon,
      x,
      y,
      createdAt: Date.now(),
    };

    this.activeDrops.push(drop);
    return drop;
  }

  public getActiveDrops(): LootDropInstance[] {
    return this.activeDrops;
  }

  public removeDrop(id: string): void {
    this.activeDrops = this.activeDrops.filter(d => d.id !== id);
  }

  /**
   * Cálculo de Poeira de Eco obtida por fragmentação de item (Módulo 14.3)
   */
  public static calculatePoeiraEco(rarity: ItemRarity): number {
    switch (rarity) {
      case 'comum': return 10;
      case 'incomum': return 25;
      case 'raro': return 50;
      case 'epico': return 100;
      case 'lendario': return 250;
    }
  }

  /**
   * Resolução da Ação Específica de Classe sobre o Loot (Módulo 15 e 16)
   */
  public static resolveClassLootAction(characterId: string, item: WeaponItem): {
    success: boolean;
    message: string;
    transformedWeapon?: WeaponItem;
    materialsGained?: { material: string; amount: number };
  } {
    if (characterId === 'dit') {
      // Dit: Assimilação do Receptáculo do Cadáver
      return {
        success: true,
        message: `Dit assimilou o receptáculo! Agora empunha [${item.name}] adaptando o estilo da carcaça.`,
        transformedWeapon: item,
      };
    } else if (characterId === 'dullant') {
      // Dullant: Transmuta em Componentes Minerais (não segura armas manufaturadas)
      const mat = item.category === 'magicas' ? 'cristal' : 'sucata';
      const amount = item.rarity === 'lendario' ? 5 : item.rarity === 'epico' ? 4 : 2;
      return {
        success: true,
        message: `Dullant transmutou [${item.name}] em ${amount}x ${mat.toUpperCase()} para construtos balísticos!`,
        materialsGained: { material: mat, amount },
      };
    } else if (characterId === 'dren') {
      // Dren: Exclusivo armas pesadas
      if (item.category === 'martelos' || item.weightCategory === 'pesado') {
        return {
          success: true,
          message: `Dren empunha [${item.name}] com hyper-armor colossal!`,
          transformedWeapon: item,
        };
      } else {
        return {
          success: false,
          message: `Dren recusa [${item.name}]: O Voraz só aceita armas pesadas colossais!`,
        };
      }
    } else if (characterId === 'duja') {
      // Duja: Exclusivo armas mágicas leves
      if (item.category === 'magicas') {
        return {
          success: true,
          message: `Duja harmonizou [${item.name}] com suas cordas vocais!`,
          transformedWeapon: item,
        };
      } else {
        return {
          success: false,
          message: `Duja recusa [${item.name}]: A Shamã só opera armas mágicas leves sem peso físico!`,
        };
      }
    }

    return {
      success: true,
      message: `Item coletado: [${item.name}]`,
      transformedWeapon: item,
    };
  }
}

