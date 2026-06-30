import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';

const expectedArtifacts = [
  'dist/index.js',
  'dist/index.cjs',
  'dist/index.d.ts',
  'dist/index.d.cts',
  'dist/vue.js',
  'dist/vue.cjs',
  'dist/vue.d.ts',
  'dist/vue.d.cts',
  'dist/dialog-lite.css',
];

test('dist artifacts exist', () => {
  for (const artifact of expectedArtifacts) {
    assert.equal(existsSync(artifact), true, `${artifact} should exist`);
  }
});

test('public ESM API exports DialogLite', async () => {
  const mod = await import('../dist/index.js');

  assert.equal(typeof mod.DialogLite, 'function');
  assert.equal(typeof mod.initDialogLite, 'function');
});

test('public Vue ESM API exports composable and component', async () => {
  const mod = await import('../dist/vue.js');

  assert.equal(typeof mod.useDialogLite, 'function');
  assert.equal(typeof mod.DialogLiteRoot, 'object');
});

test('public CJS API can be required', async () => {
  const mod = await import('../dist/index.cjs');

  assert.equal(typeof mod.DialogLite, 'function');
});
