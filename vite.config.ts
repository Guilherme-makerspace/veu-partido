import { defineConfig, type Plugin } from 'vite';

/**
 * Injeta o entry point como script clássico quando VITE_ENTRY_MODE=cjs.
 * Útil para auditoria/QA em navegadores headless onde módulos ES não são executados.
 */
function forcedEntry(): Plugin {
  return {
    name: 'veu-forced-entry',
    transformIndexHtml(html) {
      if (process.env.VITE_ENTRY_MODE !== 'cjs') return html;
      return html.replace(
        /<script type="module" src="\/src\/main\.ts"><\/script>/,
        '<script type="module">import("/src/main.ts");</script>'
      );
    },
  };
}

export default defineConfig({
  root: './',
  base: './',
  plugins: [forcedEntry()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: !!process.env.QA_OPEN,
  },
});

