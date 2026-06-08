// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DialogLite } from './index';

function renderDialog(): HTMLElement {
  document.body.innerHTML = `
    <main id="main-content"></main>
    <div class="dialog-lite dialog-lite--out" hidden aria-hidden="true">
      <div class="dialog-lite__backdrop"></div>
      <div class="dialog-lite__container">
        <div class="dialog-lite__container-inner">
          <button class="dialog-lite-close-button" type="button" tabindex="0">Close</button>
        </div>
      </div>
    </div>
  `;

  const dialog = document.querySelector<HTMLElement>('.dialog-lite');

  if (!dialog) {
    throw new Error('Test dialog was not rendered.');
  }

  return dialog;
}

describe('DialogLite', () => {
  beforeEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('opens and closes with callbacks, events and readable state', () => {
    vi.useFakeTimers();

    const dialogEl = renderDialog();
    const openListener = vi.fn();
    const closeListener = vi.fn();
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const dialog = new DialogLite({
      debounceMs: 0,
      hideDelayMs: 50,
      onOpen,
      onClose,
    });

    dialogEl.addEventListener('dialog-lite:open', openListener);
    dialogEl.addEventListener('dialog-lite:close', closeListener);
    dialog.init();

    dialog.open({ stylingClass: 'dialog-lite--game-won' });

    expect(dialog.isOpened()).toBe(true);
    expect(dialogEl.hidden).toBe(false);
    expect(dialogEl.classList.contains('dialog-lite--in')).toBe(true);
    expect(dialogEl.classList.contains('dialog-lite--game-won')).toBe(true);
    expect(onOpen).toHaveBeenCalledWith({ stylingClass: 'dialog-lite--game-won' });
    expect(openListener).toHaveBeenCalledTimes(1);

    dialog.close();

    expect(dialog.isOpened()).toBe(false);
    expect(dialogEl.classList.contains('dialog-lite--out')).toBe(true);
    expect(onClose).toHaveBeenCalledWith({});
    expect(closeListener).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(50);

    expect(dialogEl.hidden).toBe(true);
  });

  it('honors closeOnEscape', () => {
    renderDialog();

    const dialog = new DialogLite({
      closeOnEscape: false,
      debounceMs: 0,
    });

    dialog.init();
    dialog.open();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(dialog.isOpened()).toBe(true);

    dialog.destroy();
  });
});
