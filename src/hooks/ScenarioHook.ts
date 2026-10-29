import Phaser from 'phaser';

/**
 * Ponto de Integração (Hook) para Cenários Futuros de O Véu Partido
 * Não cria cenários pré-moldados; estabelece o volume de arena 2.5D e a interface para conexão de novos biomas
 */
export class ScenarioHook {
  private scene: Phaser.Scene;
  private arenaBounds: { minX: number; maxX: number; minY: number; maxY: number };
  private boundaryGraphics: Phaser.GameObjects.Graphics;
  private onClearCallbacks: (() => void)[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // Conforme Módulo 1.1: Eixo Y com 150px a 200px de altura de chão para profundidade
    this.arenaBounds = {
      minX: 60,
      maxX: 1220,
      minY: 460, // Topo da faixa de chão
      maxY: 640, // Base da faixa de chão (altura total: 180px)
    };

    this.boundaryGraphics = this.scene.add.graphics();
    this.drawArenaPlaceholder();
  }

  /**
   * Renderiza os limites funcionais da arena 2.5D enquanto nenhum cenário gráfico for injetado
   */
  private drawArenaPlaceholder(): void {
    this.boundaryGraphics.clear();

    // Área jogável do chão (Eixo Y 2.5D)
    this.boundaryGraphics.fillStyle(0x161622, 0.7);
    this.boundaryGraphics.fillRect(
      this.arenaBounds.minX,
      this.arenaBounds.minY,
      this.arenaBounds.maxX - this.arenaBounds.minX,
      this.arenaBounds.maxY - this.arenaBounds.minY
    );

    // Linha de horizonte e guias de profundidade
    this.boundaryGraphics.lineStyle(2, 0x6b21a8, 0.6);
    this.boundaryGraphics.strokeRect(
      this.arenaBounds.minX,
      this.arenaBounds.minY,
      this.arenaBounds.maxX - this.arenaBounds.minX,
      this.arenaBounds.maxY - this.arenaBounds.minY
    );

    // Texto de gancho visual para o desenvolvedor/usuário
    this.scene.add.text(
      640,
      380,
      '[GANCHO DE CENÁRIO: ESPAÇO RESERVADO PARA TILES/BACKGROUND DO BIOMA]',
      {
        fontSize: '14px',
        color: '#6b7280',
        fontFamily: 'monospace',
      }
    ).setOrigin(0.5);
  }

  public getBounds() {
    return this.arenaBounds;
  }

  /**
   * Ponto de Integração: Registra listener para o evento ON_ARENA_CLEAR (Módulo 1.1)
   */
  public onArenaClear(cb: () => void): void {
    this.onClearCallbacks.push(cb);
  }

  /**
   * Dispara a liberação das paredes invisíveis após derrota de todos os inimigos
   */
  public triggerArenaClear(): void {
    this.onClearCallbacks.forEach(cb => cb());
    // Efeito visual sutil de abertura de barreiras
    this.boundaryGraphics.lineStyle(3, 0x22c55e, 0.8);
    this.boundaryGraphics.strokeRect(
      this.arenaBounds.minX,
      this.arenaBounds.minY,
      this.arenaBounds.maxX - this.arenaBounds.minX,
      this.arenaBounds.maxY - this.arenaBounds.minY
    );
  }

  /**
   * GANCHO DE INTEGRAÇÃO FUTURA: Conexão direta de Tilemaps ou Imagens de Fundo
   * Chame este método quando fornecer os arquivos de arte do cenário
   */
  public attachCustomBackground(backgroundKey: string): Phaser.GameObjects.Image {
    return this.scene.add.image(640, 360, backgroundKey).setDepth(-10);
  }

  /**
   * GANCHO DE INTEGRAÇÃO FUTURA: Conexão de Tilemap Tiled (.json)
   */
  public attachCustomTilemap(mapKey: string, tilesetKey: string): Phaser.Tilemaps.Tilemap {
    const map = this.scene.make.tilemap({ key: mapKey });
    const tileset = map.addTilesetImage('tileset', tilesetKey);
    if (tileset) {
      map.createLayer(0, tileset, 0, 0)?.setDepth(-5);
    }
    return map;
  }
}

