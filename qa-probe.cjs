const path = require('path');
const base = 'C:/Users/47058047839/.vscode/extensions/danielsanmedium.dscodegpt-3.24.79/standalone/node_modules';
const { chromium } = require(path.join(base, 'patchright-core'));
const EXE = 'C:/Users/47058047839/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
const URL = process.env.QA_URL || 'http://localhost:3000/';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: EXE });
  const page = await browser.newPage();
  const t0 = Date.now();

  page.on('console', (m) => console.log(`C[${m.type()}] ${m.text().slice(0, 200)}`));
  page.on('pageerror', (e) => console.log('PAGEERROR ' + String(e).slice(0, 300)));
  page.on('requestfailed', (r) => console.log('REQFAIL ' + r.url().slice(0, 120) + ' ' + r.failure()?.errorText));
  page.on('response', (r) => { if (r.status() >= 400) console.log('HTTP' + r.status() + ' ' + r.url().slice(0, 120)); });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(2500);
    const s = await page.evaluate(() => ({
      phaser: typeof window.Phaser,
      game: !!window.__veuGame,
      arena: !!window.__arenaScene,
      sceneStatus: window.__veuGame?.scene?.scenes?.map(sc => `${sc.sys.settings.key}:${sc.sys.settings.status}`) ?? [],
      tex: window.__veuGame?.textures?.getTextureKeys?.() ?? [],
    })).catch(e => ({ err: String(e) }));
    console.log(`t=${Date.now() - t0} ${JSON.stringify(s)}`);
    if (s.arena) break;
  }
  await page.screenshot({ path: 'shot.png' });
  await browser.close();
})();
