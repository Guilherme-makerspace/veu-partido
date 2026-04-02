import bus from '../utils/EventBus.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
    this._players = [];
    this._scoreDisplays = [];
    this._hpBars = [];
    this._manaCircles = [];
    this._waveText = null;
    this._bossBar = null;
    this._bossBarBg = null;
    this._bossBarFill = null;
    this._bossBarText = null;
    this._skillLabels = [];
    this._skillCooldownDisplays = [];
    this._comboTexts = [];
    this._levelTexts = [];
  }

  create() {
    this._buildBossUI();
    this._buildWaveUI();

    bus.on('playerDamaged', this._onPlayerDamaged, this);
    bus.on('playerHealed',  this._onPlayerHealed, this);
    bus.on('scoreChanged',  this._onScoreChanged, this);
    bus.on('waveStarted',   this._onWaveStarted, this);
    bus.on('bossSpawned',   this._onBossSpawned, this);
    bus.on('bossEnraged',   this._onBossEnraged, this);
    bus.on('showSkillLabel', this._onShowSkillLabel, this);
    bus.on('levelUp',       this._onLevelUp, this);
    bus.on('xpGained',      this._onXpGained, this);
    bus.on('bossDefeated',  this._onBossDefeated, this);

    this.events.on('shutdown', this._cleanupListeners, this);
  }

  registerPlayers(players) {
    this._players = players;
    this._hpBars = [];
    this._manaCircles = [];
    this._scoreDisplays = [];
    this._levelTexts = [];

    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      const isP2 = i === 1;
      this._buildPlayerHUD(p, i, isP2);
    }
  }

  _buildPlayerHUD(player, index, isRight) {
    const baseX = isRight ? 980 : 20;
    const baseY = 12;
    const colors = [
      { main: player.color || 0x7c4dff, text: '#bb99ff' },
      { main: player.color || 0x00bcd4, text: '#88eeff' },
    ];
    const col = colors[index % 2];

    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.55);
    panel.fillRoundedRect(baseX, baseY, 280, 80, 10);
    panel.lineStyle(2, col.main, 0.8);
    panel.strokeRoundedRect(baseX, baseY, 280, 80, 10);

    const nameText = this.add.text(
      baseX + (isRight ? 265 : 15),
      baseY + 10,
      `P${index + 1}: ${player.name}`,
      { fontSize: '13px', color: col.text, fontStyle: 'bold', stroke: '#000', strokeThickness: 2 }
    ).setOrigin(isRight ? 1 : 0, 0);

    const classText = this.add.text(
      baseX + (isRight ? 265 : 15),
      baseY + 26,
      player.characterClass.toUpperCase(),
      { fontSize: '10px', color: '#888888' }
    ).setOrigin(isRight ? 1 : 0, 0);

    const hpBg = this.add.graphics();
    hpBg.fillStyle(0x1a0000, 1);
    hpBg.fillRoundedRect(baseX + 10, baseY + 42, 200, 10, 3);

    const hpFill = this.add.graphics();
    const hpText = this.add.text(
      baseX + (isRight ? 215 : 10),
      baseY + 40,
      `HP`,
      { fontSize: '9px', color: '#ff4444' }
    ).setOrigin(isRight ? 1 : 0, 0);

    const manaBg = this.add.graphics();
    manaBg.fillStyle(0x00001a, 1);
    manaBg.fillRoundedRect(baseX + 10, baseY + 58, 200, 8, 3);

    const manaFill = this.add.graphics();
    const manaText = this.add.text(
      baseX + (isRight ? 215 : 10),
      baseY + 55,
      `MP`,
      { fontSize: '9px', color: '#4488ff' }
    ).setOrigin(isRight ? 1 : 0, 0);

    const scoreText = this.add.text(
      baseX + 222,
      baseY + 10,
      `0`,
      { fontSize: '12px', color: '#ffdd44', fontStyle: 'bold', stroke: '#000', strokeThickness: 2 }
    ).setOrigin(isRight ? 0 : 1, 0);

    const levelText = this.add.text(
      baseX + (isRight ? 15 : 265),
      baseY + 10,
      `Lv.1`,
      { fontSize: '11px', color: '#aaffaa', stroke: '#000', strokeThickness: 2 }
    ).setOrigin(isRight ? 0 : 1, 0);

    this._hpBars.push({ fill: hpFill, player, baseX: baseX + 10, baseY: baseY + 42, w: 200, h: 10 });
    this._manaCircles.push({ fill: manaFill, player, baseX: baseX + 10, baseY: baseY + 58, w: 200, h: 8 });
    this._scoreDisplays.push({ text: scoreText, player });
    this._levelTexts.push({ text: levelText, player });

    this._redrawHpBar(index);
    this._redrawManaBar(index);
  }

  _redrawHpBar(i) {
    const bar = this._hpBars[i];
    if (!bar) return;
    const { fill, player, baseX, baseY, w, h } = bar;
    fill.clear();
    const ratio = Math.max(0, player.hp / player.getMaxHp());
    const color = ratio > 0.5 ? 0xff4444 : ratio > 0.25 ? 0xff8800 : 0xff0000;
    fill.fillStyle(color, 1);
    fill.fillRoundedRect(baseX, baseY, Math.floor(w * ratio), h, 3);
  }

  _redrawManaBar(i) {
    const bar = this._manaCircles[i];
    if (!bar) return;
    const { fill, player, baseX, baseY, w, h } = bar;
    fill.clear();
    const ratio = Math.max(0, player.mana / player.getMaxMana());
    fill.fillStyle(0x2244ff, 1);
    fill.fillRoundedRect(baseX, baseY, Math.floor(w * ratio), h, 2);
  }

  _buildBossUI() {
    this._bossBar = this.add.container(0, 0);
    const barW = 500, barH = 20;
    const barX = 640 - barW / 2;
    const barY = 8;

    this._bossBarBg = this.add.graphics();
    this._bossBarBg.fillStyle(0x000000, 0.7);
    this._bossBarBg.fillRoundedRect(barX - 5, barY - 5, barW + 10, barH + 30, 6);
    this._bossBarBg.fillStyle(0x1a0000, 1);
    this._bossBarBg.fillRoundedRect(barX, barY + 16, barW, barH, 4);
    this._bossBarBg.setVisible(false);

    this._bossBarFill = this.add.graphics();
    this._bossBarFill.setVisible(false);

    this._bossBarText = this.add.text(640, barY + 8, '', {
      fontSize: '12px', color: '#ff4444', fontStyle: 'bold', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5, 0).setVisible(false);

    this._bossData = { barX, barY: barY + 16, barW, barH, boss: null };
  }

  _buildWaveUI() {
    this._waveText = this.add.text(640, 100, '', {
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 5,
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0);
  }

  _showWaveText(text, duration = 2000) {
    if (!this._waveText) return;
    this._waveText.setText(text).setAlpha(1);
    this.tweens.add({
      targets: this._waveText,
      alpha: 0,
      delay: duration - 400,
      duration: 400,
    });
  }

  _onPlayerDamaged({ player }) {
    const i = this._players.indexOf(player);
    if (i >= 0) { this._redrawHpBar(i); this._redrawManaBar(i); }
  }

  _onPlayerHealed({ player }) {
    const i = this._players.indexOf(player);
    if (i >= 0) this._redrawHpBar(i);
  }

  _onScoreChanged({ player }) {
    const i = this._players.indexOf(player);
    if (i >= 0 && this._scoreDisplays[i]) {
      this._scoreDisplays[i].text.setText(`${player.score}`);
    }
  }

  _onWaveStarted({ wave, count }) {
    this._showWaveText(`Onda ${wave} — ${count} inimigos`);
  }

  _onBossSpawned({ boss }) {
    this._bossData.boss = boss;
    this._bossBarBg.setVisible(true);
    this._bossBarFill.setVisible(true);
    this._bossBarText.setVisible(true).setText(boss.name.toUpperCase());
    this._showWaveText(`⚠️  ${boss.name}  ⚠️`, 3000);
    this._updateBossBar();
  }

  _onBossEnraged({ boss }) {
    this._bossBarText.setStyle({ color: '#ff0000' });
    this._showWaveText('BOSS ENFURECIDO!', 2000);
  }

  _onBossDefeated({ boss }) {
    this._bossBarBg.setVisible(false);
    this._bossBarFill.setVisible(false);
    this._bossBarText.setVisible(false);
  }

  _updateBossBar() {
    if (!this._bossData.boss) return;
    const boss = this._bossData.boss;
    const { barX, barY, barW, barH } = this._bossData;
    const ratio = Math.max(0, boss.hp / boss.maxHp);
    this._bossBarFill.clear();
    const col = boss.enraged ? 0xff0000 : 0xff4444;
    this._bossBarFill.fillStyle(col, 1);
    this._bossBarFill.fillRoundedRect(barX, barY, Math.floor(barW * ratio), barH, 4);
  }

  _onShowSkillLabel({ x, y, label, color }) {
    const t = this.add.text(x, y, label, {
      fontSize: '16px',
      color: color || '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(300);

    this.tweens.add({
      targets: t,
      y: t.y - 30,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => t.destroy(),
    });
  }

  _onLevelUp({ playerId, level }) {
    const pIndex = playerId - 1;
    if (this._levelTexts[pIndex]) {
      this._levelTexts[pIndex].text.setText(`Lv.${level}`);
    }
    const p = this._players[pIndex];
    if (p) {
      const t = this.add.text(p.x, p.y - 90, `NÍVEL UP! Lv.${level}`, {
        fontSize: '18px',
        color: '#ffff44',
        stroke: '#000',
        strokeThickness: 4,
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(300);
      this.tweens.add({
        targets: t,
        y: t.y - 50,
        alpha: 0,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => t.destroy(),
      });
    }
  }

  _onXpGained({ playerId }) {
    const pIndex = playerId - 1;
    const bar = this._hpBars[pIndex];
    if (bar) this._redrawHpBar(pIndex);
    const mbar = this._manaCircles[pIndex];
    if (mbar) this._redrawManaBar(pIndex);
  }

  update() {
    for (let i = 0; i < this._hpBars.length; i++) {
      this._redrawHpBar(i);
      this._redrawManaBar(i);
    }
    this._updateBossBar();
  }

  _cleanupListeners() {
    bus.off('playerDamaged', this._onPlayerDamaged);
    bus.off('playerHealed',  this._onPlayerHealed);
    bus.off('scoreChanged',  this._onScoreChanged);
    bus.off('waveStarted',   this._onWaveStarted);
    bus.off('bossSpawned',   this._onBossSpawned);
    bus.off('bossEnraged',   this._onBossEnraged);
    bus.off('showSkillLabel', this._onShowSkillLabel);
    bus.off('levelUp',       this._onLevelUp);
    bus.off('xpGained',      this._onXpGained);
    bus.off('bossDefeated',  this._onBossDefeated);
  }
}
