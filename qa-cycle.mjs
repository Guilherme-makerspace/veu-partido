export default async function run(page, ui) {
  page.on('console', (m) => console.log(`CONSOLE[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => console.log('PAGEERROR ' + String(e)));

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(1000);
    const st = await page.evaluate(() => ({ g: !!window.__veuGame, p: typeof window.Phaser }));
    console.log(i + ' ' + JSON.stringify(st));
    if (st.g) break;
  }
  return { done: true };
}
