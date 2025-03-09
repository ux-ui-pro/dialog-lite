import { defineConfig } from 'vite';
import terser from '@rollup/plugin-terser';
import dts from 'vite-plugin-dts';
import sassDts from 'vite-plugin-sass-dts';

export default defineConfig({
  plugins: [
    dts({
      outDir: 'dist',
      insertTypesEntry: true,
      entryRoot: 'src',
      cleanVueFileName: true,
    }),
    sassDts(),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'DialogLite',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `index.${format}.js`,
    },
    cssCodeSplit: true,
    emptyOutDir: true,
    rollupOptions: {
      plugins: [
        terser({
          compress: {
            drop_console: true,
            drop_debugger: true,
            dead_code: true,
            reduce_vars: true,
            reduce_funcs: true,
          },
          mangle: {
            toplevel: true,
            keep_fnames: false,
          },
          format: {
            comments: false,
          },
        }),
      ],
      output: {
        assetFileNames: 'index.[ext]',
      },
    },
  },
  server: {
    open: true,
    port: 3000,
  },
});
