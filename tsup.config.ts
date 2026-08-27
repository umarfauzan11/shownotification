import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    minify: true,
    sourcemap: true,
    treeshake: true,
    outExtension({ format }) {
      return {
        js: format === 'cjs' ? '.cjs' : '.mjs',
      };
    },
  },
  {
    entry: ['src/index.ts'],
    format: ['iife'],
    globalName: 'shnBundle',
    minify: true,
    sourcemap: true,
    outExtension() {
      return { js: '.global.js' };
    },
    footer: {
      js: 'if (typeof window !== "undefined") { var _fn = shnBundle.default || shnBundle.shn || shnBundle; Object.assign(_fn, shnBundle); window.shn = _fn; window.showNotification = shnBundle.showNotification || _fn.showNotification; }',
    },
  },
]);
