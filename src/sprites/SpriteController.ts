import Phaser from 'phaser';

export type LPCAction = 'idle' | 'walk' | 'slash' | 'thrust' | 'shoot' | 'spellcast' | 'hurt';
export type LPCDirection = 'up' | 'left' | 'down' | 'right';

/**
 * Controlador de Sprites Universal LPC (Liberated Pixel Cup)
 * Calcula e registra animações dinamicamente respeitando o número de colunas de cada personagem
 */
export class SpriteController {
  private static registeredKeys = new Set<string>();

  /**
   * Registra todas as animações LPC no gerenciador de animações do Phaser para um spritesheet específico
   */
  public static registerAnimations(scene: Phaser.Scene, spriteKey: string, cols: number): void {
    if (this.registeredKeys.has(spriteKey)) return;
    this.registeredKeys.add(spriteKey);

    const anims = scene.anims;

    // Helper para gerar números de frames
    const getFrames = (start: number, end: number) => {
      const frames: Phaser.Types.Animations.AnimationFrame[] = [];
      for (let i = start; i <= end; i++) {
        frames.push({ key: spriteKey, frame: i });
      }
      return frames;
    };

    // 1. Idle (frames estáticos na coluna 0 da linha de caminhada)
    anims.create({ key: `${spriteKey}_idle_up`, frames: [{ key: spriteKey, frame: 8 * cols }], frameRate: 1 });
    anims.create({ key: `${spriteKey}_idle_left`, frames: [{ key: spriteKey, frame: 9 * cols }], frameRate: 1 });
    anims.create({ key: `${spriteKey}_idle_down`, frames: [{ key: spriteKey, frame: 10 * cols }], frameRate: 1 });
    anims.create({ key: `${spriteKey}_idle_right`, frames: [{ key: spriteKey, frame: 11 * cols }], frameRate: 1 });

    // 2. Walk (linhas 8 a 11, colunas 1 a 8)
    anims.create({ key: `${spriteKey}_walk_up`, frames: getFrames(8 * cols + 1, 8 * cols + 8), frameRate: 12, repeat: -1 });
    anims.create({ key: `${spriteKey}_walk_left`, frames: getFrames(9 * cols + 1, 9 * cols + 8), frameRate: 12, repeat: -1 });
    anims.create({ key: `${spriteKey}_walk_down`, frames: getFrames(10 * cols + 1, 10 * cols + 8), frameRate: 12, repeat: -1 });
    anims.create({ key: `${spriteKey}_walk_right`, frames: getFrames(11 * cols + 1, 11 * cols + 8), frameRate: 12, repeat: -1 });

    // 3. Slash / Espadas / Ataque Físico (linhas 12 a 15, colunas 0 a 5)
    anims.create({ key: `${spriteKey}_slash_up`, frames: getFrames(12 * cols, 12 * cols + 5), frameRate: 16 });
    anims.create({ key: `${spriteKey}_slash_left`, frames: getFrames(13 * cols, 13 * cols + 5), frameRate: 16 });
    anims.create({ key: `${spriteKey}_slash_down`, frames: getFrames(14 * cols, 14 * cols + 5), frameRate: 16 });
    anims.create({ key: `${spriteKey}_slash_right`, frames: getFrames(15 * cols, 15 * cols + 5), frameRate: 16 });

    // 4. Thrust / Lanças / Perfuração (linhas 4 a 7, colunas 0 a 7)
    anims.create({ key: `${spriteKey}_thrust_up`, frames: getFrames(4 * cols, 4 * cols + 7), frameRate: 16 });
    anims.create({ key: `${spriteKey}_thrust_left`, frames: getFrames(5 * cols, 5 * cols + 7), frameRate: 16 });
    anims.create({ key: `${spriteKey}_thrust_down`, frames: getFrames(6 * cols, 6 * cols + 7), frameRate: 16 });
    anims.create({ key: `${spriteKey}_thrust_right`, frames: getFrames(7 * cols, 7 * cols + 7), frameRate: 16 });

    // 5. Shoot / Arcos e Construtos Balísticos (linhas 16 a 19, colunas 0 a 12)
    anims.create({ key: `${spriteKey}_shoot_up`, frames: getFrames(16 * cols, 16 * cols + 12), frameRate: 18 });
    anims.create({ key: `${spriteKey}_shoot_left`, frames: getFrames(17 * cols, 17 * cols + 12), frameRate: 18 });
    anims.create({ key: `${spriteKey}_shoot_down`, frames: getFrames(18 * cols, 18 * cols + 12), frameRate: 18 });
    anims.create({ key: `${spriteKey}_shoot_right`, frames: getFrames(19 * cols, 19 * cols + 12), frameRate: 18 });

    // 6. Spellcast / Magia e Cânticos (linhas 0 a 3, colunas 0 a 6)
    anims.create({ key: `${spriteKey}_spellcast_up`, frames: getFrames(0 * cols, 0 * cols + 6), frameRate: 14 });
    anims.create({ key: `${spriteKey}_spellcast_left`, frames: getFrames(1 * cols, 1 * cols + 6), frameRate: 14 });
    anims.create({ key: `${spriteKey}_spellcast_down`, frames: getFrames(2 * cols, 2 * cols + 6), frameRate: 14 });
    anims.create({ key: `${spriteKey}_spellcast_right`, frames: getFrames(3 * cols, 3 * cols + 6), frameRate: 14 });

    // 7. Hurt / Dano e Morte (linha 20, colunas 0 a 5)
    anims.create({ key: `${spriteKey}_hurt`, frames: getFrames(20 * cols, 20 * cols + 5), frameRate: 12 });
  }

  /**
   * Executa a animação apropriada no sprite considerando ação e direção
   */
  public static playAnimation(
    sprite: Phaser.GameObjects.Sprite,
    spriteKey: string,
    action: LPCAction,
    dir: LPCDirection = 'down'
  ): void {
    const animKey = action === 'hurt' ? `${spriteKey}_hurt` : `${spriteKey}_${action}_${dir}`;
    if (sprite.anims.currentAnim?.key !== animKey) {
      sprite.play(animKey, true);
    }
  }
}

