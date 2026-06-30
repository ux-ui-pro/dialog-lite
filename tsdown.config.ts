import { defineCssLibrary } from '@ux-ui/tsdown-config';

export default defineCssLibrary({
  cssFileName: 'dialog-lite.css',
  entry: {
    index: 'src/index.ts',
    vue: 'src/vue.ts',
  },
  deps: { neverBundle: ['vue'] },
});
