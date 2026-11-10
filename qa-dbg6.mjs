export default async function run(page, ui) {
  page.on('console', (m) => console.log(`CONSOLE[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => console.log('PAGEERROR ' + String(e)));

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  const res = await page.evaluate(async () => {
    const origError = console.error;
    window.__errs = [];
    console.error = (...a) => { window.__errs.push(a.map(x => (x && x.stack) ? x.stack : String(x)).join(' | ')); origError(...a); };

    await import('/node_modules/phaser/dist/phaser.js?x=1');
    const Phaser = window.Phaser;
    const out = { type: typeof Phaser, keysCount: Phaser ? Object.keys(Phaser).length : 0, hasScene: !!(Phaser && Phaser.Scene) };
    return out;
  });
  console.log('RES ' + JSON.stringify(res));
  return { done: true };
}
