import Phaser from 'phaser';
import { MainArenaScene } from './scenes/MainArenaScene';

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

new Phaser.Game(config);

