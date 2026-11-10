export default async function run(page, ui) {
  page.on('console', (m) => console.log(`CONSOLE[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => console.log('PAGEERROR ' + String(e)));

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  const a = await page.evaluate(() => ({
    game: !!window.__veuGame,
    tex: window.__veuGame?.texture?.list?.map(t => t.key) ?? [],
    pending: window.__veuGame?.texture?.getTextureKeys?.() ?? [],
  }));
  console.log('A ' + JSON.stringify(a));

  // Recarrega o spritesheet diretamente via loader e observa o progresso
  await page.evaluate(() => {
    const g = window.__veuGame;
    window.__loadState = [];
    g.load.on('loaderror', (f) => window.__loadState.push('ERR:' + f.key));
    g.load.on('filecomplete', (k) => window.__loadState.push('OK:' + k));
    g.load.on('complete', () => window.__loadState.push('COMPLETE'));
    g.load.image('probe_png', 'dit.png');
    g.load.start();
  });

  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(1000);
    const st = await page.evaluate(() => ({
      loading: window.__veuGame.load.isLoading(),
      state: window.__loadState.slice(-4),
      hasProbe: window.__veuGame.textures.exists('probe_png'),
      texCount: window.__veuGame.textures.getTextureKeys().length,
      arena: !!window.__arenaScene,
    }));
    console.log(i + ' ' + JSON.stringify(st));
    if (st.arena) break;
  }
  return { done: true };
}
