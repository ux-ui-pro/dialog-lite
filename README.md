<br>
<p align="center"><strong>dialog-lite</strong></p>

<div align="center">

[![npm](https://img.shields.io/npm/v/dialog-lite.svg?colorB=brightgreen)](https://www.npmjs.com/package/dialog-lite)
[![GitHub package version](https://img.shields.io/github/package-json/v/ux-ui-pro/dialog-lite.svg)](https://github.com/ux-ui-pro/dialog-lite)
[![NPM Downloads](https://img.shields.io/npm/dm/dialog-lite.svg?style=flat)](https://www.npmjs.org/package/dialog-lite)

</div>

<p align="center">DialogLite is designed to control a dialog box (modal window) on a web page, providing the functionality to open, close and apply custom styles through a simple interface.</p>
<p align="center"><sup>0.5kB gzipped</sup></p>
<p align="center"><a href="https://codepen.io/ux-ui/pen/LYoLOjr">Demo</a></p>
<br>

&#10148; **Install**

```console
yarn add dialog-lite
```
<br>

&#10148; **Import**

```javascript
import DialogLite from 'dialog-lite';
```
<sub>CSS</sub>
```SCSS
@import "dialog-lite/dist/";
```
<sub>if your bundler supports SCSS</sub>
```SCSS
@import "dialog-lite/src/";
```
<br>

&#10148; **Usage**

```javascript
const dialogLite = new DialogLite({
  closingButton: true,
  closingBackdrop: true,
});

dialogLite.init();

button.addEventListener('click', () => {
  dialogLite.open({
    stylingClass: 'dialog-lite--first-window',
  });
});
```
<br>

&#10148; **License**

dialog-lite is released under MIT license
