export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a1a, 1);
    bg.fillRect(0, 0, w, h);

    const logo = this.add.text(w / 2, h / 2 - 40, 'VÉU PARTIDO', {
      fontSize: '32px',
      color: '#7744cc',
      fontStyle: 'bold',
      stroke: '#220055',
      strokeThickness: 6,
    }).setOrigin(0.5);

    const loading = this.add.text(w / 2, h / 2 + 20, 'Carregando...', {
      fontSize: '14px',
      color: '#554488',
    }).setOrigin(0.5);

    const barBg = this.add.graphics();
    barBg.fillStyle(0x221133, 1);
    barBg.fillRoundedRect(w / 2 - 150, h / 2 + 50, 300, 12, 4);

    const barFill = this.add.graphics();

    this.load.on('progress', (value) => {
      barFill.clear();
      barFill.fillStyle(0x7744cc, 1);
      barFill.fillRoundedRect(w / 2 - 150, h / 2 + 50, Math.floor(300 * value), 12, 4);
      loading.setText(`Carregando... ${Math.floor(value * 100)}%`);
    });

    // === CARREGAMENTO DOS FUNDOS ===
    // (Ajuste o caminho/nome .png ou .jpg se os seus estiverem diferentes)
    this.load.image('cidade_destruida_bg', 'assets/images/backgrounds/cidade_destruida.png');
    this.load.image('esgoto_limpo_bg', 'assets/images/backgrounds/esgoto_limpo.png');
    this.load.image('gruta_gelada_bg', 'assets/images/backgrounds/gruta_gelada.png');

    // === CARREGAMENTO DO SPRITE DO PERSONAGEM ===
    this.load.spritesheet('dit_sprite', 'assets/images/characters/dit.png', { 
        frameWidth: 64, 
        frameHeight: 64 
    });
  }

  create() {
    this.scene.start('TitleScene');
  }
}