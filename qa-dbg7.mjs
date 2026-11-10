export default async function run(page, ui) {
  page.on('console', (m) => console.log(`CONSOLE[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => console.log('PAGEERROR ' + String(e)));

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  const res = await page.evaluate(() => {
    return new Promise((resolve) => {
      window.__res = null;
      const s = document.createElement('script');
      s.type = 'module';
      s.textContent = `
        import('/src/main.ts').then(m => { window.__res = 'IMPORTED ' + Object.keys(m).join(','); })
          .catch(e => { window.__res = 'IMPORT_ERR ' + String(e); });
      `;
      document.body.appendChild(s);
      const started = Date.now();
      const iv = setInterval(() => {
        if (window.__res || Date.now() - started > 12000) {
          clearInterval(iv);
          resolve({ res: window.__res, game: !!window.__veuGame, phaser: typeof window.Phaser });
        }
      }, 200);
    });
  });
  console.log('RES ' + JSON.stringify(res));
  return { done: true };
}
