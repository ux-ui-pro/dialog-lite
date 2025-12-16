<br>
<p align="center"><strong>dialog-lite</strong></p>

<div align="center">

[![npm](https://img.shields.io/npm/v/dialog-lite.svg?colorB=brightgreen)](https://www.npmjs.com/package/dialog-lite)
[![GitHub package version](https://img.shields.io/github/package-json/v/ux-ui-pro/dialog-lite.svg)](https://github.com/ux-ui-pro/dialog-lite)
[![NPM Downloads](https://img.shields.io/npm/dm/dialog-lite.svg?style=flat)](https://www.npmjs.org/package/dialog-lite)

</div>

<p align="center">DialogLite is designed to control a dialog box (modal window) on a web page, providing the functionality to open, close and apply custom styles through a simple interface.</p>

<p align="center"><a href="https://codepen.io/ux-ui/pen/LYoLOjr">Demo</a></p>
<br>

&#10148; **Install**

```console
yarn add dialog-lite
```
<br>

&#10148; **Import**

```javascript
import { DialogLite } from 'dialog-lite';
```
<sub>or</sub>
```javascript
import { initDialogLite } from 'dialog-lite';
```
<sub>CSS</sub>
```javascript
import 'dialog-lite/dialog-lite.css';
```
<sub>or</sub>
```SCSS
@import "dialog-lite/dialog-lite.css";
```
<br>

&#10148; **Usage**

```javascript
const dialogLite = initDialogLite({
  closingButton: true,
  closingBackdrop: true,
  injectCss: false, // since we import CSS separately
});

button.addEventListener('click', () => {
  dialogLite.open({
    stylingClass: 'dialog-lite--first-window',
  });
});
```
<sub>Classic (class) API</sub>
```javascript
const dialogLite = new DialogLite({ closingButton: true, closingBackdrop: true });
dialogLite.init();
```
<br>

&#10148; **Markup**

Use `hidden` for the initial hidden state. Do not rely on `style="display:none"` (the library toggles via `hidden`).

```html
<div class="dialog-lite dialog-lite--out" hidden aria-hidden="true">
  <div class="dialog-lite__backdrop"></div>
  <div class="dialog-lite__container">
    <div class="dialog-lite__container-inner">
      <button class="dialog-lite-close-button" type="button" aria-label="Close" tabindex="0"></button>
      <div>Your content</div>
    </div>
  </div>
</div>
```
<br>

&#10148; **Options**

| Option | Type | Default | Description |
|:--|:--:|:--:|:--|
| `closingButton` | `boolean` | `false` | Enables close on `.dialog-lite-close-button` click. |
| `closingBackdrop` | `boolean` | `false` | Enables close on `.dialog-lite__backdrop` click. |
| `dialog` | `HTMLElement \| string` | `'.dialog-lite'` | Dialog root element or selector. |
| `mainContent` | `HTMLElement \| string \| null` | `'#main-content'` | Element/selector to set `aria-hidden` on while open. Set `null` to disable. |
| `closeButtonSelector` | `string` | `'.dialog-lite-close-button'` | Close button selector inside dialog. |
| `backdropSelector` | `string` | `'.dialog-lite__backdrop'` | Backdrop selector inside dialog. |
| `debounceMs` | `number` | `500` | Debounce window for `open/close`. |
| `hideDelayMs` | `number` | `500` | Delay before setting `hidden` on close (should match CSS). |
| `focusOnOpenSelector` | `string` | `'[tabindex="0"]'` | Element to focus when opened. |
| `lockScroll` | `boolean` | `true` | Locks page scroll while open. |
| `trapFocus` | `boolean` | `true` | Enables simple focus trap (Tab cycling) while open. |
| `emitEvents` | `boolean` | `true` | Emits `dialog-lite:open` / `dialog-lite:close` on the dialog element. |
<br>

&#10148; **API**

| API | Parameters | Description |
|:--|:--|:--|
| `new DialogLite(options)` | `DialogLiteOptions` | Creates controller instance. |
| `init()` | — | Attaches listeners and resolves DOM elements. |
| `open()` | `{ stylingClass?: string }` | Opens dialog, toggles classes/attributes, focuses inside. |
| `close()` | — | Closes dialog, restores focus, sets `hidden` after `hideDelayMs`. |
| `destroy()` | — | Removes listeners and clears timers. |
| `createDialogLite(options)` | `DialogLiteOptions` | Functional constructor (returns `{ init, open, close, destroy }`). |
| `initDialogLite(options)` | `DialogLiteOptions & { injectCss?: boolean; cssText?: string; cssTarget?: Document \| ShadowRoot }` | Creates instance, optionally injects CSS, calls `init()`, returns controller. |
| `injectDialogLiteCss()` | `{ target?: Document \| ShadowRoot; cssText?: string; id?: string }` | Injects `<style>` with default/minified CSS (or custom `cssText`). |
| `dialogLiteCssText` | — | Minified CSS string (useful for Shadow DOM). |
<br>

&#10148; **Events**

| Event | Description |
|:--|:--|
| `dialog-lite:open` | Dispatched on the dialog element after `open()` (detail includes `stylingClass`). |
| `dialog-lite:close` | Dispatched on the dialog element after `close()`. |
<br>

&#10148; **License**

dialog-lite is released under MIT license
