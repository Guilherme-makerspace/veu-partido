export default async function run(page, ui) {
  page.on('console', (m) => console.log(`CONSOLE[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => console.log('PAGEERROR ' + String(e)));

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  const t0 = Date.now();
  for (let i = 0; i < 20; i++) {
    const r = await page.evaluate(() => ({
      phaser: typeof window.Phaser,
      games: window.Phaser?.GAMES?.length ?? -1,
      scene: !!window.__arenaScene,
      alive: window.Phaser?.GAMES?.[0]?.isRunning ?? null,
      scenes: window.Phaser?.GAMES?.[0]?.scene?.scenes?.map(s => s.sys.settings.key) ?? [],
    }));
    console.log(`t=${Date.now() - t0} ` + JSON.stringify(r));
    if (r.scene) break;
    await page.waitForTimeout(1000);
  }
  return { done: true };
}
