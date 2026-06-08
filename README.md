# dialog-lite

A small TypeScript library for controlling accessible modal dialogs with plain DOM markup.

[![npm](https://img.shields.io/npm/v/dialog-lite.svg?colorB=brightgreen)](https://www.npmjs.com/package/dialog-lite)
[![NPM Downloads](https://img.shields.io/npm/dm/dialog-lite.svg?style=flat)](https://www.npmjs.com/package/dialog-lite)

[Demo](https://codepen.io/ux-ui/pen/LYoLOjr)

---

### Installation

```bash
npm install dialog-lite
```

---

### Quick Start

```ts
import { initDialogLite } from 'dialog-lite'
import 'dialog-lite/dialog-lite.css'

const dialog = initDialogLite({
  closingButton: true,
  closingBackdrop: true,
  injectCss: false,
})

button.addEventListener('click', () => {
  dialog.open({ stylingClass: 'dialog-lite--result' })
})
```

Use `hidden` for the initial hidden state. Do not rely on `style="display:none"`:
the library toggles visibility through the `hidden` attribute.

```html
<div class="dialog-lite dialog-lite--out" hidden aria-hidden="true">
  <div class="dialog-lite__backdrop"></div>
  <div class="dialog-lite__container">
    <div class="dialog-lite__container-inner">
      <button class="dialog-lite-close-button" type="button" aria-label="Close" tabindex="0">
        Close
      </button>
      <div>Your content</div>
    </div>
  </div>
</div>
```

---

### API

- `new DialogLite(options)` — creates a controller instance.
- `init()` — resolves DOM elements and attaches event listeners.
- `open(options)` — opens the dialog, toggles classes and attributes, and moves focus inside.
- `close()` — closes the dialog, restores focus, and applies `hidden` after `hideDelayMs`.
- `destroy()` — removes listeners, clears timers, and unlocks scroll.
- `isOpened()` — returns the current controller open state.
- `createDialogLite(options)` — creates a controller without calling `init()`.
- `initDialogLite(options)` — optionally injects CSS, calls `init()`, and returns a controller.
- `injectDialogLiteCss(options)` — injects the packaged CSS into `document` or a `ShadowRoot`.
- `dialogLiteCssText` — packaged minified CSS string, useful for Shadow DOM.

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `closingButton` | `boolean` | `false` | Enables close on `.dialog-lite-close-button` click. |
| `closingBackdrop` | `boolean` | `false` | Enables close on `.dialog-lite__backdrop` click. |
| `dialog` | `HTMLElement \| string` | `'.dialog-lite'` | Dialog root element or selector. |
| `mainContent` | `HTMLElement \| string \| null` | `'#main-content'` | Element or selector to set `aria-hidden` on while open. Set `null` to disable. |
| `closeButtonSelector` | `string` | `'.dialog-lite-close-button'` | Close button selector inside the dialog. |
| `backdropSelector` | `string` | `'.dialog-lite__backdrop'` | Backdrop selector inside the dialog. |
| `debounceMs` | `number` | `500` | Debounce window for `open()` and `close()`. |
| `hideDelayMs` | `number` | `500` | Delay before setting `hidden` on close. Should match CSS transitions. |
| `focusOnOpenSelector` | `string` | `'[tabindex="0"]'` | Element to focus when opened. |
| `lockScroll` | `boolean` | `true` | Locks page scroll while open. |
| `trapFocus` | `boolean` | `true` | Enables Tab cycling inside the dialog. |
| `closeOnEscape` | `boolean` | `true` | Enables closing the dialog with Escape. |
| `role` | `string` | `'dialog'` | Dialog role applied during `init()`. |
| `ariaModal` | `boolean` | `true` | Sets `aria-modal="true"` during `init()`. |
| `emitEvents` | `boolean` | `true` | Emits `dialog-lite:open` and `dialog-lite:close`. |
| `onOpen` | `(detail) => void` | - | Callback called after `open()`. |
| `onClose` | `(detail) => void` | - | Callback called after `close()`. |

#### Events

- `dialog-lite:open` — dispatched on the dialog element after `open()`.
  `event.detail` includes `{ stylingClass }`.
- `dialog-lite:close` — dispatched on the dialog element after `close()`.

---

### Vue 3

`dialog-lite/vue` provides a Vue-scoped composable and a component wrapper. Vue is an
optional peer dependency, so the default `dialog-lite` entry remains framework-agnostic.

Import the CSS once in your app entry or global stylesheet:

```ts
import 'dialog-lite/dialog-lite.css'
```

#### Composable

Use `useDialogLite()` when you want to keep custom dialog markup.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useDialogLite } from 'dialog-lite/vue'

const dialogRef = ref<HTMLElement | null>(null)
const { isOpen, open, close } = useDialogLite(dialogRef, {
  closingBackdrop: true,
  mainContent: null,
})
</script>

<template>
  <button type="button" @click="open({ stylingClass: 'dialog-lite--result' })">
    Open
  </button>

  <div ref="dialogRef" class="dialog-lite dialog-lite--out" hidden aria-hidden="true">
    <div class="dialog-lite__backdrop"></div>
    <div class="dialog-lite__container">
      <div class="dialog-lite__container-inner">
        <button type="button" @click="close">Close</button>
        <slot />
      </div>
    </div>
  </div>
</template>
```

`useDialogLite()` creates the controller in `onMounted()`, passes the Vue element ref
to the core `dialog` option, keeps `isOpen` in sync through callbacks, and calls
`destroy()` automatically when the component scope is disposed.

#### Component

Use `DialogLiteRoot` when you want the package to render the default BEM wrapper.

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { DialogLiteRoot } from 'dialog-lite/vue'

const result = ref<'won' | 'lost' | null>(null)
const isResultOpen = computed({
  get: () => result.value !== null,
  set: (value) => {
    if (!value) result.value = null
  },
})
</script>

<template>
  <DialogLiteRoot
    v-model="isResultOpen"
    :styling-class="result === 'won' ? 'dialog-lite--game-won' : 'dialog-lite--game-lost'"
    close-on-backdrop
    :main-content="null"
  >
    <GameWon v-if="result === 'won'" />
    <GameLost v-else @reset="isResultOpen = false" />
  </DialogLiteRoot>
</template>
```

#### Vue API

- `useDialogLite(dialogRef, options)` — creates a Vue-scoped controller, initializes it
  on mount, and destroys it on scope disposal.
- `DialogLiteRoot` — renders the default BEM markup and controls the core instance
  through `v-model`.
- `DialogLiteRoot` props — `modelValue`, `stylingClass`, `closeOnBackdrop`,
  `closeOnButton`, `mainContent`, `debounceMs`, `hideDelayMs`, `lockScroll`,
  `trapFocus`, `closeOnEscape`.
- `DialogLiteRoot` emits — `update:modelValue`, `open`, `close`.

For Nuxt or any SSR setup, import is safe but initialization is client-only. Use the
composable or component inside mounted/client-rendered code, and wrap rendered dialogs
in `<ClientOnly>` when the page is server-rendered.

---

### Styling

The default stylesheet is available as a package subpath:

```ts
import 'dialog-lite/dialog-lite.css'
```

```scss
@import "dialog-lite/dialog-lite.css";
```

The default CSS uses BEM classes:

- `.dialog-lite`
- `.dialog-lite--in`
- `.dialog-lite--out`
- `.dialog-lite__backdrop`
- `.dialog-lite__container`
- `.dialog-lite__container-inner`
- `.dialog-lite-close-button`

The backdrop and z-index values can be customized with CSS variables:

- `--z-index-dialog-lite`
- `--z-index-dialog-lite-backdrop`
- `--z-index-dialog-lite-container`
- `--c-dialog-lite-backdrop-in`
- `--c-dialog-lite-backdrop-out`

---

### License

MIT
