import { VESTIGIO_BASE, CLASS_NAMES, CLASS_COLORS, COLORS } from '../../constants.js';
import SkillTreeSystem from '../../systems/SkillTreeSystem.js';

export default class Player {
  constructor(scene, x, y, classType, playerIndex) {
    this.scene = scene;
    this.classType = classType;
    this.playerIndex = playerIndex;
    this.className = CLASS_NAMES[classType] || classType;
    this.color = CLASS_COLORS[classType] || COLORS.WHITE;
    this.level = 1;
    this.exp = 0;
    this.expToNext = 100;
    this.defending = false;
    this.collapsed = false;
    this.intangible = null;
    this.tempCurse = null;
    this.tempCurseBonus = false;
    this.ecoCostReduction = 0;

    this.maxStats = {
      pulso: VESTIGIO_BASE.pulso,
      eco: VESTIGIO_BASE.eco,
      veu: VESTIGIO_BASE.veu,
      fratura: VESTIGIO_BASE.fratura,
      limiar: VESTIGIO_BASE.limiar,
    };
    this.stats = { ...this.maxStats };

    this.skillTree = new SkillTreeSystem(classType);
    this.inventory = [];

    this.container = scene.add.container(x, y);

    const bodyColor = CLASS_COLORS[classType] || COLORS.ACCENT;
    this.body = scene.add.graphics();
    this.drawBody(bodyColor);
    this.container.add(this.body);

    this.nameTag = scene.add.text(0, -28, this.className.toUpperCase(), {
      fontFamily: 'monospace', fontSize: '9px', color: '#' + bodyColor.toString(16).padStart(6, '0'),
      resolution: 2,
    }).setOrigin(0.5, 1);
    this.container.add(this.nameTag);

    this.shadow = scene.add.graphics();
    this.shadow.fillStyle(0x000000, 0.3);
    this.shadow.fillEllipse(0, 14, 24, 8);
    this.container.addAt(this.shadow, 0);

    scene.physics.add.existing(this.container);
    const body = this.container.body;
    if (body) {
      body.setSize(20, 20);
      body.setOffset(-10, -10);
    }

    this.moving = false;
    this.facingRight = playerIndex === 0;
    this.animFrame = 0;
    this.animTimer = 0;
  }

  drawBody(color) {
    this.body.clear();
    this.body.fillStyle(color, 1);
    this.body.fillRect(-10, -12, 20, 22);
    this.body.fillStyle(color, 0.8);
    this.body.fillCircle(0, -16, 8);
    this.body.fillStyle(0xffffff, 0.15);
    this.body.fillRect(-10, -12, 20, 4);
  }

  getPosition() {
    return { x: this.container.x, y: this.container.y };
  }

  setPosition(x, y) {
    this.container.x = x;
    this.container.y = y;
  }

  move(vx, vy) {
    const body = this.container.body;
    if (!body) return;
    body.setVelocity(vx, vy);
    this.moving = vx !== 0 || vy !== 0;
    if (vx > 0) this.facingRight = true;
    if (vx < 0) this.facingRight = false;
    this.container.setScaleX(this.facingRight ? 1 : -1);
  }

  stop() {
    const body = this.container.body;
    if (body) body.setVelocity(0, 0);
    this.moving = false;
  }

  update(delta) {
    if (this.moving) {
      this.animTimer += delta;
      if (this.animTimer > 100) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 4;
        const bounce = Math.sin(this.animFrame * Math.PI * 0.5) * 2;
        this.body.y = bounce;
      }
    } else {
      this.body.y = 0;
    }

    if (this.intangible) {
      this.body.setAlpha(0.5);
    } else {
      this.body.setAlpha(1);
    }
  }

  takeDamage(amount) {
    if (this.intangible) return 0;
    const actual = Math.max(0, amount);
    this.stats.pulso -= actual;
    if (this.stats.pulso <= 0) {
      this.stats.pulso = 0;
      this.collapsed = true;
    }
    this.flashDamage();
    return actual;
  }

  flashDamage() {
    this.scene.tweens.add({
      targets: this.body,
      alpha: 0,
      duration: 60,
      yoyo: true,
      repeat: 2,
    });
  }

  heal(amount) {
    this.stats.pulso = Math.min(this.stats.pulso + amount, this.maxStats.pulso);
  }

  gainEco(amount) {
    this.stats.eco = Math.min(this.stats.eco + amount, this.maxStats.eco);
  }

  gainExp(amount) {
    this.exp += amount;
    while (this.exp >= this.expToNext) {
      this.exp -= this.expToNext;
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.expToNext = Math.floor(this.expToNext * 1.4);
    this.maxStats.pulso += 20;
    this.maxStats.eco += 10;
    this.maxStats.fratura += 2;
    this.maxStats.veu += 1;
    this.stats.pulso = this.maxStats.pulso;
    this.stats.eco = this.maxStats.eco;
    this.skillTree.addPoints(1);
    if (this.scene.onLevelUp) this.scene.onLevelUp(this);
  }

  isAlive() {
    return this.stats.pulso > 0 || (this.collapsed && !this.dead);
  }

  getHUDInfo() {
    return {
      name: this.className,
      classType: this.classType,
      level: this.level,
      pulso: this.stats.pulso,
      maxPulso: this.maxStats.pulso,
      eco: this.stats.eco,
      maxEco: this.maxStats.eco,
      fratura: this.stats.fratura,
      veu: this.stats.veu,
      limiar: this.stats.limiar,
      collapsed: this.collapsed,
    };
  }

  destroy() {
    this.container.destroy();
  }
}
