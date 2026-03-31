import { COLORS } from '../../constants.js';

export default class NPC {
  constructor(scene, x, y, config = {}) {
    this.scene = scene;
    this.npcName = config.name || 'NPC';
    this.dialogLines = config.dialogs || [{ speaker: 'npc', text: '...' }];
    this.curseDrop = config.curseDrop || null;
    this.shopItems = config.shopItems || [];
    this.interacted = false;

    this.container = scene.add.container(x, y);

    this.body = scene.add.graphics();
    this.body.fillStyle(config.color || COLORS.TEAL, 0.9);
    this.body.fillRect(-8, -16, 16, 24);
    this.body.fillCircle(0, -20, 7);
    this.container.add(this.body);

    const indicator = scene.add.text(0, -34, '!', {
      fontFamily: 'monospace', fontSize: '14px', color: '#e09a3a',
    }).setOrigin(0.5, 1);
    this.container.add(indicator);
    this.indicator = indicator;

    this.nameText = scene.add.text(0, -46, this.npcName, {
      fontFamily: 'monospace', fontSize: '8px', color: '#8a86a0',
      resolution: 2,
    }).setOrigin(0.5, 1);
    this.container.add(this.nameText);

    scene.physics.add.existing(this.container, true);

    this.floatTimer = 0;
  }

  update(delta) {
    this.floatTimer += delta;
    this.indicator.y = -34 + Math.sin(this.floatTimer * 0.003) * 3;
  }

  interact(players) {
    return {
      dialogs: this.dialogLines,
      curseDrop: this.interacted ? null : this.curseDrop,
      shopItems: this.shopItems,
    };
  }

  isNear(player, range = 60) {
    const dx = player.container.x - this.container.x;
    const dy = player.container.y - this.container.y;
    return Math.sqrt(dx * dx + dy * dy) <= range;
  }

  destroy() {
    this.container.destroy();
  }
}
