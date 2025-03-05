<br>
<p align="center"><strong>dialog-lite</strong></p>

<div align="center">

[![npm](https://img.shields.io/npm/v/dialog-lite.svg?colorB=brightgreen)](https://www.npmjs.com/package/dialog-lite)
[![GitHub package version](https://img.shields.io/github/package-json/v/ux-ui-pro/dialog-lite.svg)](https://github.com/ux-ui-pro/dialog-lite)
[![NPM Downloads](https://img.shields.io/npm/dm/dialog-lite.svg?style=flat)](https://www.npmjs.org/package/dialog-lite)

</div>

<p align="center">DialogLite is designed to control a dialog box (modal window) on a web page, providing the functionality to open, close and apply custom styles through a simple interface.</p>
<p align="center"><sup>750B gzipped</sup></p>
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
```javascript
import 'dialog-lite/dist/index.css';
```
<sub>or</sub>
```SCSS
@import "dialog-lite/dist/index.css";
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

&#10148; **Options**

|      Option       |   Type    | Default | Description                                                                                                                    |
|:-----------------:|:---------:|:-------:|:-------------------------------------------------------------------------------------------------------------------------------|
| `closingButton`   | `boolean` | `false` | When set to true, enables the close button functionality in the dialog. The dialog can be closed by clicking the close button. |
| `closingBackdrop` | `boolean` | `false` | When set to true, enables closing the dialog by clicking on the backdrop.                                                      |
<br>

&#10148; **API**

| Method  |                           Parameters                           | Description                                                                                                                                                          |
|:-------:|:--------------------------------------------------------------:|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `init`  |                              None                              | Initializes the dialog, setting up event listeners for close button, backdrop click, and escape key based on the provided options.                                   |
| `open`  | `{ stylingClass?: string }`<br>Default: `{ stylingClass: '' }` | Opens the dialog, applying the specified styling class. Focuses on the first element inside the dialog with tabindex="0", and stores the previously focused element. |
| `close` |                              None                              | Closes the dialog, restoring focus to the previously focused element. Adds the class for closing animation and optionally delays removal of the class.               |
<br>

&#10148; **Events**

|         Method          | Description                                                                                        |
|:-----------------------:|:---------------------------------------------------------------------------------------------------|
| `click` (Close Button)  | Triggered when the close button is clicked, closing the dialog if closingButton option is enabled. |
|   `click` (Backdrop)    | Triggered when the backdrop is clicked, closing the dialog if closingBackdrop option is enabled.   |
| `keydown`  (Escape key) | Triggered when the Escape key is pressed, closing the dialog.                                      |
<br>

&#10148; **License**

dialog-lite is released under MIT license
