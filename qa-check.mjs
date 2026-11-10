export default async function run(page, ui) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Foca o canvas para que os eventos de teclado cheguem ao Phaser
  const canvas = page.locator('canvas');
  await canvas.click({ position: { x: 600, y: 400 } });
  await page.waitForTimeout(300);

  const probe = async () => page.evaluate(() => {
    const g = window.Phaser?.GAMES?.[0];
    const scene = window.__arenaScene || g?.scene?.getScene('MainArenaScene');
    if (!scene) return { scene: null };
    return {
      p: { x: Math.round(scene.playerSprite?.x ?? -1), y: Math.round(scene.playerSprite?.y ?? -1), anim: scene.playerSprite?.anims?.currentAnim?.key },
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

  // Move atÃ© os inimigos
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(2800);
  await page.keyboard.up('KeyD');
  await page.waitForTimeout(300);
  const moved = await probe();
  await page.screenshot({ path: 'qa-before.png' });

  // Dren + ataque pesado (PodridÃ£o / Vida Cinza)
  await page.keyboard.press('Digit3');
  await page.waitForTimeout(500);
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('KeyK');
    await page.waitForTimeout(330);
  }
  const afterDren = await probe();

  // Sub-habilidade do sub-caminho ativo
  await page.keyboard.press('KeyV');
  await page.waitForTimeout(600);
  const afterSkill = await probe();

  // Trocas de caminho/sub-caminho
  await page.keyboard.press('Digit5');
  await page.keyboard.press('Digit6');
  const afterCycle = await probe();

  // Duja + Chamas Negras
  await page.keyboard.press('Digit4');
  await page.waitForTimeout(400);
  await page.keyboard.press('KeyL');
  await page.waitForTimeout(700);
  await page.keyboard.press('KeyV');
  await page.waitForTimeout(1500);
  const afterDuja = await probe();

  await page.screenshot({ path: 'qa-after.png' });
  return { before, moved, afterDren, afterSkill, afterCycle, afterDuja, errors: errors.slice(0, 8) };
}

