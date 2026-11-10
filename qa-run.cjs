const path = require('path');
const base = 'C:/Users/47058047839/.vscode/extensions/danielsanmedium.dscodegpt-3.24.79/standalone/node_modules';
const { chromium } = require(path.join(base, 'patchright-core'));

const EXE = 'C:/Users/47058047839/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
const URL = process.env.QA_URL || 'http://localhost:3000/';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: EXE });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();

  const logs = [];
  page.on('console', (m) => { if (m.type() !== 'debug' && m.type() !== 'log') logs.push(`[${m.type()}] ${m.text()}`.slice(0, 300)); });
  page.on('pageerror', (e) => logs.push('PAGEERROR ' + String(e).slice(0, 400)));
  ctx.on('requestfailed', (r) => {
    if (!/analytics|hotjar|sentry/.test(r.url())) logs.push('REQFAIL ' + r.url() + ' ' + r.failure()?.errorText);
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  const t0 = Date.now();
  let state = {};
  for (let i = 0; i < 25; i++) {
    await page.waitForTimeout(1000);
    state = await page.evaluate(() => {
      const g = window.__veuGame;
      return {
        phaser: typeof window.Phaser,
        game: !!g,
        loop: g?.loop?.running ?? null,
        scenes: g?.scene?.scenes?.map(s => `${s.sys.settings.key}:${s.sys.settings.status}`) ?? [],
        tex: g?.textures?.getTextureKeys?.() ?? [],
        arena: !!window.__arenaScene,
        sprite: !!window.__arenaScene?.playerSprite,
      };
    }).catch((e) => ({ err: String(e) }));
    console.log(`t=${Date.now() - t0}ms ${JSON.stringify(state)}`);
    if (state.sprite) break;
  }

  console.log('LOGS:\n' + logs.slice(0, 25).join('\n'));
  await page.screenshot({ path: 'shot.png' });
  await browser.close();
})();
