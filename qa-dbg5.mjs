export default async function run(page, ui) {
  page.on('console', (m) => console.log(`CONSOLE[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => console.log('PAGEERROR ' + String(e)));

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  const res = await page.evaluate(async () => {
    const origError = console.error;
    window.__errs = [];
    console.error = (...a) => { window.__errs.push(a.map(x => (x && x.stack) ? x.stack : String(x)).join(' | ')); origError(...a); };

    const origWarn = console.warn;
    window.__warns = [];
    console.warn = (...a) => { window.__warns.push(a.map(String).join(' | ')); origWarn(...a); };

    window.__log = [];
    try {
      const Phaser = window.Phaser;
      class TestScene extends Phaser.Scene {
        constructor() { super('TestScene'); }
        preload() {
          window.__log.push('PRELOAD');
          this.load.spritesheet('dit', 'dit.png', { frameWidth: 64, frameHeight: 64 });
          this.load.on('loaderror', (f) => window.__log.push('ERR:' + f.key));
          this.load.on('complete', () => window.__log.push('COMPLETE'));
        }
        create() { window.__log.push('CREATE exists=' + this.textures.exists('dit')); }
      }
      const g = new Phaser.Game({ type: Phaser.AUTO, parent: document.body, width: 640, height: 360, scene: [TestScene] });
      window.__g = g;
      await new Promise(r => setTimeout(r, 8000));
      return {
        log: window.__log,
        errs: window.__errs.slice(0, 5),
        warns: window.__warns.slice(0, 5),
        scenes: g.scene.scenes.map(s => ({ k: s.sys.settings.key, status: s.sys.settings.status })),
        loading: g.load.isLoading(),
        tex: g.textures.getTextureKeys(),
      };
    } catch (e) { return { err: String(e), stack: e.stack }; }
  });
  console.log('RESULT ' + JSON.stringify(res, null, 1));
  return { done: true };
}
