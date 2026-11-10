export default async function run(page, ui) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => errors.push(`[${m.type()}] ${m.text()}`));

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.__arenaScene, null, { timeout: 25000 }).catch(() => { });
  await page.waitForTimeout(500);

  // Invoca handlers diretamente (keyboard cria efeitos colaterais no headless)
  const call = (method, ...args) => page.evaluate(([m, a]) => {
    const s = window.__arenaScene;
    if (!s) return 'no-scene';
    s[m](...a);
    return 'ok';
  }, [method, args]);

  const probe = async () => page.evaluate(() => {
    const scene = window.__arenaScene;
    if (!scene) return { scene: null };
    return {
      p: { x: Math.round(scene.playerSprite?.x ?? -1), y: Math.round(scene.playerSprite?.y ?? -1) },
      path: scene.currentPathId, sub: scene.currentSubPathId,
      hp: Math.round(scene.playerHp), eco: Math.round(scene.playerEco),
      enemies: (scene.enemies || []).map(e => ({
        n: e.name, x: Math.round(e.sprite.x), hp: Math.round(e.hp),
        grey: Math.round(e.greyHealth?.currentGreyHp ?? 0), rotten: !!e.greyHealth?.isFullyRotten,
        ps: (e.pathStatuses || []).map(p => p.type), cs: (e.classicStatuses || []).map(c => c.type),
      })),
      log: scene.logMessageText?.text,
    };
  });

  const before = await probe();
  await page.screenshot({ path: 'qa-before.png' });

  // Aproxima o jogador dos inimigos e vira para a direita
  await page.evaluate(() => {
    const s = window.__arenaScene;
    s.playerSprite.x = 700;
    s.playerSprite.y = 520;
    s.playerFacing = 'right';
  });
  await page.waitForTimeout(200);
  const moved = await probe();

  // Dren: ataques pesados acumulam Vida Cinza (Podridão)
  await call('selectCharacter', 'dren');
  await page.waitForTimeout(400);
  for (let i = 0; i < 12; i++) {
    await call('handlePlayerAttack', true);
    await page.waitForTimeout(340);
  }
  const afterDren = await probe();

  // Sub-habilidade do sub-caminho (Ossos de Tau-Tau -> Carapaça do Nicho)
  await page.evaluate(() => { window.__arenaScene.subSkillCooldownUntil = 0; });
  await call('handleSubSkill');
  await page.waitForTimeout(600);
  const afterSkill = await probe();

  await call('cyclePath', 1);
  await call('cycleSubPath');
  const afterCycle = await probe();

  // Duja: Chamas Negras (anti-cura) + sub-habilidade do primeiro sub-caminho
  await call('selectCharacter', 'duja');
  await page.waitForTimeout(400);
  await call('handlePlayerClassAbility');
  await page.waitForTimeout(700);
  await page.evaluate(() => { window.__arenaScene.subSkillCooldownUntil = 0; });
  await call('handleSubSkill');
  await page.waitForTimeout(1800);
  const afterDuja = await probe();

  // Colapso necrótico: força um inimigo a 100% de vida cinza
  await page.evaluate(() => {
    const s = window.__arenaScene;
    const e = s.enemies[0];
    s.selectCharacter('dren');
    e.hp = 30;
    e.greyHealth.currentGreyHp = 30;
    e.greyHealth.isFullyRotten = true;
    e.greyHealth.rotDebuffRatio = 0.30;
    e.greyHealth.rotVulnerabilityRatio = 0.30;
  });
  await page.waitForTimeout(2500);
  const afterCollapse = await probe();

  await page.screenshot({ path: 'qa-after.png' });
  return { before, moved, afterDren, afterSkill, afterCycle, afterDuja, afterCollapse, logs: errors.slice(0, 12) };
}
