import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { transform } from 'lightningcss';
import { defineConfig, type PluginOption } from 'vite';
import dts from 'vite-plugin-dts';

function dialogLiteCssPlugin(): PluginOption {
  return {
    name: 'dialog-lite:css',
    async load(id) {
      if (!id.includes('dialog-lite.css') || !id.includes('?raw')) return null;

      const file = id.split('?', 1)[0];
      const input = await readFile(file);
      const result = transform({
        filename: file,
        code: input,
        minify: true,
      });

      const minifiedCssText = Buffer.from(result.code).toString('utf8');
      return `export default ${JSON.stringify(minifiedCssText)};`;
    },
    async generateBundle() {
      const file = resolve(process.cwd(), 'src', 'dialog-lite.css');
      const input = await readFile(file);
      const result = transform({
        filename: file,
        code: input,
        minify: true,
      });

      this.emitFile({
        type: 'asset',
        fileName: 'dialog-lite.css',
        source: Buffer.from(result.code).toString('utf8'),
      });
    },
  };
}

export default defineConfig({
  plugins: [
    dialogLiteCssPlugin(),
    dts({
      outDirs: ['dist'],
      insertTypesEntry: true,
      entryRoot: 'src',
      include: ['src', 'vite-env.d.ts'],
      exclude: ['src/**/*.test.ts'],
      cleanVueFileName: true,
      beforeWriteFile: (filePath, content) => ({
        filePath: filePath.replace(/([/\\]dist)[/\\]src[/\\]/, '$1/'),
        content,
      }),
    }),
  ],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        vue: 'src/vue.ts',
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        format === 'cjs' ? `${entryName}.cjs` : `${entryName}.${format}.js`,
    },
    emptyOutDir: true,
    rollupOptions: {
      external: ['vue'],
      output: {
        assetFileNames: 'index.[ext]',
        exports: 'named',
      },
    },
  },
});
