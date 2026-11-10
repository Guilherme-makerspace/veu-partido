import Phaser from 'phaser';
import { MainArenaScene } from './scenes/MainArenaScene';

// Expõe o Phaser globalmente (QA headless e depuração no console do navegador)
(window as any).Phaser = Phaser;

/**
 * Ponto de Entrada de O Véu Partido (2.5D Hardcore ARPG)
 * Configurado conforme Módulo 8 (Manual Técnico de Performance e Execução):
 * - Resolução Nativa: 1280x720 (720p)
 * - Arcade Physics para eficiência máxima de processamento
 * - Renderizador WebGL nativo para efeitos de corte e shaders
 */
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1280,
  height: 720,
  backgroundColor: '#07070d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // 2.5D com profundidade de eixos controlados
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [MainArenaScene],
};

/**
 * Boot com carregamento resiliente de assets:
 * tenta novamente caso o primeiro carregamento do spritesheet falhe em
 * condições de rede/GPU instáveis (ambiente headless, conexões lentas).
 */
export function bootGame(attempt: number = 1): Phaser.Game {
  const game = new Phaser.Game(config);
  game.events.once('ready', () => {
    const scene = game.scene.getScene('MainArenaScene');
    const probe = window.setTimeout(() => {
      const sprite = (scene as any)?.playerSprite;
      if (!sprite && attempt < 3) {
        game.destroy(true);
        window.clearTimeout(probe);
        bootGame(attempt + 1);
      }
    }, 4000);
    game.events.once('shutdown', () => window.clearTimeout(probe));
  });
  (window as any).__veuGame = game;
  return game;
}

bootGame();
