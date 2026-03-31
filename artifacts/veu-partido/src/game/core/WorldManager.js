import { BIOMES, COLORS } from '../constants.js';

export default class WorldManager {
  constructor(scene) {
    this.scene = scene;
    this.currentBiome = BIOMES.CIDADE;
    this.biomeData = {
      [BIOMES.CIDADE]: { bgColor: 0x1a1528, tileKey: 'tile_city', music: 'theme_city', enemyTypes: ['fragmentado', 'corrompido'] },
      [BIOMES.FLORESTA]: { bgColor: 0x0e1f14, tileKey: 'tile_forest', music: 'theme_explore', enemyTypes: ['espectro', 'fragmentado'] },
      [BIOMES.DUNGEON]: { bgColor: 0x0f0d18, tileKey: 'tile_dungeon', music: 'theme_dungeon', enemyTypes: ['corrompido', 'guardiao'] },
      [BIOMES.RUINAS]: { bgColor: 0x1f1508, tileKey: 'tile_ruins', music: 'theme_explore', enemyTypes: ['espectro', 'guardiao'] },
    };
  }

  setBiome(biome) {
    this.currentBiome = biome;
    const data = this.biomeData[biome];
    if (data) {
      this.scene.cameras.main.setBackgroundColor(data.bgColor);
    }
  }

  getBiomeData() {
    return this.biomeData[this.currentBiome];
  }

  transition(toScene, data = {}) {
    this.scene.cameras.main.fadeOut(400, 0, 0, 0, (cam, progress) => {
      if (progress === 1) {
        this.scene.scene.start(toScene, data);
      }
    });
  }

  applyBiomeShader(graphics, width, height) {
    const data = this.getBiomeData();
    graphics.fillStyle(data.bgColor, 1);
    graphics.fillRect(0, 0, width, height);
  }
}
