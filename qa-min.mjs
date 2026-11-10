export default async function run(page, ui) {
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e)));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`); });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  const t0 = Date.now();
  let found = false;
  try {
    await page.waitForFunction(() => !!window.__arenaScene, null, { timeout: 30000 });
    found = true;
  } catch (e) { found = false; }
  const waitMs = Date.now() - t0;

  const info = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    return {
      canvas: c ? { w: c.width, h: c.height } : null,
      scene: !!window.__arenaScene,
      keys: window.__arenaScene ? Object.keys(window.__arenaScene).length : 0,
      ready: window.__arenaScene?.playerSprite ? true : false,
    };
  });

  return { found, waitMs, info, errors };
}
