export default async function run(page, ui) {
  page.on('console', (m) => console.log(`CONSOLE[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => console.log('PAGEERROR ' + String(e)));

  await page.goto('about:blank');
  const res = await page.evaluate(async () => {
    const out = {};
    try {
      window.__log = [];
      const Phaser = (await import('/node_modules/.vite/deps/phaser.js?v=a5c2d0e2')).default;
      out.phaser = typeof Phaser;
      Phaser.GameObjects.GameObjectFactory.prototype;// noop
      class TestScene extends Phaser.Scene {
        constructor() { super('TestScene'); }
        preload() {
          this.load.spritesheet('dit', 'dit.png', { frameWidth: 64, frameHeight: 64 });
          this.load.on('loaderror', (f) => window.__log.push('ERR:' + f.key + ':' + f.src));
          this.load.on('complete', () => window.__log.push('COMPLETE'));
        }
        create() { window.__log.push('CREATE:' + this.textures.exists('dit')); this.game.hasCreated = true; }
      }
      const g = new Phaser.Game({ type: Phaser.AUTO, parent: document.body, width: 1280, height: 720, scene: [TestScene] });
      window.__g = g;
      await new Promise(r => setTimeout(r, 6000));
      out.log = window.__log;
      out.alive = g.isRunning;
      out.tex = g.textures.getTextureKeys();
    } catch (e) { out.err = String(e) + ' ' + (e && e.stack); }
    return out;
  });
  console.log('RESULT ' + JSON.stringify(res));
  return { done: true };
}
